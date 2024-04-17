import {BufferAttribute, BufferGeometry, Vector3} from 'three';
import {Box3, Sphere} from 'three';
import {XhrRequest} from '../loading/types';
import {OctreeGeometry} from './octree-geometry';
import {OctreeGeometryNode} from './octree-geometry-node';
import {PointAttribute, PointAttributes, PointAttributeTypes} from './point-attributes';
import {WorkerPool, WorkerType} from './worker-pool';

export class NodeLoader {

	attributes?: PointAttributes;
	scale?: [number, number, number];
	offset?: [number, number, number];

	constructor(public url: string, public workerPool: WorkerPool, public metadata: Metadata) {
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

			const {byteOffset, byteSize} = node;

			if (byteOffset === undefined || byteSize === undefined) {
				throw new Error('byteOffset and byteSize are required');
			}

			const urlOctree = this.url.replace('/metadata.json', '/octree.bin');

			const first = byteOffset;
			const last = byteOffset + byteSize - BigInt(1);

			let buffer;

			if (byteSize === BigInt(0)) {
				buffer = new ArrayBuffer(0);
				console.warn(`loaded node with 0 bytes: ${node.name}`);
			} else {
				const response = await fetch(urlOctree, {
					headers: {
						'content-type': 'multipart/byteranges',
						Range: `bytes=${first}-${last}`
					}
				});

				buffer = await response.arrayBuffer();
			}

			const workerType = WorkerType.DECODER_WORKER;
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

		const {hierarchyByteOffset, hierarchyByteSize} = node;

		if (hierarchyByteOffset === undefined || hierarchyByteSize === undefined) {
			throw new Error(`hierarchyByteOffset and hierarchyByteSize are undefined for node ${node.name}`);
		}

		const hierarchyPath = this.url.replace('/metadata.json', '/hierarchy.bin');

		const first = hierarchyByteOffset;
		const last = first + hierarchyByteSize - BigInt(1);

		const response = await fetch(hierarchyPath, {
			headers: {
				'content-type': 'multipart/byteranges',
				Range: `bytes=${first}-${last}`
			}
		});

		const buffer = await response.arrayBuffer();

		this.parseHierarchy(node, buffer);
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

export interface Attribute {
	name: string;
	description: string;
	size: number;
	numElements: number;
	type: AttributeType;
	min: number[];
	max: number[];
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

	constructor() {
	}

	static parseAttributes(jsonAttributes: Attribute[]) {

		const attributes = new PointAttributes();

		const replacements: {[key: string]: string} = {rgb: 'rgba'};

		for (const jsonAttribute of jsonAttributes) {
			const {name, numElements, min, max} = jsonAttribute;

			const type = typenameTypeattributeMap[jsonAttribute.type]; 

			const potreeAttributeName = replacements[name] ? replacements[name] : name;

			const attribute = new PointAttribute(potreeAttributeName, type, numElements);

			if (numElements === 1) {
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

		const response = await xhrRequest(url);
		const metadata: Metadata = await response.json();

		const attributes = OctreeLoader.parseAttributes(metadata.attributes);

		const loader = new NodeLoader(url, this.workerPool, metadata);
		loader.attributes = attributes;
		loader.scale = metadata.scale;
		loader.offset = metadata.offset;

		const octree = new OctreeGeometry(loader, new Box3(new Vector3(...metadata.boundingBox.min), new Vector3(...metadata.boundingBox.max)));
		octree.url = url;
		octree.spacing = metadata.spacing;
		octree.scale = metadata.scale;

		const min = new Vector3(...metadata.boundingBox.min);
		const max = new Vector3(...metadata.boundingBox.max);
		const boundingBox = new Box3(min, max);

		const offset = min.clone();
		boundingBox.min.sub(offset);
		boundingBox.max.sub(offset);

		octree.projection = metadata.projection;
		octree.boundingBox = boundingBox;
		octree.tightBoundingBox = boundingBox.clone();
		octree.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
		octree.tightBoundingSphere = boundingBox.getBoundingSphere(new Sphere());
		octree.offset = offset;
		octree.pointAttributes = OctreeLoader.parseAttributes(metadata.attributes);

		const root = new OctreeGeometryNode('r', octree, boundingBox);
		root.level = 0;
		root.nodeType = 2;
		root.hierarchyByteOffset = BigInt(0);
		root.hierarchyByteSize = BigInt(metadata.hierarchy.firstChunkSize);
		root.spacing = octree.spacing;
		root.byteOffset = BigInt(0);

		octree.root = root;

		loader.load(root);

		const result = {geometry: octree};

		return result;
	}
}
