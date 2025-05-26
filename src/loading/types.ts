import { PointCloudOctreeGeometryNode } from 'point-cloud-octree-geometry-node';

export type GetUrlFn = (url: string) => string | Promise<string>;
export type XhrRequest = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
export type Callback = (node: PointCloudOctreeGeometryNode) => void;
