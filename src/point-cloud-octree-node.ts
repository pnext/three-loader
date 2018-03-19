import { Box3, EventDispatcher, Object3D, Points, Sphere } from 'three';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { IPointCloudTreeNode } from './types';

export class PointCloudOctreeNode extends EventDispatcher implements IPointCloudTreeNode {
  geometryNode: PointCloudOctreeGeometryNode;
  sceneNode: Points;
  pcIndex: number | undefined = undefined;
  boundingBoxNode: Object3D | null = null;
  readonly children: (IPointCloudTreeNode | null)[] = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
  readonly loaded = true;
  readonly isTreeNode: boolean = true;
  readonly isGeometryNode: boolean = false;

  constructor(geometryNode: PointCloudOctreeGeometryNode, sceneNode: Points) {
    super();

    this.geometryNode = geometryNode;
    this.sceneNode = sceneNode;
  }

  copyChildren(children: (IPointCloudTreeNode | null)[]) {
    for (let i = 0; i < 8; ++i) {
      this.children[i] = children[i];
    }
  }

  dispose(): void {
    this.geometryNode.dispose();
  }

  traverse(cb: (node: IPointCloudTreeNode) => void, includeSelf?: boolean): void {
    this.geometryNode.traverse(cb, includeSelf);
  }

  get id() {
    return this.geometryNode.id;
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
