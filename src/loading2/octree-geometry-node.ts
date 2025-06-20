import { Box3, BufferGeometry, Sphere } from 'three';
import { IPointCloudGeometryNode } from '../types';
import { OctreeGeometry } from './octree-geometry';

export class OctreeGeometryNode implements IPointCloudGeometryNode {
  constructor(
    public name: string,
    public octreeGeometry: OctreeGeometry,
    public boundingBox: Box3,
  ) {
    this.id = OctreeGeometryNode.IDCount++;
    this.index = parseInt(name.charAt(name.length - 1));
    this.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
    this.tightBoundingBox = boundingBox.clone();
    this.numPoints = 0;
    this.oneTimeDisposeHandlers = [];
  }

  loaded: boolean = false;
  loading: boolean = false;
  failed: boolean = false;
  parent: OctreeGeometryNode | null = null;
  geometry: BufferGeometry | undefined;
  nodeType?: number;
  byteOffset?: bigint;
  byteSize?: bigint;
  hierarchyByteOffset?: bigint;
  hierarchyByteSize?: bigint;
  hasChildren: boolean = false;
  spacing!: number;
  density?: number;
  isLeafNode: boolean = true;

  readonly isTreeNode: boolean = false;
  readonly isGeometryNode: boolean = true;

  readonly children: ReadonlyArray<OctreeGeometryNode | null> = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  static IDCount = 0;

  id: number;
  index: number;
  boundingSphere: Sphere;
  tightBoundingBox: Box3;
  numPoints: number;
  level!: number;
  oneTimeDisposeHandlers: Function[];

  getLevel() {
    return this.level;
  }

  isLoaded() {
    return this.loaded;
  }

  getBoundingSphere() {
    return this.boundingSphere;
  }

  getBoundingBox() {
    return this.boundingBox;
  }

  load(): Promise<void> {
    if (this.octreeGeometry.numNodesLoading >= this.octreeGeometry.maxNumNodesLoading) {
      return Promise.resolve();
    }

    if (!this.octreeGeometry.loader) {
      this.loading = false;
      this.failed = true;
      return Promise.reject(`Loader not initialized for ${this.name}`);
    }

    return this.octreeGeometry.loader.load(this);
  }

  getNumPoints() {
    return this.numPoints;
  }

  dispose(): void {
    if (this.geometry && this.parent != null) {
      this.geometry.dispose();
      this.geometry = undefined;
      this.loaded = false;

      for (let i = 0; i < this.oneTimeDisposeHandlers.length; i++) {
        const handler = this.oneTimeDisposeHandlers[i];
        handler();
      }
      this.oneTimeDisposeHandlers = [];
    }
  }

  traverse(cb: (node: OctreeGeometryNode) => void, includeSelf = true): void {
    const stack: OctreeGeometryNode[] = includeSelf ? [this] : [];

    let current: OctreeGeometryNode | undefined;

    while ((current = stack.pop()) !== undefined) {
      cb(current);

      for (const child of current.children) {
        if (child !== null) {
          stack.push(child);
        }
      }
    }
  }
}

OctreeGeometryNode.IDCount = 0;
