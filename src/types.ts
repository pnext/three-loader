import { Box3, PerspectiveCamera, Sphere, WebGLRenderer } from 'three';
import { GetUrlFn } from './loading/types';
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
  maxNodesLoading: number;
  lru: LRU;

  loadPointCloud(url: string, getUrl: GetUrlFn): Promise<PointCloudOctree>;

  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult;
}
