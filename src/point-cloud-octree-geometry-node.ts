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
}

const NODE_STRIDE = 5;

export class PointCloudOctreeGeometryNode extends EventDispatcher implements IPointCloudTreeNode {
  id: number = PointCloudOctreeGeometryNode.idCount++;
  name: string;
  pcoGeometry: PointCloudOctreeGeometry;
  index: number;
  level: number = 0;
  spacing: number = 0;
  hasChildren: boolean = false;
  boundingBox: Box3;
  tightBoundingBox!: Box3;
  boundingSphere: Sphere;
  mean: Vector3 = new Vector3();
  numPoints: number = 0;
  geometry: BufferGeometry = new BufferGeometry();
  loaded: boolean = false;
  loading: boolean = false;
  parent: PointCloudOctreeGeometryNode | null = null;
  children: (PointCloudOctreeGeometryNode | undefined)[] = [];
  oneTimeDisposeHandlers: (() => void)[] = [];

  isTreeNode: boolean = false;
  isGeometryNode: boolean = true;

  private static idCount = 0;

  constructor(name: string, pcoGeometry: PointCloudOctreeGeometry, boundingBox: Box3) {
    super();

    this.name = name;
    this.index = getIndexFromName(name);
    this.pcoGeometry = pcoGeometry;
    this.boundingBox = boundingBox;
    this.boundingSphere = boundingBox.getBoundingSphere();
  }

  getChildren(): PointCloudOctreeGeometryNode[] {
    const children: PointCloudOctreeGeometryNode[] = [];

    for (let i = 0; i < 8; i++) {
      const child = this.children[i];
      if (child) {
        children.push(child);
      }
    }

    return children;
  }

  /**
   * Gets the url of the binary file for this node.
   */
  getUrl(): string {
    const geometry = this.pcoGeometry;
    const version = geometry.loader.version;
    const pathParts = [geometry.octreeDir];

    if (geometry.loader && version.equalOrHigher('1.5')) {
      pathParts.push(this.getHierarchyBaseUrl());
      pathParts.push(this.name);
    } else if (version.equalOrHigher('1.4')) {
      pathParts.push(this.name);
    } else if (version.upTo('1.3')) {
      pathParts.push(this.name);
    }

    return pathParts.join('/');
  }

  /**
   * Gets the url of the hierarchy file for this node.
   */
  getHierarchyUrl(): string {
    return `${this.pcoGeometry.octreeDir}/${this.getHierarchyBaseUrl()}/${this.name}.hrc`;
  }

  addChild(child: PointCloudOctreeGeometryNode): void {
    this.children[child.index] = child;
    child.parent = this;
  }

  load(): void {
    if (this.loading === true || this.loaded === true || this.pcoGeometry.numNodesLoading > 3) {
      return;
    }

    this.loading = true;

    this.pcoGeometry.numNodesLoading++;
    this.pcoGeometry.needsUpdate = true;

    if (this.pcoGeometry.loader.version.equalOrHigher('1.5')) {
      if (this.level % this.pcoGeometry.hierarchyStepSize === 0 && this.hasChildren) {
        this.loadHierachyThenPoints();
      } else {
        this.loadPoints();
      }
    } else {
      this.loadPoints();
    }
  }

  loadPoints(): void {
    this.pcoGeometry.loader.load(this);
    this.pcoGeometry.needsUpdate = true;
  }

  loadHierachyThenPoints(): void {
    if (this.level % this.pcoGeometry.hierarchyStepSize !== 0) {
      return;
    }

    Promise.resolve(this.pcoGeometry.loader.getUrl(this.getHierarchyUrl()))
      .then(url => fetch(url, { mode: 'cors' }))
      .then(res => res.json())
      .then(json => this.loadHierarchy(this, json));
  }

  /**
   * Gets the url of the folder where the hierarchy is, relative to the octreeDir.
   */
  private getHierarchyBaseUrl(): string {
    const hierarchyStepSize = this.pcoGeometry.hierarchyStepSize;
    const indices = this.name.substr(1);
    const numParts = Math.floor(indices.length / hierarchyStepSize);

    let path = 'r/';
    for (let i = 0; i < numParts; i++) {
      path += `${indices.substr(i * hierarchyStepSize, hierarchyStepSize)}/`;
    }

    return path.slice(0, -1);
  }

  // tslint:disable:no-bitwise
  private loadHierarchy(node: PointCloudOctreeGeometryNode, buffer: ArrayBuffer) {
    const view = new DataView(buffer);

    const firstNodeData = this.getNodeData(node.name, 0, view);
    node.numPoints = firstNodeData.numPoints;

    // Nodes which need be visited.
    const stack: NodeData[] = [firstNodeData];
    // Nodes which have already been decoded. We will take nodes from the stack and place them here.
    const decoded: NodeData[] = [];

    let offset = NODE_STRIDE;
    while (stack.length > 0) {
      const stackNodeData = stack.shift()!;

      // From the last bit, all the way to the 8th one from the right.
      let mask = 1;
      for (let i = 0; i < 8; i++) {
        if ((stackNodeData.children & mask) !== 0) {
          const nodeData = this.getNodeData(stackNodeData.name + i, offset, view);

          decoded.push(nodeData); // Node is decoded.
          stack.push(nodeData); // Need to check its children.

          offset += NODE_STRIDE; // Move over to the next node in the buffer.
        }

        mask = mask * 2;
      }

      if (offset === buffer.byteLength) {
        break;
      }
    }

    node.pcoGeometry.needsUpdate = true;

    // Map containing all the nodes.
    const nodes = new Map<string, PointCloudOctreeGeometryNode>();
    nodes.set(node.name, node);
    decoded.forEach(nodeData => this.addNode(nodeData, node.pcoGeometry, nodes));

    node.loadPoints();
  }

  // tslint:enable:no-bitwise

  private getNodeData(name: string, offset: number, view: DataView): NodeData {
    const children = view.getUint8(offset);
    const numPoints = view.getUint32(offset + 1, true);
    return { children: children, numPoints: numPoints, name };
  }

  addNode(
    { name, numPoints, children }: NodeData,
    pco: PointCloudOctreeGeometry,
    nodes: Map<string, PointCloudOctreeGeometryNode>,
  ): void {
    const index = getIndexFromName(name);
    const parentName = name.substring(0, name.length - 1);
    const parentNode = nodes.get(parentName)!;
    const level = name.length - 1;
    const boundingBox = createChildAABB(parentNode.boundingBox, index);

    const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
    node.level = level;
    node.numPoints = numPoints;
    node.hasChildren = children > 0;
    node.spacing = pco.spacing / Math.pow(2, level);

    parentNode.addChild(node);
    nodes.set(name, node);
  }

  dispose(): void {
    if (!this.geometry || !this.parent) {
      return;
    }

    this.geometry.dispose();
    this.geometry = new BufferGeometry();
    this.loaded = false;

    this.oneTimeDisposeHandlers.forEach(handler => handler());
    this.oneTimeDisposeHandlers = [];
  }
}
