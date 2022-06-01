import { Camera, Ray, WebGLRenderer } from 'three';
import { GetUrlFn } from './loading';
import { PointCloudOctree } from './point-cloud-octree';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
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
export declare enum BBoxExclusion {
    COMPLETE = 0,
    PARTIAL = 1,
    NONE = 2
}
export declare class Potree implements IPotree {
    private static picker;
    private _pointBudget;
    private _rendererSize;
    private _maxNumNodesLoading;
    features: {
        SHADER_INTERPOLATION: boolean;
        SHADER_SPLATS: boolean;
        SHADER_EDL: boolean;
        precision: string;
    };
    lru: LRU;
    loadResonaiPointCloud(potreeName: string, getUrl: GetUrlFn, xhrRequest: ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) | undefined, callbacks: ((node: PointCloudOctreeGeometryNode) => void)[]): Promise<PointCloudOctree>;
    updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer, maxNumNodesLoading?: number): IVisibilityUpdateResult;
    static pick(pointClouds: PointCloudOctree[], renderer: WebGLRenderer, camera: Camera, ray: Ray, params?: Partial<PickParams>): PickPoint | null;
    get pointBudget(): number;
    set pointBudget(value: number);
    get maxNumNodesLoading(): number;
    set maxNumNodesLoading(value: number);
    private updateVisibility;
    private BBoxClippingByPolyhedra;
    private shouldClipByPlanes;
    private box_vertices_outside_of_halfspace;
    private updateTreeNodeVisibility;
    private updateChildVisibility;
    private updateBoundingBoxVisibility;
    private shouldClip;
    private updateVisibilityStructures;
}
