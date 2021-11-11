import { Box3, Camera, Object3D, Ray, Sphere, WebGLRenderer } from 'three';
import { PointCloudMaterial, PointSizeType } from './materials';
import { PointCloudOctreeGeometry } from './point-cloud-octree-geometry';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { PickParams } from './point-cloud-octree-picker';
import { PointCloudTree } from './point-cloud-tree';
import { IPointCloudTreeNode, IPotree, PickPoint } from './types';
export declare class PointCloudOctree extends PointCloudTree {
    potree: IPotree;
    disposed: boolean;
    pcoGeometry: PointCloudOctreeGeometry;
    boundingBox: Box3;
    boundingSphere: Sphere;
    material: PointCloudMaterial;
    level: number;
    maxLevel: number;
    /**
     * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
     */
    minNodePixelSize: number;
    root: IPointCloudTreeNode | null;
    boundingBoxNodes: Object3D[];
    visibleNodes: PointCloudOctreeNode[];
    visibleGeometry: PointCloudOctreeGeometryNode[];
    numVisiblePoints: number;
    showBoundingBox: boolean;
    private visibleBounds;
    private picker;
    constructor(potree: IPotree, pcoGeometry: PointCloudOctreeGeometry, material?: PointCloudMaterial);
    private initMaterial;
    dispose(): void;
    get pointSizeType(): PointSizeType;
    set pointSizeType(value: PointSizeType);
    toTreeNode(geometryNode: PointCloudOctreeGeometryNode, parent?: PointCloudOctreeNode | null): PointCloudOctreeNode;
    updateVisibleBounds(): void;
    updateBoundingBoxes(): void;
    updateMatrixWorld(force: boolean): void;
    hideDescendants(object: Object3D): void;
    moveToOrigin(): void;
    moveToGroundPlane(): void;
    getBoundingBoxWorld(): Box3;
    getVisibleExtent(): Box3;
    pick(renderer: WebGLRenderer, camera: Camera, ray: Ray, params?: Partial<PickParams>): PickPoint | null;
    get progress(): number;
}
