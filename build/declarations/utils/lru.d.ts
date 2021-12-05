import { IPointCloudTreeNode } from '../types';
export declare type Node = IPointCloudTreeNode;
export declare class LRUItem {
    node: Node;
    next: LRUItem | null;
    previous: LRUItem | null;
    constructor(node: Node);
}
/**
 * A doubly-linked-list of the least recently used elements.
 */
export declare class LRU {
    pointBudget: number;
    first: LRUItem | null;
    last: LRUItem | null;
    numPoints: number;
    private items;
    constructor(pointBudget?: number);
    get size(): number;
    has(node: Node): boolean;
    /**
     * Makes the specified the most recently used item. if the list does not contain node, it will
     * be added.
     */
    touch(node: Node): void;
    private addNew;
    private touchExisting;
    remove(node: Node): void;
    getLRUItem(): Node | undefined;
    freeMemory(): void;
    disposeSubtree(node: Node): void;
}
