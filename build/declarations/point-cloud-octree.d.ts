import { Box3, Camera, Object3D, Ray, Sphere, Vector2, WebGLRenderer } from 'three';
import { PointCloudMaterial, PointSizeType } from './materials';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { PickParams } from './point-cloud-octree-picker';
import { PointCloudTree } from './point-cloud-tree';
import {
  IPointCloudGeometryNode,
  IPointCloudTreeNode,
  IPotree,
  PCOGeometry,
  PickPoint,
} from './types';
import { SplatsMesh } from './splats-mesh';
export declare class PointCloudOctree extends PointCloudTree {
  potree: IPotree;
  disposed: boolean;
  pcoGeometry: PCOGeometry;
  boundingBox: Box3;
  boundingSphere: Sphere;
  material: PointCloudMaterial;
  level: number;
  maxLevel: number;
  splatsMesh: SplatsMesh | null;
  /**
   * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
   */
  minNodePixelSize: number;
  root: IPointCloudTreeNode | null;
  boundingBoxNodes: Object3D[];
  visibleNodes: PointCloudOctreeNode[];
  visibleGeometry: IPointCloudGeometryNode[];
  numVisiblePoints: number;
  showBoundingBox: boolean;
  private visibleBounds;
  private picker;
  private renderAsSplats;
  private loadHarmonics;
  private maxAmountOfSplats;
  constructor(
    potree: IPotree,
    pcoGeometry: PCOGeometry,
    material?: PointCloudMaterial,
    loadHarmonics?: boolean,
    maxAmountOfSplats?: number,
  );
  private initMaterial;
  dispose(): void;
  get pointSizeType(): PointSizeType;
  set pointSizeType(value: PointSizeType);
  toTreeNode(
    geometryNode: IPointCloudGeometryNode,
    parent?: PointCloudOctreeNode | null,
  ): PointCloudOctreeNode;
  updateSplats(camera: Camera, size: Vector2, callback?: () => void): void;
  updateVisibleBounds(): void;
  updateBoundingBoxes(): void;
  updateMatrixWorld(force: boolean): void;
  hideDescendants(object: Object3D): void;
  moveToOrigin(): void;
  moveToGroundPlane(): void;
  getBoundingBoxWorld(): Box3;
  getVisibleExtent(): Box3;
  pick(
    renderer: WebGLRenderer,
    camera: Camera,
    ray: Ray,
    params?: Partial<PickParams>,
  ): PickPoint | null;
  get progress(): number;
  get maxAmountOfSplatsToRender(): number;
}
