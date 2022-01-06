import { PointCloudOctreeGeometry } from '../point-cloud-octree-geometry';
import { PointCloudOctreeGeometryNode } from '../point-cloud-octree-geometry-node';
import { GetUrlFn, XhrRequest } from './types';
export declare function loadResonaiPOC(url: string, getUrl: GetUrlFn, xhrRequest: XhrRequest, callbacks: ((node: PointCloudOctreeGeometryNode) => void)[]): Promise<PointCloudOctreeGeometry>;
