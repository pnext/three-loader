import { Box3, BufferGeometry, Camera, Sphere, Vector3, WebGLRenderer } from 'three';
import { GetUrlFn, XhrRequest } from './loading/types';
import { OctreeGeometry } from './loading2/octree-geometry';
import { PointCloudOctree } from './point-cloud-octree';
import { PointCloudOctreeGeometry } from './point-cloud-octree-geometry';
import { LRU } from './utils/lru';

export interface IPointCloudTreeNode {
  id: number;
  name: string;
  level: number;
  index: number;
  spacing: number;
  boundingBox: Box3;
  boundingSphere: Sphere;
  loaded: boolean;
  numPoints: number;
  readonly children: ReadonlyArray<IPointCloudTreeNode | null>;
  readonly isLeafNode: boolean;

  dispose(): void;

  traverse(cb: (node: IPointCloudTreeNode) => void, includeSelf?: boolean): void;
}

export interface IPointCloudGeometryNode extends IPointCloudTreeNode {
  geometry: BufferGeometry | undefined;
  oneTimeDisposeHandlers: Function[];

  loading: boolean;
  loaded: boolean;
  failed: boolean;

  load(): Promise<void>;
}

export interface IVisibilityUpdateResult {
  visibleNodes: IPointCloudTreeNode[];
  numVisiblePoints: number;
  /**
   * True when a node has been loaded but was not added to the scene yet.
   * Make sure to call updatePointClouds() again on the next frame.
   */
  exceededMaxLoadsToGPU: boolean;
  /**
   * True when at least one node in view has failed to load.
   */
  nodeLoadFailed: boolean;
  /**
   * Promises for loading nodes, will reject when loading fails.
   */
  nodeLoadPromises: Promise<void>[];
}

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(
    url: string,
    getUrl: GetUrlFn,
    xhrRequest?: XhrRequest,
    loadHarmonics?: boolean,
    maxAmountOfSplats?: number,
  ): Promise<PointCloudOctree>;

  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer,
    callback?: any,
  ): IVisibilityUpdateResult;
}

export interface PickPoint {
  position?: Vector3;
  normal?: Vector3;
  pointCloud?: PointCloudOctree;
  [property: string]: any;
}

export interface PointCloudHit {
  pIndex: number;
  pcIndex: number;
}

export type PCOGeometry = PointCloudOctreeGeometry | OctreeGeometry;
