import { Matrix4, Vector3 } from 'three';
import { PointCloudOctree } from '../point-cloud-octree';
import { PointCloudOctreeGeometryNode } from '../point-cloud-octree-geometry-node';
import { isGeometryNode } from '../type-predicates';
import { Points } from './points';
import { ProfileData } from './profile-data';
import { IProfile, IProfileData, IProfileRequest, IProfileRequestCallbacks } from './types';

// const makePriorityQueue = () => new BinaryHeap(x => 1 / x.weight);
const makePriorityQueue = () => null as any;

export class ProfileRequest implements IProfileRequest {
  pointsServed: number = 0;
  highestLevelServed: number = 0;

  private temporaryResult: IProfileData = new ProfileData(this.profile);
  private priorityQueue = makePriorityQueue();

  private cancelRequested: boolean = false;

  constructor(
    public pointcloud: PointCloudOctree,
    public profile: IProfile,
    public maxDepth: number,
    public callback: IProfileRequestCallbacks,
  ) {
    this.initialize();
  }

  private initialize() {
    this.priorityQueue.push({
      node: this.pointcloud.pcoGeometry.root,
      weight: 1,
    });

    this.traverse(this.pointcloud.pcoGeometry.root);
  }

  // traverse the node and add intersecting descendants to queue
  private traverse(node: PointCloudOctreeGeometryNode) {
    const stack: PointCloudOctreeGeometryNode[] = [];

    this.addIntersectedChildren(node, stack);

    let current: PointCloudOctreeGeometryNode | undefined;
    while ((current = stack.pop())) {
      const weight = current.boundingSphere.radius;

      this.priorityQueue.push({ node: current, weight: weight });

      if (current.level < this.maxDepth) {
        this.addIntersectedChildren(current, stack);
      }
    }
  }

  private addIntersectedChildren(
    node: PointCloudOctreeGeometryNode,
    stack: PointCloudOctreeGeometryNode[],
  ) {
    node.children.forEach(child => {
      if (isGeometryNode(child) && this.pointcloud.nodeIntersectsProfile(child, this.profile)) {
        stack.push(child);
      }
    });
  }

  update() {
    // load nodes in queue
    // if hierarchy expands, also load nodes from expanded hierarchy
    // once loaded, add data to this.points and remove node from queue
    // only evaluate 1-50 nodes per frame to maintain responsiveness

    const maxNodesPerUpdate = 1;
    const intersectedNodes: PointCloudOctreeGeometryNode[] = [];

    for (let i = 0; i < Math.min(maxNodesPerUpdate, this.priorityQueue.size()); i++) {
      const element = this.priorityQueue.pop();
      const node = element.node;

      if (node.loaded) {
        // add points to result
        intersectedNodes.push(node);
        this.pointcloud.potree.lru.touch(node);
        this.highestLevelServed = node.level;

        if (node.level % node.pcoGeometry.hierarchyStepSize === 0 && node.hasChildren) {
          this.traverse(node);
        }
      } else {
        node.load();
        this.priorityQueue.push(element);
      }
    }

    if (intersectedNodes.length > 0) {
      this.getPointsInsideProfile(intersectedNodes, this.temporaryResult);
      if (this.temporaryResult.size > 100) {
        this.pointsServed += this.temporaryResult.size;
        this.callback.onProgress({ request: this, points: this.temporaryResult });
        this.temporaryResult = new ProfileData(this.profile);
      }
    }

    if (this.priorityQueue.size() === 0) {
      // we're done! inform callback and remove from pending requests

      if (this.temporaryResult.size > 0) {
        this.pointsServed += this.temporaryResult.size;
        this.callback.onProgress({
          request: this,
          points: this.temporaryResult,
        });
        this.temporaryResult = new ProfileData(this.profile);
      }

      this.callback.onFinish({ request: this });

      const index = this.pointcloud.profileRequests.indexOf(this);
      if (index >= 0) {
        this.pointcloud.profileRequests.splice(index, 1);
      }
    }
  }

  getPointsInsideProfile(nodes: PointCloudOctreeGeometryNode[], target: IProfileData) {
    let totalMileage = 0;

    for (const segment of target.segments) {
      for (const node of nodes) {
        const geometry = node.geometry;
        const positions = geometry.getAttribute('position');
        const p = positions.array;
        const numPoints = node.numPoints;

        const sv = new Vector3().subVectors(segment.end, segment.start).setZ(0);
        const segmentDir = sv.clone().normalize();

        const accepted = [];
        const mileage = [];
        const acceptedPositions = [];
        const points = new Points();

        const boundsMin = node.boundingBox.min;
        const nodeMatrix = new Matrix4().makeTranslation(boundsMin.x, boundsMin.y, boundsMin.z);
        const matrix = new Matrix4().multiplyMatrices(this.pointcloud.matrixWorld, nodeMatrix);

        for (let i = 0; i < numPoints; i++) {
          const pos = new Vector3(p[3 * i], p[3 * i + 1], p[3 * i + 2]);
          pos.applyMatrix4(matrix);
          const distance = Math.abs(segment.cutPlane.distanceToPoint(pos));
          const centerDistance = Math.abs(segment.halfPlane.distanceToPoint(pos));

          if (distance < this.profile.width / 2 && centerDistance < segment.length / 2) {
            const svp = new Vector3().subVectors(pos, segment.start);
            const localMileage = segmentDir.dot(svp);

            accepted.push(i);
            mileage.push(localMileage + totalMileage);
            points.boundingBox.expandByPoint(pos);

            acceptedPositions.push(pos.x);
            acceptedPositions.push(pos.y);
            acceptedPositions.push(pos.z);
          }
        }

        for (const attribute of Object.keys(geometry.attributes).filter(a => a !== 'indices')) {
          const bufferedAttribute: any = geometry.getAttribute(attribute);
          const type: any = bufferedAttribute.array.constructor;

          let filteredBuffer: any = null;

          if (attribute === 'position') {
            filteredBuffer = new type(acceptedPositions);
          } else {
            filteredBuffer = new type(accepted.length * bufferedAttribute.itemSize);

            for (let i = 0; i < accepted.length; i++) {
              const index = accepted[i];

              filteredBuffer.set(
                bufferedAttribute.array.subarray(
                  bufferedAttribute.itemSize * index,
                  bufferedAttribute.itemSize * index + bufferedAttribute.itemSize,
                ),
                bufferedAttribute.itemSize * i,
              );
            }
          }
          points.data[attribute] = filteredBuffer;
        }

        points.data['mileage'] = new Float64Array(mileage);
        points.numPoints = accepted.length;

        segment.points.add(points);
      }

      totalMileage += segment.length;
    }

    for (const segment of target.segments) {
      target.boundingBox.union(segment.points.boundingBox);
    }
  }

  finishLevelThenCancel() {
    if (this.cancelRequested) {
      return;
    }

    this.maxDepth = this.highestLevelServed + 1;
    this.cancelRequested = true;

    console.log(`maxDepth: ${this.maxDepth}`);
  }

  cancel() {
    this.callback.onCancel();

    this.priorityQueue = makePriorityQueue();

    const index = this.pointcloud.profileRequests.indexOf(this);
    if (index >= 0) {
      this.pointcloud.profileRequests.splice(index, 1);
    }
  }
}
