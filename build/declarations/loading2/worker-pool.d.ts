export declare enum WorkerType {
  DECODER_WORKER = 'DECODER_WORKER',
  DECODER_WORKER_GLTF = 'DECODER_WORKER_GLTF',
  DECODER_WORKER_SPLATS = 'DECODER_WORKER_SPLATS',
  DECODER_WORKER_SPLATS_COMPRESSED = 'DECODER_WORKER_SPLATS_COMPRESSED',
}
export declare class WorkerPool {
  private workers;
  getWorker(workerType: WorkerType): Worker;
  returnWorker(workerType: WorkerType, worker: Worker): void;
}
