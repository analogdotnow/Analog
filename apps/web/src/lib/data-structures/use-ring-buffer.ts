import * as React from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";

import {
  RingBufferSnapshot,
  RingBufferStore,
  createRingBufferStore,
} from "./ring-buffer-store";

interface RingBufferStoreOptions<T> {
  seed?: readonly T[];
  deps?: React.DependencyList;
}

export function useRingBufferStore<T>(
  capacity: number,
  options?: RingBufferStoreOptions<T>,
) {
  return React.useMemo(() => {
    const store = createRingBufferStore<T>(capacity);

    if (options?.seed) {
      store.replace(options.seed);
    }

    return store;
  }, [capacity, ...(options?.deps ?? [])]);
}

export function useRingBufferSelector<T, S>(
  store: RingBufferStore<T>,
  selector: (snap: RingBufferSnapshot<T>) => S,
  isEqual: (a: S, b: S) => boolean = Object.is,
) {
  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
    selector,
    isEqual,
  );
}
