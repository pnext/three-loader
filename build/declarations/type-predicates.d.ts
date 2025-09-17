import { IPointCloudGeometryNode } from './types';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
export declare function isGeometryNode(node?: any): node is IPointCloudGeometryNode;
export declare function isTreeNode(node?: any): node is PointCloudOctreeNode;
