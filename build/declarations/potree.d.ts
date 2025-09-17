import { Camera, Ray, WebGLRenderer } from 'three';
import { GetUrlFn, loadPOC } from './loading';
import { loadOctree } from './loading2/load-octree';
import { PointCloudOctree } from './point-cloud-octree';
import { PickParams } from './point-cloud-octree-picker';
import { IPointCloudTreeNode, IPotree, IVisibilityUpdateResult, PickPoint } from './types';
import { LRU } from './utils/lru';
export declare class QueueItem {
  pointCloudIndex: number;
  weight: number;
  node: IPointCloudTreeNode;
  parent?: IPointCloudTreeNode | null | undefined;
  constructor(
    pointCloudIndex: number,
    weight: number,
    node: IPointCloudTreeNode,
    parent?: IPointCloudTreeNode | null | undefined,
  );
}
declare const GEOMETRY_LOADERS: {
  v1: typeof loadPOC;
  v2: typeof loadOctree;
};
export type PotreeVersion = keyof typeof GEOMETRY_LOADERS;
export declare class Potree implements IPotree {
  private static picker;
  private _pointBudget;
  private _rendererSize;
  maxNumNodesLoading: number;
  memoryScale: number;
  features: {
    SHADER_INTERPOLATION: boolean;
    SHADER_SPLATS: boolean;
    SHADER_EDL: boolean;
    precision: string;
  };
  lru: LRU;
  private readonly loadGeometry;
  constructor(version?: PotreeVersion);
  loadPointCloud(
    url: string,
    getUrl: GetUrlFn,
    xhrRequest?: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
    loadHarmonics?: boolean,
    maxAmountOfSplats?: number,
  ): Promise<PointCloudOctree>;
  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer,
    callback?: () => void,
  ): IVisibilityUpdateResult;
  static pick(
    pointClouds: PointCloudOctree[],
    renderer: WebGLRenderer,
    camera: Camera,
    ray: Ray,
    params?: Partial<PickParams>,
  ): PickPoint | null;
  get pointBudget(): number;
  set pointBudget(value: number);
  static set maxLoaderWorkers(value: number);
  static get maxLoaderWorkers(): number;
  private updateVisibility;
  private updateTreeNodeVisibility;
  private updateChildVisibility;
  private updateBoundingBoxVisibility;
  private shouldClip;
  private updateVisibilityStructures;
}
export {};
