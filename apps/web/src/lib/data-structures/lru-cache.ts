export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly entries = new Map<K, V>();

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError(
        `LRUCache capacity must be a positive integer, got ${capacity}`,
      );
    }

    this.capacity = capacity;
  }

  get(key: K) {
    if (!this.entries.has(key)) {
      return undefined;
    }

    const value = this.entries.get(key)!;

    // re-insert to mark as most recently used
    this.entries.delete(key);
    this.entries.set(key, value);

    return value;
  }

  set(key: K, value: V) {
    if (this.entries.has(key)) {
      this.entries.delete(key);
    } else if (this.entries.size >= this.capacity) {
      // Map iterates in insertion order, so the first key is the least recently used
      this.entries.delete(this.entries.keys().next().value!);
    }

    this.entries.set(key, value);
  }

  has(key: K) {
    return this.entries.has(key);
  }

  delete(key: K) {
    return this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
  }

  getSize() {
    return this.entries.size;
  }

  getCapacity() {
    return this.capacity;
  }
}
