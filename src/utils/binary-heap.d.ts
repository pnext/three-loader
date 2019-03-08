export class BinaryHeap<T> {
  constructor(scoreFunction: (node: T) => number);
  push(node: T): void;
  pop(): T | undefined;
  remove(node: T): void;
  size(): number;
  bubbleUp(n: number): void;
  sinkDown(n: number): void;
}
