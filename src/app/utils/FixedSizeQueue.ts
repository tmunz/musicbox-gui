export class FixedSizeQueue<T> {
  private queue: T[];
  private size: number;

  constructor(size: number, defaultValue: T) {
    if (size <= 0) {
      throw new Error("Queue size must be greater than 0.");
    }
    this.size = size;
    this.queue = Array(size).fill(defaultValue);
  }

  push(item: T): void {
    this.queue.push(item);
    if (this.queue.length > this.size) {
      this.queue.shift();
    }
  }
  
  get(i: number): T {
    return this.queue[i];
  }
}
