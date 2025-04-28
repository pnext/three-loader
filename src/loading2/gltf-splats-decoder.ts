import { BufferAttribute, BufferGeometry } from 'three';
import { GetUrlFn } from '../loading/types';
import { DecodedGeometry, GeometryDecoder } from './geometry-decoder';
import { OctreeGeometryNode } from './octree-geometry-node';
import { LoadingContext, Metadata} from './octree-loader';
import { appendBuffer } from './utils';
import { WorkerType } from './worker-pool';


export class GltfSplatDecoder implements GeometryDecoder {

	readonly workerType: WorkerType = WorkerType.DECODER_WORKER_SPLATS;

    private _metadata: Metadata;

	constructor(public metadata: Metadata, private context: LoadingContext) {
        this._metadata = metadata;
	}

	async decode(node: OctreeGeometryNode, worker: Worker): Promise<DecodedGeometry | undefined> {

		node.loading = true;
		node.octreeGeometry.numNodesLoading++;

		const { byteOffset, byteSize } = node;
		if (byteOffset === undefined || byteSize === undefined) {
			throw new Error('byteOffset and byteSize are required');
		}

		let urls: Record<string, string>;
		let buffer: ArrayBuffer;

		urls = {
			positions: await this.getUrl(this.gltfPositionsPath),
			colors: await this.getUrl('sh_band_0.glbin'),
			opacities: await this.getUrl('opacity.glbin'),
			scales: await this.getUrl('scale.glbin'),
			rotations: await this.getUrl('rotation.glbin'),
		};

		if (this.harmonicsEnabled) {

			urls = {
				positions: await this.getUrl(this.gltfPositionsPath),
				colors: await this.getUrl('sh_band_0.glbin'),
				opacities: await this.getUrl('opacity.glbin'),
				scales: await this.getUrl('scale.glbin'),
				rotations: await this.getUrl('rotation.glbin'),
				shBand1_0: await this.getUrl('sh_band_1_triplet_0.glbin'),
				shBand1_1: await this.getUrl('sh_band_1_triplet_1.glbin'),
				shBand1_2: await this.getUrl('sh_band_1_triplet_2.glbin'),

				shBand2_0: await this.getUrl('sh_band_2_triplet_0.glbin'),
				shBand2_1: await this.getUrl('sh_band_2_triplet_1.glbin'),
				shBand2_2: await this.getUrl('sh_band_2_triplet_2.glbin'),
				shBand2_3: await this.getUrl('sh_band_2_triplet_3.glbin'),
				shBand2_4: await this.getUrl('sh_band_2_triplet_4.glbin'),

				shBand3_0: await this.getUrl('sh_band_3_triplet_0.glbin'),
				shBand3_1: await this.getUrl('sh_band_3_triplet_1.glbin'),
				shBand3_2: await this.getUrl('sh_band_3_triplet_2.glbin'),
				shBand3_3: await this.getUrl('sh_band_3_triplet_3.glbin'),
				shBand3_4: await this.getUrl('sh_band_3_triplet_4.glbin'),
				shBand3_5: await this.getUrl('sh_band_3_triplet_5.glbin'),
				shBand3_6: await this.getUrl('sh_band_3_triplet_6.glbin'),
			};

		}

		const offsets: Record<string, bigint> = {
			positions: 3n,
			colors: 3n,
			opacities: 1n,
			scales: 3n,
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

		if (byteSize === BigInt(0)) {
			console.warn(`Loaded node with 0 bytes: ${node.name}`);
			return;
		} else {

			const fetchBuffer = async (url: string, offsetMultiplier: bigint): Promise<ArrayBuffer> => {
				const firstByte = byteOffset * 4n * offsetMultiplier;
				const lastByte = firstByte + byteSize * 4n * offsetMultiplier - 1n;
				const headers: Record<string, string> = { Range: `bytes=${firstByte}-${lastByte}` };
				const response = await fetch(url, { headers });
				return response.arrayBuffer();
			};

			const fetchPromises: Promise<ArrayBuffer>[] = Object.entries(urls).map(([key, url]) =>
				fetchBuffer(url, offsets[key])
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

        console.log(node.name);

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
            harmonicsEnabled: this.harmonicsEnabled
        };

        worker.postMessage(message, [message.buffer]);

		const workerDone = await new Promise<MessageEvent<any>>(res => worker.onmessage = res);
		const data = workerDone.data;
		const buffers = data.attributeBuffers;
		const geometry = new BufferGeometry();

		geometry.drawRange.count = node.numPoints;

		for (const property in buffers) {

			const buffer = buffers[property].buffer;

			if (property === "position") {
				geometry.setAttribute('centers', new BufferAttribute(new Float32Array(buffer), 4));
			}

			if (property === "scale") {
				geometry.setAttribute('scale', new BufferAttribute(new Float32Array(buffer), 3));
			}

			if (property === "orientation") {
				geometry.setAttribute('orientation', new BufferAttribute(new Float32Array(buffer), 4));
			}

			if (property === "raw_position") {
				geometry.setAttribute('raw_position', new BufferAttribute(new Float32Array(buffer), 4));
			}

			else if (property === 'COVARIANCE0') {
				geometry.setAttribute('COVARIANCE0', new BufferAttribute(new Float32Array(buffer), 4));
			}

			else if (property === 'COVARIANCE1') {
				geometry.setAttribute('COVARIANCE1', new BufferAttribute(new Float32Array(buffer), 2));
			}

			else if (property === 'POS_COLOR') {
				geometry.setAttribute('POS_COLOR', new BufferAttribute(new Uint32Array(buffer), 4));
			}

			if (this.harmonicsEnabled) {

				if (property === "HARMONICS1") {
					geometry.setAttribute('HARMONICS1', new BufferAttribute(new Uint32Array(buffer), 3));
				}

				else if (property === "HARMONICS2") {
					geometry.setAttribute('HARMONICS2', new BufferAttribute(new Uint32Array(buffer), 5));
				}

				else if (property === "HARMONICS3") {
					geometry.setAttribute('HARMONICS3', new BufferAttribute(new Uint32Array(buffer), 7));
				}

			}

		}

		return { data, buffer, geometry };
	}

	private get gltfPositionsPath() {
		return this.context.gltfPositionsPath;
	}

	private get getUrl(): GetUrlFn {
		return this.context.getUrl;
	}

	private get harmonicsEnabled(): boolean {
		return this.context.harmonicsEnabled;
	}

}