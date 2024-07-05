import { IPointCloudGeometryNode } from './types';
import { PointCloudOctreeNode } from './point-cloud-octree-node';

export function isGeometryNode(node?: any): node is IPointCloudGeometryNode {
  return node !== undefined && node !== null && node.isGeometryNode;
}

export function isTreeNode(node?: any): node is PointCloudOctreeNode {
  return node !== undefined && node !== null && node.isTreeNode;
}
