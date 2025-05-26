import { Box3, BufferAttribute, BufferGeometry, Uint8BufferAttribute, Vector3 } from 'three';
import { Version } from '../../version';
import { Callback, GetUrlFn, XhrRequest } from '../types';
import { WorkerPool, WorkerType } from '../../utils/worker-pool';
import { PointCloudOctreeGeometryNode } from '../../point-cloud-octree-geometry-node';
import { handleEmptyBuffer, handleFailedRequest } from '../../utils/utils';
import { LASFile } from './LASFile';
import { PointAttributeName } from '../../point-attributes';

interface WorkerResponseData {
  mean: number[];
  tightBoundingBox: { min: number[]; max: number[] };
  position: ArrayBuffer;
  color: ArrayBuffer;
  intensity: ArrayBuffer;
  classification: ArrayBuffer;
  returnNumber: ArrayBuffer;
  numberOfReturns: ArrayBuffer;
  pointSourceID: ArrayBuffer;
  indices: ArrayBuffer;
}

interface WorkerResponse {
  data: WorkerResponseData;
}

interface LazLazLoaderOptions {
  getUrl?: GetUrlFn;
  extension: string;
  version: string;
  boundingBox: Box3;
  scale: number;
  xhrRequest: XhrRequest;
}

export class LasLazLoader {
  version: Version;
  extension: string;
  boundingBox: Box3;
  scale: number;
  getUrl: GetUrlFn;
  disposed: boolean = false;
  xhrRequest: XhrRequest;
  callbacks: Callback[];

  public static readonly WORKER_POOL = WorkerPool.getInstance();

  dispose(): void {
    this.disposed = true;
  }

  constructor({
    getUrl = s => Promise.resolve(s),
    version,
    extension,
    boundingBox,
    scale,
    xhrRequest,
  }: LazLazLoaderOptions) {
    if (typeof version === 'string') {
      this.version = new Version(version);
    } else {
      this.version = version;
    }

    this.extension = extension;
    this.xhrRequest = xhrRequest;
    this.getUrl = getUrl;
    this.boundingBox = boundingBox;
    this.scale = scale;
    this.callbacks = [];
  }

  load(node: PointCloudOctreeGeometryNode): Promise<void> {
    if (node.loaded || this.disposed) {
      return Promise.resolve();
    }

    return Promise.resolve(this.getUrl(this.getNodeUrl(node)))
      .then(url => this.xhrRequest(url, { mode: 'cors' }))
      .then(res => handleFailedRequest(res))
      .then(okRes => okRes.arrayBuffer())
      .then(buffer => handleEmptyBuffer(buffer))
      .then(okBuffer => {
        return new Promise(resolve => this.parse(node, okBuffer, resolve));
      });
  }

  private getNodeUrl(node: PointCloudOctreeGeometryNode): string {
    let url = node.getUrl();
    if (this.version.equalOrHigher('1.4')) {
      url += `.${this.extension}`;
    }

    return url;
  }

  private async parse(
    node: PointCloudOctreeGeometryNode,
    buffer: ArrayBuffer,
    resolve: () => void,
  ) {
    if (this.disposed) {
      resolve();
      return;
    }

    const lf = new LASFile(buffer, LasLazLoader.WORKER_POOL);

    try {
      await lf.open();
    } catch (e) {
      console.error('failed to open file. :(');

      return;
    }

    const header: any = await lf.getHeader();

    const skip = 1;
    let totalRead = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const data: any = await lf.readData(1000 * 1000, 0, skip);

      const workerType = WorkerType.LAS_DECODER_WORKER;
      const numPoints = data.count;

      LasLazLoader.WORKER_POOL.getWorker(workerType).then(autoTerminatingWorker => {
        autoTerminatingWorker.worker.onmessage = (e: WorkerResponse) => {
          const data = e.data;

          const geometry = new BufferGeometry();

          const dataAttributes = this.parseBufferAttributes(e.data);
          this.addBufferAttributes(geometry, dataAttributes);
          this.addIndices(geometry, data.indices);
          this.addNormalAttribute(geometry, numPoints);

          geometry.boundingBox = node.boundingBox;

          node.geometry = geometry;
          node.numPoints = numPoints;
          node.tightBoundingBox = this.getTightBoundingBox(data.tightBoundingBox);
          node.mean = new Vector3().fromArray(data.mean);

          node.loaded = true;
          node.loading = false;
          node.failed = false;
          node.pcoGeometry.numNodesLoading--;
          node.pcoGeometry.needsUpdate = true;

          resolve();
          LasLazLoader.WORKER_POOL.releaseWorker(workerType, autoTerminatingWorker);
        };

        const message = {
          buffer: data.buffer,
          numPoints: data.count,
          pointSize: header.pointsStructSize,
          pointFormatID: 2,
          scale: header.scale,
          offset: header.offset,
          mins: header.mins,
          maxs: header.maxs,
        };

        autoTerminatingWorker.worker.postMessage(message, [message.buffer]);
      });

      totalRead += data.count;
      hasMoreData = data.hasMoreData;
    }

    header.totalRead = totalRead;
    header.versionAsString = lf.versionAsString;
    header.isCompressed = lf.isCompressed;

    try {
      await lf.close();
    } catch (e) {
      console.error('failed to close las/laz file!!!');

      throw e;
    }
  }

  private getTightBoundingBox({ min, max }: { min: number[]; max: number[] }): Box3 {
    const box = new Box3(new Vector3().fromArray(min), new Vector3().fromArray(max));
    box.max.sub(box.min);
    box.min.set(0, 0, 0);

    return box;
  }

  private parseBufferAttributes(data: WorkerResponseData) {
    const buffers: { [name: string]: ArrayBuffer } = {};

    if (data.position) {
      buffers[PointAttributeName.POSITION_CARTESIAN] = data.position;
    }
    if (data.color) {
      buffers[PointAttributeName.COLOR_PACKED] = data.color;
    }
    if (data.position) {
      buffers[PointAttributeName.INTENSITY] = data.intensity;
    }
    if (data.position) {
      buffers[PointAttributeName.CLASSIFICATION] = data.classification;
    }
    if (data.position) {
      buffers[PointAttributeName.RETURN_NUMBER] = data.returnNumber;
    }
    if (data.position) {
      buffers[PointAttributeName.NUMBER_OF_RETURNS] = data.numberOfReturns;
    }
    if (data.position) {
      buffers[PointAttributeName.SOURCE_ID] = data.pointSourceID;
    }

    return buffers;
  }

  private addBufferAttributes(
    geometry: BufferGeometry,
    buffers: { [name: string]: ArrayBuffer },
  ): void {
    Object.keys(buffers).forEach(property => {
      const buffer = buffers[property];

      if (this.isAttribute(property, PointAttributeName.POSITION_CARTESIAN)) {
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(buffer), 3)); //
      } else if (this.isAttribute(property, PointAttributeName.COLOR_PACKED)) {
        geometry.setAttribute('color', new BufferAttribute(new Uint8Array(buffer), 4, true));
      } else if (this.isAttribute(property, PointAttributeName.INTENSITY)) {
        geometry.setAttribute('intensity', new BufferAttribute(new Float32Array(buffer), 1));
      } else if (this.isAttribute(property, PointAttributeName.CLASSIFICATION)) {
        geometry.setAttribute('classification', new BufferAttribute(new Uint8Array(buffer), 1));
      } else if (this.isAttribute(property, PointAttributeName.RETURN_NUMBER)) {
        geometry.setAttribute('returnNumber', new BufferAttribute(new Uint8Array(buffer), 1));
      } else if (this.isAttribute(property, PointAttributeName.NUMBER_OF_RETURNS)) {
        geometry.setAttribute('numberOfReturns', new BufferAttribute(new Uint8Array(buffer), 1));
      } else if (this.isAttribute(property, PointAttributeName.SOURCE_ID)) {
        geometry.setAttribute('pointSourceID', new BufferAttribute(new Uint16Array(buffer), 1));
      }
    });
  }

  private addIndices(geometry: BufferGeometry, indices: ArrayBuffer): void {
    const indicesAttribute = new Uint8BufferAttribute(indices, 4);
    indicesAttribute.normalized = true;
    geometry.setAttribute('indices', indicesAttribute);
  }

  private addNormalAttribute(geometry: BufferGeometry, numPoints: number): void {
    if (!geometry.getAttribute('normal')) {
      const buffer = new Float32Array(numPoints * 3);
      geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
    }
  }

  private isAttribute(property: string, name: PointAttributeName): boolean {
    return parseInt(property, 10) === name;
  }
}
