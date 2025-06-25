import { BufferAttribute, BufferGeometry } from 'three';
import { GeometryDecoder } from './geometry-decoder';
import { OctreeGeometryNode } from './octree-geometry-node';
import { LoadingContext, Metadata } from './octree-loader';
import { WorkerType } from './worker-pool';
import { XhrRequest } from 'loading/types';

// Buffer files for DEFAULT encoding
export const HIERARCHY_FILE = 'hierarchy.bin';
export const OCTREE_FILE = 'octree.bin';

// Default buffer files for GLTF encoding
export const GLTF_COLORS_FILE = 'colors.glbin';
export const GLTF_POSITIONS_FILE = 'positions.glbin';

export class Decoder implements GeometryDecoder {
  public readonly workerType = WorkerType.DECODER_WORKER;
  private _metadata: Metadata;

  constructor(
    public metadata: Metadata,
    private context: LoadingContext,
  ) {
    this._metadata = metadata;
  }

  async decode(node: OctreeGeometryNode, worker: Worker) {
    const { byteOffset, byteSize } = node;

    if (byteOffset === undefined || byteSize === undefined) {
      throw new Error('byteOffset and byteSize are required');
    }

    let buffer;

    const urlOctree = await this.getUrl(this.octreePath);

    const first = byteOffset;
    const last = byteOffset + byteSize - BigInt(1);

    if (byteSize === BigInt(0)) {
      buffer = new ArrayBuffer(0);
      console.warn(`loaded node with 0 bytes: ${node.name}`);
    } else {
      const headers = { Range: `bytes=${first}-${last}` };
      const response = await this.xhrRequest(urlOctree, { headers });

      buffer = await response.arrayBuffer();
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
    };

    worker.postMessage(message, [message.buffer]);

    const doneEvent = await new Promise<MessageEvent<any>>((res) => {
      worker.onmessage = res;
    });

    return this.readSuccessMessage(doneEvent, buffer);
  }

  private get getUrl() {
    return this.context.getUrl;
  }

  private get xhrRequest(): XhrRequest {
    return this.context.xhrRequest;
  }

  private get octreePath() {
    return this.context.octreePath;
  }

  private readSuccessMessage(e: MessageEvent<any>, buffer: ArrayBuffer) {
    const data = e.data;
    const buffers = data.attributeBuffers;
    const geometry = new BufferGeometry();

    for (const property in buffers) {
      const buffer = buffers[property].buffer;

      if (property === 'position') {
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(buffer), 3));
      } else if (property === 'rgba') {
        geometry.setAttribute('rgba', new BufferAttribute(new Uint8Array(buffer), 4, true));
      } else if (property === 'NORMAL') {
        geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
      } else if (property === 'INDICES') {
        const bufferAttribute = new BufferAttribute(new Uint8Array(buffer), 4);
        bufferAttribute.normalized = true;
        geometry.setAttribute('indices', bufferAttribute);
      } else {
        const bufferAttribute: BufferAttribute & {
          potree?: object;
        } = new BufferAttribute(new Float32Array(buffer), 1);

        const batchAttribute = buffers[property].attribute;
        bufferAttribute.potree = {
          offset: buffers[property].offset,
          scale: buffers[property].scale,
          preciseBuffer: buffers[property].preciseBuffer,
          range: batchAttribute.range,
        };

        geometry.setAttribute(property, bufferAttribute);
      }
    }

    return { data, buffer, geometry };
  }
}
