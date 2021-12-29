import { PointCloudOctreeGeometryNode } from '../point-cloud-octree-geometry-node';
import { GetUrlFn } from './types';
interface YBFLoaderOptions {
    url: string;
    getUrl?: GetUrlFn;
    callbacks?: Callback[];
}
declare type Callback = (node: PointCloudOctreeGeometryNode) => void;
export declare class YBFLoader {
    url: string;
    disposed: boolean;
    callbacks: Callback[];
    getUrl: GetUrlFn;
    private static workers;
    constructor({ url, getUrl, callbacks }: YBFLoaderOptions);
    dispose(): void;
    load(node: PointCloudOctreeGeometryNode): Promise<void>;
    private parse;
    private getWorker;
    private releaseWorker;
    private addBufferAttributes;
    private addIndices;
}
export {};
