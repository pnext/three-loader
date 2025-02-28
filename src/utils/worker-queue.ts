import { AsyncBlockingQueue } from './async-blocking-queue';

export class AutoTerminatingWorker {
  private timeoutId: number | undefined = undefined;
  private terminated: boolean = false;

  constructor(private wrappedWorker: Worker, private maxIdle: number) {}

  public get worker(): Worker {
    return this.wrappedWorker;
  }

  get isTerminated(): boolean {
    return this.terminated;
  }

  markIdle(): void {
    this.timeoutId = window.setTimeout(() => {
      this.terminated = true;
      this.wrappedWorker.terminate();
    }, this.maxIdle);
  }

  markInUse(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }
}

export class WorkerQueue {
  /**
   * The maximum amount of idle time that can elapse before a worker from this pool is automatically terminated
   */
  private static readonly QUEUE_MAX_IDLE = 7000;

  private queue = new AsyncBlockingQueue<AutoTerminatingWorker>();
  private queueSize = 0;

  constructor(public maxWorkers: number, private workerType: any) {}

  /**
   * Returns a worker promise which is resolved when one is available.
   */
  public getWorker(): Promise<AutoTerminatingWorker> {
    // If the number of active workers is smaller than the maximum, return a new one.
    // Otherwise, return a promise for worker from the pool.
    if (this.queueSize < this.maxWorkers) {
      this.queueSize++;
      return Promise.resolve(
        new AutoTerminatingWorker(new this.workerType(), WorkerQueue.QUEUE_MAX_IDLE),
      );
    } else {
      return this.queue.dequeue().then(worker => {
        worker.markInUse();
        // If the dequeued worker has been terminated, decrease the pool size and make a recursive call to get a new worker
        if (worker.isTerminated) {
          this.queueSize--;
          return this.getWorker();
        }
        return worker;
      });
    }
  }

  /**
   * Releases a Worker back into the pool
   * @param worker
   */
  public releaseWorker(worker: AutoTerminatingWorker): void {
    worker.markIdle();
    this.queue.enqueue(worker);
  }
}
