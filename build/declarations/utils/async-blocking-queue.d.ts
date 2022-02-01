export declare class AsyncBlockingQueue<T> {
    private promises;
    private resolvers;
    constructor();
    enqueue(t: T): void;
    dequeue(): Promise<T>;
    private add;
}
