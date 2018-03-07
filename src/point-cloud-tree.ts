import { Object3D } from 'three';
import { IPointCloudTreeNode } from './types';

export class PointCloudTree extends Object3D {
  root: IPointCloudTreeNode | null = null;

  initialized() {
    return this.root !== null;
  }
}
