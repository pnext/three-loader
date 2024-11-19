import { PointAttribute, PointAttributeTypes } from './point-attributes.ts';
import { Quaternion } from 'three';

const typedArrayMapping = {
	'int8': Int8Array,
	'int16': Int16Array,
	'int32': Int32Array,
	'int64': Float64Array,
	'uint8': Uint8Array,
	'uint16': Uint16Array,
	'uint32': Uint32Array,
	'uint64': Float64Array,
	'float': Float32Array,
	'double': Float64Array,
};

onmessage = function (event) {

	const { buffer, pointAttributes, scale, name, min, max, size, offset, numPoints } = event.data;

	const view = new DataView(buffer);

	const attributeBuffers = {};

	const bytesPerPointPosition = 4 * 3;
	const bytesPerPointScale = 4 * 3;
	const bytesPerPointRotation = 4 * 4;
	const bytesPerPointColor = 4 * 3;
	const bytesPerPointOpacity = 4;

	const gridSize = 32;
	const grid = new Uint32Array(gridSize ** 3);
	const toIndex = (x, y, z) => {
		// min is already subtracted
		const dx = gridSize * x / size.x;
		const dy = gridSize * y / size.y;
		const dz = gridSize * z / size.z;

		const ix = Math.min(parseInt(dx), gridSize - 1);
		const iy = Math.min(parseInt(dy), gridSize - 1);
		const iz = Math.min(parseInt(dz), gridSize - 1);

		const index = ix + iy * gridSize + iz * gridSize * gridSize;

		return index;
	};

	const clamp = function (val, min, max) {
		return Math.max(Math.min(val, max), min);
	};

	let numOccupiedCells = 0;

	const tightBoxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
	const tightBoxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

	// positions, colors, opacities, scales, rotations
	for (const pointAttribute of pointAttributes.attributes) {

		if (["POSITION_CARTESIAN", "position"].includes(pointAttribute.name)) {
			const buff = new ArrayBuffer(numPoints * 4 * 3);
			const positions = new Float32Array(buff);
			for (let j = 0; j < numPoints; j++) {
				const pointOffset = j * bytesPerPointPosition;

				const x = view.getFloat32(pointOffset + 0, true) + offset[0] - min.x;
				const y = view.getFloat32(pointOffset + 4, true) + offset[1] - min.y;
				const z = view.getFloat32(pointOffset + 8, true) + offset[2] - min.z;

				tightBoxMin[0] = Math.min(tightBoxMin[0], x);
				tightBoxMin[1] = Math.min(tightBoxMin[1], y);
				tightBoxMin[2] = Math.min(tightBoxMin[2], z);

				tightBoxMax[0] = Math.max(tightBoxMax[0], x);
				tightBoxMax[1] = Math.max(tightBoxMax[1], y);
				tightBoxMax[2] = Math.max(tightBoxMax[2], z);

				const index = toIndex(x, y, z);
				const count = grid[index]++;
				if (count === 0) {
					numOccupiedCells++;
				}

				positions[3 * j + 0] = x;
				positions[3 * j + 1] = y;
				positions[3 * j + 2] = z;
			}

			attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
		} else if (["RGBA", "rgba", "sh_band_0"].includes(pointAttribute.name)) {

			const SH_C0 = 0.28209479177387814;

			const bufferColors = new ArrayBuffer(numPoints * 4);
			const colors = new Uint8Array(bufferColors);

			for (let j = 0; j < numPoints; j++) {
				const c0 = 4 * j + 0;
				const c1 = 4 * j + 1;
				const c2 = 4 * j + 2;
				const c3 = 4 * j + 3;

				const colorOffset = j * bytesPerPointColor + numPoints * bytesPerPointPosition;
				const opacityOffset = j * bytesPerPointOpacity + numPoints * (bytesPerPointPosition + bytesPerPointColor);

				// rgb 
				const r = view.getFloat32(colorOffset + 0, true);
				const g = view.getFloat32(colorOffset + 4, true);
				const b = view.getFloat32(colorOffset + 8, true);

				colors[c0] = (0.5 + SH_C0 * r) * 255;
				colors[c1] = (0.5 + SH_C0 * g) * 255;
				colors[c2] = (0.5 + SH_C0 * b) * 255;

				colors[c0] = clamp(Math.floor(colors[c0]), 0, 255);
				colors[c1] = clamp(Math.floor(colors[c1]), 0, 255);
				colors[c2] = clamp(Math.floor(colors[c2]), 0, 255);

				// opacity
				let a = view.getFloat32(opacityOffset, true);
				a = (1 / (1 + Math.exp(-a))) * 255;
				colors[c3] = clamp(Math.floor(a), 0, 255);
			}

			attributeBuffers['rgba'] = {
				buffer: bufferColors, attribute: pointAttribute
			};
		} else if (["scale"].includes(pointAttribute.name)) {
			const bufferScales = new ArrayBuffer(numPoints * 4 * 3);
			const scales = new Float32Array(bufferScales);

			for (let j = 0; j < numPoints; j++) {

				const scaleOffset = j * bytesPerPointScale + numPoints * (bytesPerPointPosition + bytesPerPointColor + bytesPerPointOpacity);

				const sx = view.getFloat32(scaleOffset + 0, true);
				const sy = view.getFloat32(scaleOffset + 4, true);
				const sz = view.getFloat32(scaleOffset + 8, true);

				scales[3 * j + 0] = Math.exp(sx);
				scales[3 * j + 1] = Math.exp(sy);
				scales[3 * j + 2] = Math.exp(sz);
			}

			attributeBuffers['scale'] = {
				buffer: bufferScales, attribute: pointAttribute
			};
		} else if (["rotation"].includes(pointAttribute.name)) {
			const bufferRotations = new ArrayBuffer(numPoints * 4 * 4);
			const rotations = new Float32Array(bufferRotations);

			const tempRotation = new Quaternion();

			for (let j = 0; j < numPoints; j++) {

				const rotationOffset = j * bytesPerPointRotation + numPoints * (bytesPerPointPosition + bytesPerPointColor + bytesPerPointOpacity + bytesPerPointScale);

				const rx = view.getFloat32(rotationOffset + 0, true);
				const ry = view.getFloat32(rotationOffset + 4, true);
				const rz = view.getFloat32(rotationOffset + 8, true);
				const rw = view.getFloat32(rotationOffset + 12, true);

				tempRotation.set(rx, ry, rz, rw);
				tempRotation.normalize();
	
				rotations[4 * j + 0] = tempRotation.x;
				rotations[4 * j + 1] = tempRotation.y;
				rotations[4 * j + 2] = tempRotation.z;
				rotations[4 * j + 3] = tempRotation.w;
			}

			attributeBuffers['rotation'] = {
				buffer: bufferRotations, attribute: pointAttribute
			};
		}
	}

	const occupancy = parseInt(numPoints / numOccupiedCells);

	{ // add indices
		const buff = new ArrayBuffer(numPoints * 4);
		const indices = new Uint32Array(buff);

		for (let i = 0; i < numPoints; i++) {
			indices[i] = i;
		}
		attributeBuffers["INDICES"] = { buffer: buff, attribute: PointAttribute.INDICES };
	}


	{ // handle attribute vectors
		const vectors = pointAttributes.vectors;

		for (let vector of vectors) {

			const { name, attributes } = vector;
			const numVectorElements = attributes.length;
			const buffer = new ArrayBuffer(numVectorElements * numPoints * 4);
			const f32 = new Float32Array(buffer);

			const iElement = 0;
			for (let sourceName of attributes) {
				const sourceBuffer = attributeBuffers[sourceName];
				const { offset, scale } = sourceBuffer;
				const view = new DataView(sourceBuffer.buffer);

				const getter = view.getFloat32.bind(view);

				for (let j = 0; j < numPoints; j++) {
					const value = getter(j * 4, true);

					f32[j * numVectorElements + iElement] = (value / scale) + offset;
				}

				iElement++;
			}

			const vecAttribute = new PointAttribute(name, PointAttributeTypes.DATA_TYPE_FLOAT, 3);

			attributeBuffers[name] = {
				buffer: buffer,
				attribute: vecAttribute,
			};

		}

	}

	const message = {
		buffer: buffer,
		attributeBuffers: attributeBuffers,
		density: occupancy,
		tightBoundingBox: { min: tightBoxMin, max: tightBoxMax },
	};

	const transferables = [];
	for (let property in message.attributeBuffers) {
		transferables.push(message.attributeBuffers[property].buffer);
	}
	transferables.push(buffer);

	postMessage(message, transferables);
};
