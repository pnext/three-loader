import { Box3, Matrix4 } from 'three';
/**
 * adapted from mhluska at https://github.com/mrdoob/three.js/issues/1561
 */
export declare function computeTransformedBoundingBox(box: Box3, transform: Matrix4): Box3;
export declare function createChildAABB(aabb: Box3, index: number): Box3;
