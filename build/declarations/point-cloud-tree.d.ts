import { Object3D } from 'three';
import { IPointCloudTreeNode } from './types';
export declare class PointCloudTree extends Object3D {
    root: IPointCloudTreeNode | null;
    initialized(): boolean;
}
