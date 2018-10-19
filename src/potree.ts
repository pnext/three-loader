import { Box3, Frustum, Matrix4, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { DEFAULT_POINT_BUDGET, MAX_LOADS_TO_GPU, MAX_NUM_NODES_LOADING } from './constants';
import { FEATURES } from './features';
import {GetUrlFn, loadPOC} from './loading';
import { ClipMode } from './materials/clipping';
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
  maxNumNodesLoading: number = MAX_NUM_NODES_LOADING;
  features = FEATURES;
  lru = new LRU(this._pointBudget);

  loadPointCloud(url: string, getUrl: GetUrlFn,
      xhrRequest = (input: RequestInfo, init?: RequestInit) => fetch(input, init)): Promise<PointCloudOctree> {
    return loadPOC(url, getUrl, xhrRequest).then(geometry => new PointCloudOctree(this, geometry));
  }

  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult {
    const result = this.updateVisibility(pointClouds, camera, renderer);

    for (let i = 0; i < pointClouds.length; i++) {
      const pointCloud = pointClouds[i];
      if (pointCloud.disposed) {
        continue;
      }

      pointCloud.updateMaterial(pointCloud.material, pointCloud.visibleNodes, camera, renderer);
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
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult {
    let numVisiblePoints = 0;

    const visibleNodes: PointCloudOctreeNode[] = [];
    const visibleGeometry: PointCloudOctreeGeometryNode[] = [];
    const unloadedGeometry: PointCloudOctreeGeometryNode[] = [];

    // calculate object space frustum and cam pos and setup priority queue
    const { frustums, cameraPositions, priorityQueue } = this.updateVisibilityStructures(
      pointClouds,
      camera,
    );

    let loadedToGPUThisFrame = 0;
    let queueItem: QueueItem | undefined;

    const halfHeight = 0.5 * renderer.getSize().height;
    const fov = (camera.fov * Math.PI) / 180.0;
    const fovSlope = Math.tan(fov / 2.0);

    while ((queueItem = priorityQueue.pop()) !== undefined) {
      let node = queueItem.node;

      // If we will end up with too many points, we stop right away.
      if (numVisiblePoints + node.numPoints > this.pointBudget) {
        break;
      }

      const pointCloudIndex = queueItem.pointCloudIndex;
      const pointCloud = pointClouds[pointCloudIndex];

      const maxLevel = pointCloud.maxLevel || Infinity;

      if (
        node.level > maxLevel ||
        !frustums[pointCloudIndex].intersectsBox(node.boundingBox) ||
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
        } else {
          unloadedGeometry.push(node);
          visibleGeometry.push(node);
        }
      }

      if (isTreeNode(node)) {
        this.updateTreeNodeVisibility(pointCloud, node, visibleNodes);
      }

      this.updateChildVisibility(
        queueItem,
        priorityQueue,
        pointCloud,
        node,
        cameraPositions[pointCloudIndex],
        halfHeight,
        fovSlope,
      );
    } // end priority queue loop

    const numNodesToLoad = Math.min(this.maxNumNodesLoading, unloadedGeometry.length);
    for (let i = 0; i < numNodesToLoad; i++) {
      unloadedGeometry[i].load();
    }

    return {
      visibleNodes: visibleNodes,
      numVisiblePoints: numVisiblePoints,
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
    cameraPosition: Vector3,
    halfHeight: number,
    fovSlope: number,
  ): void {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child === null) {
        continue;
      }

      const sphere = child.boundingSphere;
      const distance = sphere.center.distanceTo(cameraPosition);
      const radius = sphere.radius;

      const projFactor = halfHeight / (fovSlope * distance);
      const screenPixelRadius = radius * projFactor;

      // Don't add the node if it'll be too small on the screen.
      if (screenPixelRadius < pointCloud.minNodePixelSize) {
        continue;
      }

      // Nodes which are larger will have priority in loading/displaying.
      const weight = distance < radius ? Number.MAX_VALUE : screenPixelRadius + 1 / distance;

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
        return true;
      }
    }

    return false;
  }

  private updateVisibilityStructures = (() => {
    const frustumMatrix = new Matrix4();
    const inverseWorldMatrix = new Matrix4();
    const cameraMatrix = new Matrix4();

    return (
      pointClouds: PointCloudOctree[],
      camera: PerspectiveCamera,
    ): {
      frustums: Frustum[];
      cameraPositions: Vector3[];
      priorityQueue: BinaryHeap<QueueItem>;
    } => {
      const frustums: Frustum[] = [];
      const cameraPositions = [];
      const priorityQueue = new BinaryHeap<QueueItem>(x => 1 / x.weight);

      for (let i = 0; i < pointClouds.length; i++) {
        const pointCloud = pointClouds[i];

        if (!pointCloud.initialized()) {
          continue;
        }

        pointCloud.numVisiblePoints = 0;
        pointCloud.visibleNodes = [];
        pointCloud.visibleGeometry = [];

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
