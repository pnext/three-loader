import { Box3, PerspectiveCamera, Sphere, Vector3, WebGLRenderer } from 'three';
import { GetUrlFn, XhrRequest } from './loading/types';
import { PointCloudOctree } from './point-cloud-octree';
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

export interface IVisibilityUpdateResult {
  visibleNodes: IPointCloudTreeNode[];
  numVisiblePoints: number;
}

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(url: string, getUrl: GetUrlFn, xhrRequest?: XhrRequest): Promise<PointCloudOctree>;

  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult;
}

export interface PickPoint {
  position?: Vector3;
  normal?: Vector3;
  datasetNormal?: Vector3;
  [property: string]: any;
}

export interface PointCloudHit {
  pIndex: number;
  pcIndex: number;
}
