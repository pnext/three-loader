import {PointCloudOctreeGeometryNode} from './point-cloud-octree-geometry-node';

export function isGeometryNode(node?: any): node is PointCloudOctreeGeometryNode {
	return node !== undefined && node !== null && node.isGeometryNode;
}

export function isTreeNode(node?: any) {
	return node !== undefined && node !== null && node.isTreeNode;
}
