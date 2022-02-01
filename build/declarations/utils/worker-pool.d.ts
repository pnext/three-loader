export declare class AutoTerminatingWorker {
    private wrappedWorker;
    private maxIdle;
    private timeoutId;
    private terminated;
    constructor(wrappedWorker: Worker, maxIdle: number);
    get worker(): Worker;
    get isTerminated(): boolean;
    markIdle(): void;
    markInUse(): void;
}
export declare class WorkerPool {
    maxWorkers: number;
    private workerType;
    /**
     * The maximum amount of idle time that can elapse before a worker from this pool is automatically terminated
     */
    private static readonly POOL_MAX_IDLE;
    private pool;
    private poolSize;
    constructor(maxWorkers: number, workerType: any);
    /**
     * Returns a worker promise which is resolved when one is available.
     */
    getWorker(): Promise<AutoTerminatingWorker>;
    /**
     * Releases a Worker back into the pool
     * @param worker
     */
    releaseWorker(worker: AutoTerminatingWorker): void;
}
