import { Box3, Matrix4, Vector3, BoxGeometry, Mesh, Quaternion, SphereGeometry } from 'three';

export enum ClipMode {
  DISABLED = 0,
  CLIP_OUTSIDE = 1,
  HIGHLIGHT_INSIDE = 2,
  CLIP_OUTSIDE_TEST = 3,
}

export interface IClipBox {
  box: Box3;
  inverse: Matrix4;
  matrix: Matrix4;
  position: Vector3;
}

export type ClipBox = {
  iClipBox: IClipBox,
  geometry: BoxGeometry,
  color: string,
  mesh: Mesh,
  position: Vector3,
  rotation: Quaternion,
  scale: Vector3,
}

export interface IClipSphere {
  radius: number;
  inverse: Matrix4;
  matrix: Matrix4;
  position: Vector3;
}

export type ClipSphere = {
  iClipSphere: IClipSphere,
  geometry: SphereGeometry,
  color: string,
  mesh: Mesh,
  position: Vector3,
  rotation: Quaternion,
  scale: Vector3,
}
