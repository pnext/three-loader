import { Box3, Plane, Vector3 } from 'three';
import { Points } from './points';
import { IProfile, IProfileData, IProfileSegment } from './types';

export class ProfileData implements IProfileData {
  boundingBox = new Box3();
  segments: IProfileSegment[] = [];

  constructor(public profile: IProfile) {
    for (let i = 0; i < profile.points.length - 1; i++) {
      const start: Vector3 = profile.points[i];
      const end: Vector3 = profile.points[i + 1];

      const startGround = new Vector3(start.x, start.y, 0);
      const endGround = new Vector3(end.x, end.y, 0);

      const center = new Vector3().addVectors(endGround, startGround).multiplyScalar(0.5);
      const length = startGround.distanceTo(endGround);
      const side = new Vector3().subVectors(endGround, startGround).normalize();
      const up = new Vector3(0, 0, 1);
      const forward = new Vector3().crossVectors(side, up).normalize();
      const N = forward;
      const cutPlane = new Plane().setFromNormalAndCoplanarPoint(N, startGround);
      const halfPlane = new Plane().setFromNormalAndCoplanarPoint(side, center);

      this.segments.push({
        start: start,
        end: end,
        cutPlane: cutPlane,
        halfPlane: halfPlane,
        length: length,
        points: new Points(),
      });
    }
  }

  get size() {
    let size = 0;
    for (let i = 0; i < this.segments.length; ++i) {
      size += this.segments[i].points.numPoints;
    }

    return size;
  }
}
