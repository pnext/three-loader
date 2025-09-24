import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { GetUrlFn, XhrRequest } from '../loading/types';
import { DecodedGeometry, GeometryDecoder } from './geometry-decoder';
import { OctreeGeometryNode } from './octree-geometry-node';
import { LoadingContext, Metadata } from './octree-loader';
import { appendBuffer } from './utils';
import { WorkerType } from './worker-pool';

export class GltfSplatDecoderInterleaved implements GeometryDecoder {
  readonly workerType: WorkerType;

  private _metadata: Metadata;

  private compressed = false;

  constructor(
    public metadata: Metadata,
    private context: LoadingContext,
  ) {
    this._metadata = metadata;
    this.compressed = true;
    this.workerType = this.compressed
      ? WorkerType.DECODER_WORKER_SPLATS_COMPRESSED
      : WorkerType.DECODER_WORKER_SPLATS;
  }

  async decode(node: OctreeGeometryNode, worker: Worker): Promise<DecodedGeometry | undefined> {
    const { byteOffset, byteSize } = node;
    if (byteOffset === undefined || byteSize === undefined) {
      throw new Error('byteOffset and byteSize are required');
    }

    let urls: Record<string, string>;
    let buffer: ArrayBuffer;

    urls = {
      core: await this.getUrl('core.glbin'),
    };

    if (this.harmonicsEnabled) {
      urls = {
        core: await this.getUrl('core.glbin'),
        harmonics: await this.getUrl('sh_bands_123.glbin'),
      };
    }

    const sizes: Record<string, bigint> = {
      core: 28n,
      harmonics: 45n,
    };

    if (byteSize === BigInt(0)) {
      //warn(`Loaded node with 0 bytes: ${node.name}`);
      return;
    } else {
      const fetchBuffer = async (url: string, size: bigint): Promise<ArrayBuffer> => {
        const firstByte = byteOffset * size;
        const lastByte = firstByte + byteSize * size - 1n;
        const headers: any = {
          Range: `bytes=${firstByte}-${lastByte}`,
          'Transfer-Encoding': 'compress',
          'Accept-Encoding': 'compress',
        };
        const response = await this.xhrRequest(url, { headers });
        return response.arrayBuffer();
      };

      const fetchPromises: Promise<ArrayBuffer>[] = Object.entries(urls).map(([key, url]) =>
        fetchBuffer(url, sizes[key]),
      );

      const [core, harmonics]: ArrayBuffer[] = await Promise.all(fetchPromises);

      buffer = core;

      if (this.harmonicsEnabled) {
        buffer = appendBuffer(buffer, harmonics);
      }
    }

    const pointAttributes = node.octreeGeometry.pointAttributes;
    const scale = node.octreeGeometry.scale;

    const box = node.boundingBox;
    const min = node.octreeGeometry.offset.clone().add(box.min);
    const size = box.max.clone().sub(box.min);
    const max = min.clone().add(size);
    const numPoints = node.numPoints;

    const offset = this._metadata.offset;

    const message = {
      name: node.name,
      buffer: buffer,
      pointAttributes: pointAttributes,
      scale: scale,
      min: min,
      max: max,
      size: size,
      offset: offset,
      numPoints: numPoints,
      harmonicsEnabled: this.harmonicsEnabled,
    };

    worker.postMessage(message, [message.buffer]);

    const workerDone = await new Promise<MessageEvent<any>>((res) => (worker.onmessage = res));
    const data = workerDone.data;
    const buffers = data.attributeBuffers;
    const geometry = new BufferGeometry();

    geometry.drawRange.count = node.numPoints;

    for (const property in buffers) {
      const buffer = buffers[property].buffer;

      if (property === 'position') {
        geometry.setAttribute('centers', new BufferAttribute(new Float32Array(buffer), 4));
      }

      if (property === 'scale') {
        geometry.setAttribute('scale', new BufferAttribute(new Float32Array(buffer), 3));
      }

      if (property === 'orientation') {
        geometry.setAttribute('orientation', new BufferAttribute(new Float32Array(buffer), 4));
      }

      if (property === 'raw_position') {
        geometry.setAttribute('raw_position', new BufferAttribute(new Float32Array(buffer), 4));
      } else if (property === 'COVARIANCE0') {
        geometry.setAttribute('COVARIANCE0', new BufferAttribute(new Float32Array(buffer), 4));
      } else if (property === 'COVARIANCE1') {
        geometry.setAttribute('COVARIANCE1', new BufferAttribute(new Float32Array(buffer), 2));
      } else if (property === 'POS_COLOR') {
        geometry.setAttribute('POS_COLOR', new BufferAttribute(new Uint32Array(buffer), 4));
      }

      if (this.harmonicsEnabled) {
        if (property === 'HARMONICS1') {
          geometry.setAttribute('HARMONICS1', new BufferAttribute(new Uint32Array(buffer), 3));
        } else if (property === 'HARMONICS2') {
          geometry.setAttribute('HARMONICS2', new BufferAttribute(new Uint32Array(buffer), 5));
        } else if (property === 'HARMONICS3') {
          geometry.setAttribute('HARMONICS3', new BufferAttribute(new Uint32Array(buffer), 7));
        }
      }
    }

    geometry.userData.maxDepth = this._metadata.hierarchy.depth + 1;
    geometry.userData.totalSplats = this._metadata.points;
    geometry.userData.offset = new Vector3(...offset).sub(min);

    return { data, buffer, geometry };
  }

  private get getUrl(): GetUrlFn {
    return this.context.getUrl;
  }

  private get xhrRequest(): XhrRequest {
    return this.context.xhrRequest;
  }

  private get harmonicsEnabled(): boolean {
    return this.context.harmonicsEnabled;
  }
}
