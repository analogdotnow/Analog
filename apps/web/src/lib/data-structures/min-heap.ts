/**
 * Minimal binary min-heap for priority queue operations.
 * O(log n) push/pop, O(1) peek.
 */
export class MinHeap<T> {
  private items: T[] = [];

  constructor(private compare: (a: T, b: T) => number) {}

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(item: T) {
    this.items.push(item);
    this.siftUp(this.items.length - 1);
  }

  pop() {
    if (this.items.length === 0) {
      return undefined;
    }

    const top = this.items[0];
    const last = this.items.pop()!;

    if (this.items.length > 0) {
      this.items[0] = last;
      this.siftDown(0);
    }

    return top;
  }

  private siftUp(index: number) {
    while (index > 0) {
      const parent = (index - 1) >> 1;

      if (this.compare(this.items[index]!, this.items[parent]!) >= 0) {
        break;
      }

      [this.items[index], this.items[parent]] = [
        this.items[parent]!,
        this.items[index]!,
      ];
      index = parent;
    }
  }

  private siftDown(index: number) {
    const length = this.items.length;

    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (
        left < length &&
        this.compare(this.items[left]!, this.items[smallest]!) < 0
      ) {
        smallest = left;
      }

      if (
        right < length &&
        this.compare(this.items[right]!, this.items[smallest]!) < 0
      ) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      [this.items[index], this.items[smallest]] = [
        this.items[smallest]!,
        this.items[index]!,
      ];

      index = smallest;
    }
  }
}
