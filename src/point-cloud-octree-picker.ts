import {
  BufferAttribute,
  Camera,
  Color,
  LinearFilter,
  NearestFilter,
  NoBlending,
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
import { COLOR_BLACK, DEFAULT_PICK_WINDOW_SIZE } from './constants';
import { ClipMode, PointCloudMaterial, PointColorType } from './materials';
import { PointCloudOctree } from './point-cloud-octree';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { PickPoint, PointCloudHit } from './types';
import { clamp } from './utils/math';

export interface PickParams {
  pickWindowSize: number;
  pickOutsideClipRegion: boolean;
  /**
   * If provided, the picking will use this pixel position instead of the `Ray` passed to the `pick`
   * method.
   */
  pixelPosition: Vector3;
  /**
   * Function which gets called after a picking material has been created and setup and before the
   * point cloud is rendered into the picking render target. This gives applications a chance to
   * customize the renderTarget and the material.
   *
   * @param material
   *    The pick material.
   * @param renterTarget
   *    The render target used for picking.
   */
  onBeforePickRender: (material: PointCloudMaterial, renterTarget: WebGLRenderTarget) => void;
}

interface IPickState {
  renderTarget: WebGLRenderTarget;
  material: PointCloudMaterial;
  scene: Scene;
}

interface RenderedNode {
  node: PointCloudOctreeNode;
  octree: PointCloudOctree;
}

export class PointCloudOctreePicker {
  private static readonly helperVec3 = new Vector3();
  private static readonly helperSphere = new Sphere();
  private static readonly clearColor = new Color();
  private pickState: IPickState | undefined;

  dispose() {
    if (this.pickState) {
      this.pickState.material.dispose();
      this.pickState.renderTarget.dispose();
    }
  }

  pick(
    renderer: WebGLRenderer,
    camera: Camera,
    ray: Ray,
    octrees: PointCloudOctree[],
    params: Partial<PickParams> = {},
  ): PickPoint | null {
    if (octrees.length === 0) {
      return null;
    }

    const pickState = this.pickState
      ? this.pickState
      : (this.pickState = PointCloudOctreePicker.getPickState());

    const pickMaterial = pickState.material;

    const pixelRatio = renderer.getPixelRatio();
    const width = Math.ceil(renderer.domElement.clientWidth * pixelRatio);
    const height = Math.ceil(renderer.domElement.clientHeight * pixelRatio);
    PointCloudOctreePicker.updatePickRenderTarget(this.pickState, width, height);

    const pixelPosition = PointCloudOctreePicker.helperVec3; // Use helper vector to prevent extra allocations.

    if (params.pixelPosition) {
      pixelPosition.copy(params.pixelPosition);
    } else {
      pixelPosition.addVectors(camera.position, ray.direction).project(camera);
      pixelPosition.x = (pixelPosition.x + 1) * width * 0.5;
      pixelPosition.y = (pixelPosition.y + 1) * height * 0.5;
    }

    const pickWndSize = Math.floor(
      (params.pickWindowSize || DEFAULT_PICK_WINDOW_SIZE) * pixelRatio,
    );
    const halfPickWndSize = (pickWndSize - 1) / 2;
    const x = Math.floor(clamp(pixelPosition.x - halfPickWndSize, 0, width));
    const y = Math.floor(clamp(pixelPosition.y - halfPickWndSize, 0, height));

    PointCloudOctreePicker.prepareRender(renderer, x, y, pickWndSize, pickMaterial, pickState);

    const renderedNodes = PointCloudOctreePicker.render(
      renderer,
      camera,
      pickMaterial,
      octrees,
      ray,
      pickState,
      params,
    );

    // Cleanup
    pickMaterial.clearVisibleNodeTextureOffsets();

    // Read back image and decode hit point
    const pixels = PointCloudOctreePicker.readPixels(renderer, x, y, pickWndSize);
    const hit = PointCloudOctreePicker.findHit(pixels, pickWndSize);
    return PointCloudOctreePicker.getPickPoint(hit, renderedNodes);
  }

  private static prepareRender(
    renderer: WebGLRenderer,
    x: number,
    y: number,
    pickWndSize: number,
    pickMaterial: PointCloudMaterial,
    pickState: IPickState,
  ) {
    // Render the intersected nodes onto the pick render target, clipping to a small pick window.
    renderer.setScissor(x, y, pickWndSize, pickWndSize);
    renderer.setScissorTest(true);
    renderer.state.buffers.depth.setTest(pickMaterial.depthTest);
    renderer.state.buffers.depth.setMask(pickMaterial.depthWrite);
    renderer.state.setBlending(NoBlending);

    renderer.setRenderTarget(pickState.renderTarget);

    // Save the current clear color and clear the renderer with black color and alpha 0.
    renderer.getClearColor(this.clearColor);
    const oldClearAlpha = renderer.getClearAlpha();
    renderer.setClearColor(COLOR_BLACK, 0);
    renderer.clear(true, true, true);
    renderer.setClearColor(this.clearColor, oldClearAlpha);
  }

  private static render(
    renderer: WebGLRenderer,
    camera: Camera,
    pickMaterial: PointCloudMaterial,
    octrees: PointCloudOctree[],
    ray: Ray,
    pickState: IPickState,
    params: Partial<PickParams>,
  ): RenderedNode[] {
    const renderedNodes: RenderedNode[] = [];
    for (const octree of octrees) {
      // Get all the octree nodes which intersect the picking ray. We only need to render those.
      const nodes = PointCloudOctreePicker.nodesOnRay(octree, ray);
      if (!nodes.length) {
        continue;
      }

      PointCloudOctreePicker.updatePickMaterial(pickMaterial, octree.material, params);
      pickMaterial.updateMaterial(octree, nodes, camera, renderer);

      if (params.onBeforePickRender) {
        params.onBeforePickRender(pickMaterial, pickState.renderTarget);
      }

      // Create copies of the nodes so we can render them differently than in the normal point cloud.
      pickState.scene.children = PointCloudOctreePicker.createTempNodes(
        octree,
        nodes,
        pickMaterial,
        renderedNodes.length,
      );

      renderer.render(pickState.scene, camera);

      nodes.forEach(node => renderedNodes.push({ node, octree }));
    }
    return renderedNodes;
  }

  private static nodesOnRay(octree: PointCloudOctree, ray: Ray): PointCloudOctreeNode[] {
    const nodesOnRay: PointCloudOctreeNode[] = [];

    const rayClone = ray.clone();
    for (const node of octree.visibleNodes) {
      const sphere = PointCloudOctreePicker.helperSphere
        .copy(node.boundingSphere)
        .applyMatrix4(octree.matrixWorld);

      if (rayClone.intersectsSphere(sphere)) {
        nodesOnRay.push(node);
      }
    }

    return nodesOnRay;
  }

  private static readPixels(
    renderer: WebGLRenderer,
    x: number,
    y: number,
    pickWndSize: number,
  ): Uint8Array {
    // Read the pixel from the pick render target.
    const pixels = new Uint8Array(4 * pickWndSize * pickWndSize);
    renderer.readRenderTargetPixels(
      renderer.getRenderTarget()!,
      x,
      y,
      pickWndSize,
      pickWndSize,
      pixels,
    );
    renderer.setScissorTest(false);
    renderer.setRenderTarget(null!);
    return pixels;
  }

  private static createTempNodes(
    octree: PointCloudOctree,
    nodes: PointCloudOctreeNode[],
    pickMaterial: PointCloudMaterial,
    nodeIndexOffset: number,
  ): Points[] {
    const tempNodes: Points[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const sceneNode = node.sceneNode;
      const tempNode = new Points(sceneNode.geometry, pickMaterial);
      tempNode.matrix = sceneNode.matrix;
      tempNode.matrixWorld = sceneNode.matrixWorld;
      tempNode.matrixAutoUpdate = false;
      tempNode.frustumCulled = false;
      const nodeIndex = nodeIndexOffset + i + 1;
      if (nodeIndex > 255) {
        console.error('More than 255 nodes for pick are not supported.');
      }
      tempNode.onBeforeRender = PointCloudMaterial.makeOnBeforeRender(octree, node, nodeIndex);

      tempNodes.push(tempNode);
    }
    return tempNodes;
  }

  private static updatePickMaterial(
    pickMaterial: PointCloudMaterial,
    nodeMaterial: PointCloudMaterial,
    params: Partial<PickParams>,
  ): void {
    pickMaterial.pointSizeType = nodeMaterial.pointSizeType;
    pickMaterial.shape = nodeMaterial.shape;
    pickMaterial.size = nodeMaterial.size;
    pickMaterial.minSize = nodeMaterial.minSize;
    pickMaterial.maxSize = nodeMaterial.maxSize;
    pickMaterial.classification = nodeMaterial.classification;
    pickMaterial.useFilterByNormal = nodeMaterial.useFilterByNormal;
    pickMaterial.filterByNormalThreshold = nodeMaterial.filterByNormalThreshold;

    if (params.pickOutsideClipRegion) {
      pickMaterial.clipMode = ClipMode.DISABLED;
    } else {
      pickMaterial.clipMode = nodeMaterial.clipMode;
      pickMaterial.setClipBoxes(
        nodeMaterial.clipMode === ClipMode.CLIP_OUTSIDE ? nodeMaterial.clipBoxes : [],
      );
    }
  }

  private static updatePickRenderTarget(
    pickState: IPickState,
    width: number,
    height: number,
  ): void {
    if (pickState.renderTarget.width === width && pickState.renderTarget.height === height) {
      return;
    }

    pickState.renderTarget.dispose();
    pickState.renderTarget = PointCloudOctreePicker.makePickRenderTarget();
    pickState.renderTarget.setSize(width, height);
  }

  private static makePickRenderTarget() {
    return new WebGLRenderTarget(1, 1, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
    });
  }

  private static findHit(pixels: Uint8Array, pickWndSize: number): PointCloudHit | null {
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
    return hit;
  }

  private static getPickPoint(hit: PointCloudHit | null, nodes: RenderedNode[]): PickPoint | null {
    if (!hit) {
      return null;
    }

    const point: PickPoint = {};

    const points = nodes[hit.pcIndex] && nodes[hit.pcIndex].node.sceneNode;
    if (!points) {
      return null;
    }

    point.pointCloud = nodes[hit.pcIndex].octree;

    const attributes: BufferAttribute[] = (points.geometry as any).attributes;

    for (const property in attributes) {
      if (!attributes.hasOwnProperty(property)) {
        continue;
      }

      const values = attributes[property];

      // tslint:disable-next-line:prefer-switch
      if (property === 'position') {
        PointCloudOctreePicker.addPositionToPickPoint(point, hit, values, points);
      } else if (property === 'normal') {
        PointCloudOctreePicker.addNormalToPickPoint(point, hit, values, points);
      } else if (property === 'indices') {
        // TODO
      } else {
        if (values.itemSize === 1) {
          point[property] = values.array[hit.pIndex];
        } else {
          const value: number[] = [];
          for (let j = 0; j < values.itemSize; j++) {
            value.push(values.array[values.itemSize * hit.pIndex + j]);
          }
          point[property] = value;
        }
      }
    }

    return point;
  }

  private static addPositionToPickPoint(
    point: PickPoint,
    hit: PointCloudHit,
    values: BufferAttribute,
    points: Points,
  ): void {
    point.position = new Vector3()
      .fromBufferAttribute(values, hit.pIndex)
      .applyMatrix4(points.matrixWorld);
  }

  private static addNormalToPickPoint(
    point: PickPoint,
    hit: PointCloudHit,
    values: BufferAttribute,
    points: Points,
  ): void {
    const normal = new Vector3().fromBufferAttribute(values, hit.pIndex);
    const normal4 = new Vector4(normal.x, normal.y, normal.z, 0).applyMatrix4(points.matrixWorld);
    normal.set(normal4.x, normal4.y, normal4.z);

    point.normal = normal;
  }

  private static getPickState() {
    const scene = new Scene();
    scene.autoUpdate = false;

    const material = new PointCloudMaterial();
    material.pointColorType = PointColorType.POINT_INDEX;

    return {
      renderTarget: PointCloudOctreePicker.makePickRenderTarget(),
      material: material,
      scene: scene,
    };
  }
}
