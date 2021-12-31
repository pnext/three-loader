// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------

import { BufferAttribute, BufferGeometry, Uint8BufferAttribute, Vector3 } from 'three';
import { PointAttributeName, PointAttributeType } from '../point-attributes';
import { PointCloudOctreeGeometryNode } from '../point-cloud-octree-geometry-node';
import { GetUrlFn } from './types';

// @ts-ignore
import YBFLoaderWorker from '../workers/ybf-loader.worker.js';

interface AttributeData {
  attribute: {
    name: PointAttributeName;
    type: PointAttributeType;
    byteSize: number;
    numElements: number;
  };
  buffer: ArrayBuffer;
}

interface WorkerResponse {
  data: {
    attributeBuffers: { [name: string]: AttributeData };
    indices: ArrayBuffer;
    tightBoundingBox: { min: number[]; max: number[] };
    mean: number[];
    failed: boolean;
  };
}

interface YBFLoaderOptions {
  url: string;
  getUrl?: GetUrlFn;
  callbacks?: Callback[];
}

type Callback = (node: PointCloudOctreeGeometryNode) => void;

export class YBFLoader {
  url: string;
  disposed: boolean = false;
  callbacks: Callback[];
  getUrl: GetUrlFn;

  private static workers: Worker[] = [];

  constructor({
    url,
    getUrl = s => Promise.resolve(s),
    callbacks = []
  }: YBFLoaderOptions) {
    this.getUrl = getUrl;
    this.url = url;
    this.callbacks = callbacks || [];
  }

  dispose(): void {
    YBFLoader.workers.forEach(worker => worker.terminate());
    YBFLoader.workers = [];

    this.disposed = true;
  }

  load(node: PointCloudOctreeGeometryNode): Promise<void> {
    if (node.loaded || this.disposed) {
      return Promise.resolve();
    }

    return Promise.resolve(this.getUrl(node.name, node.indexInList))
      .then(url => {
        if (!url) {
          return Promise.reject('Empty node');
        }
        // console.log('fetching:', url);
        return fetch(url, { mode: 'cors' });
      })
      .then(res => res.arrayBuffer())
      .then(buffer => {
        return new Promise(resolve => this.parse(node, buffer, resolve));
      });
  }

  private parse(
    node: PointCloudOctreeGeometryNode,
    buffer: ArrayBuffer,
    resolve: () => void,
  ): void {
    if (this.disposed) {
      resolve();
      return;
    }

    const worker = this.getWorker();

    const pointAttributes = node.pcoGeometry.pointAttributes;
    // const numPoints = buffer.byteLength / pointAttributes.byteSize;

    worker.onmessage = (e: WorkerResponse) => {
      if (this.disposed) {
        resolve();
        return;
      }

      const data = e.data;

      if (data.failed) {
        node.failed = true;
        this.releaseWorker(worker);
        this.callbacks.forEach(callback => callback(node));
        resolve();
        return;
      }

      const geometry = (node.geometry = node.geometry || new BufferGeometry());
      geometry.boundingBox = node.boundingBox;

      this.addBufferAttributes(geometry, data.attributeBuffers);
      this.addIndices(geometry, data.indices);
      // this.addNormalAttribute(geometry, numPoints);

      node.mean = new Vector3().fromArray([0, 0, 0]);
      geometry.computeBoundingBox();
      // console.log(geometry.boundingBox);
      node.tightBoundingBox = geometry.boundingBox;
      node.loaded = true;
      node.loading = false;
      node.failed = false;
      node.pcoGeometry.numNodesLoading--;
      node.pcoGeometry.needsUpdate = true;

      this.releaseWorker(worker);

      this.callbacks.forEach(callback => callback(node));
      resolve();
    };

    const message = {
      buffer,
      pointAttributes,
      min: node.boundingBox.min.toArray(),
      offset: node.pcoGeometry.offset.toArray(),
      spacing: node.spacing,
      hasChildren: node.hasChildren,
    };

    worker.postMessage(message, [message.buffer]);
  }

  private getWorker(): Worker {
    const worker = YBFLoader.workers.pop();
    if (worker) {
      return worker;
    }
    return new YBFLoaderWorker();
  }

  private releaseWorker(worker: Worker): void {
    YBFLoader.workers.push(worker);
  }

  private addBufferAttributes(
    geometry: BufferGeometry,
    buffers: { [name: string]: { buffer: ArrayBuffer } },
  ): void {
    Object.keys(buffers).forEach(property => {
      const buffer = buffers[property].buffer;

      if (property === 'position') {
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(buffer), 3));
      } else if (property === 'color') {
        geometry.setAttribute('color', new BufferAttribute(new Uint8Array(buffer), 3, true));
      }
    });
  }

  private addIndices(geometry: BufferGeometry, indices: ArrayBuffer): void {
    const indicesAttribute = new Uint8BufferAttribute(indices, 4);
    indicesAttribute.normalized = true;
    geometry.setAttribute('indices', indicesAttribute);
  }

  // private addNormalAttribute(geometry: BufferGeometry, numPoints: number): void {
  //   if (!geometry.getAttribute('normal')) {
  //     const buffer = new Float32Array(numPoints * 3);
  //     geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
  //   }
  // }

  // private isAttribute(): boolean {
  //   return true;
  // }
}
