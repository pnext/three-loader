import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Geometry,
  LinearFilter,
  Material,
  Matrix4,
  NearestFilter,
  NoBlending,
  Object3D,
  PerspectiveCamera,
  Points,
  Ray,
  RGBAFormat,
  Scene,
  Sphere,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { DEFAULT_MIN_NODE_PIXEL_SIZE, DEFAULT_PICK_WINDOW_SIZE } from './constants';
import { ClipMode, PointCloudMaterial, PointColorType, PointSizeType } from './materials';
import { PointCloudOctreeGeometry } from './point-cloud-octree-geometry';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { PointCloudTree } from './point-cloud-tree';
import { IPointCloudTreeNode, IPotree, PickPoint, PointCloudHit } from './types';
import { computeTransformedBoundingBox } from './utils/bounds';
import { clamp } from './utils/math';
import { byLevelAndIndex } from './utils/utils';

export interface PickParams {
  pickWindowSize: number;
  pickOutsideClipRegion: boolean;

  /**
   * In the case of custom pixel position coordinates, this property
   * will be used for the pick window position.
   */
  pixelPos: Vector3;
}

export interface IPickState {
  renderTarget: WebGLRenderTarget;
  material: PointCloudMaterial;
  scene: Scene;
}

const helperVec3 = new Vector3();

export class PointCloudOctree extends PointCloudTree {
  potree: IPotree;
  disposed: boolean = false;
  pcoGeometry: PointCloudOctreeGeometry;
  boundingBox: Box3;
  boundingSphere: Sphere;
  material: PointCloudMaterial;
  level: number = 0;
  maxLevel: number = Infinity;
  /**
   * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
   */
  minNodePixelSize: number = DEFAULT_MIN_NODE_PIXEL_SIZE;
  root: IPointCloudTreeNode | null = null;
  boundingBoxNodes: Object3D[] = [];
  visibleNodes: PointCloudOctreeNode[] = [];
  visibleGeometry: PointCloudOctreeGeometryNode[] = [];
  numVisiblePoints: number = 0;
  showBoundingBox: boolean = false;
  pickState: IPickState | undefined;
  private visibleBounds: Box3 = new Box3();
  private visibleNodeTextureOffsets = new Map<string, number>();

  constructor(
    potree: IPotree,
    pcoGeometry: PointCloudOctreeGeometry,
    material?: PointCloudMaterial,
  ) {
    super();

    this.name = '';
    this.potree = potree;
    this.root = pcoGeometry.root;
    this.pcoGeometry = pcoGeometry;
    this.boundingBox = pcoGeometry.boundingBox;
    this.boundingSphere = this.boundingBox.getBoundingSphere(new Sphere());

    this.position.copy(pcoGeometry.offset);
    this.updateMatrix();

    this.material = material || new PointCloudMaterial();
    this.initMaterial(this.material);
  }

  private initMaterial(material: PointCloudMaterial): void {
    this.updateMatrixWorld(true);

    const { min, max } = computeTransformedBoundingBox(
      this.pcoGeometry.tightBoundingBox || this.getBoundingBoxWorld(),
      this.matrixWorld,
    );

    const bWidth = max.z - min.z;
    material.heightMin = min.z - 0.2 * bWidth;
    material.heightMax = max.z + 0.2 * bWidth;
  }

  dispose(): void {
    if (this.root) {
      this.root.dispose();
    }

    this.pcoGeometry.dispose();
    this.material.dispose();

    this.visibleNodes = [];
    this.visibleGeometry = [];
    this.visibleNodeTextureOffsets.clear();

    if (this.pickState) {
      this.pickState.material.dispose();
      this.pickState.renderTarget.dispose();
      this.pickState = undefined;
    }

    this.disposed = false;
  }

  get pointSizeType(): PointSizeType {
    return this.material.pointSizeType;
  }

  set pointSizeType(value: PointSizeType) {
    this.material.pointSizeType = value;
  }

  toTreeNode(
    geometryNode: PointCloudOctreeGeometryNode,
    parent?: PointCloudOctreeNode | null,
  ): PointCloudOctreeNode {
    const sceneNode = new Points(geometryNode.geometry, this.material);
    const node = new PointCloudOctreeNode(geometryNode, sceneNode);
    sceneNode.name = geometryNode.name;
    sceneNode.position.copy(geometryNode.boundingBox.min);
    sceneNode.frustumCulled = false;
    sceneNode.onBeforeRender = this.makeOnBeforeRender(node);

    if (parent) {
      parent.sceneNode.add(sceneNode);
      parent.children[geometryNode.index] = node;

      geometryNode.oneTimeDisposeHandlers.push(() => {
        parent.sceneNode.remove(node.sceneNode);
        // Replace the tree node (rendered and in the GPU) with the geometry node.
        parent.children[geometryNode.index] = geometryNode;
      });
    } else {
      this.root = node;
      this.add(sceneNode);
    }

    return node;
  }

  private makeOnBeforeRender(node: PointCloudOctreeNode) {
    return (
      _renderer: WebGLRenderer,
      _scene: Scene,
      _camera: Camera,
      _geometry: Geometry | BufferGeometry,
      material: Material,
    ) => {
      const materialUniforms = (material as PointCloudMaterial).uniforms;

      materialUniforms.level.value = node.level;
      materialUniforms.isLeafNode.value = node.isLeafNode;

      const vnStart = this.visibleNodeTextureOffsets.get(node.name);
      if (vnStart !== undefined) {
        materialUniforms.vnStart.value = vnStart;
      }

      const pcIndex = node.pcIndex ? node.pcIndex : this.visibleNodes.indexOf(node);
      materialUniforms.pcIndex.value = pcIndex;

      // Note: when changing uniforms in onBeforeRender, the flag uniformsNeedUpdate has to be
      // set to true to instruct ThreeJS to upload them. See also
      // https://github.com/mrdoob/three.js/issues/9870#issuecomment-368750182.

      // Remove the cast to any when uniformsNeedUpdate has been added to the typings.
      (material as any) /*ShaderMaterial*/.uniformsNeedUpdate = true;
    };
  }

  updateVisibleBounds() {
    const bounds = this.visibleBounds;
    bounds.min.set(Infinity, Infinity, Infinity);
    bounds.max.set(-Infinity, -Infinity, -Infinity);

    for (const node of this.visibleNodes) {
      if (node.isLeafNode) {
        bounds.expandByPoint(node.boundingBox.min);
        bounds.expandByPoint(node.boundingBox.max);
      }
    }
  }

  updateBoundingBoxes(): void {
    if (!this.showBoundingBox || !this.parent) {
      return;
    }

    let bbRoot: any = this.parent.getObjectByName('bbroot');
    if (!bbRoot) {
      bbRoot = new Object3D();
      bbRoot.name = 'bbroot';
      this.parent.add(bbRoot);
    }

    const visibleBoxes = [];
    for (const node of this.visibleNodes) {
      if (node.boundingBoxNode !== undefined && node.isLeafNode) {
        visibleBoxes.push(node.boundingBoxNode);
      }
    }

    bbRoot.children = visibleBoxes;
  }

  updateMaterial(
    material: PointCloudMaterial,
    visibleNodes: PointCloudOctreeNode[],
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ): void {
    const maxScale = Math.max(this.scale.x, this.scale.y, this.scale.z);
    const pixelRatio = renderer.getPixelRatio();

    material.fov = camera.fov * (Math.PI / 180);
    material.screenWidth = renderer.domElement.clientWidth * pixelRatio;
    material.screenHeight = renderer.domElement.clientHeight * pixelRatio;
    material.near = camera.near;
    material.far = camera.far;
    material.spacing = this.pcoGeometry.spacing * maxScale;
    material.uniforms.octreeSize.value = this.pcoGeometry.boundingBox.getSize(helperVec3).x;

    if (
      material.pointSizeType === PointSizeType.ADAPTIVE ||
      material.pointColorType === PointColorType.LOD
    ) {
      this.updateVisibilityTextureData(visibleNodes, material);
    }
  }

  private updateVisibilityTextureData(nodes: PointCloudOctreeNode[], material: PointCloudMaterial) {
    nodes.sort(byLevelAndIndex);

    const data = new Uint8Array(nodes.length * 4);
    const offsetsToChild = new Array(nodes.length).fill(Infinity);

    this.visibleNodeTextureOffsets.clear();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      this.visibleNodeTextureOffsets.set(node.name, i);

      if (i > 0) {
        const parentName = node.name.slice(0, -1);
        const parentOffset = this.visibleNodeTextureOffsets.get(parentName)!;
        const parentOffsetToChild = i - parentOffset;

        offsetsToChild[parentOffset] = Math.min(offsetsToChild[parentOffset], parentOffsetToChild);

        // tslint:disable:no-bitwise
        const offset = parentOffset * 4;
        data[offset] = data[offset] | (1 << node.index);
        data[offset + 1] = offsetsToChild[parentOffset] >> 8;
        data[offset + 2] = offsetsToChild[parentOffset] % 256;
        // tslint:enable:no-bitwise
      }

      data[i * 4 + 3] = node.name.length;
    }

    const texture = material.visibleNodesTexture;
    texture.image.data.set(data);
    texture.needsUpdate = true;
  }

  private helperSphere = new Sphere();

  nodesOnRay(nodes: PointCloudOctreeNode[], ray: Ray): PointCloudOctreeNode[] {
    const nodesOnRay: PointCloudOctreeNode[] = [];

    const rayClone = ray.clone();
    for (const node of nodes) {
      const sphere = this.helperSphere.copy(node.boundingSphere).applyMatrix4(this.matrixWorld);

      if (rayClone.intersectsSphere(sphere)) {
        nodesOnRay.push(node);
      }
    }

    return nodesOnRay;
  }

  updateMatrixWorld(force: boolean): void {
    if (this.matrixAutoUpdate === true) {
      this.updateMatrix();
    }

    if (this.matrixWorldNeedsUpdate === true || force === true) {
      if (!this.parent) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }

      this.matrixWorldNeedsUpdate = false;

      force = true;
    }
  }

  hideDescendants(object: Object3D): void {
    const toHide: Object3D[] = [];
    addVisibleChildren(object);

    while (toHide.length > 0) {
      const objToHide = toHide.shift()!;
      objToHide.visible = false;
      addVisibleChildren(objToHide);
    }

    function addVisibleChildren(obj: Object3D) {
      for (const child of obj.children) {
        if (child.visible) {
          toHide.push(child);
        }
      }
    }
  }

  moveToOrigin(): void {
    this.position.set(0, 0, 0); // Reset, then the matrix will be updated in getBoundingBoxWorld()
    this.position.set(0, 0, 0).sub(this.getBoundingBoxWorld().getCenter(new Vector3()));
  }

  moveToGroundPlane(): void {
    this.position.y += -this.getBoundingBoxWorld().min.y;
  }

  getBoundingBoxWorld(): Box3 {
    this.updateMatrixWorld(true);
    return computeTransformedBoundingBox(this.boundingBox, this.matrixWorld);
  }

  getVisibleExtent() {
    return this.visibleBounds.applyMatrix4(this.matrixWorld);
  }

  pick(
    renderer: WebGLRenderer,
    camera: PerspectiveCamera,
    ray: Ray,
    params: Partial<PickParams> = {},
  ): PickPoint | null {
    const pixelRatio = renderer.getPixelRatio();
    const pickWndSize = Math.floor(
      (params.pickWindowSize || DEFAULT_PICK_WINDOW_SIZE) * pixelRatio,
    );

    const width = Math.ceil(renderer.domElement.clientWidth * pixelRatio);
    const height = Math.ceil(renderer.domElement.clientHeight * pixelRatio);

    const pickState = this.pickState ? this.pickState : (this.pickState = this.getPickState());
    const pickMaterial = pickState.material;

    // Get all the octree nodes which intersect the picking ray. We only need to render those.
    const nodes: PointCloudOctreeNode[] = this.nodesOnRay(this.visibleNodes, ray);
    if (nodes.length === 0) {
      return null;
    }

    // Create copies of the nodes so we can render them differently than in the normal point cloud.
    const tempNodes = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.pcIndex = i + 1;

      const sceneNode = node.sceneNode;
      const tempNode = new Points(sceneNode.geometry, pickMaterial);
      tempNode.matrix = sceneNode.matrix;
      tempNode.matrixWorld = sceneNode.matrixWorld;
      tempNode.matrixAutoUpdate = false;
      tempNode.frustumCulled = false;
      (tempNode as any).pcIndex = i + 1;
      tempNode.onBeforeRender = this.makeOnBeforeRender(node);

      tempNodes.push(tempNode);
    }

    pickState.scene.autoUpdate = false;
    pickState.scene.children = tempNodes;

    this.updatePickMaterial(pickMaterial, params);
    this.updateMaterial(pickMaterial, nodes, camera, renderer);
    this.updatePickRenderTarget(this.pickState, width, height);

    let pixelPos = helperVec3; // Use helper vector to prevent extra allocations.

    if (params.pixelPos) {
        pixelPos = params.pixelPos;
    } else {
        pixelPos.addVectors(camera.position, ray.direction).project(camera);
        pixelPos.x = (pixelPos.x + 1) * width * 0.5;
        pixelPos.y = (pixelPos.y + 1) * height * 0.5;
    }

    const halfPickWndSize = (pickWndSize - 1) / 2;
    const x = Math.floor(clamp(pixelPos.x - halfPickWndSize, 0, width));
    const y = Math.floor(clamp(pixelPos.y - halfPickWndSize, 0, height));

    // Render the intersected nodes onto the pick render target, clipping to a small pick window.
    renderer.setScissor(x, y, pickWndSize, pickWndSize);
    renderer.setScissorTest(true);
    renderer.state.buffers.depth.setTest(pickMaterial.depthTest);
    renderer.state.buffers.depth.setMask(pickMaterial.depthWrite ? 1 : 0);
    renderer.state.setBlending(NoBlending);

    renderer.setRenderTarget(pickState.renderTarget);
    renderer.clear(true, true, true);
    renderer.render(pickState.scene, camera);

    // Read the pixel from the pick render target.
    const pixels = new Uint8Array(4 * pickWndSize * pickWndSize);
    renderer.readRenderTargetPixels(pickState.renderTarget, x, y, pickWndSize, pickWndSize, pixels);
    renderer.setScissorTest(false);
    renderer.setRenderTarget(null!);

    const ibuffer = new Uint32Array(pixels.buffer);

    // Find closest hit inside pixelWindow boundaries
    let min = Number.MAX_VALUE;
    let hit: PointCloudHit | null = null;
    for (let u = 0; u < pickWndSize; u++) {
      for (let v = 0; v < pickWndSize; v++) {
        const offset = u + v * pickWndSize;
        const distance =
          Math.pow(u - (pickWndSize - 1) / 2, 2) + Math.pow(v - (pickWndSize - 1) / 2, 2);

        const pcIndex = pixels[4 * offset + 3];
        pixels[4 * offset + 3] = 0;
        const pIndex = ibuffer[offset];

        if (pcIndex > 0 && distance < min) {
          hit = {
            pIndex: pIndex,
            pcIndex: pcIndex - 1,
          };
          min = distance;
        }
      }
    }

    return this.getPickPoint(hit, nodes);
  }

  private getPickPoint(hit: PointCloudHit | null, nodes: PointCloudOctreeNode[]): PickPoint | null {
    if (!hit) {
      return null;
    }

    const point: PickPoint = {};

    const points = nodes[hit.pcIndex] && nodes[hit.pcIndex].sceneNode;
    if (!points) {
      return null;
    }

    const attributes: BufferAttribute[] = (points.geometry as any).attributes;

    for (const property in attributes) {
      if (!attributes.hasOwnProperty(property)) {
        continue;
      }

      const values = attributes[property];

      // tslint:disable-next-line:prefer-switch
      if (property === 'position') {
        this.addPositionToPickPoint(point, hit, values, points);
      } else if (property === 'normal') {
        this.addNormalToPickPoint(point, hit, values);
      } else if (property === 'indices') {
        // TODO
      } else {
        if (values.itemSize === 1) {
          point[property] = values.array[hit.pIndex];
        } else {
          const value = [];
          for (let j = 0; j < values.itemSize; j++) {
            value.push(values.array[values.itemSize * hit.pIndex + j]);
          }
          point[property] = value;
        }
      }
    }

    return point;
  }

  private addPositionToPickPoint(
    point: PickPoint,
    hit: PointCloudHit,
    values: BufferAttribute,
    points: Points,
  ): void {
    const x = values.array[3 * hit.pIndex];
    const y = values.array[3 * hit.pIndex + 1];
    const z = values.array[3 * hit.pIndex + 2];

    point.position = new Vector3(x, y, z).applyMatrix4(points.matrixWorld);
  }

  private addNormalToPickPoint(
    point: PickPoint,
    hit: PointCloudHit,
    values: BufferAttribute,
  ): void {
    const normalsArray = values.array;

    const x = normalsArray[3 * hit.pIndex];
    const y = normalsArray[3 * hit.pIndex + 1];
    const z = normalsArray[3 * hit.pIndex + 2];

    const normal = new Vector4(x, y, z, 0);
    const m = new Matrix4();
    m.getInverse(this.matrixWorld);
    m.transpose();
    normal.applyMatrix4(m);

    point.normal = new Vector3(normal.x, normal.y, normal.z);
    point.datasetNormal = new Vector3(x, y, z);
  }

  private getPickState() {
    const scene = new Scene();

    const material = new PointCloudMaterial();
    material.pointColorType = PointColorType.POINT_INDEX;

    return {
      renderTarget: this.makePickRenderTarget(),
      material: material,
      scene: scene,
    };
  }

  private updatePickMaterial(pickMaterial: PointCloudMaterial, params: Partial<PickParams>): void {
    const material = this.material;

    pickMaterial.pointSizeType = material.pointSizeType;
    pickMaterial.shape = material.shape;
    pickMaterial.size = material.size;
    pickMaterial.minSize = material.minSize;
    pickMaterial.maxSize = material.maxSize;
    pickMaterial.classification = material.classification;

    if (params.pickOutsideClipRegion) {
      pickMaterial.clipMode = ClipMode.DISABLED;
    } else {
      pickMaterial.clipMode = material.clipMode;
      pickMaterial.setClipBoxes(
        material.clipMode === ClipMode.CLIP_OUTSIDE ? material.clipBoxes : [],
      );
    }
  }

  private updatePickRenderTarget(pickState: IPickState, width: number, height: number): void {
    if (pickState.renderTarget.width === width && pickState.renderTarget.height === height) {
      return;
    }

    pickState.renderTarget.dispose();
    pickState.renderTarget = this.makePickRenderTarget();
    pickState.renderTarget.setSize(width, height);
  }

  private makePickRenderTarget() {
    return new WebGLRenderTarget(1, 1, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
    });
  }

  get progress() {
    return this.visibleGeometry.length === 0
      ? 0
      : this.visibleNodes.length / this.visibleGeometry.length;
  }
}
