/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.5/LICENSE
 */
import { Box3, BufferGeometry, EventDispatcher, Sphere, Vector3 } from 'three';
import { PointCloudOctreeGeometry } from './point-cloud-octree-geometry';
import { IPointCloudTreeNode } from './types';
export interface NodeData {
    children: number;
    numPoints: number;
    name: string;
    indexInList: number;
}
export declare class PointCloudOctreeGeometryNode extends EventDispatcher implements IPointCloudTreeNode {
    id: number;
    name: string;
    pcoGeometry: PointCloudOctreeGeometry;
    index: number;
    level: number;
    spacing: number;
    hasChildren: boolean;
    readonly children: ReadonlyArray<PointCloudOctreeGeometryNode | null>;
    boundingBox: Box3;
    tightBoundingBox: Box3;
    boundingSphere: Sphere;
    hierarchyData: any;
    mean: Vector3;
    numPoints: number;
    geometry: BufferGeometry | undefined;
    loaded: boolean;
    loading: boolean;
    failed: boolean;
    indexInList: number;
    parent: PointCloudOctreeGeometryNode | null;
    oneTimeDisposeHandlers: (() => void)[];
    isLeafNode: boolean;
    readonly isTreeNode: boolean;
    readonly isGeometryNode: boolean;
    private static idCount;
    constructor(name: string, pcoGeometry: PointCloudOctreeGeometry, boundingBox: Box3, index: number);
    dispose(): void;
    /**
     * Gets the url of the binary file for this node.
     */
    getUrl(): string;
    /**
     * Adds the specified node as a child of the current node.
     *
     * @param child
     *    The node which is to be added as a child.
     */
    addChild(child: PointCloudOctreeGeometryNode): void;
    /**
     * Calls the specified callback for the current node (if includeSelf is set to true) and all its
     * children.
     *
     * @param cb
     *    The function which is to be called for each node.
     */
    traverse(cb: (node: PointCloudOctreeGeometryNode) => void, includeSelf?: boolean): void;
    load(): Promise<void>;
    loadResonai(): Promise<void>;
    private canLoad;
    private loadPoints;
    private loadResonaiPoints;
    private loadResonaiHierachyThenPoints;
    private loadResonaiHierarchy;
    private getResonaiNodeData;
    addNode({ name, numPoints, children, indexInList }: NodeData, pco: PointCloudOctreeGeometry, nodes: Map<string, PointCloudOctreeGeometryNode>): void;
}
