import {XhrRequest} from './../loading/types';
import {BufferAttribute, BufferGeometry, Vector3} from 'three';
import {PointAttribute, PointAttributes, PointAttributeTypes} from './PointAttributes';
import {Box3, Sphere} from 'three';
import {WorkerPool, WorkerType} from './WorkerPool';
import {OctreeGeometryNode} from './OctreeGeometryNode';
import {OctreeGeometry} from './OctreeGeometry';

export class NodeLoader
{

	attributes?: PointAttributes;

	scale?: [number, number, number];

	offset?: [number, number, number];
	

	constructor(public url: string, public workerPool: WorkerPool, public metadata: Metadata)
	{
	}

	async load(node: OctreeGeometryNode)
	{

		if (node.loaded || node.loading)
		{
			return;
		}

		node.loading = true;
		// TODO: Need to put the numNodesLoading to the pco
		node.octreeGeometry.numNodesLoading++;

		try 
		{
			if (node.nodeType === 2)
			{ // TODO: Investigate
				await this.loadHierarchy(node);
			}

			let {byteOffset, byteSize} = node;
			
			if (byteOffset === undefined || byteSize === undefined) 
			{
				throw new Error('byteOffset and byteSize are required');
			}

			let urlOctree = this.url.replace('/metadata.json', '/octree.bin');

			let first = byteOffset;
			let last = byteOffset + byteSize - BigInt(1);

			let buffer;

			if (byteSize === BigInt(0))
			{
				buffer = new ArrayBuffer(0);
				console.warn(`loaded node with 0 bytes: ${node.name}`);
			}
			else 
			{
				let response = await fetch(urlOctree, {
					headers: {
						'content-type': 'multipart/byteranges',
						'Range': `bytes=${first}-${last}`
					}
				});

				buffer = await response.arrayBuffer();
			}

			const workerType = this.metadata.encoding === 'BROTLI' ? WorkerType.DECODER_WORKER_BROTLI : WorkerType.DECODER_WORKER;

			const worker = this.workerPool.getWorker(workerType);

			worker.onmessage = (e) => 
			{

				let data = e.data;
				let buffers = data.attributeBuffers;

				this.workerPool.returnWorker(workerType, worker);

				let geometry = new BufferGeometry();
				
				for (let property in buffers)
				{

					let buffer = buffers[property].buffer;

					if (property === 'position')
					{
						geometry.setAttribute('position', new BufferAttribute(new Float32Array(buffer), 3));
					}
					else if (property === 'rgba')
					{
						geometry.setAttribute('rgba', new BufferAttribute(new Uint8Array(buffer), 4, true));
					}
					else if (property === 'NORMAL')
					{
						// geometry.setAttribute('rgba', new BufferAttribute(new Uint8Array(buffer), 4, true));
						geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
					}
					else if (property === 'INDICES') 
					{
						let bufferAttribute = new BufferAttribute(new Uint8Array(buffer), 4);
						bufferAttribute.normalized = true;
						geometry.setAttribute('indices', bufferAttribute);
					}
					else 
					{
						const bufferAttribute: BufferAttribute & {
							potree?: object
						} = new BufferAttribute(new Float32Array(buffer), 1);

						let batchAttribute = buffers[property].attribute;
						bufferAttribute.potree = {
							offset: buffers[property].offset,
							scale: buffers[property].scale,
							preciseBuffer: buffers[property].preciseBuffer,
							range: batchAttribute.range
						};

						geometry.setAttribute(property, bufferAttribute);
					}

				}
				// indices ??

				node.density = data.density;
				node.geometry = geometry;
				node.loaded = true;
				node.loading = false;
				// Potree.numNodesLoading--;
				node.octreeGeometry.numNodesLoading--;
			};

			let pointAttributes = node.octreeGeometry.pointAttributes;
			let scale = node.octreeGeometry.scale;

			let box = node.boundingBox;
			let min = node.octreeGeometry.offset.clone().add(box.min);
			let size = box.max.clone().sub(box.min);
			let max = min.clone().add(size);
			let numPoints = node.numPoints;

			let offset = node.octreeGeometry.loader.offset;

			let message = {
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
		}
		catch (e)
		{
			node.loaded = false;
			node.loading = false;
			node.octreeGeometry.numNodesLoading--;

			// console.log(`failed to load ${node.name}`);
			// console.log(e);
			// console.log(`trying again!`);
		}
	}

	parseHierarchy(node: OctreeGeometryNode, buffer: ArrayBuffer)
	{
		let view = new DataView(buffer);

		let bytesPerNode = 22;
		let numNodes = buffer.byteLength / bytesPerNode;

		let octree = node.octreeGeometry;
		// let nodes = [node];
		let nodes: OctreeGeometryNode[] = new Array(numNodes);
		nodes[0] = node;
		let nodePos = 1;

		for (let i = 0; i < numNodes; i++)
		{
			let current = nodes[i];

			let type = view.getUint8(i * bytesPerNode + 0);
			let childMask = view.getUint8(i * bytesPerNode + 1);
			let numPoints = view.getUint32(i * bytesPerNode + 2, true);
			let byteOffset = view.getBigInt64(i * bytesPerNode + 6, true);
			let byteSize = view.getBigInt64(i * bytesPerNode + 14, true);

			// if(byteSize === 0n){
			// 	// debugger;
			// }


			if (current.nodeType === 2)
			{
				// replace proxy with real node
				current.byteOffset = byteOffset;
				current.byteSize = byteSize;
				current.numPoints = numPoints;
			}
			else if (type === 2)
			{
				// load proxy
				current.hierarchyByteOffset = byteOffset;
				current.hierarchyByteSize = byteSize;
				current.numPoints = numPoints;
			}
			else 
			{
				// load real node 
				current.byteOffset = byteOffset;
				current.byteSize = byteSize;
				current.numPoints = numPoints;
			}
			
			current.nodeType = type;

			if (current.nodeType === 2)
			{
				continue;
			}

			for (let childIndex = 0; childIndex < 8; childIndex++)
			{
				let childExists = (1 << childIndex & childMask) !== 0;

				if (!childExists)
				{
					continue;
				}

				let childName = current.name + childIndex;

				let childAABB = createChildAABB(current.boundingBox, childIndex);
				let child = new OctreeGeometryNode(childName, octree, childAABB);
				child.name = childName;
				child.spacing = current.spacing / 2;
				child.level = current.level + 1;

				(current.children as any)[childIndex] = child;
				child.parent = current;

				// nodes.push(child);
				nodes[nodePos] = child;
				nodePos++;
			}

			// if((i % 500) === 0){
			// 	yield;
			// }
		}

		// if(duration > 20){
		// 	let msg = `duration: ${duration}ms, numNodes: ${numNodes}`;
		// 	console.log(msg);
		// }
	}

	async loadHierarchy(node: OctreeGeometryNode)
	{

		let {hierarchyByteOffset, hierarchyByteSize} = node;

		if (hierarchyByteOffset === undefined || hierarchyByteSize === undefined) 
		{
			throw new Error(`hierarchyByteOffset and hierarchyByteSize are undefined for node ${node.name}`);
		}

		let hierarchyPath = this.url.replace('/metadata.json', '/hierarchy.bin');
		
		let first = hierarchyByteOffset;
		let last = first + hierarchyByteSize - BigInt(1);


		let response = await fetch(hierarchyPath, {
			headers: {
				'content-type': 'multipart/byteranges',
				'Range': `bytes=${first}-${last}`
			}
		});

		let buffer = await response.arrayBuffer();

		this.parseHierarchy(node, buffer);
	}

}

let tmpVec3 = new Vector3();
function createChildAABB(aabb: Box3, index: number)
{
	let min = aabb.min.clone();
	let max = aabb.max.clone();
	let size = tmpVec3.subVectors(max, min);

	if ((index & 0b0001) > 0) 
	{
		min.z += size.z / 2;
	}
	else 
	{
		max.z -= size.z / 2;
	}

	if ((index & 0b0010) > 0) 
	{
		min.y += size.y / 2;
	}
	else 
	{
		max.y -= size.y / 2;
	}
	
	if ((index & 0b0100) > 0) 
	{
		min.x += size.x / 2;
	}
	else 
	{
		max.x -= size.x / 2;
	}

	return new Box3(min, max);
}

let typenameTypeattributeMap = {
	'double': PointAttributeTypes.DATA_TYPE_DOUBLE,
	'float': PointAttributeTypes.DATA_TYPE_FLOAT,
	'int8': PointAttributeTypes.DATA_TYPE_INT8,
	'uint8': PointAttributeTypes.DATA_TYPE_UINT8,
	'int16': PointAttributeTypes.DATA_TYPE_INT16,
	'uint16': PointAttributeTypes.DATA_TYPE_UINT16,
	'int32': PointAttributeTypes.DATA_TYPE_INT32,
	'uint32': PointAttributeTypes.DATA_TYPE_UINT32,
	'int64': PointAttributeTypes.DATA_TYPE_INT64,
	'uint64': PointAttributeTypes.DATA_TYPE_UINT64
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
	},
	offset: [number, number, number],
	scale: [number, number, number],
	spacing: number,
	boundingBox: {
		min: [number, number, number],
		max: [number, number, number],
	},
	encoding: string;
	attributes: Attribute[];
}

export class OctreeLoader
{

	workerPool: WorkerPool = new WorkerPool();

	constructor() 
	{
	}

	static parseAttributes(jsonAttributes: Attribute[])
	{

		let attributes = new PointAttributes();

		// Replacements object for string to string
		let replacements: {[key: string]: string} = {'rgb': 'rgba'};

		for (const jsonAttribute of jsonAttributes) 
		{
			let {name, numElements, min, max} = jsonAttribute;

			let type = typenameTypeattributeMap[jsonAttribute.type]; // Fix the typing, currently jsonAttribute has type 'never'

			let potreeAttributeName = replacements[name] ? replacements[name] : name;

			let attribute = new PointAttribute(potreeAttributeName, type, numElements);

			if (numElements === 1)
			{
				attribute.range = [min[0], max[0]];
			}
			else 
			{
				attribute.range = [min, max];
			}

			if (name === 'gps-time') 
			{ // HACK: Guard against bad gpsTime range in metadata, see potree/potree#909
				if (typeof attribute.range[0] === 'number' && attribute.range[0] === attribute.range[1]) 
				{
					attribute.range[1] += 1;
				}
			}

			attribute.initialRange = attribute.range;

			attributes.add(attribute);
		}

		{
			// check if it has normals
			let hasNormals = 
				attributes.attributes.find((a) => {return a.name === 'NormalX';}) !== undefined &&
				attributes.attributes.find((a) => {return a.name === 'NormalY';}) !== undefined &&
				attributes.attributes.find((a) => {return a.name === 'NormalZ';}) !== undefined;

			if (hasNormals)
			{
				let vector = {
					name: 'NORMAL',
					attributes: ['NormalX', 'NormalY', 'NormalZ']
				};
				attributes.addVector(vector);
			}
		}

		return attributes;
	}

	async load(url: string, xhrRequest: XhrRequest)
	{ // Previously a static method

		let response = await xhrRequest(url);
		let metadata: Metadata = await response.json();

		let attributes = OctreeLoader.parseAttributes(metadata.attributes);
		// console.log(attributes)

		let loader = new NodeLoader(url, this.workerPool, metadata);
		loader.attributes = attributes;
		loader.scale = metadata.scale;
		loader.offset = metadata.offset;

		let octree = new OctreeGeometry(loader, new Box3(new Vector3(...metadata.boundingBox.min), new Vector3(...metadata.boundingBox.max)));
		octree.url = url;
		octree.spacing = metadata.spacing;
		octree.scale = metadata.scale;

		let min = new Vector3(...metadata.boundingBox.min);
		let max = new Vector3(...metadata.boundingBox.max);
		let boundingBox = new Box3(min, max);

		let offset = min.clone();
		boundingBox.min.sub(offset);
		boundingBox.max.sub(offset);

		octree.projection = metadata.projection;
		octree.boundingBox = boundingBox;
		octree.tightBoundingBox = boundingBox.clone();
		octree.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
		octree.tightBoundingSphere = boundingBox.getBoundingSphere(new Sphere());
		octree.offset = offset;
		octree.pointAttributes = OctreeLoader.parseAttributes(metadata.attributes);

		let root = new OctreeGeometryNode('r', octree, boundingBox);
		root.level = 0;
		root.nodeType = 2;
		root.hierarchyByteOffset = BigInt(0);
		root.hierarchyByteSize = BigInt(metadata.hierarchy.firstChunkSize);
		root.spacing = octree.spacing;
		root.byteOffset = BigInt(0); // Originally 0

		octree.root = root;

		loader.load(root);

		let result = {geometry: octree};

		return result;

	}

}
