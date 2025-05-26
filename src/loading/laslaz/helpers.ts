type RelativeIndexableConstrutor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export const pointFormatReaders: Record<number, Function> = {
  0: function(dv: any) {
    return {
      position: [dv.getInt32(0, true), dv.getInt32(4, true), dv.getInt32(8, true)],
      intensity: dv.getUint16(12, true),
      classification: dv.getUint8(16, true),
    };
  },
  1: function(dv: any) {
    return {
      position: [dv.getInt32(0, true), dv.getInt32(4, true), dv.getInt32(8, true)],
      intensity: dv.getUint16(12, true),
      classification: dv.getUint8(16, true),
    };
  },
  2: function(dv: any) {
    return {
      position: [dv.getInt32(0, true), dv.getInt32(4, true), dv.getInt32(8, true)],
      intensity: dv.getUint16(12, true),
      classification: dv.getUint8(16, true),
      color: [dv.getUint16(20, true), dv.getUint16(22, true), dv.getUint16(24, true)],
    };
  },
  3: function(dv: any) {
    return {
      position: [dv.getInt32(0, true), dv.getInt32(4, true), dv.getInt32(8, true)],
      intensity: dv.getUint16(12, true),
      classification: dv.getUint8(16, true),
      color: [dv.getUint16(28, true), dv.getUint16(30, true), dv.getUint16(32, true)],
    };
  },
};

export function parseLASHeader(arraybuffer: ArrayBuffer) {
  const o: any = {};

  o.pointsOffset = readAs(arraybuffer, Uint32Array, 32 * 3);
  o.pointsFormatId = readAs(arraybuffer, Uint8Array, 32 * 3 + 8);
  o.pointsStructSize = readAs(arraybuffer, Uint16Array, 32 * 3 + 8 + 1);
  o.pointsCount = readAs(arraybuffer, Uint32Array, 32 * 3 + 11);

  let start = 32 * 3 + 35;
  o.scale = readAs(arraybuffer, Float64Array, start, 3);
  start += 24; // 8*3
  o.offset = readAs(arraybuffer, Float64Array, start, 3);
  start += 24;

  const bounds = readAs(arraybuffer, Float64Array, start, 6) as number[];
  start += 48; // 8*6;
  o.maxs = [bounds[0], bounds[2], bounds[4]];
  o.mins = [bounds[1], bounds[3], bounds[5]];

  return o;
}

export function readAs(
  buf: ArrayBuffer,
  Type: RelativeIndexableConstrutor,
  offset: number,
  count?: number,
) {
  count = count === undefined || count === 0 ? 1 : count;
  const sub = buf.slice(offset, offset + Type.BYTES_PER_ELEMENT * count);

  const r = new Type(sub);
  if (count === undefined || count === 1) return r[0];

  const ret = [];
  for (let i = 0; i < count; i++) {
    ret.push(r[i]);
  }

  return ret;
}
