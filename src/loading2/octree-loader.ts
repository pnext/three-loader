import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { Box3, Sphere } from 'three';
import { GetUrlFn, XhrRequest } from '../loading/types';
import { OctreeGeometry } from './octree-geometry';
import { OctreeGeometryNode } from './octree-geometry-node';
import { PointAttributes } from './point-attributes';
import { WorkerPool, WorkerType } from './worker-pool';
import { Metadata } from './metadata';
import { appendBuffer, buildUrl, createChildAABB, extractBasePath } from './utils';

// Buffer files for DEFAULT encoding
export const HIERARCHY_FILE = 'hierarchy.bin';
export const OCTREE_FILE = 'octree.bin';

// Default buffer files for GLTF encoding
export const GLTF_COLORS_FILE = 'colors.glbin';
export const GLTF_POSITIONS_FILE = 'positions.glbin';

export const BYTES_PER_NODE = 22;

export class NodeLoader {
	attributes?: PointAttributes;
	scale?: [number, number, number];
	offset?: [number, number, number];

	hierarchyPath = '';
	octreePath = '';
	gltfColorsPath = '';
	gltfPositionsPath = '';

	constructor(public getUrl: GetUrlFn, 
				public url: string, 
				public workerPool: WorkerPool, 
				public metadata: Metadata) {
	}

	async load(node: OctreeGeometryNode) {

		if (node.loaded || node.loading) {
			return;
		}

		node.loading = true;
		node.octreeGeometry.numNodesLoading++;

		try {
			if (node.nodeType === 2) {
				await this.loadHierarchy(node);
			}

			const { byteOffset, byteSize } = node;

			if (byteOffset === undefined || byteSize === undefined) {
				throw new Error('byteOffset and byteSize are required');
			}

			let buffer;

			if (this.metadata.encoding === "GLTF") {
				const urlColors = await this.getUrl(this.gltfColorsPath);
				const urlPositions = await this.getUrl(this.gltfPositionsPath);

				if (byteSize === BigInt(0)) {
					buffer = new ArrayBuffer(0);
					console.warn(`loaded node with 0 bytes: ${node.name}`);
				} else {
					const firstPositions = byteOffset * 4n * 3n;
					const lastPositions = byteOffset * 4n * 3n + byteSize * 4n * 3n - 1n;

					const headersPositions = { Range: `bytes=${firstPositions}-${lastPositions}` };
					const responsePositions = await fetch(urlPositions, { headers: headersPositions });

					const bufferPositions = await responsePositions.arrayBuffer();

					const firstColors = byteOffset * 4n;
					const lastColors = byteOffset * 4n + byteSize * 4n - 1n;

					const headersColors = { Range: `bytes=${firstColors}-${lastColors}` };
					const responseColors = await fetch(urlColors, { headers: headersColors });
					const bufferColors = await responseColors.arrayBuffer();

					buffer = appendBuffer(bufferPositions, bufferColors);
				}
			}
			else {
				const urlOctree = await this.getUrl(this.octreePath);

				const first = byteOffset;
				const last = byteOffset + byteSize - BigInt(1);

				if (byteSize === BigInt(0)) {
					buffer = new ArrayBuffer(0);
					console.warn(`loaded node with 0 bytes: ${node.name}`);
				} else {
					const headers = { Range: `bytes=${first}-${last}` };
					const response = await fetch(urlOctree, { headers });

					buffer = await response.arrayBuffer();
				}
			}

			const workerType = this.metadata.encoding === 'GLTF' ? WorkerType.DECODER_WORKER_GLTF : WorkerType.DECODER_WORKER;
			const worker = this.workerPool.getWorker(workerType);

			worker.onmessage = (e) => {

				const data = e.data;
				const buffers = data.attributeBuffers;

				this.workerPool.returnWorker(workerType, worker);

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
							potree?: object
						} = new BufferAttribute(new Float32Array(buffer), 1);

						const batchAttribute = buffers[property].attribute;
						bufferAttribute.potree = {
							offset: buffers[property].offset,
							scale: buffers[property].scale,
							preciseBuffer: buffers[property].preciseBuffer,
							range: batchAttribute.range
						};

						geometry.setAttribute(property, bufferAttribute);
					}
				}
				node.density = data.density;
				node.geometry = geometry;
				node.loaded = true;
				node.loading = false;
				node.octreeGeometry.numNodesLoading--;
				node.octreeGeometry.needsUpdate = true;
				node.tightBoundingBox = this.getTightBoundingBox(data.tightBoundingBox);
			};

			const pointAttributes = node.octreeGeometry.pointAttributes;
			const scale = node.octreeGeometry.scale;

			const box = node.boundingBox;
			const min = node.octreeGeometry.offset.clone().add(box.min);
			const size = box.max.clone().sub(box.min);
			const max = min.clone().add(size);
			const numPoints = node.numPoints;

			const offset = node.octreeGeometry.loader.offset;

			const message = {
				name: node.name,
				buffer: buffer,
				pointAttributes: pointAttributes,
				scale: scale,
				min: min,
				max: max,
				size: size,
				offset: offset,
				numPoints: numPoints
			};

			worker.postMessage(message, [message.buffer]);
		} catch (e) {
			node.loaded = false;
			node.loading = false;
			node.octreeGeometry.numNodesLoading--;
		}
	}

	parseHierarchy(node: OctreeGeometryNode, buffer: ArrayBuffer) {
		const view = new DataView(buffer);

		const bytesPerNode = BYTES_PER_NODE;
		const numNodes = buffer.byteLength / bytesPerNode;

		const octree = node.octreeGeometry;
		const nodes: OctreeGeometryNode[] = new Array(numNodes);
		nodes[0] = node;
		let nodePos = 1;

		for (let i = 0; i < numNodes; i++) {
			const current = nodes[i];

			const type = view.getUint8(i * bytesPerNode + 0);
			const childMask = view.getUint8(i * bytesPerNode + 1);
			const numPoints = view.getUint32(i * bytesPerNode + 2, true);
			const byteOffset = view.getBigInt64(i * bytesPerNode + 6, true);
			const byteSize = view.getBigInt64(i * bytesPerNode + 14, true);

			if (current.nodeType === 2) {
				// replace proxy with real node
				current.byteOffset = byteOffset;
				current.byteSize = byteSize;
				current.numPoints = numPoints;
			} else if (type === 2) {
				// load proxy
				current.hierarchyByteOffset = byteOffset;
				current.hierarchyByteSize = byteSize;
				current.numPoints = numPoints;
			} else {
				// load real node
				current.byteOffset = byteOffset;
				current.byteSize = byteSize;
				current.numPoints = numPoints;
			}

			current.nodeType = type;

			if (current.nodeType === 2) {
				continue;
			}

			for (let childIndex = 0; childIndex < 8; childIndex++) {
				const childExists = (1 << childIndex & childMask) !== 0;

				if (!childExists) {
					continue;
				}

				const childName = current.name + childIndex;

				const childAABB = createChildAABB(current.boundingBox, childIndex);
				const child = new OctreeGeometryNode(childName, octree, childAABB);
				child.name = childName;
				child.spacing = current.spacing / 2;
				child.level = current.level + 1;

				(current.children as any)[childIndex] = child;
				child.parent = current;

				nodes[nodePos] = child;
				nodePos++;
			}
		}
	}

	async loadHierarchy(node: OctreeGeometryNode) {

		const { hierarchyByteOffset, hierarchyByteSize } = node;

		if (hierarchyByteOffset === undefined || hierarchyByteSize === undefined) {
			throw new Error(`hierarchyByteOffset and hierarchyByteSize are undefined for node ${node.name}`);
		}

		const hierarchyUrl = await this.getUrl(this.hierarchyPath);

		const first = hierarchyByteOffset;
		const last = first + hierarchyByteSize - BigInt(1);

		const headers = { Range: `bytes=${first}-${last}` };
		const response = await fetch(hierarchyUrl, { headers });

		const buffer = await response.arrayBuffer();

		this.parseHierarchy(node, buffer);
	}

	private getTightBoundingBox({ min, max }: { min: number[]; max: number[] }): Box3 {
		const box = new Box3(new Vector3().fromArray(min), new Vector3().fromArray(max));
		box.max.sub(box.min);
		box.min.set(0, 0, 0);

		return box;
	}
}

export class OctreeLoader {

	private workerPool: WorkerPool = new WorkerPool();

	private basePath: string;
	private hierarchyPath: string;
	private octreePath: string;
	private gltfColorsPath: string;
	private gltfPositionsPath: string;

	private getUrl: GetUrlFn;

	constructor(getUrl: GetUrlFn, url: string) {
		this.getUrl = getUrl;

		this.basePath = extractBasePath(url);
		this.hierarchyPath = buildUrl(this.basePath, HIERARCHY_FILE);
		this.octreePath = buildUrl(this.basePath, OCTREE_FILE);

		// We default to the known naming convention for glTF datasets
		this.gltfColorsPath = buildUrl(this.basePath, GLTF_COLORS_FILE);
		this.gltfPositionsPath = buildUrl(this.basePath, GLTF_POSITIONS_FILE);
	}

	async load(url: string, xhrRequest: XhrRequest) {
		const metadata = await this.fetchMetadata(url, xhrRequest);
		const attributes = PointAttributes.parseAttributes(metadata.attributes);
	
		this.applyCustomBufferURI(metadata.encoding, attributes);
	
		const boundingBox = this.createBoundingBox(metadata);
		const offset = this.getOffset(boundingBox);
		const loader = this.createLoader(url, metadata, attributes);
		const octree = this.initializeOctree(loader, url, metadata, boundingBox, offset, attributes);
		const root = this.initializeRootNode(octree, boundingBox, metadata);
		octree.root = root;
	
		loader.load(root);
	
		return { geometry: octree };
	}
	
	private async fetchMetadata(url: string, xhrRequest: XhrRequest): Promise<Metadata> {
		const response = await xhrRequest(url);
		return response.json();
	}

	private getBufferUri(attributesObj: any, attributeName: string): string | null {
		const attribute = attributesObj.attributes.find((attr: any) => attr.name === attributeName);
		if (attribute) {
			return attribute.uri;
		}
		return null;
	}
	
	private applyCustomBufferURI(encoding: string, attributes: any) {
		// Only datasets with GLTF encoding support custom buffer URIs -
		// as opposed to datasets with DEFAULT encoding coming from PotreeConverter
		if (encoding === 'GLTF') {
			this.gltfPositionsPath = this.getBufferUri(attributes, "position") ?? this.gltfPositionsPath;
			this.gltfColorsPath = this.getBufferUri(attributes, "rgba") ?? this.gltfColorsPath;
		}
	}
	
	private createLoader(url: string, metadata: Metadata, attributes: any): NodeLoader {
		const loader = new NodeLoader(this.getUrl, url, this.workerPool, metadata);
		loader.attributes = attributes;
		loader.scale = metadata.scale;
		loader.offset = metadata.offset;
		loader.hierarchyPath = this.hierarchyPath;
		loader.octreePath = this.octreePath;
		loader.gltfColorsPath = this.gltfColorsPath;
		loader.gltfPositionsPath = this.gltfPositionsPath;
		return loader;
	}
	
	private createBoundingBox(metadata: Metadata): Box3 {
		const min = new Vector3(...metadata.boundingBox.min);
		const max = new Vector3(...metadata.boundingBox.max);
		const boundingBox = new Box3(min, max);
		return boundingBox;
	}
	
	private getOffset(boundingBox: Box3): Vector3 {
		const offset = boundingBox.min.clone();
		boundingBox.min.sub(offset);
		boundingBox.max.sub(offset);
		return offset;
	}
	
	private initializeOctree(	loader: NodeLoader, 
						 		url: string, 
								metadata: Metadata, 
								boundingBox: Box3, 
								offset: Vector3, 
								attributes: any): OctreeGeometry {
		const octree = new OctreeGeometry(loader, boundingBox);
		octree.url = url;
		octree.spacing = metadata.spacing;
		octree.scale = metadata.scale;
		octree.projection = metadata.projection;
		octree.boundingBox = boundingBox;
		octree.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
		octree.tightBoundingSphere = boundingBox.getBoundingSphere(new Sphere());
		octree.tightBoundingBox = this.getTightBoundingBox(metadata);
		octree.offset = offset;
		octree.pointAttributes = attributes;
		return octree;
	}
	
	private initializeRootNode(	octree: OctreeGeometry, 
								boundingBox: Box3, 
								metadata: Metadata): OctreeGeometryNode {
		const root = new OctreeGeometryNode('r', octree, boundingBox);
		root.level = 0;
		root.nodeType = 2;
		root.hierarchyByteOffset = BigInt(0);
		root.hierarchyByteSize = BigInt(metadata.hierarchy.firstChunkSize);
		root.spacing = octree.spacing;
		root.byteOffset = BigInt(0);
		return root;
	}

	private getTightBoundingBox(metadata: Metadata): Box3 {
		const positionAttribute = metadata.attributes.find((attr) => attr.name === 'position');

		if (!positionAttribute || !positionAttribute.min || !positionAttribute.max) {
			console.warn('Position attribute (min, max) not found. Falling back to boundingBox for tightBoundingBox');
			return new Box3(
				new Vector3(...metadata.boundingBox.min),
				new Vector3(...metadata.boundingBox.max)
			);
		}

		const offset = metadata.boundingBox.min;
		const tightBoundingBox = new Box3(
			new Vector3(
				positionAttribute.min[0] - offset[0],
				positionAttribute.min[1] - offset[1],
				positionAttribute.min[2] - offset[2]
			),
			new Vector3(
				positionAttribute.max[0] - offset[0],
				positionAttribute.max[1] - offset[1],
				positionAttribute.max[2] - offset[2]
			)
		);

		return tightBoundingBox;
	}
}
