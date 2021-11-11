import { Camera, Ray, WebGLRenderer } from 'three';
import { GetUrlFn } from './loading';
import { PointCloudOctree } from './point-cloud-octree';
import { PickParams } from './point-cloud-octree-picker';
import { IPointCloudTreeNode, IPotree, IVisibilityUpdateResult, PickPoint } from './types';
import { LRU } from './utils/lru';
export declare class QueueItem {
    pointCloudIndex: number;
    weight: number;
    node: IPointCloudTreeNode;
    parent?: IPointCloudTreeNode | null | undefined;
    constructor(pointCloudIndex: number, weight: number, node: IPointCloudTreeNode, parent?: IPointCloudTreeNode | null | undefined);
}
export declare class Potree implements IPotree {
    private static picker;
    private _pointBudget;
    private _rendererSize;
    maxNumNodesLoading: number;
    features: {
        SHADER_INTERPOLATION: boolean;
        SHADER_SPLATS: boolean;
        SHADER_EDL: boolean;
        precision: string;
    };
    lru: LRU;
    loadPointCloud(url: string, getUrl: GetUrlFn, xhrRequest?: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>): Promise<PointCloudOctree>;
    updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): IVisibilityUpdateResult;
    static pick(pointClouds: PointCloudOctree[], renderer: WebGLRenderer, camera: Camera, ray: Ray, params?: Partial<PickParams>): PickPoint | null;
    get pointBudget(): number;
    set pointBudget(value: number);
    private updateVisibility;
    private updateTreeNodeVisibility;
    private updateChildVisibility;
    private updateBoundingBoxVisibility;
    private shouldClip;
    private updateVisibilityStructures;
}
