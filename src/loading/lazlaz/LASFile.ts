import { WorkerPool } from 'utils/worker-pool';
import { LASLoader } from './LASLoader';
import { LAZLoader } from './LAZLoader';
import { readAs, pointFormatReaders } from './helpers';

export class LASFile {
  arraybuffer: ArrayBuffer;
  version: number;
  versionAsString: string;
  formatId: number;
  isCompressed: boolean;

  loader: LASLoader | LAZLoader;

  constructor(arraybuffer: ArrayBuffer, workerPool: WorkerPool) {
    this.arraybuffer = arraybuffer;

    const ver = new Int8Array(this.arraybuffer, 24, 2);
    this.version = ver[0] * 10 + ver[1];
    this.versionAsString = ver[0] + '.' + ver[1];
    if (this.version > 12) throw new Error('Only file versions <= 1.2 are supported at this time');

    const formatId = readAs(this.arraybuffer, Uint8Array, 32 * 3 + 8) as number;
    const bit_7 = (formatId & 0x80) >> 7;
    const bit_6 = (formatId & 0x40) >> 6;

    if (bit_7 === 1 && bit_6 === 1) throw new Error('Old style compression not supported');

    this.formatId = formatId & 0x3f;
    this.isCompressed = bit_7 === 1 || bit_6 === 1;

    if (pointFormatReaders[this.formatId] === undefined)
      throw new Error('The point format ID is not supported');

    this.loader = this.isCompressed
      ? new LAZLoader(this.arraybuffer, workerPool)
      : new LASLoader(this.arraybuffer);
  }

  determineFormat() {
    const formatId = readAs(this.arraybuffer, Uint8Array, 32 * 3 + 8) as number;
    const bit_7 = (formatId & 0x80) >> 7;
    const bit_6 = (formatId & 0x40) >> 6;

    if (bit_7 === 1 && bit_6 === 1) throw new Error('Old style compression not supported');

    this.formatId = formatId & 0x3f;
    this.isCompressed = bit_7 === 1 || bit_6 === 1;
  }

  open() {
    return this.loader.open();
  }

  getHeader() {
    return this.loader.getHeader();
  }

  readData(count: number, start: number, skip: number) {
    return this.loader.readData(count, start, skip);
  }

  close() {
    return this.loader.close();
  }
}
