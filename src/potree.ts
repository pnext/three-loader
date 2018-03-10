import { Box3, Frustum, Matrix4, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { FEATURES } from './features';
import { GetUrlFn, loadPOC } from './loading';
import { ClipMode } from './materials/clipping';
import { PointCloudOctree } from './point-cloud-octree';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { isGeometryNode, isTreeNode } from './type-predicates';
import { IPointCloudTreeNode, IPotree, IVisibilityUpdateResult } from './types';
import { BinaryHeap } from './utils/binary-heap';
import { Box3Helper } from './utils/box3-helper';
import { LRU } from './utils/lru';

export interface IQueueItem {
  weight: number;
  node: IPointCloudTreeNode;
  pointCloudIndex: number;
  parent?: IPointCloudTreeNode | null;
}

export class Potree implements IPotree {
  private _pointBudget: number = 1_000_000;
  maxNodesLoading: number = 5;
  features = FEATURES;
  lru = new LRU(this._pointBudget);

  loadPointCloud(url: string, getUrl: GetUrlFn): Promise<PointCloudOctree> {
    return loadPOC(url, getUrl).then(geometry => new PointCloudOctree(this, geometry));
  }

  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult {
    for (let i = 0; i < pointClouds.length; i++) {
      pointClouds[i].updateProfileRequests();
    }

    const result = this.updateVisibility(pointClouds, camera, renderer);

    for (let i = 0; i < pointClouds.length; i++) {
      const pointCloud = pointClouds[i];
      pointCloud.updateMaterial(pointCloud.material, pointCloud.visibleNodes, camera, renderer);
      pointCloud.updateVisibleBounds();
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

  // getDEMWorkerInstance() {
  //   if (!Potree.DEMWorkerInstance) {
  //     const workerPath = Potree.scriptPath + '/workers/DEMWorker.js';
  //     Potree.DEMWorkerInstance = Potree.workerPool.getWorker(workerPath);
  //   }

  //   return Potree.DEMWorkerInstance;
  // }

  private updateVisibility(
    pointClouds: PointCloudOctree[],
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult {
    let numVisiblePoints = 0;

    const visibleNodes: PointCloudOctreeNode[] = [];
    const visibleGeometry: PointCloudOctreeGeometryNode[] = [];
    const unloadedGeometry: PointCloudOctreeGeometryNode[] = [];

    let lowestSpacing = Infinity;

    // calculate object space frustum and cam pos and setup priority queue
    const { frustums, camObjPositions, priorityQueue } = this.updateVisibilityStructures(
      pointClouds,
      camera,
    );

    let loadedToGPUThisFrame = 0;
    const domHeight = renderer.domElement.clientHeight;

    while (priorityQueue.size() > 0) {
      const element = priorityQueue.pop()!;
      let node = element.node;
      const parentNode = element.parent;
      const pointCloud = pointClouds[element.pointCloudIndex];

      // // restrict to certain nodes for debugging
      // const allowedNodes = ['r', 'r0', 'r1', 'r2', 'r3', 'r4', 'r5'];
      // if (!allowedNodes.includes(node.name)) {
      //   continue;
      // }

      if (numVisiblePoints + node.numPoints > this.pointBudget) {
        break;
      }

      const frustum = frustums[element.pointCloudIndex];
      const camObjPos = camObjPositions[element.pointCloudIndex];

      if (
        node.level > pointCloud.maxLevel ||
        !frustum.intersectsBox(node.boundingBox) ||
        this.shouldClip(pointCloud, node.boundingBox)
      ) {
        continue;
      }

      lowestSpacing = Math.min(lowestSpacing, node.spacing);

      numVisiblePoints += node.numPoints;
      pointCloud.numVisiblePoints += node.numPoints;

      if (isGeometryNode(node) && (!parentNode || isTreeNode(parentNode))) {
        if (node.loaded && loadedToGPUThisFrame < 2) {
          node = pointCloud.toTreeNode(node, parentNode);
          loadedToGPUThisFrame++;
        } else {
          unloadedGeometry.push(node);
          visibleGeometry.push(node);
        }
      }

      if (isTreeNode(node)) {
        this.lru.touch(node.geometryNode);

        node.sceneNode.visible = true;
        node.sceneNode.material = pointCloud.material;

        visibleNodes.push(node);
        pointCloud.visibleNodes.push(node);

        node.sceneNode.updateMatrix();
        node.sceneNode.matrixWorld.multiplyMatrices(pointCloud.matrixWorld, node.sceneNode.matrix);

        this.updateBoundingBoxVisibility(pointCloud, node);
      }

      // add child nodes to priorityQueue
      for (let i = 0; i < 8; i++) {
        const child = node.children[i];
        if (child === null) {
          continue;
        }

        const sphere = child.boundingSphere;
        const distance = sphere.center.distanceTo(camObjPos);
        const radius = sphere.radius;

        const fov = camera.fov * Math.PI / 180;
        const slope = Math.tan(fov / 2);
        const projFactor = 0.5 * domHeight / (slope * distance);
        const screenPixelRadius = radius * projFactor;

        if (screenPixelRadius < pointCloud.minimumNodePixelSize) {
          continue;
        }

        let weight = screenPixelRadius;

        if (distance - radius < 0) {
          weight = Number.MAX_VALUE;
        }

        priorityQueue.push({
          pointCloudIndex: element.pointCloudIndex,
          node: child,
          parent: node,
          weight,
        });
      }
    } // end priority queue loop

    const numNodesToLoad = Math.min(this.maxNodesLoading, unloadedGeometry.length);
    for (let i = 0; i < numNodesToLoad; i++) {
      unloadedGeometry[i].load();
    }

    return {
      visibleNodes: visibleNodes,
      numVisiblePoints: numVisiblePoints,
      lowestSpacing: lowestSpacing,
    };
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
    const { material } = pointCloud;

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

  private updateVisibilityStructures(
    pointClouds: PointCloudOctree[],
    camera: PerspectiveCamera,
  ): {
      frustums: Frustum[];
      camObjPositions: Vector3[];
      priorityQueue: BinaryHeap<IQueueItem>;
    } {
    const frustums: Frustum[] = [];
    const camObjPositions = [];
    const priorityQueue = new BinaryHeap<IQueueItem>(x => 1 / x.weight);

    for (let i = 0; i < pointClouds.length; i++) {
      const pointCloud = pointClouds[i];

      if (!pointCloud.initialized()) {
        continue;
      }

      pointCloud.numVisiblePoints = 0;
      pointCloud.visibleNodes = [];
      pointCloud.visibleGeometry = [];

      // frustum in object space
      camera.updateMatrixWorld(true);
      const frustum = new Frustum();
      const viewI = camera.matrixWorldInverse;
      const world = pointCloud.matrixWorld;
      const proj = camera.projectionMatrix;
      const fm = new Matrix4()
        .multiply(proj)
        .multiply(viewI)
        .multiply(world);
      frustum.setFromMatrix(fm);
      frustums.push(frustum);

      // camera position in object space
      const view = camera.matrixWorld;
      const worldI = new Matrix4().getInverse(world);
      const camMatrixObject = new Matrix4().multiply(worldI).multiply(view);
      const camObjPos = new Vector3().setFromMatrixPosition(camMatrixObject);
      camObjPositions.push(camObjPos);

      if (pointCloud.visible && pointCloud.root !== null) {
        priorityQueue.push({
          weight: Number.MAX_VALUE,
          node: pointCloud.root,
          pointCloudIndex: i,
        });
      }

      // Hide any previously visible nodes. We will later show only the needed ones.
      if (isTreeNode(pointCloud.root)) {
        pointCloud.hideDescendants(pointCloud.root.sceneNode);
      }

      for (let j = 0; j < pointCloud.boundingBoxNodes.length; j++) {
        pointCloud.boundingBoxNodes[j].visible = false;
      }
    }

    return { frustums, camObjPositions, priorityQueue };
  }
}
