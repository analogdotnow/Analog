export class RingBuffer<T> {
  private length: number;
  private readonly capacity: number;

  private buffer: T[];
  private headPos: number;
  private revision: number;

  private cachedRevision: number;
  private cached: T[];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(this.capacity);
    this.length = 0;
    this.headPos = 0;
    this.revision = 0;
    this.cachedRevision = 0;
    this.cached = [];
  }

  // * places item at the right (head) of the queue, evicting from left (tail) if full
  enqueueRight(item: T) {
    if (this.isFull()) {
      const tailIdx = this.getTailPos();

      this.buffer[tailIdx] = undefined as T;
      this.length--;
    }

    const newHeadPos = mod(this.headPos - 1, this.capacity);

    this.buffer[newHeadPos] = item;
    this.length++;
    this.headPos = newHeadPos;
    this.revision++;
  }

  // * places items at the right (head) so items[0] is older than items[1], evicting from left (tail) if full
  enqueueRightMany(items: readonly T[]) {
    if (items.length === 0) {
      return;
    }

    for (const item of items) {
      if (this.isFull()) {
        const tailIdx = this.getTailPos();

        this.buffer[tailIdx] = undefined as T;
        this.length--;
      }

      const newHeadPos = mod(this.headPos - 1, this.capacity);

      this.buffer[newHeadPos] = item;
      this.length++;
      this.headPos = newHeadPos;
    }

    this.revision++;
  }

  // * places item at the left (tail) of the queue, evicting from right (head) if full
  enqueueLeft(item: T) {
    if (this.isFull()) {
      this.buffer[this.headPos] = undefined as T;
      this.headPos = mod(this.headPos + 1, this.capacity);
      this.length--;
    }

    const tailPos = this.getTailPos();
    const newTail = mod(tailPos + 1, this.capacity);

    this.buffer[newTail] = item;
    this.length++;
    this.revision++;
  }

  // * places items at the left (tail) so items[0] becomes the new left-most (oldest), evicting from right (head) if full
  enqueueLeftMany(items: readonly T[]) {
    if (items.length === 0) {
      return;
    }

    for (let idx = items.length - 1; idx >= 0; idx--) {
      const item = items[idx]!;

      if (this.isFull()) {
        this.buffer[this.headPos] = undefined as T;
        this.headPos = mod(this.headPos + 1, this.capacity);
        this.length--;
      }

      const tailPos = this.getTailPos();
      const newTail = mod(tailPos + 1, this.capacity);

      this.buffer[newTail] = item;
      this.length++;
    }

    this.revision++;
  }

  // * pulls item from the left (tail) of the queue
  dequeueLeft() {
    if (this.isEmpty()) {
      return undefined;
    }

    const tailIdx = this.getTailPos();
    const lastEl = this.buffer[tailIdx]!;

    this.buffer[tailIdx] = undefined as T;
    this.length--;
    this.revision++;

    return lastEl;
  }

  // * pulls item from the right (head) of the queue
  dequeueRight() {
    if (this.isEmpty()) {
      return undefined;
    }

    const item = this.buffer[this.headPos]!;

    this.buffer[this.headPos] = undefined as T;
    this.headPos = mod(this.headPos + 1, this.capacity);
    this.length--;
    this.revision++;

    return item;
  }

  // * removes all items from the buffer
  clear() {
    this.length = 0;
    this.buffer = new Array(this.capacity);
    this.revision++;
  }

  // * replaces all items with the provided list (oldest to newest)
  replace(items: readonly T[]) {
    const count = Math.min(items.length, this.capacity);
    const start = items.length - count;

    this.buffer = new Array(this.capacity);
    this.length = count;
    this.headPos = 0;

    for (let idx = 0; idx < count; idx++) {
      const sourceIdx = start + (count - 1 - idx);
      this.buffer[idx] = items[sourceIdx]!;
    }

    this.revision++;
  }

  peekLeft() {
    if (this.isEmpty()) {
      return undefined;
    }

    return this.buffer[this.getTailPos()];
  }

  peekRight() {
    if (this.isEmpty()) {
      return undefined;
    }

    return this.buffer[this.headPos];
  }

  isFull() {
    return this.length === this.capacity;
  }

  isEmpty() {
    return this.length === 0;
  }

  getLength() {
    return this.length;
  }

  getCapacity() {
    return this.capacity;
  }

  // * returns a list of all items (oldest to newest)
  getItems() {
    if (this.revision === this.cachedRevision) {
      return this.cached;
    }

    const items: T[] = [];

    const max = this.headPos + this.length - 1;

    for (let i = max; i >= this.headPos; i--) {
      const tmpIdx = i % this.capacity;

      items.push(this.buffer[tmpIdx]!);
    }

    this.cached = items;
    this.cachedRevision = this.revision;

    return items;
  }

  // * for debugging
  toString() {
    const items = [];

    const max = this.headPos + this.length - 1;

    for (let i = this.headPos; i <= max; i++) {
      const tmpIdx = i % this.capacity;
      items.push(this.buffer[tmpIdx]);
    }

    const queueVals = items.join("->");

    return `[${queueVals}]`;
  }

  private getTailPos() {
    return mod(this.headPos + this.length - 1, this.capacity);
  }
}

// helper util fn
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
