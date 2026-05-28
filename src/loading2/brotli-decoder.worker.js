/**
 * Adapted from original Potree Brotli worker: https://github.com/potree/potree/blob/master/src/modules/loader/2.0/DecoderWorker_brotli.js
 */

import { PointAttribute, PointAttributeTypes } from './point-attributes.ts';

const decompress = require('brotli/decompress');

const typedArrayMapping = {
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  int64: Float64Array,
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
  uint64: Float64Array,
  float: Float32Array,
  double: Float64Array,
};

function dealign24b(mortoncode) {
  // see https://stackoverflow.com/questions/45694690/how-i-can-remove-all-odds-bits-in-c

  // input alignment of desired bits
  // ..a..b..c..d..e..f..g..h..i..j..k..l..m..n..o..p
  let x = mortoncode;

  //          ..a..b..c..d..e..f..g..h..i..j..k..l..m..n..o..p                     ..a..b..c..d..e..f..g..h..i..j..k..l..m..n..o..p
  //          ..a.....c.....e.....g.....i.....k.....m.....o...                     .....b.....d.....f.....h.....j.....l.....n.....p
  //          ....a.....c.....e.....g.....i.....k.....m.....o.                     .....b.....d.....f.....h.....j.....l.....n.....p
  x = ((x & 0b001000001000001000001000) >> 2) | ((x & 0b000001000001000001000001) >> 0);
  //          ....ab....cd....ef....gh....ij....kl....mn....op                     ....ab....cd....ef....gh....ij....kl....mn....op
  //          ....ab..........ef..........ij..........mn......                     ..........cd..........gh..........kl..........op
  //          ........ab..........ef..........ij..........mn..                     ..........cd..........gh..........kl..........op
  x = ((x & 0b000011000000000011000000) >> 4) | ((x & 0b000000000011000000000011) >> 0);
  //          ........abcd........efgh........ijkl........mnop                     ........abcd........efgh........ijkl........mnop
  //          ........abcd....................ijkl............                     ....................efgh....................mnop
  //          ................abcd....................ijkl....                     ....................efgh....................mnop
  x = ((x & 0b000000001111000000000000) >> 8) | ((x & 0b000000000000000000001111) >> 0);
  //          ................abcdefgh................ijklmnop                     ................abcdefgh................ijklmnop
  //          ................abcdefgh........................                     ........................................ijklmnop
  //          ................................abcdefgh........                     ........................................ijklmnop
  x = ((x & 0b000000000000000000000000) >> 16) | ((x & 0b000000000000000011111111) >> 0);

  // sucessfully realigned!
  //................................abcdefghijklmnop

  return x;
}

onmessage = function (event) {
  let { pointAttributes, scale, min, size, offset, numPoints } = event.data;

  let buffer = decompress(new Uint8Array(event.data.buffer), event.data.buffer.byteLength);
  let view = new DataView(buffer.buffer);

  let attributeBuffers = {};

  let gridSize = 32;
  let grid = new Uint32Array(gridSize ** 3);
  let toIndex = (x, y, z) => {
    // min is already subtracted
    let dx = (gridSize * x) / size.x;
    let dy = (gridSize * y) / size.y;
    let dz = (gridSize * z) / size.z;

    let ix = Math.min(parseInt(dx), gridSize - 1);
    let iy = Math.min(parseInt(dy), gridSize - 1);
    let iz = Math.min(parseInt(dz), gridSize - 1);

    let index = ix + iy * gridSize + iz * gridSize * gridSize;

    return index;
  };

  let numOccupiedCells = 0;
  let byteOffset = 0;

  let tightBoxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  let tightBoxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

  for (let pointAttribute of pointAttributes.attributes) {
    if (['POSITION_CARTESIAN', 'position'].includes(pointAttribute.name)) {
      let buff = new ArrayBuffer(numPoints * 4 * 3);
      let positions = new Float32Array(buff);

      for (let j = 0; j < numPoints; j++) {
        let mc_0 = view.getUint32(byteOffset + 4, true);
        let mc_1 = view.getUint32(byteOffset + 0, true);
        let mc_2 = view.getUint32(byteOffset + 12, true);
        let mc_3 = view.getUint32(byteOffset + 8, true);

        byteOffset += 16;

        let X =
          dealign24b((mc_3 & 0x00ffffff) >>> 0) |
          (dealign24b(((mc_3 >>> 24) | (mc_2 << 8)) >>> 0) << 8);

        let Y =
          dealign24b((mc_3 & 0x00ffffff) >>> 1) |
          (dealign24b(((mc_3 >>> 24) | (mc_2 << 8)) >>> 1) << 8);

        let Z =
          dealign24b((mc_3 & 0x00ffffff) >>> 2) |
          (dealign24b(((mc_3 >>> 24) | (mc_2 << 8)) >>> 2) << 8);

        if (mc_1 != 0 || mc_2 != 0) {
          X =
            X |
            (dealign24b((mc_1 & 0x00ffffff) >>> 0) << 16) |
            (dealign24b(((mc_1 >>> 24) | (mc_0 << 8)) >>> 0) << 24);

          Y =
            Y |
            (dealign24b((mc_1 & 0x00ffffff) >>> 1) << 16) |
            (dealign24b(((mc_1 >>> 24) | (mc_0 << 8)) >>> 1) << 24);

          Z =
            Z |
            (dealign24b((mc_1 & 0x00ffffff) >>> 2) << 16) |
            (dealign24b(((mc_1 >>> 24) | (mc_0 << 8)) >>> 2) << 24);
        }

        let x = parseInt(X) * scale[0] + offset[0] - min.x;
        let y = parseInt(Y) * scale[1] + offset[1] - min.y;
        let z = parseInt(Z) * scale[2] + offset[2] - min.z;

        tightBoxMin[0] = Math.min(tightBoxMin[0], x);
        tightBoxMin[1] = Math.min(tightBoxMin[1], y);
        tightBoxMin[2] = Math.min(tightBoxMin[2], z);

        tightBoxMax[0] = Math.max(tightBoxMax[0], x);
        tightBoxMax[1] = Math.max(tightBoxMax[1], y);
        tightBoxMax[2] = Math.max(tightBoxMax[2], z);

        let index = toIndex(x, y, z);
        let count = grid[index]++;
        if (count === 0) {
          numOccupiedCells++;
        }

        positions[3 * j + 0] = x;
        positions[3 * j + 1] = y;
        positions[3 * j + 2] = z;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (['RGBA', 'rgba'].includes(pointAttribute.name)) {
      let buff = new ArrayBuffer(numPoints * 4);
      let colors = new Uint8Array(buff);

      for (let j = 0; j < numPoints; j++) {
        let mc_0 = view.getUint32(byteOffset + 4, true);
        let mc_1 = view.getUint32(byteOffset + 0, true);
        byteOffset += 8;

        let r =
          dealign24b((mc_1 & 0x00ffffff) >>> 0) |
          (dealign24b(((mc_1 >>> 24) | (mc_0 << 8)) >>> 0) << 8);

        let g =
          dealign24b((mc_1 & 0x00ffffff) >>> 1) |
          (dealign24b(((mc_1 >>> 24) | (mc_0 << 8)) >>> 1) << 8);

        let b =
          dealign24b((mc_1 & 0x00ffffff) >>> 2) |
          (dealign24b(((mc_1 >>> 24) | (mc_0 << 8)) >>> 2) << 8);

        colors[4 * j + 0] = r > 255 ? r / 256 : r;
        colors[4 * j + 1] = g > 255 ? g / 256 : g;
        colors[4 * j + 2] = b > 255 ? b / 256 : b;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else {
      let buff = new ArrayBuffer(numPoints * 4);
      let f32 = new Float32Array(buff);

      let TypedArray = typedArrayMapping[pointAttribute.type.name];
      let preciseBuffer = new TypedArray(numPoints);

      let [offset, scale] = [0, 1];

      const getterMap = {
        int8: view.getInt8,
        int16: view.getInt16,
        int32: view.getInt32,
        // 'int64':  view.getInt64,
        uint8: view.getUint8,
        uint16: view.getUint16,
        uint32: view.getUint32,
        // 'uint64': view.getUint64,
        float: view.getFloat32,
        double: view.getFloat64,
      };
      const getter = getterMap[pointAttribute.type.name].bind(view);

      // compute offset and scale to pack larger types into 32 bit floats
      if (pointAttribute.type.size > 4) {
        let [amin, amax] = pointAttribute.range;
        offset = amin;
        scale = 1 / (amax - amin);
      }

      for (let j = 0; j < numPoints; j++) {
        let value = getter(byteOffset, true);
        byteOffset += pointAttribute.byteSize;

        f32[j] = (value - offset) * scale;
        preciseBuffer[j] = value;
      }

      attributeBuffers[pointAttribute.name] = {
        buffer: buff,
        preciseBuffer: preciseBuffer,
        attribute: pointAttribute,
        offset: offset,
        scale: scale,
      };
    }
  }

  let occupancy = parseInt(numPoints / numOccupiedCells);

  {
    // add indices
    let buff = new ArrayBuffer(numPoints * 4);
    let indices = new Uint32Array(buff);

    for (let i = 0; i < numPoints; i++) {
      indices[i] = i;
    }

    attributeBuffers['INDICES'] = { buffer: buff, attribute: PointAttribute.INDICES };
  }

  {
    // handle attribute vectors
    let vectors = pointAttributes.vectors;

    for (let vector of vectors) {
      let { name, attributes } = vector;
      let numVectorElements = attributes.length;
      let buffer = new ArrayBuffer(numVectorElements * numPoints * 4);
      let f32 = new Float32Array(buffer);

      let iElement = 0;
      for (let sourceName of attributes) {
        let sourceBuffer = attributeBuffers[sourceName];
        let { offset, scale } = sourceBuffer;
        let view = new DataView(sourceBuffer.buffer);

        const getter = view.getFloat32.bind(view);

        for (let j = 0; j < numPoints; j++) {
          let value = getter(j * 4, true);

          f32[j * numVectorElements + iElement] = value / scale + offset;
        }

        iElement++;
      }

      let vecAttribute = new PointAttribute(name, PointAttributeTypes.DATA_TYPE_FLOAT, 3);

      attributeBuffers[name] = {
        buffer: buffer,
        attribute: vecAttribute,
      };
    }
  }

  let message = {
    buffer: buffer,
    attributeBuffers: attributeBuffers,
    density: occupancy,
    tightBoundingBox: { min: tightBoxMin, max: tightBoxMax },
  };

  let transferables = [];
  for (let property in message.attributeBuffers) {
    transferables.push(message.attributeBuffers[property].buffer);
  }

  postMessage(message, transferables);
};
