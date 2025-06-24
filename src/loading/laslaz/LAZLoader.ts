/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.8.2/LICENSE
 */

import { AutoTerminatingWorker, WorkerPool } from '../../utils/worker-pool';

export class LAZLoader {
  arraybuffer: ArrayBuffer;

  public static readonly WORKER_POOL = new WorkerPool(
    32,
    require('../../workers/LAZLoaderWorker.worker.js').default,
  );

  worker: AutoTerminatingWorker | null;

  nextCB: Function | null;

  constructor(arraybuffer: ArrayBuffer) {
    this.arraybuffer = arraybuffer;
    this.worker = null;

    this.nextCB = null;
  }

  init() {
    return new Promise<void>((resolve) => {
      LAZLoader.WORKER_POOL.getWorker().then((autoTerminatingWorker) => {
        this.worker = autoTerminatingWorker;
        this.worker.worker.onmessage = (e) => {
          if (this.nextCB !== null) {
            this.nextCB(e.data);
            this.nextCB = null;
          }
        };
        resolve();
      });
    });
  }

  async dorr(req: any, cb: Function) {
    this.nextCB = cb;
    if (!this.worker?.worker) {
      await this.init();
    }

    this.worker?.worker.postMessage(req);
  }

  open() {
    return new Promise((res, rej) => {
      this.dorr({ type: 'open', arraybuffer: this.arraybuffer }, function (r: any) {
        if (r.status !== 1) return rej(new Error('Failed to open file'));

        res(true);
      });
    });
  }

  getHeader() {
    return new Promise((res, rej) => {
      this.dorr({ type: 'header' }, function (r: any) {
        if (r.status !== 1) return rej(new Error('Failed to get header'));

        res(r.header);
      });
    });
  }

  readData(count: number, offset: number, skip: number) {
    return new Promise((res, rej) => {
      this.dorr({ type: 'read', count: count, offset: offset, skip: skip }, function (r: any) {
        if (r.status !== 1) return rej(new Error('Failed to read data'));
        res({
          buffer: r.buffer,
          count: r.count,
          hasMoreData: r.hasMoreData,
        });
      });
    });
  }

  close() {
    return new Promise((res, rej) => {
      this.dorr({ type: 'close' }, (r: any) => {
        if (this.worker) {
          LAZLoader.WORKER_POOL.releaseWorker(this.worker);
        }

        if (r.status !== 1) return rej(new Error('Failed to close file'));

        res(true);
      });
    });
  }
}
