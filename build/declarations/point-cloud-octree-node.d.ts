import { Box3, EventDispatcher, Object3D, Points, Sphere } from 'three';
import { IPointCloudGeometryNode, IPointCloudTreeNode } from './types';
export declare class PointCloudOctreeNode extends EventDispatcher implements IPointCloudTreeNode {
  geometryNode: IPointCloudGeometryNode;
  sceneNode: Points;
  pcIndex: number | undefined;
  boundingBoxNode: Object3D | null;
  readonly children: (IPointCloudTreeNode | null)[];
  readonly loaded = true;
  readonly isTreeNode: boolean;
  readonly isGeometryNode: boolean;
  constructor(geometryNode: IPointCloudGeometryNode, sceneNode: Points);
  dispose(): void;
  disposeSceneNode(): void;
  traverse(cb: (node: IPointCloudTreeNode) => void, includeSelf?: boolean): void;
  get id(): number;
  get name(): string;
  get level(): number;
  get isLeafNode(): boolean;
  get numPoints(): number;
  get index(): number;
  get boundingSphere(): Sphere;
  get boundingBox(): Box3;
  get spacing(): number;
}
