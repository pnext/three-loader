import { Camera, Ray, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import { PointCloudMaterial } from './materials';
import { PointCloudOctree } from './point-cloud-octree';
import { PickPoint } from './types';
export interface PickParams {
    pickWindowSize: number;
    pickOutsideClipRegion: boolean;
    /**
     * If provided, the picking will use this pixel position instead of the `Ray` passed to the `pick`
     * method.
     */
    pixelPosition: Vector3;
    /**
     * Function which gets called after a picking material has been created and setup and before the
     * point cloud is rendered into the picking render target. This gives applications a chance to
     * customize the renderTarget and the material.
     *
     * @param material
     *    The pick material.
     * @param renterTarget
     *    The render target used for picking.
     */
    onBeforePickRender: (material: PointCloudMaterial, renterTarget: WebGLRenderTarget) => void;
}
export declare class PointCloudOctreePicker {
    private static readonly helperVec3;
    private static readonly helperSphere;
    private static readonly clearColor;
    private pickState;
    dispose(): void;
    pick(renderer: WebGLRenderer, camera: Camera, ray: Ray, octrees: PointCloudOctree[], params?: Partial<PickParams>): PickPoint | null;
    private static prepareRender;
    private static render;
    private static nodesOnRay;
    private static readPixels;
    private static createTempNodes;
    private static updatePickMaterial;
    private static updatePickRenderTarget;
    private static makePickRenderTarget;
    private static findHit;
    private static getPickPoint;
    private static addPositionToPickPoint;
    private static addNormalToPickPoint;
    private static getPickState;
}
