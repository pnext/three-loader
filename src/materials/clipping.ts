import { Box3, Matrix4, Vector3 } from 'three';

export enum ClipMode {
  DISABLED = 0,
  CLIP_OUTSIDE = 1,
  HIGHLIGHT_INSIDE = 2,
  CLIP_HORIZONTALLY = 3,
  CLIP_VERTICALLY = 4,
}

export interface IClipBox {
  box: Box3;
  inverse: Matrix4;
  matrix: Matrix4;
  position: Vector3;
}
