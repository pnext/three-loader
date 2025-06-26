export class AsyncBlockingQueue<T> {
  private promises: Promise<T>[];
  private resolvers: ((t: T) => void)[];

  constructor() {
    this.resolvers = [];
    this.promises = [];
  }

  public enqueue(t: T): void {
    if (!this.resolvers.length) {
      this.add();
    }
    const resolve = this.resolvers.shift()!;
    resolve(t);
  }

  public dequeue(): Promise<T> {
    if (!this.promises.length) {
      this.add();
    }
    return this.promises.shift()!;
  }

  private add(): void {
    this.promises.push(
      new Promise((resolve) => {
        this.resolvers.push(resolve);
      }),
    );
  }
}
