import { RingBuffer } from "./ring-buffer";

type Unsubscribe = () => void;

export type RingBufferSnapshot<T> = {
  version: number;
  items: readonly T[];
  length: number;
  capacity: number;
  left: T | undefined; // oldest
  right: T | undefined; // newest
  isEmpty: boolean;
  isFull: boolean;
};

export interface RingBufferStore<T> {
  subscribe: (listener: () => void) => Unsubscribe;
  getSnapshot: () => RingBufferSnapshot<T>;
  getServerSnapshot: () => RingBufferSnapshot<T>;

  enqueueRight: (item: T) => void;
  enqueueLeft: (item: T) => void;
  enqueueRightMany: (items: readonly T[]) => void;
  enqueueLeftMany: (items: readonly T[]) => void;
  replace: (items: readonly T[]) => void;
  dequeueLeft: () => T | undefined;
  dequeueRight: () => T | undefined;
  clear: () => void;
}

export function createRingBufferStore<T>(capacity: number): RingBufferStore<T> {
  const buffer = new RingBuffer<T>(capacity);
  const listeners = new Set<() => void>();

  let version = 0;
  let cachedVersion = -1;
  let cachedSnapshot: RingBufferSnapshot<T> = {
    version: 0,
    items: [],
    length: 0,
    capacity,
    left: undefined,
    right: undefined,
    isEmpty: true,
    isFull: false,
  };

  const emit = () => {
    for (const l of listeners) l();
  };

  const computeSnapshot = (): RingBufferSnapshot<T> => {
    const items = buffer.getItems(); // your class caches the array by revision 👍
    const length = buffer.getLength();
    const isEmpty = length === 0;

    return {
      version,
      items,
      length,
      capacity: buffer.getCapacity(),
      left: isEmpty ? undefined : (items[0] as T),
      right: isEmpty ? undefined : (items[length - 1] as T),
      isEmpty,
      isFull: buffer.isFull(),
    };
  };

  const getSnapshot = () => {
    if (cachedVersion === version) {
      return cachedSnapshot;
    }

    cachedSnapshot = computeSnapshot();
    cachedVersion = version;
    return cachedSnapshot;
  };

  const bump = () => {
    version++;
    emit();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot,
    getServerSnapshot: () => cachedSnapshot, // fine for SSR; or return an empty snapshot

    enqueueRight(item) {
      buffer.enqueueRight(item);
      bump();
    },
    enqueueLeft(item) {
      buffer.enqueueLeft(item);
      bump();
    },
    enqueueRightMany(items) {
      if (items.length === 0) return;
      buffer.enqueueRightMany(items);
      bump();
    },
    enqueueLeftMany(items) {
      if (items.length === 0) return;
      buffer.enqueueLeftMany(items);
      bump();
    },
    replace(items) {
      buffer.replace(items);
      bump();
    },
    dequeueLeft() {
      const v = buffer.dequeueLeft();
      if (v !== undefined) bump();
      return v;
    },
    dequeueRight() {
      const v = buffer.dequeueRight();
      if (v !== undefined) bump();
      return v;
    },
    clear() {
      if (!buffer.isEmpty()) {
        buffer.clear();
        bump();
      }
    },
  };
}
