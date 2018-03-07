import { Box3, Plane, Vector3 } from 'three';
import { Points } from './points';

export interface IProfileSegment {
  start: Vector3;
  end: Vector3;
  cutPlane: Plane;
  halfPlane: Plane;
  length: number;
  points: Points;
}

export interface IProfileRequest {}

export interface IProfileData {
  boundingBox: Box3;
  segments: IProfileSegment[];
  size: number;
}

export interface IProfileRequestCallbacks {
  onProgress(event: { request: IProfileRequest; points: IProfileData }): void;
  onFinish(event: { request: IProfileRequest }): void;
  onCancel(): void;
}

export interface IProfile {
  points: Vector3[];
  width: number;
}

export type PointsData = Record<string, any>;

export interface IPoints {
  numPoints: number;
  boundingBox: Box3;
  data: PointsData;
}
