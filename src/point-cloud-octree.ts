import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Geometry,
  LinearFilter,
  Material,
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
  WebGLProgram,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { DEFAULT_MIN_NODE_PIXEL_SIZE } from './constants';
import { ClipMode } from './materials/clipping';
import { PointColorType, PointSizeType } from './materials/enums';
import { PointCloudMaterial } from './materials/point-cloud-material';
import { PointCloudOctreeGeometry } from './point-cloud-octree-geometry';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { PointCloudTree } from './point-cloud-tree';
import { IPointCloudTreeNode, IPotree } from './types';
import { computeTransformedBoundingBox } from './utils/bounds';
import { clamp } from './utils/math';
import { byLevelAndIndex } from './utils/utils';

export interface PickParams {
  pickWindowSize: number;
  pickOutsideClipRegion: boolean;
}

interface IPickState {
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
  minNodePixelSize: number = DEFAULT_MIN_NODE_PIXEL_SIZE;
  root: IPointCloudTreeNode | null = null;
  boundingBoxNodes: Object3D[] = [];
  visibleNodes: PointCloudOctreeNode[] = [];
  visibleGeometry: PointCloudOctreeGeometry[] = [];
  numVisiblePoints: number = 0;
  showBoundingBox: boolean = false;
  private visibleBounds: Box3 = new Box3();
  private visibleNodeTextureOffsets = new Map<string, number>();
  private pickState: IPickState | undefined;

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
      renderer: WebGLRenderer,
      _scene: Scene,
      _camera: Camera,
      _geometry: Geometry | BufferGeometry,
      material: Material,
    ) => {
      const program = (material as any).program as WebGLProgram;
      if (program === undefined) {
        return;
      }

      const ctx = renderer.getContext();
      ctx.useProgram(program.program);

      const uniformsMap = (program.getUniforms() as any).map;
      const materialUniforms = (material as PointCloudMaterial).uniforms;

      if (uniformsMap.level !== undefined) {
        const level = node.level;
        materialUniforms.level.value = level;
        uniformsMap.level.setValue(ctx, level);
      }

      if (uniformsMap.isLeafNode !== undefined) {
        const isLeafNode = node.isLeafNode;
        uniformsMap.isLeafNode.setValue(ctx, isLeafNode);
        materialUniforms.isLeafNode.value = isLeafNode;
      }

      const vnStart = this.visibleNodeTextureOffsets.get(node.name);
      if (vnStart !== undefined && uniformsMap.vnStart !== undefined) {
        materialUniforms.vnStart.value = vnStart;
        uniformsMap.vnStart.setValue(ctx, vnStart);
      }

      if (uniformsMap.pcIndex !== undefined) {
        const i = node.pcIndex ? node.pcIndex : this.visibleNodes.indexOf(node);
        materialUniforms.pcIndex.value = i;
        uniformsMap.pcIndex.setValue(ctx, i);
      }
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

    material.fov = camera.fov * (Math.PI / 180);
    material.screenWidth = renderer.domElement.clientWidth;
    material.screenHeight = renderer.domElement.clientHeight;
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
  ) {
    const pickWindowSize = params.pickWindowSize || 17;

    const width = Math.ceil(renderer.domElement.clientWidth);
    const height = Math.ceil(renderer.domElement.clientHeight);

    const nodes: PointCloudOctreeNode[] = this.nodesOnRay(this.visibleNodes, ray);

    if (nodes.length === 0) {
      return null;
    }

    const pickState = this.pickState ? this.pickState : (this.pickState = this.getPickState());
    const pickMaterial = pickState.material;

    this.updatePickMaterial(pickMaterial, params);
    this.updateMaterial(pickMaterial, nodes, camera, renderer);

    if (pickState.renderTarget.width !== width || pickState.renderTarget.height !== height) {
      this.updatePickRenderTarget(this.pickState);
      pickState.renderTarget.setSize(width, height);
    }

    const pixelPos = helperVec3; // Use helper vector to prevent extra allocations.
    pixelPos
      .addVectors(camera.position, ray.direction)
      .project(camera)
      .addScalar(1)
      .multiplyScalar(0.5);
    pixelPos.x *= width;
    pixelPos.y *= height;

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
    // pickState.scene.overrideMaterial = pickMaterial;

    // RENDER
    renderer.setRenderTarget(pickState.renderTarget);
    renderer.clearTarget(pickState.renderTarget, true, true, true);

    const halfPickWindow = (pickWindowSize - 1) / 2;

    renderer.setScissor(
      Math.floor(pixelPos.x - halfPickWindow),
      Math.floor(pixelPos.y - halfPickWindow),
      Math.floor(pickWindowSize),
      Math.floor(pickWindowSize),
    );
    renderer.setScissorTest(true);
    renderer.state.buffers.depth.setTest(pickMaterial.depthTest);
    renderer.state.buffers.depth.setMask(pickMaterial.depthWrite ? 1 : 0);
    renderer.state.setBlending(NoBlending);

    renderer.render(pickState.scene, camera, pickState.renderTarget);

    const x = Math.floor(clamp(pixelPos.x - halfPickWindow, 0, width));
    const y = Math.floor(clamp(pixelPos.y - halfPickWindow, 0, height));
    const w = Math.floor(Math.min(x + pickWindowSize, width) - x);
    const h = Math.floor(Math.min(y + pickWindowSize, height) - y);

    const pixelCount = w * h;
    const buffer = new Uint8Array(4 * pixelCount);
    renderer.readRenderTargetPixels(pickState.renderTarget, x, y, w, h, buffer);
    renderer.setScissorTest(false);
    renderer.setRenderTarget(null!);

    const pixels = buffer;
    const ibuffer = new Uint32Array(buffer.buffer);

    // find closest hit inside pixelWindow boundaries
    let min = Number.MAX_VALUE;
    let hit = null;
    for (let u = 0; u < pickWindowSize; u++) {
      for (let v = 0; v < pickWindowSize; v++) {
        const offset = u + v * pickWindowSize;
        const distance =
          Math.pow(u - (pickWindowSize - 1) / 2, 2) + Math.pow(v - (pickWindowSize - 1) / 2, 2);

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

    let point: any = null;

    if (hit) {
      point = {};

      const node = nodes[hit.pcIndex];
      const pc = node && node.sceneNode;
      if (!pc) {
        return null;
      }

      const attributes: BufferAttribute[] = (pc.geometry as any).attributes;

      for (const property in attributes) {
        if (attributes.hasOwnProperty(property)) {
          const values = attributes[property];

          if (property === 'position') {
            const positionArray = values.array;

            // tslint:disable-next-line:no-shadowed-variable
            const x = positionArray[3 * hit.pIndex + 0];
            // tslint:disable-next-line:no-shadowed-variable
            const y = positionArray[3 * hit.pIndex + 1];
            const z = positionArray[3 * hit.pIndex + 2];

            point[property] = new Vector3(x, y, z).applyMatrix4(pc.matrixWorld);
          } else if (property === 'indices') {
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
      }
    }

    return point;
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

  private updatePickRenderTarget(pickState: IPickState) {
    pickState.renderTarget.dispose();
    pickState.renderTarget = this.makePickRenderTarget();
  }

  private makePickRenderTarget() {
    return new WebGLRenderTarget(1, 1, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
    });
  }

  get progress() {
    return this.visibleNodes.length / this.visibleGeometry.length;
  }
}
