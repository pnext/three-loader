/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.8.2/LICENSE
 */

export function readUsingDataView(event: any) {
  // if (!PRODUCTION) {
  //   performance.mark('laslaz-start');
  // }

  const buffer = event.data.buffer;
  const numPoints = event.data.numPoints;
  const sourcePointSize = event.data.pointSize;
  const pointFormatID = event.data.pointFormatID;
  const scale = event.data.scale;
  const offset = event.data.offset;

  const sourceView = new DataView(buffer);

  const tightBoundingBox = {
    min: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    max: [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  };

  const mean = [0, 0, 0];

  const pBuff = new ArrayBuffer(numPoints * 3 * 4);
  const cBuff = new ArrayBuffer(numPoints * 4);
  const iBuff = new ArrayBuffer(numPoints * 4);
  const clBuff = new ArrayBuffer(numPoints);
  const rnBuff = new ArrayBuffer(numPoints);
  const nrBuff = new ArrayBuffer(numPoints);
  const psBuff = new ArrayBuffer(numPoints * 2);

  const positions = new Float32Array(pBuff);
  const colors = new Uint8Array(cBuff);
  const intensities = new Float32Array(iBuff);
  const classifications = new Uint8Array(clBuff);
  const returnNumbers = new Uint8Array(rnBuff);
  const numberOfReturns = new Uint8Array(nrBuff);
  const pointSourceIDs = new Uint16Array(psBuff);

  for (let i = 0; i < numPoints; i++) {
    // POSITION
    const ux = sourceView.getInt32(i * sourcePointSize + 0, true);
    const uy = sourceView.getInt32(i * sourcePointSize + 4, true);
    const uz = sourceView.getInt32(i * sourcePointSize + 8, true);

    const x = ux * scale[0] + offset[0] - event.data.mins[0];
    const y = uy * scale[1] + offset[1] - event.data.mins[1];
    const z = uz * scale[2] + offset[2] - event.data.mins[2];

    //x = ux * scale[0];
    //y = uy * scale[1];
    //z = uz * scale[2];

    positions[3 * i + 0] = x;
    positions[3 * i + 1] = y;
    positions[3 * i + 2] = z;

    mean[0] += x / numPoints;
    mean[1] += y / numPoints;
    mean[2] += z / numPoints;

    tightBoundingBox.min[0] = Math.min(tightBoundingBox.min[0], x);
    tightBoundingBox.min[1] = Math.min(tightBoundingBox.min[1], y);
    tightBoundingBox.min[2] = Math.min(tightBoundingBox.min[2], z);

    tightBoundingBox.max[0] = Math.max(tightBoundingBox.max[0], x);
    tightBoundingBox.max[1] = Math.max(tightBoundingBox.max[1], y);
    tightBoundingBox.max[2] = Math.max(tightBoundingBox.max[2], z);

    // INTENSITY
    const intensity = sourceView.getUint16(i * sourcePointSize + 12, true);
    intensities[i] = intensity;

    // RETURN NUMBER, stored in the first 3 bits - 00000111
    // number of returns stored in next 3 bits   - 00111000
    const returnNumberAndNumberOfReturns = sourceView.getUint8(i * sourcePointSize + 14);
    const returnNumber = returnNumberAndNumberOfReturns & 0b0111;
    const numberOfReturn = (returnNumberAndNumberOfReturns & 0b00111000) >> 3;
    returnNumbers[i] = returnNumber;
    numberOfReturns[i] = numberOfReturn;

    // CLASSIFICATION
    const classification = sourceView.getUint8(i * sourcePointSize + 15);
    classifications[i] = classification;

    // POINT SOURCE ID
    const pointSourceID = sourceView.getUint16(i * sourcePointSize + 18, true);
    pointSourceIDs[i] = pointSourceID;

    // COLOR, if available
    if (pointFormatID === 2) {
      const r = sourceView.getUint16(i * sourcePointSize + 20, true) / 256;
      const g = sourceView.getUint16(i * sourcePointSize + 22, true) / 256;
      const b = sourceView.getUint16(i * sourcePointSize + 24, true) / 256;

      colors[4 * i + 0] = r;
      colors[4 * i + 1] = g;
      colors[4 * i + 2] = b;
      colors[4 * i + 3] = 255;
    }
  }

  const indices = new ArrayBuffer(numPoints * 4);
  const iIndices = new Uint32Array(indices);
  for (let i = 0; i < numPoints; i++) {
    iIndices[i] = i;
  }

  const message = {
    mean: mean,
    position: pBuff,
    color: cBuff,
    intensity: iBuff,
    classification: clBuff,
    returnNumber: rnBuff,
    numberOfReturns: nrBuff,
    pointSourceID: psBuff,
    tightBoundingBox: tightBoundingBox,
    indices: indices,
  };

  const transferables = [
    message.position,
    message.color,
    message.intensity,
    message.classification,
    message.returnNumber,
    message.numberOfReturns,
    message.pointSourceID,
    message.indices,
  ];

  postMessage(message, transferables as any);
}
