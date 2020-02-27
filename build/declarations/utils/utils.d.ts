import { IPointCloudTreeNode } from '../types';
export declare function getIndexFromName(name: string): number;
/**
 * When passed to `[].sort`, sorts the array by level and index: r, r0, r3, r4, r01, r07, r30, ...
 */
export declare function byLevelAndIndex(a: IPointCloudTreeNode, b: IPointCloudTreeNode): number;
