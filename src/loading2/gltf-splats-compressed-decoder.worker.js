import { PointAttribute, PointAttributeTypes } from './point-attributes.ts';

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

onmessage = function (event) {
  const {
    buffer,
    pointAttributes,
    scale,
    name,
    min,
    max,
    size,
    offset,
    numPoints,
    harmonicsEnabled,
  } = event.data;

  const view = new DataView(buffer);

  const attributeBuffers = {};

  //Three float values.
  const bytesPerPointPosition = 4 * 3;

  //Three uint8 values (3 bytes);
  const bytesPerPointColor = 3;

  //8 bits (1 byte) for the opacity
  const bytesPerPointOpacity = 1;

  //Two float values X, Y
  const bytesPerPointScale = 4 * 2;

  //Four uint8 values (32 bits for a compressed quaternion)
  const bytesPerPointRotation = 4;

  //Three bytes (3 uint8 values for the triplets)
  const bytesPerPointHarmonics = 3;

  const gridSize = 32;
  const grid = new Uint32Array(gridSize ** 3);
  const toIndex = (x, y, z) => {
    // min is already subtracted
    const dx = (gridSize * x) / size.x;
    const dy = (gridSize * y) / size.y;
    const dz = (gridSize * z) / size.z;

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

  const tightBoxMin = [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
  ];
  const tightBoxMax = [
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ];

  const buff = new ArrayBuffer(numPoints * 4 * 4);
  const positions = new Float32Array(buff);

  const rawPositionsBuffer = new ArrayBuffer(numPoints * 4 * 4);
  const rawPositions = new Float32Array(rawPositionsBuffer);

  const bufferScales = new ArrayBuffer(numPoints * 4 * 3);
  const scales = new Float32Array(bufferScales);

  const bufferRotations = new ArrayBuffer(numPoints * 4 * 4);
  const rotations = new Float32Array(bufferRotations);

  const bufferColors = new ArrayBuffer(numPoints * 4 * 4);
  const colors = new Float32Array(bufferColors);

  const harmonicsBuffer = new ArrayBuffer(numPoints * 45 * 4);
  let harmonics = new Float32Array(harmonicsBuffer);

  const uintEncodedFloat = (function () {
    const floatView = new Float32Array(1);
    const int32View = new Int32Array(floatView.buffer);

    return function (f) {
      floatView[0] = f;
      return int32View[0];
    };
  })();

  const harmonicsBandsName = [
    'sh_band_1_triplet_0',
    'sh_band_1_triplet_1',
    'sh_band_1_triplet_2',

    'sh_band_2_triplet_0',
    'sh_band_2_triplet_1',
    'sh_band_2_triplet_2',
    'sh_band_2_triplet_3',
    'sh_band_2_triplet_4',

    'sh_band_3_triplet_0',
    'sh_band_3_triplet_1',
    'sh_band_3_triplet_2',
    'sh_band_3_triplet_3',
    'sh_band_3_triplet_4',
    'sh_band_3_triplet_5',
    'sh_band_3_triplet_6',
  ];

  // positions, colors, opacities, scales, rotations
  for (const pointAttribute of pointAttributes.attributes) {
    if (['POSITION_CARTESIAN', 'position'].includes(pointAttribute.name)) {
      for (let j = 0; j < numPoints; j++) {
        const pointOffset = j * bytesPerPointPosition;

        const _x = view.getFloat32(pointOffset + 0, true);
        const _y = view.getFloat32(pointOffset + 4, true);
        const _z = view.getFloat32(pointOffset + 8, true);

        const x = _x + offset[0] - min.x;
        const y = _y + offset[1] - min.y;
        const z = _z + offset[2] - min.z;

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

        positions[4 * j + 0] = x;
        positions[4 * j + 1] = y;
        positions[4 * j + 2] = z;

        rawPositions[4 * j + 0] = _x;
        rawPositions[4 * j + 1] = _y;
        rawPositions[4 * j + 2] = _z;
      }

      attributeBuffers['raw_position'] = { buffer: rawPositionsBuffer, attribute: 'raw_position' };
      attributeBuffers['position'] = { buffer: buff, attribute: 'position' };
    } else if (['sh_band_0'].includes(pointAttribute.name)) {
      const SH_C0 = 0.28209479177387814;

      for (let j = 0; j < numPoints; j++) {
        const c0 = 4 * j + 0;
        const c1 = 4 * j + 1;
        const c2 = 4 * j + 2;
        const c3 = 4 * j + 3;

        const colorOffset = j * bytesPerPointColor + numPoints * bytesPerPointPosition;
        const opacityOffset =
          j * bytesPerPointOpacity + numPoints * (bytesPerPointPosition + bytesPerPointColor);

        // rgb: https://github.com/Pix4D/pix4d-gsplat/blob/master/docs/GS_OPF_glTF_requirements.md
        const r = (view.getUint8(colorOffset + 0, true) / 255 - 0.5) / 0.15;
        const g = (view.getUint8(colorOffset + 1, true) / 255 - 0.5) / 0.15;
        const b = (view.getUint8(colorOffset + 2, true) / 255 - 0.5) / 0.15;

        colors[c0] = (0.5 + SH_C0 * r) * 255;
        colors[c1] = (0.5 + SH_C0 * g) * 255;
        colors[c2] = (0.5 + SH_C0 * b) * 255;

        colors[c0] = clamp(Math.floor(colors[c0]), 0, 255);
        colors[c1] = clamp(Math.floor(colors[c1]), 0, 255);
        colors[c2] = clamp(Math.floor(colors[c2]), 0, 255);

        // opacity
        let a = view.getUint8(opacityOffset, true) / 255;
        a = (1 / (1 + Math.exp(-a))) * 255;
        a = clamp(Math.floor(a), 0, 255);
        colors[c3] = a;
      }
    } else if (['scale'].includes(pointAttribute.name)) {
      let maxScale = 0;
      let index = 0;

      for (let j = 0; j < numPoints; j++) {
        const scaleOffset =
          j * bytesPerPointScale +
          numPoints * (bytesPerPointPosition + bytesPerPointColor + bytesPerPointOpacity);

        const sx = view.getFloat32(scaleOffset + 0, true);
        const sy = view.getFloat32(scaleOffset + 4, true);

        scales[3 * j + 0] = Math.exp(sx);
        scales[3 * j + 1] = Math.exp(sy);
        scales[3 * j + 2] = 0;

        let s = Math.max(Math.exp(sx), Math.exp(sy));
        if (s > maxScale) {
          maxScale = s;
          index = j;
        }
      }

      attributeBuffers['scale'] = { buffer: bufferScales, attribute: 'scale' };
    } else if (['rotation'].includes(pointAttribute.name)) {
      const tempRotation = { x: 0, y: 0, z: 0, w: 0 };

      for (let j = 0; j < numPoints; j++) {
        const rotationOffset =
          j * bytesPerPointRotation +
          numPoints *
            (bytesPerPointPosition +
              bytesPerPointColor +
              bytesPerPointOpacity +
              bytesPerPointScale);

        //Decoding based on: https://github.com/Pix4D/pix4d-gsplat/blob/master/docs/GS_OPF_glTF_requirements.md
        const encoded = view.getUint32(rotationOffset, true);

        const decodeComponent = (pos) => {
          const value = (encoded >> pos) & 511;
          const sign = (encoded >> (pos + 9)) & 1;
          //if(j < 100) console.log(encoded, ((encoded >> pos) & 511), value, sign);
          return ((1 - 2 * sign) * value) / (511 * Math.SQRT2);
        };

        //Read the first two bits to get the largest component
        const largestComponent = (encoded >> 30) & 3;
        const c1 = decodeComponent(20);
        const c2 = decodeComponent(10);
        const c3 = decodeComponent(0);
        const c4 = Math.sqrt(1 - c1 * c1 - c2 * c2 - c3 * c3);

        let rx = 0;
        let ry = 0;
        let rz = 0;
        let rw = 1;

        switch (largestComponent) {
          case 0:
            rx = c4;
            ry = c1;
            rz = c2;
            rw = c3;
            break;
          case 1:
            rx = c1;
            ry = c4;
            rz = c2;
            rw = c3;
            break;
          case 2:
            rx = c1;
            ry = c2;
            rz = c4;
            rw = c3;
            break;
          case 3:
            rx = c1;
            ry = c2;
            rz = c3;
            rw = c4;
            break;
        }

        rotations[4 * j + 0] = rx;
        rotations[4 * j + 1] = ry;
        rotations[4 * j + 2] = rz;
        rotations[4 * j + 3] = rw;
      }

      attributeBuffers['orientation'] = { buffer: bufferRotations, attribute: 'orientation' };
    }

    //For the spherical harmonics
    else if (pointAttribute.name.indexOf('triplet') > -1 && harmonicsEnabled) {
      for (let j = 0; j < numPoints; j++) {
        let harmonicIndex = harmonicsBandsName.indexOf(pointAttribute.name);

        const harmonicsOffset =
          j * bytesPerPointHarmonics +
          numPoints *
            (bytesPerPointPosition +
              bytesPerPointColor +
              bytesPerPointOpacity +
              bytesPerPointScale +
              bytesPerPointRotation +
              harmonicIndex * bytesPerPointHarmonics);

        const r = (view.getUint8(harmonicsOffset + 0, true) - 128) / 128;
        const g = (view.getUint8(harmonicsOffset + 1, true) - 128) / 128;
        const b = (view.getUint8(harmonicsOffset + 2, true) - 128) / 128;

        harmonics[45 * j + harmonicIndex * 3 + 0] = r;
        harmonics[45 * j + harmonicIndex * 3 + 1] = g;
        harmonics[45 * j + harmonicIndex * 3 + 2] = b;
      }
    }
  }

  //calculate the convariance from scales and rotations.
  {
    function multiplyMatricex(ae, be) {
      const te = new Array(9);

      const a11 = ae[0],
        a12 = ae[3],
        a13 = ae[6];
      const a21 = ae[1],
        a22 = ae[4],
        a23 = ae[7];
      const a31 = ae[2],
        a32 = ae[5],
        a33 = ae[8];

      const b11 = be[0],
        b12 = be[3],
        b13 = be[6];
      const b21 = be[1],
        b22 = be[4],
        b23 = be[7];
      const b31 = be[2],
        b32 = be[5],
        b33 = be[8];

      te[0] = a11 * b11 + a12 * b21 + a13 * b31;
      te[3] = a11 * b12 + a12 * b22 + a13 * b32;
      te[6] = a11 * b13 + a12 * b23 + a13 * b33;

      te[1] = a21 * b11 + a22 * b21 + a23 * b31;
      te[4] = a21 * b12 + a22 * b22 + a23 * b32;
      te[7] = a21 * b13 + a22 * b23 + a23 * b33;

      te[2] = a31 * b11 + a32 * b21 + a33 * b31;
      te[5] = a31 * b12 + a32 * b22 + a33 * b32;
      te[8] = a31 * b13 + a32 * b23 + a33 * b33;

      return te;
    }

    function generateCovarianceMatrix(quaternion, scale) {
      const covarianceMatrix = new Array(16);

      const x = quaternion.x,
        y = quaternion.y,
        z = quaternion.z,
        w = quaternion.w;

      const x2 = x + x,
        y2 = y + y,
        z2 = z + z;
      const xx = x * x2,
        xy = x * y2,
        xz = x * z2;
      const yy = y * y2,
        yz = y * z2,
        zz = z * z2;
      const wx = w * x2,
        wy = w * y2,
        wz = w * z2;

      const sx = scale.x,
        sy = scale.y,
        sz = scale.z;

      covarianceMatrix[0] = (1 - (yy + zz)) * sx;
      covarianceMatrix[1] = (xy + wz) * sx;
      covarianceMatrix[2] = (xz - wy) * sx;

      covarianceMatrix[3] = (xy - wz) * sy;
      covarianceMatrix[4] = (1 - (xx + zz)) * sy;
      covarianceMatrix[5] = (yz + wx) * sy;

      covarianceMatrix[6] = (xz + wy) * sz;
      covarianceMatrix[7] = (yz - wx) * sz;
      covarianceMatrix[8] = (1 - (xx + yy)) * sz;

      const transposeCovariance = covarianceMatrix.map((el) => el);

      let tmp;
      const m = transposeCovariance;

      tmp = m[1];
      m[1] = m[3];
      m[3] = tmp;
      tmp = m[2];
      m[2] = m[6];
      m[6] = tmp;
      tmp = m[5];
      m[5] = m[7];
      m[7] = tmp;

      return multiplyMatricex(covarianceMatrix, transposeCovariance);
    }

    function computeCovariance(scale, rotation, outOffset) {
      let transformedCovariance = generateCovarianceMatrix(rotation, scale);

      covariances0[4 * outOffset + 0] = transformedCovariance[0];
      covariances0[4 * outOffset + 1] = transformedCovariance[3];
      covariances0[4 * outOffset + 2] = transformedCovariance[6];
      covariances0[4 * outOffset + 3] = transformedCovariance[4];

      covariances1[2 * outOffset + 0] = transformedCovariance[7];
      covariances1[2 * outOffset + 1] = transformedCovariance[8];
    }

    const covariances0Buffer = new ArrayBuffer(numPoints * 4 * 4);
    const covariances0 = new Float32Array(covariances0Buffer);
    const covariances1Buffer = new ArrayBuffer(numPoints * 4 * 2);
    const covariances1 = new Float32Array(covariances1Buffer);

    for (let j = 0; j < numPoints; j++) {
      const quat = { x: 0, y: 0, z: 0, w: 0 };
      const scale = { x: 0, y: 0, z: 0 };

      quat.w = rotations[4 * j + 0];
      quat.x = rotations[4 * j + 1];
      quat.y = rotations[4 * j + 2];
      quat.z = rotations[4 * j + 3];

      scale.x = scales[3 * j + 0];
      scale.y = scales[3 * j + 1];
      scale.z = scales[3 * j + 2];

      computeCovariance(scale, quat, j);
    }

    attributeBuffers['COVARIANCE0'] = {
      buffer: covariances0Buffer,
      attribute: PointAttribute.COVARIANCE0,
    };
    attributeBuffers['COVARIANCE1'] = {
      buffer: covariances1Buffer,
      attribute: PointAttribute.COVARIANCE1,
    };
  }

  //Compress the position and the color in a single attribute
  {
    const rgbaArrayToInteger = function (arr) {
      return arr[0] + (arr[1] << 8) + (arr[2] << 16) + (arr[3] << 24);
    };

    const posColorBuffer = new ArrayBuffer(numPoints * 4 * 4);
    const posColor = new Int32Array(posColorBuffer);

    for (let j = 0; j < numPoints; j++) {
      const color = { x: 0, y: 0, z: 0, w: 0 };
      const pos = { x: 0, y: 0, z: 0 };

      color.x = colors[4 * j + 0];
      color.y = colors[4 * j + 1];
      color.z = colors[4 * j + 2];
      color.w = colors[4 * j + 3];

      pos.x = rawPositions[4 * j + 0];
      pos.y = rawPositions[4 * j + 1];
      pos.z = rawPositions[4 * j + 2];

      let encodedColor = rgbaArrayToInteger([color.x, color.y, color.z, color.w]);
      pos.x = uintEncodedFloat(pos.x);
      pos.y = uintEncodedFloat(pos.y);
      pos.z = uintEncodedFloat(pos.z);

      posColor[4 * j + 0] = encodedColor;
      posColor[4 * j + 1] = pos.x;
      posColor[4 * j + 2] = pos.y;
      posColor[4 * j + 3] = pos.z;
    }

    attributeBuffers['POS_COLOR'] = { buffer: posColorBuffer, attribute: PointAttribute.POS_COLOR };
  }

  //Setup the harmonics normalised and compressed
  {
    const compressedHarmonicsBuffer1 = new ArrayBuffer(numPoints * 4 * 3);
    const compressedHarmonics1 = new Uint32Array(compressedHarmonicsBuffer1);

    const compressedHarmonicsBuffer2 = new ArrayBuffer(numPoints * 4 * 5);
    const compressedHarmonics2 = new Uint32Array(compressedHarmonicsBuffer2);

    const compressedHarmonicsBuffer3 = new ArrayBuffer(numPoints * 4 * 7);
    const compressedHarmonics3 = new Uint32Array(compressedHarmonicsBuffer3);

    harmonics = harmonics.map((value, index) => {
      value = Math.min(Math.max(value, -1), 1);
      value = 0.5 * value + 0.5;
      let scaler = index % 3 == 1 ? 1023 : 2047;
      value = Math.min(Math.max(Math.floor(value * scaler), 0), scaler);

      return value;
    });

    for (let j = 0; j < numPoints; j++) {
      for (let i = 0; i < 15; i++) {
        let r = harmonics[45 * j + 3 * i + 0];
        let g = harmonics[45 * j + 3 * i + 1];
        let b = harmonics[45 * j + 3 * i + 2];

        if (i < 3) {
          compressedHarmonics1[3 * j + i - 0] = (r << 21) | (g << 11) | b;
        }

        if (i >= 3 && i < 8) {
          compressedHarmonics2[5 * j + i - 3] = (r << 21) | (g << 11) | b;
        }

        if (i >= 8) {
          compressedHarmonics3[7 * j + i - 8] = (r << 21) | (g << 11) | b;
        }
      }
    }

    attributeBuffers['HARMONICS1'] = {
      buffer: compressedHarmonicsBuffer1,
      attribute: 'HARMONICS1',
    };
    attributeBuffers['HARMONICS2'] = {
      buffer: compressedHarmonicsBuffer2,
      attribute: 'HARMONICS2',
    };
    attributeBuffers['HARMONICS3'] = {
      buffer: compressedHarmonicsBuffer3,
      attribute: 'HARMONICS3',
    };
  }

  const occupancy = parseInt(numPoints / numOccupiedCells);

  {
    // add indices
    const buff = new ArrayBuffer(numPoints * 4);
    const indices = new Uint32Array(buff);

    for (let i = 0; i < numPoints; i++) {
      indices[i] = i;
    }
    attributeBuffers['INDICES'] = { buffer: buff, attribute: PointAttribute.INDICES };
  }

  {
    // handle attribute vectors
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

          f32[j * numVectorElements + iElement] = value / scale + offset;
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
