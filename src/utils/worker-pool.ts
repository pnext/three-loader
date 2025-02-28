import { AutoTerminatingWorker, WorkerQueue } from './worker-queue';

export enum WorkerType {
  // Potree 1 workers
  BINARY_DECODER_WORKER = 'BINARY_DECODER_WORKER',

  // Potree 2 workers
  DECODER_WORKER = 'DECODER_WORKER',
  DECODER_WORKER_GLTF = 'DECODER_WORKER_GLTF',
}

export const DEFAULT_MAX_WORKERS_PER_POOL = 32;

export class WorkerPool {
  public _maxWorkersPerPool = DEFAULT_MAX_WORKERS_PER_POOL;

  private static instance: WorkerPool | undefined;
  private constructor() {}

  private pool: { [key in WorkerType]: WorkerQueue } = {
    BINARY_DECODER_WORKER: new WorkerQueue(
      this._maxWorkersPerPool,
      require('../workers/binary-decoder.worker.js').default,
    ),
    DECODER_WORKER: new WorkerQueue(
      this._maxWorkersPerPool,
      require('../loading2/decoder.worker.js').default,
    ),
    DECODER_WORKER_GLTF: new WorkerQueue(
      this._maxWorkersPerPool,
      require('../loading2/gltf-decoder.worker.js').default,
    ),
  };

  static getInstance(): WorkerPool {
    if (!this.instance) {
      this.instance = new WorkerPool();
    }

    return this.instance;
  }

  set maxWorkersPerPool(count: number) {
    Object.entries(this.pool).forEach(([_, pool]) => (pool.maxWorkers = count));
  }

  public getWorker(workerType: WorkerType): Promise<AutoTerminatingWorker> {
    return this.pool[workerType].getWorker();
  }

  public releaseWorker(workerType: WorkerType, worker: AutoTerminatingWorker): void {
    return this.pool[workerType].releaseWorker(worker);
  }
}
