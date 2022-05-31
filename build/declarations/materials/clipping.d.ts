import { Box3, Color, Matrix4, Plane, Vector3 } from 'three';
export declare enum ClipMode {
    DISABLED = 0,
    CLIP_OUTSIDE = 1,
    HIGHLIGHT_INSIDE = 2
}
export interface IClipBox {
    box: Box3;
    inverse: Matrix4;
    matrix: Matrix4;
    position: Vector3;
}
export interface IClipConvex {
    planes: Plane[];
}
export interface IClipPolyhedron {
    color: Color | number | string;
    outside: boolean;
    convexes: IClipConvex[];
}
