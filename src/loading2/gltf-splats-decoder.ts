import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { GetUrlFn, XhrRequest } from '../loading/types';
import { DecodedGeometry, GeometryDecoder } from './geometry-decoder';
import { OctreeGeometryNode } from './octree-geometry-node';
import { LoadingContext, Metadata } from './octree-loader';
import { appendBuffer } from './utils';
import { WorkerType } from './worker-pool';

export class GltfSplatDecoder implements GeometryDecoder {
  readonly workerType: WorkerType;

  private _metadata: Metadata;

  private compressed = false;

  constructor(
    public metadata: Metadata,
    private context: LoadingContext,
  ) {
    this._metadata = metadata;

    /*
    The non compressed data works with scales of three dimensions, where the Z value is always zero,
    the compressed data avoids this third value and only works with the XY elements, which is
    used to know if the metadata points to compressed values (the scale only has two elements).
    */

    this.workerType = this.metadata.compressed
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

    let dataUri = this.metadata;
    let retrieveURL = function (name: string) {
      let el = dataUri.attributes.filter((att: any) => att.name === name)[0];
      return el.bufferView.uri;
    };

    urls = {
      positions: await this.getUrl(retrieveURL('position')),
      colors: await this.getUrl(retrieveURL('sh_band_0')),
      opacities: await this.getUrl(retrieveURL('opacity')),
      scales: await this.getUrl(retrieveURL('scale')),
      rotations: await this.getUrl(retrieveURL('rotation')),
    };

    if (this.harmonicsEnabled) {
      urls = {
        positions: await this.getUrl(retrieveURL('position')),
        colors: await this.getUrl(retrieveURL('sh_band_0')),
        opacities: await this.getUrl(retrieveURL('opacity')),
        scales: await this.getUrl(retrieveURL('scale')),
        rotations: await this.getUrl(retrieveURL('rotation')),

        shBand1_0: await this.getUrl(retrieveURL('sh_band_1_triplet_0')),
        shBand1_1: await this.getUrl(retrieveURL('sh_band_1_triplet_1')),
        shBand1_2: await this.getUrl(retrieveURL('sh_band_1_triplet_2')),

        shBand2_0: await this.getUrl(retrieveURL('sh_band_2_triplet_0')),
        shBand2_1: await this.getUrl(retrieveURL('sh_band_2_triplet_1')),
        shBand2_2: await this.getUrl(retrieveURL('sh_band_2_triplet_2')),
        shBand2_3: await this.getUrl(retrieveURL('sh_band_2_triplet_3')),
        shBand2_4: await this.getUrl(retrieveURL('sh_band_2_triplet_4')),

        shBand3_0: await this.getUrl(retrieveURL('sh_band_3_triplet_0')),
        shBand3_1: await this.getUrl(retrieveURL('sh_band_3_triplet_1')),
        shBand3_2: await this.getUrl(retrieveURL('sh_band_3_triplet_2')),
        shBand3_3: await this.getUrl(retrieveURL('sh_band_3_triplet_3')),
        shBand3_4: await this.getUrl(retrieveURL('sh_band_3_triplet_4')),
        shBand3_5: await this.getUrl(retrieveURL('sh_band_3_triplet_5')),
        shBand3_6: await this.getUrl(retrieveURL('sh_band_3_triplet_6')),
      };
    }

    const offsets: Record<string, bigint> = {
      positions: 3n,
      colors: 3n,
      opacities: 1n,
      scales: this.compressed ? 2n : 3n,
      rotations: 4n,

      shBand1_0: 3n,
      shBand1_1: 3n,
      shBand1_2: 3n,

      shBand2_0: 3n,
      shBand2_1: 3n,
      shBand2_2: 3n,
      shBand2_3: 3n,
      shBand2_4: 3n,

      shBand3_0: 3n,
      shBand3_1: 3n,
      shBand3_2: 3n,
      shBand3_3: 3n,
      shBand3_4: 3n,
      shBand3_5: 3n,
      shBand3_6: 3n,
    };

    const intOrFloat = this.compressed ? 1n : 4n;

    const sizes: Record<string, bigint> = {
      positions: 4n,
      colors: intOrFloat,
      opacities: intOrFloat,
      scales: 4n,
      rotations: intOrFloat,

      shBand1_0: intOrFloat,
      shBand1_1: intOrFloat,
      shBand1_2: intOrFloat,

      shBand2_0: intOrFloat,
      shBand2_1: intOrFloat,
      shBand2_2: intOrFloat,
      shBand2_3: intOrFloat,
      shBand2_4: intOrFloat,

      shBand3_0: intOrFloat,
      shBand3_1: intOrFloat,
      shBand3_2: intOrFloat,
      shBand3_3: intOrFloat,
      shBand3_4: intOrFloat,
      shBand3_5: intOrFloat,
      shBand3_6: intOrFloat,
    };

    if (byteSize === BigInt(0)) {
      //warn(`Loaded node with 0 bytes: ${node.name}`);
      return;
    } else {
      const fetchBuffer = async (
        url: string,
        offsetMultiplier: bigint,
        size: bigint,
      ): Promise<ArrayBuffer> => {
        const firstByte = byteOffset * size * offsetMultiplier;
        const lastByte = firstByte + byteSize * size * offsetMultiplier - 1n;
        const headers: any = {
          Range: `bytes=${firstByte}-${lastByte}`,
          'Transfer-Encoding': 'compress',
          'Accept-Encoding': 'compress',
        };
        const response = await this.xhrRequest(url, { headers });
        return response.arrayBuffer();
      };

      const fetchPromises: Promise<ArrayBuffer>[] = Object.entries(urls).map(([key, url]) =>
        fetchBuffer(url, offsets[key], sizes[key]),
      );

      const [
        positions,
        colors,
        opacities,
        scales,
        rotations,

        shBand1_0,
        shBand1_1,
        shBand1_2,

        shBand2_0,
        shBand2_1,
        shBand2_2,
        shBand2_3,
        shBand2_4,

        shBand3_0,
        shBand3_1,
        shBand3_2,
        shBand3_3,
        shBand3_4,
        shBand3_5,
        shBand3_6,
      ]: ArrayBuffer[] = await Promise.all(fetchPromises);

      buffer = appendBuffer(positions, colors);
      buffer = appendBuffer(buffer, opacities);
      buffer = appendBuffer(buffer, scales);
      buffer = appendBuffer(buffer, rotations);

      if (this.harmonicsEnabled) {
        buffer = appendBuffer(buffer, shBand1_0);
        buffer = appendBuffer(buffer, shBand1_1);
        buffer = appendBuffer(buffer, shBand1_2);

        buffer = appendBuffer(buffer, shBand2_0);
        buffer = appendBuffer(buffer, shBand2_1);
        buffer = appendBuffer(buffer, shBand2_2);
        buffer = appendBuffer(buffer, shBand2_3);
        buffer = appendBuffer(buffer, shBand2_4);

        buffer = appendBuffer(buffer, shBand3_0);
        buffer = appendBuffer(buffer, shBand3_1);
        buffer = appendBuffer(buffer, shBand3_2);
        buffer = appendBuffer(buffer, shBand3_3);
        buffer = appendBuffer(buffer, shBand3_4);
        buffer = appendBuffer(buffer, shBand3_5);
        buffer = appendBuffer(buffer, shBand3_6);
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
