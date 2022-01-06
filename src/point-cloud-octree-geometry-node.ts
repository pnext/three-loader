/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.5/LICENSE
 */

import { Box3, BufferGeometry, EventDispatcher, Sphere, Vector3 } from 'three';
import { PointCloudOctreeGeometry } from './point-cloud-octree-geometry';
import { IPointCloudTreeNode } from './types';
import { createChildAABB } from './utils/bounds';
import { getIndexFromName } from './utils/utils';

export interface NodeData {
  children: number;
  numPoints: number;
  name: string;
  indexInList: number;
}

export class PointCloudOctreeGeometryNode extends EventDispatcher implements IPointCloudTreeNode {
  id: number = PointCloudOctreeGeometryNode.idCount++;
  name: string;
  pcoGeometry: PointCloudOctreeGeometry;
  index: number;
  level: number = 0;
  spacing: number = 0.2;
  hasChildren: boolean = false;
  readonly children: ReadonlyArray<PointCloudOctreeGeometryNode | null> = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
  boundingBox: Box3;
  tightBoundingBox: Box3;
  boundingSphere: Sphere;
  hierarchyData: any = {};
  mean: Vector3 = new Vector3();
  numPoints: number = 50000;
  geometry: BufferGeometry | undefined;
  loaded: boolean = false;
  loading: boolean = false;
  failed: boolean = false;
  indexInList: number = 0;
  parent: PointCloudOctreeGeometryNode | null = null;
  oneTimeDisposeHandlers: (() => void)[] = [];
  isLeafNode: boolean = true;
  readonly isTreeNode: boolean = false;
  readonly isGeometryNode: boolean = true;

  private static idCount = 0;

  constructor(name: string, pcoGeometry: PointCloudOctreeGeometry, boundingBox: Box3, index: number) {
    super();

    this.name = name;
    this.index = getIndexFromName(name);
    this.indexInList = index;
    this.pcoGeometry = pcoGeometry;
    this.boundingBox = boundingBox;
    this.tightBoundingBox = boundingBox.clone();
    this.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
  }

  dispose(): void {
    if (!this.geometry || !this.parent) {
      return;
    }

    this.geometry.dispose();
    this.geometry = undefined;
    this.loaded = false;

    this.oneTimeDisposeHandlers.forEach(handler => handler());
    this.oneTimeDisposeHandlers = [];
  }

  /**
   * Gets the url of the binary file for this node.
   */
  getUrl(): string {
    const geometry = this.pcoGeometry;
    const pathParts = [geometry.octreeDir];

    return pathParts.join('/');
  }

  /**
   * Adds the specified node as a child of the current node.
   *
   * @param child
   *    The node which is to be added as a child.
   */
  addChild(child: PointCloudOctreeGeometryNode): void {
    (this.children as any)[child.index] = child;
    this.isLeafNode = false;
    child.parent = this;
  }

  /**
   * Calls the specified callback for the current node (if includeSelf is set to true) and all its
   * children.
   *
   * @param cb
   *    The function which is to be called for each node.
   */
  traverse(cb: (node: PointCloudOctreeGeometryNode) => void, includeSelf = true): void {
    const stack: PointCloudOctreeGeometryNode[] = includeSelf ? [this] : [];

    let current: PointCloudOctreeGeometryNode | undefined;

    while ((current = stack.pop()) !== undefined) {
      cb(current);

      for (const child of current.children) {
        if (child !== null) {
          stack.push(child);
        }
      }
    }
  }

  load(): Promise<void> {
    if (!this.canLoad()) {
      return Promise.resolve();
    }

    this.loading = true;
    this.pcoGeometry.numNodesLoading++;
    this.pcoGeometry.needsUpdate = true;

    let promise: Promise<void>;

    promise = this.loadPoints();

    return promise.catch(reason => {
      this.loading = false;
      this.failed = true;
      this.pcoGeometry.numNodesLoading--;
      if (reason !== 'Empty node') {
        throw reason;
      }
    });
  }

  loadResonai(): Promise<void> {
    if (!this.canLoad()) {
      return Promise.resolve();
    }

    this.loading = true;
    this.pcoGeometry.numNodesLoading++;
    this.pcoGeometry.needsUpdate = true;

    let promise: Promise<void>;

    if (
      this.level % this.pcoGeometry.hierarchyStepSize === 0 &&
      this.hasChildren
    ) {
      promise = this.loadResonaiHierachyThenPoints();
    } else {
      promise = this.loadResonaiPoints();
    }

    return promise.catch(reason => {
      this.loading = false;
      this.failed = true;
      this.pcoGeometry.numNodesLoading--;
      if (reason !== 'Empty node') {
        throw reason;
      }
    });
  }

  private canLoad(): boolean {
    // return true
    return (
      !this.loading &&
      !this.loaded &&
      !this.pcoGeometry.disposed &&
      !this.pcoGeometry.loader.disposed
      // this.pcoGeometry.numNodesLoading < this.pcoGeometry.maxNumNodesLoading
    );
  }

  private loadPoints(): Promise<void> {
    this.pcoGeometry.needsUpdate = true;
    return this.pcoGeometry.loader.load(this);
  }

  private loadResonaiPoints(): Promise<void> {
    this.pcoGeometry.needsUpdate = true;
    // ybf loader
    return this.pcoGeometry.loader.load(this);
  }

  private loadResonaiHierachyThenPoints(): Promise<any> {
    if (this.level % this.pcoGeometry.hierarchyStepSize !== 0) {
      return Promise.resolve();
    }

    return this.loadResonaiHierarchy(this, this.hierarchyData);
  }
  // tslint:disable:no-bitwise
  private loadResonaiHierarchy(node: PointCloudOctreeGeometryNode, hierarchyData: any): Promise<any> {
    const firstNodeData = this.getResonaiNodeData(node.name, 0, hierarchyData);
    node.numPoints = firstNodeData.numPoints;

    // Nodes which need be visited.
    const stack: NodeData[] = [firstNodeData];
    // Nodes which have already been decoded. We will take nodes from the stack and place them here.
    const decoded: NodeData[] = [];
    // hierarchyData.nodes.forEach((number: any) => {
    //   const binary: string = Number(number).toString(2).padStart(32, '0')
    // })

    let idx = 1;
    // TODO(Shai) something in the hierarchy parsing is wrong so we never actually load all the existing nodes
    while (stack.length > 0) {
    // for (let j = 0; j < 800; j++) {
      const stackNodeData = stack.shift()!;

      // From the last bit, all the way to the 8th one from the right.
      let mask = 1 << 7;
      for (let i = 0; i < 8; i++) {
        // N & 2^^i !== 0
        // TODO(Shai) something in the hierarchy parsing is wrong so we never actually load all the existing nodes
        if ((stackNodeData.children & mask) !== 0) {
          // const nodeData = this.getResonaiNodeData(stackNodeData.name + '_' + (7 - i), idx, hierarchyData);
          const nodeData = this.getResonaiNodeData(`${stackNodeData.name}_${i}`, idx, hierarchyData);
          idx += 1;

          decoded.push(nodeData); // Node is decoded.
          stack.push(nodeData); // Need to check its children.
        }
        mask = mask >> 1;
      }
    }

    node.pcoGeometry.needsUpdate = true;

    // Map containing all the nodes.
    const nodes = new Map<string, PointCloudOctreeGeometryNode>();
    nodes.set(node.name, node);
    decoded.forEach(nodeData => this.addNode(nodeData, node.pcoGeometry, nodes));

    return node.loadResonaiPoints();
  }

  // tslint:disable:no-bitwise
  private getResonaiNodeData(name: string, offset: number, hierarchyData: any): NodeData {
    const code = hierarchyData.nodes[offset];
    // https://stackoverflow.com/questions/22335853/hack-to-convert-javascript-number-to-uint32
    // Force the number to be a UInt32 and not overflow
    const children = code >>> 24;
    const mask = (1 << 24) - 1;
    const numPoints = code & mask;
    const indexInList = offset;
    return { children, numPoints, name, indexInList };
  }

  addNode(
    { name, numPoints, children, indexInList }: NodeData,
    pco: PointCloudOctreeGeometry,
    nodes: Map<string, PointCloudOctreeGeometryNode>,
  ): void {
    const index = getIndexFromName(name);
    const parentName = name.substring(0, name.length - 2);
    const parentNode = nodes.get(parentName)!;
    const level = (name.length - 1) / 2;
    const boundingBox = createChildAABB(parentNode.boundingBox, index);

    const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox, indexInList);
    node.level = level;

    node.numPoints = numPoints;
    node.hasChildren = children > 0;
    node.spacing = pco.spacing / Math.pow(2, level);
    node.indexInList = indexInList;

    parentNode.addChild(node);
    nodes.set(name, node);
  }
}
