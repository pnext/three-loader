import {PointCloudOctreeGeometryNode} from './point-cloud-octree-geometry-node';
// import { PointCloudOctreeNode } from './point-cloud-octree-node';

export function isGeometryNode(node?: any): node is PointCloudOctreeGeometryNode 
{ // 'node is' in this case 
	return node !== undefined && node !== null && node.isGeometryNode;
}

// export function isTreeNode(node?: any): node is PointCloudOctreeNode { // Problem is here! Pnext modified isTreeNode to be one function when it's normally attached as a method to the root node.
//   return node !== undefined && node !== null && node.isTreeNode;
// }

export function isTreeNode(node?: any) 
{
	return node !== undefined && node !== null && node.isTreeNode;
}
