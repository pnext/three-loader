/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.5/LICENSE
 */

// http://jsperf.com/uint8array-vs-dataview3/3
// tslint:disable:no-bitwise
export class CustomArrayView {
  private u8: Uint8Array;
  private tmp = new ArrayBuffer(4);
  private tmpf = new Float32Array(this.tmp);
  private tmpu8 = new Uint8Array(this.tmp);

  constructor(buffer: ArrayBuffer) {
    this.u8 = new Uint8Array(buffer);
  }

  getUint32(i: number) {
    return (this.u8[i + 3] << 24) | (this.u8[i + 2] << 16) | (this.u8[i + 1] << 8) | this.u8[i];
  }

  getUint16(i: number): number {
    return (this.u8[i + 1] << 8) | this.u8[i];
  }

  getFloat32(i: number): number {
    const tmpu8 = this.tmpu8;
    const u8 = this.u8;
    const tmpf = this.tmpf;

    tmpu8[0] = u8[i + 0];
    tmpu8[1] = u8[i + 1];
    tmpu8[2] = u8[i + 2];
    tmpu8[3] = u8[i + 3];

    return tmpf[0];
  }

  getUint8(i: number): number {
    return this.u8[i];
  }
}
// tslint:enable:no-bitwise
