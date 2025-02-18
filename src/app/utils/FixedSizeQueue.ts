/**
 * A fixed-size circular queue that maintains a constant size.
 * New items are added to the front of the queue, and the oldest items are
 * removed automatically when the queue exceeds its maximum size.
 */
export class FixedSizeQueue<T> {
  protected queue: T[];
  protected size: number;

  constructor(size: number, defaultValue: T) {
    if (size <= 0) {
      throw new Error('Queue size must be greater than 0.');
    }
    this.size = size;
    this.queue = new Array(size).fill(defaultValue);
  }

  push(item: T): void {
    this.queue.unshift(item);
    if (this.queue.length > this.size) {
      this.queue.pop();
    }
  }

  get(i: number): T {
    return this.queue[i];
  }

  getFullSize(): number {
    return this.size;
  }

  getFillSize(): number {
    return this.queue.length;
  }

  setSize(size: number): void {
    if (size <= 0) {
      throw new Error('Queue size must be greater than 0.');
    }
    this.size = size;
    if (this.queue.length > size) {
      this.queue.length = size;
    }
  }
}
