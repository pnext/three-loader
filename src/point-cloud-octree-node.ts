import { Box3, EventDispatcher, Object3D, Points, Sphere } from 'three';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { IPointCloudTreeNode } from './types';

export class PointCloudOctreeNode extends EventDispatcher implements IPointCloudTreeNode {
  children: (IPointCloudTreeNode | undefined)[] = [];
  boundingBoxNode: Object3D | null = null;
  pcIndex?: number;
  readonly loaded = true;

  isTreeNode: boolean = true;
  isGeometryNode: boolean = false;

  constructor(public geometryNode: PointCloudOctreeGeometryNode, public sceneNode: Points) {
    super();
  }

  getChildren(): IPointCloudTreeNode[] {
    const children: IPointCloudTreeNode[] = [];

    for (let i = 0; i < 8; i++) {
      const child = this.children[i];
      if (child) {
        children.push(child);
      }
    }

    return children;
  }

  get name() {
    return this.geometryNode.name;
  }

  get level(): number {
    return this.geometryNode.level;
  }

  get numPoints(): number {
    return this.geometryNode.numPoints;
  }

  get index() {
    return this.geometryNode.index;
  }

  get boundingSphere(): Sphere {
    return this.geometryNode.boundingSphere;
  }

  get boundingBox(): Box3 {
    return this.geometryNode.boundingBox;
  }

  get spacing() {
    return this.geometryNode.spacing;
  }
}
