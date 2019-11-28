import {
  Box3,
  Camera,
  Frustum,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  DEFAULT_POINT_BUDGET,
  MAX_LOADS_TO_GPU,
  MAX_NUM_NODES_LOADING,
  PERSPECTIVE_CAMERA,
} from './constants';
import { FEATURES } from './features';
import { GetUrlFn, loadPOC } from './loading';
import { ClipMode } from './materials';
import { PointCloudOctree } from './point-cloud-octree';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { isGeometryNode, isTreeNode } from './type-predicates';
import { IPointCloudTreeNode, IPotree, IVisibilityUpdateResult } from './types';
import { BinaryHeap } from './utils/binary-heap';
import { Box3Helper } from './utils/box3-helper';
import { LRU } from './utils/lru';

export class QueueItem {
  constructor(
    public pointCloudIndex: number,
    public weight: number,
    public node: IPointCloudTreeNode,
    public parent?: IPointCloudTreeNode | null,
  ) {}
}

export class Potree implements IPotree {
  private _pointBudget: number = DEFAULT_POINT_BUDGET;
  private _rendererSize: Vector2 = new Vector2();

  maxNumNodesLoading: number = MAX_NUM_NODES_LOADING;
  features = FEATURES;
  lru = new LRU(this._pointBudget);

  loadPointCloud(
    url: string,
    getUrl: GetUrlFn,
    xhrRequest = (input: RequestInfo, init?: RequestInit) => fetch(input, init),
  ): Promise<PointCloudOctree> {
    return loadPOC(url, getUrl, xhrRequest).then(geometry => new PointCloudOctree(this, geometry));
  }

  updatePointClouds(
    pointClouds: PointCloudOctree[],
    cameras: OrthographicCamera | PerspectiveCamera | OrthographicCamera[] | PerspectiveCamera[],
    renderers: WebGLRenderer | WebGLRenderer[],
  ): IVisibilityUpdateResult {
    const renderersArr = Array.isArray(renderers) ? renderers : [renderers]
    const camerasArr = Array.isArray(cameras) ? cameras : [cameras]
    const firstCameraType = camerasArr[0].type
    const cameraTypeTest = camerasArr.every(camera => camera.type === firstCameraType);

    if (!cameraTypeTest) {
      throw new Error('Cameras must all be of same type, perspective or orthographic.');
    }

    const result = this.updateVisibility(pointClouds, camerasArr, renderersArr);

    for (let i = 0; i < pointClouds.length; i++) {
      const pointCloud = pointClouds[i];
      if (pointCloud.disposed) {
        continue;
      }

      pointCloud.updateMaterial(
        pointCloud.material,
        pointCloud.visibleNodes,
        // fix
        camerasArr[0] as PerspectiveCamera,
        renderersArr[0],
      );
      pointCloud.updateVisibleBounds();
      pointCloud.updateBoundingBoxes();
    }

    this.lru.freeMemory();

    return result;
  }

  get pointBudget(): number {
    return this._pointBudget;
  }

  set pointBudget(value: number) {
    if (value !== this._pointBudget) {
      this._pointBudget = value;
      this.lru.pointBudget = value;
      this.lru.freeMemory();
    }
  }

  private updateVisibility(
    pointClouds: PointCloudOctree[],
    cameras: Camera[],
    renderers: WebGLRenderer[],
  ): IVisibilityUpdateResult {
    let numVisiblePoints = 0;

    const visibleNodes: PointCloudOctreeNode[] = [];
    const unloadedGeometry: PointCloudOctreeGeometryNode[] = [];

    // calculate object space frustum and cam pos and setup priority queue
    const { frustums, cameraPositions, priorityQueue } = this.updateVisibilityStructures(
      pointClouds,
      cameras,
    );

    let loadedToGPUThisFrame = 0;
    let exceededMaxLoadsToGPU = false;
    let nodeLoadFailed = false;
    let queueItem: QueueItem | undefined;

    while ((queueItem = priorityQueue.pop()) !== undefined) {
      let node = queueItem.node;

      // If we will end up with too many points, we stop right away.
      if (numVisiblePoints + node.numPoints > this.pointBudget) {
        break;
      }

      const pointCloudIndex = queueItem.pointCloudIndex;
      const pointCloud = pointClouds[pointCloudIndex];

      const maxLevel = pointCloud.maxLevel !== undefined ? pointCloud.maxLevel : Infinity;

      const isIntersecting = frustums.some(frustum => frustum.intersectsBox(node.boundingBox));

      if (
        node.level > maxLevel ||
        !isIntersecting ||
        this.shouldClip(pointCloud, node.boundingBox)
      ) {
        continue;
      }

      numVisiblePoints += node.numPoints;
      pointCloud.numVisiblePoints += node.numPoints;

      const parentNode = queueItem.parent;

      if (isGeometryNode(node) && (!parentNode || isTreeNode(parentNode))) {
        if (node.loaded && loadedToGPUThisFrame < MAX_LOADS_TO_GPU) {
          node = pointCloud.toTreeNode(node, parentNode);
          loadedToGPUThisFrame++;
        } else if (!node.failed) {
          if (node.loaded && loadedToGPUThisFrame >= MAX_LOADS_TO_GPU) {
            exceededMaxLoadsToGPU = true;
          }
          unloadedGeometry.push(node);
          pointCloud.visibleGeometry.push(node);
        } else {
          nodeLoadFailed = true;
          continue;
        }
      }

      if (isTreeNode(node)) {
        this.updateTreeNodeVisibility(pointCloud, node, visibleNodes);
        pointCloud.visibleGeometry.push(node.geometryNode);
      }

      const halfHeights = renderers.map(
        renderer => 0.5 * renderer.getSize(this._rendererSize).height * renderer.getPixelRatio(),
      );

      this.updateChildVisibility(
        queueItem,
        priorityQueue,
        pointCloud,
        node,
        cameraPositions,
        pointCloudIndex,
        cameras,
        halfHeights,
      );
    } // end priority queue loop

    const numNodesToLoad = Math.min(this.maxNumNodesLoading, unloadedGeometry.length);
    const nodeLoadPromises: Promise<void>[] = [];
    for (let i = 0; i < numNodesToLoad; i++) {
      nodeLoadPromises.push(unloadedGeometry[i].load());
    }

    return {
      visibleNodes: visibleNodes,
      numVisiblePoints: numVisiblePoints,
      exceededMaxLoadsToGPU: exceededMaxLoadsToGPU,
      nodeLoadFailed: nodeLoadFailed,
      nodeLoadPromises: nodeLoadPromises,
    };
  }

  private updateTreeNodeVisibility(
    pointCloud: PointCloudOctree,
    node: PointCloudOctreeNode,
    visibleNodes: IPointCloudTreeNode[],
  ): void {
    this.lru.touch(node.geometryNode);

    const sceneNode = node.sceneNode;
    sceneNode.visible = true;
    sceneNode.material = pointCloud.material;
    sceneNode.updateMatrix();
    sceneNode.matrixWorld.multiplyMatrices(pointCloud.matrixWorld, sceneNode.matrix);

    visibleNodes.push(node);
    pointCloud.visibleNodes.push(node);

    this.updateBoundingBoxVisibility(pointCloud, node);
  }

  private updateChildVisibility(
    queueItem: QueueItem,
    priorityQueue: BinaryHeap<QueueItem>,
    pointCloud: PointCloudOctree,
    node: IPointCloudTreeNode,
    cameraPositions: Vector3[],
    pointCloudIndex: number,
    cameras: Camera[],
    halfHeights: number[],
  ): void {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child === null) {
        continue;
      }

      const sphere = child.boundingSphere;
      const radius = sphere.radius;
      const distances = []
      const screenPixelRadii = []

      for (let i = 0; i < cameras.length; i++) {
        const camera = cameras[i];
        const distance = sphere.center.distanceTo(cameraPositions[pointCloudIndex * cameras.length + i]);
        distances.push(distance)
        // halfHeight from renderers which are 1:1 with cameras
        const halfHeight = halfHeights[i]

        let projectionFactor = 0.0;

        if (camera.type === PERSPECTIVE_CAMERA) {
          const perspective = camera as PerspectiveCamera;
          const fov = (perspective.fov * Math.PI) / 180.0;
          const slope = Math.tan(fov / 2.0);
          projectionFactor = halfHeight / (slope * distance);
        } else {
          const orthographic = camera as OrthographicCamera;
          projectionFactor = (2 * halfHeight) / (orthographic.top - orthographic.bottom);
        }

        screenPixelRadii.push(radius * projectionFactor);
      }
      const minDistance = distances.sort((a, b) => a - b)[0]
      const maxScreenPixelRadius = screenPixelRadii.sort((a, b) => b - a)[0]

      // Don't add the node if it'll be too small on the screen.
      if (maxScreenPixelRadius < pointCloud.minNodePixelSize) {
        continue;
      }

      // Nodes which are larger will have priority in loading/displaying.
      const weight = minDistance < radius ? Number.MAX_VALUE : maxScreenPixelRadius + 1 / minDistance;

      priorityQueue.push(new QueueItem(queueItem.pointCloudIndex, weight, child, node));
    }
  }

  private updateBoundingBoxVisibility(
    pointCloud: PointCloudOctree,
    node: PointCloudOctreeNode,
  ): void {
    if (pointCloud.showBoundingBox && !node.boundingBoxNode) {
      const boxHelper = new Box3Helper(node.boundingBox);
      boxHelper.matrixAutoUpdate = false;
      pointCloud.boundingBoxNodes.push(boxHelper);
      node.boundingBoxNode = boxHelper;
      node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
    } else if (pointCloud.showBoundingBox && node.boundingBoxNode) {
      node.boundingBoxNode.visible = true;
      node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
    } else if (!pointCloud.showBoundingBox && node.boundingBoxNode) {
      node.boundingBoxNode.visible = false;
    }
  }

  private shouldClip(pointCloud: PointCloudOctree, boundingBox: Box3): boolean {
    const material = pointCloud.material;

    if (material.numClipBoxes === 0 || material.clipMode !== ClipMode.CLIP_OUTSIDE) {
      return false;
    }

    const box2 = boundingBox.clone();
    pointCloud.updateMatrixWorld(true);
    box2.applyMatrix4(pointCloud.matrixWorld);

    const clipBoxes = material.clipBoxes;
    for (let i = 0; i < clipBoxes.length; i++) {
      const clipMatrixWorld = clipBoxes[i].matrix;
      const clipBoxWorld = new Box3(
        new Vector3(-0.5, -0.5, -0.5),
        new Vector3(0.5, 0.5, 0.5),
      ).applyMatrix4(clipMatrixWorld);
      if (box2.intersectsBox(clipBoxWorld)) {
        return false;
      }
    }

    return true;
  }

  private updateVisibilityStructures = (() => {
    const frustumMatrix = new Matrix4();
    const inverseWorldMatrix = new Matrix4();
    const cameraMatrix = new Matrix4();

    return (
      pointClouds: PointCloudOctree[],
      cameras: Camera[],
    ): {
      frustums: Frustum[];
      cameraPositions: Vector3[];
      priorityQueue: BinaryHeap<QueueItem>;
    } => {
      const frustums: Frustum[] = [];
      const cameraPositions: Vector3[] = [];
      const priorityQueue = new BinaryHeap<QueueItem>(x => 1 / x.weight);

      for (let i = 0; i < pointClouds.length; i++) {
        const pointCloud = pointClouds[i];

        if (!pointCloud.initialized()) {
          continue;
        }

        pointCloud.numVisiblePoints = 0;
        pointCloud.visibleNodes = [];
        pointCloud.visibleGeometry = [];

        for (let i = 0; i < cameras.length; i++) {
          const camera = cameras[i]
          camera.updateMatrixWorld(false);

          // Furstum in object space.
          const inverseViewMatrix = camera.matrixWorldInverse;
          const worldMatrix = pointCloud.matrixWorld;
          frustumMatrix
            .identity()
            .multiply(camera.projectionMatrix)
            .multiply(inverseViewMatrix)
            .multiply(worldMatrix);
          frustums.push(new Frustum().setFromMatrix(frustumMatrix));

          // Camera position in object space
          inverseWorldMatrix.getInverse(worldMatrix);
          cameraMatrix
            .identity()
            .multiply(inverseWorldMatrix)
            .multiply(camera.matrixWorld);
          cameraPositions.push(new Vector3().setFromMatrixPosition(cameraMatrix));
        }

        if (pointCloud.visible && pointCloud.root !== null) {
          const weight = Number.MAX_VALUE;
          priorityQueue.push(new QueueItem(i, weight, pointCloud.root));
        }

        // Hide any previously visible nodes. We will later show only the needed ones.
        if (isTreeNode(pointCloud.root)) {
          pointCloud.hideDescendants(pointCloud.root.sceneNode);
        }

        for (const boundingBoxNode of pointCloud.boundingBoxNodes) {
          boundingBoxNode.visible = false;
        }
      }

      return { frustums, cameraPositions, priorityQueue };
    };
  })();
}
