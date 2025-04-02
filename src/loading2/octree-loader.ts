import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { Box3, Sphere } from 'three';
import { GetUrlFn, XhrRequest } from '../loading/types';
import { OctreeGeometry } from './octree-geometry';
import { OctreeGeometryNode } from './octree-geometry-node';
import { PointAttribute, PointAttributes, PointAttributeTypes } from './point-attributes';
import { WorkerPool, WorkerType } from './worker-pool';
import { buildUrl, extractBasePath } from './utils';

// Buffer files for DEFAULT encoding
export const HIERARCHY_FILE = 'hierarchy.bin';
export const OCTREE_FILE = 'octree.bin';

// Default buffer files for GLTF encoding
export const GLTF_COLORS_FILE = 'colors.glbin';
export const GLTF_POSITIONS_FILE = 'positions.glbin';

export class NodeLoader {

	attributes?: PointAttributes;
	scale?: [number, number, number];
	offset?: [number, number, number];

	hierarchyPath = '';
	octreePath = '';
	gltfColorsPath = '';
	gltfPositionsPath = '';

	constructor(public getUrl: GetUrlFn, public url: string, public workerPool: WorkerPool, public metadata: Metadata, public xhrRequest: XhrRequest) {
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
					const responsePositions = await this.xhrRequest(urlPositions, { headers: headersPositions });

					const bufferPositions = await responsePositions.arrayBuffer();

					const firstColors = byteOffset * 4n;
					const lastColors = byteOffset * 4n + byteSize * 4n - 1n;

					const headersColors = { Range: `bytes=${firstColors}-${lastColors}` };
					const responseColors = await this.xhrRequest(urlColors, { headers: headersColors });
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
					// Add byte range as query param to enforce unique cacheable URI
					const urlOctreeCacheable = `${urlOctree}?range=${first}to${last}`;

					const headers = { Range: `bytes=${first}-${last}`, 'content-type': 'multipart/byteranges' };
					const response = await this.xhrRequest(urlOctreeCacheable, { headers });

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

		const bytesPerNode = 22;
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
		const response = await this.xhrRequest(hierarchyUrl, { headers });

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

const tmpVec3 = new Vector3();
function createChildAABB(aabb: Box3, index: number) {
	const min = aabb.min.clone();
	const max = aabb.max.clone();
	const size = tmpVec3.subVectors(max, min);

	if ((index & 0b0001) > 0) {
		min.z += size.z / 2;
	} else {
		max.z -= size.z / 2;
	}

	if ((index & 0b0010) > 0) {
		min.y += size.y / 2;
	} else {
		max.y -= size.y / 2;
	}

	if ((index & 0b0100) > 0) {
		min.x += size.x / 2;
	} else {
		max.x -= size.x / 2;
	}

	return new Box3(min, max);
}

function appendBuffer(buffer1: any, buffer2: any) {
	var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	tmp.set(new Uint8Array(buffer1), 0);
	tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
	return tmp.buffer;
}

const typenameTypeattributeMap = {
	double: PointAttributeTypes.DATA_TYPE_DOUBLE,
	float: PointAttributeTypes.DATA_TYPE_FLOAT,
	int8: PointAttributeTypes.DATA_TYPE_INT8,
	uint8: PointAttributeTypes.DATA_TYPE_UINT8,
	int16: PointAttributeTypes.DATA_TYPE_INT16,
	uint16: PointAttributeTypes.DATA_TYPE_UINT16,
	int32: PointAttributeTypes.DATA_TYPE_INT32,
	uint32: PointAttributeTypes.DATA_TYPE_UINT32,
	int64: PointAttributeTypes.DATA_TYPE_INT64,
	uint64: PointAttributeTypes.DATA_TYPE_UINT64
};

type AttributeType = keyof typeof typenameTypeattributeMap;

// A buffer view carries information on how to extract attribute data from a binary buffer.
// For the majority of cases byteLength and byteOffset will not be needed because matic will 
// always upload single attribute buffer files. However, to be prepared for potential future 
// support of combined buffers byteLength and byteOffset are present to understand where to 
// find the data inside the buffer.  
type BufferView = {
	byteLength: number,
	byteOffset: number,
	// The uri points to the particular source file and allows for arbitrary buffernames
	// when using metadata with gltf encoding. When using PotreeConverter 2 to generate the metadata 
	// the uri can be ignored. It will default to the naming convention of the potree v2 format.
	uri: string,
};

export interface Attribute {
	name: string;
	description: string;
	size: number;
	numElements: number;
	type: AttributeType;
	min: number[];
	max: number[];
	bufferView: BufferView;
}

export interface Metadata {
	version: string;
	name: string;
	description: string;
	points: number;
	projection: string;
	hierarchy: {
		firstChunkSize: number;
		stepSize: number;
		depth: number;
	};
	offset: [number, number, number];
	scale: [number, number, number];
	spacing: number;
	boundingBox: {
		min: [number, number, number],
		max: [number, number, number],
	};
	encoding: string;
	attributes: Attribute[];
}

export class OctreeLoader {

	workerPool: WorkerPool = new WorkerPool();

	basePath = '';
	hierarchyPath = '';
	octreePath = '';
	gltfColorsPath = '';
	gltfPositionsPath = '';

	getUrl: GetUrlFn;

	constructor(getUrl: GetUrlFn, url: string) {
		this.getUrl = getUrl;
		this.basePath = extractBasePath(url);
		this.hierarchyPath = buildUrl(this.basePath, HIERARCHY_FILE);
		this.octreePath = buildUrl(this.basePath, OCTREE_FILE);

		// We default to the known naming convention for glTF datasets
		this.gltfColorsPath = buildUrl(this.basePath, GLTF_COLORS_FILE);
		this.gltfPositionsPath = buildUrl(this.basePath, GLTF_POSITIONS_FILE);
	}

	static parseAttributes(jsonAttributes: Attribute[]) {

		const attributes = new PointAttributes();

		const replacements: { [key: string]: string } = { rgb: 'rgba' };

		for (const jsonAttribute of jsonAttributes) {
			const { name, numElements, min, max, bufferView } = jsonAttribute;

			const type = typenameTypeattributeMap[jsonAttribute.type];

			const potreeAttributeName = replacements[name] ? replacements[name] : name;

			const attribute = new PointAttribute(potreeAttributeName, type, numElements);

			if (bufferView) {
				attribute.uri = bufferView.uri;
			}
			
			if (numElements === 1  && min && max) {
				attribute.range = [min[0], max[0]];
			} else {
				attribute.range = [min, max];
			}

			if (name === 'gps-time') { // HACK: Guard against bad gpsTime range in metadata, see potree/potree#909
				if (typeof attribute.range[0] === 'number' && attribute.range[0] === attribute.range[1]) {
					attribute.range[1] += 1;
				}
			}

			attribute.initialRange = attribute.range;

			attributes.add(attribute);
		}

		{
			const hasNormals =
				attributes.attributes.find((a) => a.name === 'NormalX') !== undefined &&
				attributes.attributes.find((a) => a.name === 'NormalY') !== undefined &&
				attributes.attributes.find((a) => a.name === 'NormalZ') !== undefined;

			if (hasNormals) {
				const vector = {
					name: 'NORMAL',
					attributes: ['NormalX', 'NormalY', 'NormalZ']
				};
				attributes.addVector(vector);
			}
		}

		return attributes;
	}

	async load(url: string, xhrRequest: XhrRequest) {
		const metadata = await this.fetchMetadata(url, xhrRequest);
		const attributes = OctreeLoader.parseAttributes(metadata.attributes);
	
		this.applyCustomBufferURI(metadata.encoding, attributes);
	
		const loader = this.createLoader(url, metadata, attributes, xhrRequest);
	
		const boundingBox = this.createBoundingBox(metadata);
		const offset = this.getOffset(boundingBox);
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
	
	private applyCustomBufferURI(encoding: string, attributes: any) {
		// Only datasets with GLTF encoding support custom buffer URIs -
		// as opposed to datasets with DEFAULT encoding coming from PotreeConverter
		if (encoding === 'GLTF') {
			this.gltfPositionsPath = attributes.getAttribute("position")?.uri ?? this.gltfPositionsPath;
			this.gltfColorsPath = attributes.getAttribute("rgba")?.uri ?? this.gltfColorsPath;
		}
	}

	private createLoader(url: string, metadata: Metadata, attributes: any, xhrRequest: XhrRequest): NodeLoader {
		const loader = new NodeLoader(this.getUrl, url, this.workerPool, metadata, xhrRequest);
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
	
	private initializeOctree(loader: NodeLoader, url: string, metadata: Metadata, boundingBox: Box3, offset: Vector3, attributes: any): OctreeGeometry {
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
	
	private initializeRootNode(octree: OctreeGeometry, boundingBox: Box3, metadata: Metadata): OctreeGeometryNode {
		const root = new OctreeGeometryNode('r', octree, boundingBox);
		root.level = 0;
		root.nodeType = 2;
		root.hierarchyByteOffset = BigInt(0);
		root.hierarchyByteSize = BigInt(metadata.hierarchy.firstChunkSize);
		root.spacing = octree.spacing;
		root.byteOffset = BigInt(0);
		return root;
	}

	getTightBoundingBox(metadata: Metadata): Box3 {
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
