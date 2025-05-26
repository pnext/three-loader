/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.8.2/LICENSE
 */

import Module from './laz-perf.js';

type RelativeIndexableConstrutor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

let instance: any = null;

function readAs(buf: ArrayBuffer, Type: RelativeIndexableConstrutor, offset: any, count?: any) {
  count = count === undefined || count === 0 ? 1 : count;
  const sub = buf.slice(offset, offset + Type.BYTES_PER_ELEMENT * count);

  const r = new Type(sub);
  if (count === undefined || count === 1) {
    return r[0];
  }

  const ret = [];
  for (let i = 0; i < count; i++) {
    ret.push(r[i]);
  }

  return ret;
}

function parseLASHeader(arraybuffer: any) {
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

function handleEvent(msg: any) {
  switch (msg.type) {
    case 'open':
      try {
        console.log(Module);
        instance = new Module.LASZip();
        const abInt = new Uint8Array(msg.arraybuffer);
        const buf = Module._malloc(msg.arraybuffer.byteLength);

        instance.arraybuffer = msg.arraybuffer;
        instance.buf = buf;
        Module.HEAPU8.set(abInt, buf);
        instance.open(buf, msg.arraybuffer.byteLength);

        instance.readOffset = 0;

        postMessage({ type: 'open', status: 1 });
      } catch (e) {
        postMessage({ type: 'open', status: 0, details: e });
      }
      break;

    case 'header':
      if (!instance) {
        throw new Error('You need to open the file before trying to read header');
      }

      const header = parseLASHeader(instance.arraybuffer);
      header.pointsFormatId &= 0x3f;
      instance.header = header;

      postMessage({ type: 'header', status: 1, header: header });
      break;

    case 'read':
      if (!instance) {
        throw new Error('You need to open the file before trying to read stuff');
      }

      // msg.start
      const count = msg.count;
      const skip = msg.skip;
      const o = instance;

      if (!o.header) {
        throw new Error(
          'You need to query header before reading, I maintain state that way, sorry :(',
        );
      }

      const pointsToRead = Math.min(count * skip, o.header.pointsCount - o.readOffset);
      const bufferSize = Math.ceil(pointsToRead / skip);
      let pointsRead = 0;

      const thisBuf = new Uint8Array(bufferSize * o.header.pointsStructSize);
      const bufRead = Module._malloc(o.header.pointsStructSize);
      for (let i = 0; i < pointsToRead; i++) {
        o.getPoint(bufRead);

        if (i % skip === 0) {
          const a = new Uint8Array(Module.HEAPU8.buffer, bufRead, o.header.pointsStructSize);
          thisBuf.set(a, pointsRead * o.header.pointsStructSize);
          pointsRead++;
        }

        o.readOffset++;
      }

      postMessage({
        type: 'header',
        status: 1,
        buffer: thisBuf.buffer,
        count: pointsRead,
        hasMoreData: o.readOffset < o.header.pointsCount,
      });

      break;

    case 'close':
      if (instance !== null) {
        instance.delete();
        instance = null;
      }
      postMessage({ type: 'close', status: 1 });
      break;
  }
}

export function handleMessage(event: any) {
  try {
    handleEvent(event.data);
  } catch (e) {
    postMessage({ type: event.data.type, status: 0, details: e });
  }
}
