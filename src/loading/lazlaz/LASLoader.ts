/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.8.2/LICENSE
 */

import { parseLASHeader } from './helpers';

export class LASLoader {
  arraybuffer: ArrayBuffer | null;
  header: any;
  readOffset: number;

  constructor(arraybuffer: ArrayBuffer) {
    this.arraybuffer = arraybuffer;
    this.readOffset = 0;
  }

  open() {
    // nothing needs to be done to open this file
    //
    this.readOffset = 0;
    return new Promise(function(res) {
      setTimeout(res, 0);
    });
  }

  getHeader() {
    return new Promise(res => {
      this.header = parseLASHeader(this.arraybuffer!);
      res(this.header);
    });
  }

  readData(count: number, _offset: number, skip: number) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (!this.header)
          return rej(new Error('Cannot start reading data till a header request is issued'));

        let start;
        if (skip <= 1) {
          count = Math.min(count, this.header.pointsCount - this.readOffset);
          start = this.header.pointsOffset + this.readOffset * this.header.pointsStructSize;
          const end = start + count * this.header.pointsStructSize;
          res({
            buffer: this.arraybuffer!.slice(start, end),
            count: count,
            hasMoreData: this.readOffset + count < this.header.pointsCount,
          });
          this.readOffset += count;
        } else {
          const pointsToRead = Math.min(count * skip, this.header.pointsCount - this.readOffset);
          const bufferSize = Math.ceil(pointsToRead / skip);
          let pointsRead = 0;

          const buf = new Uint8Array(bufferSize * this.header.pointsStructSize);
          for (let i = 0; i < pointsToRead; i++) {
            if (i % skip === 0) {
              start = this.header.pointsOffset + this.readOffset * this.header.pointsStructSize;
              const src = new Uint8Array(this.arraybuffer!, start, this.header.pointsStructSize);

              buf.set(src, pointsRead * this.header.pointsStructSize);
              pointsRead++;
            }

            this.readOffset++;
          }

          res({
            buffer: buf.buffer,
            count: pointsRead,
            hasMoreData: this.readOffset < this.header.pointsCount,
          });
        }
      }, 0);
    });
  }

  close() {
    return new Promise(res => {
      this.arraybuffer = null;
      setTimeout(res, 0);
    });
  }
}
