import { PointCloudOctreeGeometryNode } from '../point-cloud-octree-geometry-node';
interface YBFLoaderOptions {
    url: string;
}
declare type Callback = (node: PointCloudOctreeGeometryNode) => void;
export declare class YBFLoader {
    url: string;
    disposed: boolean;
    callbacks: Callback[];
    private workers;
    constructor({ url }: YBFLoaderOptions);
    dispose(): void;
    load(node: PointCloudOctreeGeometryNode): Promise<void>;
    private parse;
    private getWorker;
    private releaseWorker;
    private addBufferAttributes;
    private addIndices;
}
export {};
