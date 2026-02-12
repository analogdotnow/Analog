# Declarative Sliding Window Hook Plan

## Problem

The current `useRingBuffer*` hooks require imperative updates via `useEffect`:

```tsx
// Current pattern (imperative)
const dayBuffer = useDayBuffer(capacity, seed, []);
const updateBuffer = React.useEffectEvent(() => {
  dayBuffer.update(rangeStart, rangeEnd, anchor, columns, collection);
});

React.useLayoutEffect(() => {
  updateBuffer();
}, [anchor, rangeStart, rangeEnd, columns, collection]);

return dayBuffer.items;
```

This requires:

- Manual `useRef` state tracking inside `useDayBuffer`
- Explicit `useLayoutEffect` at the call site
- Imperative `update()` calls that determine delta internally

## Goal

A declarative API similar to `useMemo`:

```tsx
// Desired pattern (declarative)
const days = useSlidingWindow({
  start: rangeStart,
  end: rangeEnd,
  getItem: (index) => createDay(index, anchor, columns, collection),
  deps: [anchor, collection], // reset buffer when these change
});
```

No `useEffect` at the call site - the hook internally handles efficient updates.

## Constraint: No Ref Mutation During Render

React requires render to be pure. We cannot mutate refs during render because:

- Strict Mode double-invokes render functions
- Concurrent rendering may abandon renders
- It violates React's mental model

**Solution**: Use `useSyncExternalStore` with a store that manages state outside React's render phase.

---

## Proposed API

### Option A: Index-based with `getItem` callback

```tsx
interface SlidingWindowOptions<T> {
  /** Start index of the visible window (inclusive) */
  start: number;
  /** End index of the visible window (inclusive) */
  end: number;
  /** Factory function to create item for a given index */
  getItem: (index: number) => T;
  /** When these change, the buffer is fully replaced (anchor change, collection change) */
  deps?: DependencyList;
  /** Optional: custom equality check for items */
  isEqual?: (a: T, b: T) => boolean;
}

function useSlidingWindow<T>(options: SlidingWindowOptions<T>): readonly T[];
```

**Usage:**

```tsx
const days = useSlidingWindow({
  start: startOffset - BUFFER_COUNT,
  end: startOffset + columns.count + BUFFER_COUNT - 1,
  getItem: (index) => ({
    date: anchor.add({ days: index - columns.center }),
    index,
    style: { left: `${50 + columns.fraction * (index - columns.center)}%` },
    items:
      collection.positionedItems[index - columns.center + BUFFER_COUNT] ?? [],
    sideItems:
      collection.positionedSideItems[index - columns.center + BUFFER_COUNT] ??
      [],
  }),
  deps: [anchor, collection],
});
```

### Option B: Range-based with memoized computation

```tsx
interface SlidingWindowOptions<T, C> {
  /** Start index */
  start: number;
  /** End index */
  end: number;
  /** Context passed to getItem - when this changes, buffer resets */
  context: C;
  /** Factory function */
  getItem: (index: number, context: C) => T;
  /** Compare contexts - if different, reset buffer */
  contextEqual?: (a: C, b: C) => boolean;
}
```

**Usage:**

```tsx
const days = useSlidingWindow({
  start: rangeStart,
  end: rangeEnd,
  context: { anchor, columns, collection },
  getItem: (index, { anchor, columns, collection }) => createDay(index, ...),
  contextEqual: (a, b) => isSameDay(a.anchor, b.anchor) && a.collection === b.collection,
});
```

---

## Implementation Strategy

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  useSlidingWindow (React hook)                          │
│  - Creates store once (useMemo)                         │
│  - Subscribes via useSyncExternalStore                  │
│  - Updates store in useLayoutEffect                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  SlidingWindowStore (external store)                    │
│  - Holds RingBuffer + window state                      │
│  - updateWindow() computes delta, mutates buffer        │
│  - Notifies subscribers on change                       │
│  - getSnapshot() returns cached items array             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  RingBuffer<T> (data structure)                         │
│  - Efficient enqueueLeft/Right operations               │
│  - Caches getItems() by revision                        │
└─────────────────────────────────────────────────────────┘
```

### Store Implementation

```tsx
interface SlidingWindowState {
  start: number;
  end: number;
}

interface SlidingWindowStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => readonly T[];
  getServerSnapshot: () => readonly T[];
  updateWindow: (
    start: number,
    end: number,
    getItem: (index: number) => T,
  ) => void;
}

function createSlidingWindowStore<T>(capacity: number): SlidingWindowStore<T> {
  const buffer = createRingBuffer<T>(capacity);
  let state: SlidingWindowState | null = null;
  let snapshot: readonly T[] = [];
  const listeners = new Set<() => void>();

  const notify = () => {
    snapshot = buffer.getItems();
    listeners.forEach((l) => l());
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot: () => snapshot,
    getServerSnapshot: () => snapshot,

    updateWindow: (start, end, getItem) => {
      // Fresh store (state is null) or no overlap → full populate
      const noOverlap =
        state !== null && (end < state.start || start > state.end);

      if (state === null || noOverlap) {
        buffer.clear();
        for (let i = start; i <= end; i++) {
          buffer.enqueueRight(getItem(i));
        }
        state = { start, end };
        notify();
        return;
      }

      // Incremental update
      const delta = start - state.start;

      if (delta === 0) {
        return; // No change
      }

      if (delta > 0) {
        // Scrolled right - add new items to right
        for (let i = state.end + 1; i <= end; i++) {
          buffer.enqueueRight(getItem(i));
        }
      } else {
        // Scrolled left - add new items to left
        for (let i = state.start - 1; i >= start; i--) {
          buffer.enqueueLeft(getItem(i));
        }
      }

      state = { start, end };
      notify();
    },
  };
}
```

### Hook Implementation

```tsx
interface SlidingWindowOptions<T> {
  /** Start index of the window (inclusive) */
  start: number;
  /** End index of the window (inclusive) */
  end: number;
  /** Factory function to create item for a given index */
  getItem: (index: number) => T;
  /** Dependencies - when these change, buffer is fully replaced */
  deps?: React.DependencyList;
}

function useSlidingWindow<T>({
  start,
  end,
  getItem,
  deps = [],
}: SlidingWindowOptions<T>): readonly T[] {
  const capacity = end - start + 1;

  // New store when deps change → this IS the full reset
  const store = React.useMemo(
    () => createSlidingWindowStore<T>(capacity),
    [capacity, ...deps],
  );

  // Single effect - store figures out full populate vs incremental
  React.useLayoutEffect(() => {
    store.updateWindow(start, end, getItem);
  }, [store, start, end, getItem]);

  // Subscribe to store
  return React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}
```

### Key Points

1. **No ref needed** - `useMemo` dependency array handles deps tracking
2. **Store recreation = full reset** - when deps change, new store is created
3. **Store knows its state** - `state === null` means fresh store, needs full populate
4. **Single effect** - store's `updateWindow` handles both cases internally

---

## Key Design Decisions

### 1. Render-phase vs Effect-phase Updates

**Current (effect-phase):**

- Updates happen in `useLayoutEffect`
- Extra render cycle for buffer updates to propagate

**Proposed (render-phase):**

- Updates computed during render via `useMemo`
- Items available immediately, no extra render cycle
- Follows React's data flow model

### 2. Dependency Tracking

**Option A: Explicit `deps` array**

- User specifies what triggers full reset
- Similar to `useMemo` mental model
- Risk: forgetting deps

**Option B: Context object with equality**

- Single object contains all context
- Explicit equality function
- More explicit, less error-prone

**Recommendation:** Option A with lint rule support (similar to `useMemo`)

### 3. Buffer Capacity

The buffer capacity is derived from `end - start + 1`. This means:

- If window size changes, we might need to resize
- Could allocate extra capacity for flexibility
- Or recreate buffer when capacity changes

### 4. `getItem` Stability

The `getItem` function should be stable or memoized. With React Compiler's `"use memo"`, this happens automatically. Without it, consumers need `useCallback`.

---

## Comparison

| Aspect         | Current (`useRingBuffer*`)              | Proposed (`useSlidingWindow`) |
| -------------- | --------------------------------------- | ----------------------------- |
| Update trigger | `useLayoutEffect` at call site          | `useLayoutEffect` internal    |
| State tracking | `useRef` in custom hook                 | External store                |
| API surface    | `{ items, update }`                     | Just `items`                  |
| Call site      | Effect + `useEffectEvent` + update call | Single hook call              |
| Mental model   | Imperative                              | Declarative                   |
| React 18+ safe | Yes                                     | Yes (`useSyncExternalStore`)  |

---

## Migration Path

1. Implement `useSlidingWindow` alongside existing hooks
2. Create wrapper hooks that match current signatures:
   ```tsx
   function useDayBuffer(...) {
     return useSlidingWindow({...});
   }
   ```
3. Update providers to use new declarative pattern
4. Remove old hooks once migrated

---

## Edge Cases to Handle

1. **Empty window** (`start > end`): Return empty array
2. **Capacity change**: Recreate buffer with new capacity
3. **Large jumps**: If delta > capacity, do full replace
4. **SSR**: Initial render should work without effects
5. **Strict Mode**: Double-invoke should be idempotent

---

## Alternative: Pure Computed (No Buffer)

For simpler cases, we could skip the buffer entirely:

```tsx
function useVirtualWindow<T>({
  start,
  end,
  getItem,
}: VirtualWindowOptions<T>): readonly T[] {
  return React.useMemo(() => {
    const items: T[] = [];
    for (let i = start; i <= end; i++) {
      items.push(getItem(i));
    }
    return items;
  }, [start, end, getItem]);
}
```

This is simpler but regenerates all items on every scroll. The ring buffer approach only generates delta items. For expensive `getItem` functions, the buffer is valuable.

---

## Why This Works

### The Effect is Still There, But Hidden

We haven't eliminated the effect - we've encapsulated it. The key insight:

```tsx
// Before: Consumer writes effect
const buffer = useDayBuffer(...);
React.useLayoutEffect(() => { buffer.update(...); }, [...]);
return buffer.items;

// After: Consumer writes nothing, effect is internal
const items = useSlidingWindow({ start, end, getItem, deps });
```

### Store Recreation = Full Reset

When `deps` change, `useMemo` creates a new store. The new store has `state === null`, so `updateWindow` knows to do a full populate. No ref comparison needed.

| Scenario              | Store | `state`          | Action             |
| --------------------- | ----- | ---------------- | ------------------ |
| `deps` change         | New   | `null`           | Full populate      |
| `start/end` change    | Same  | `{ start, end }` | Incremental delta  |
| Big jump (no overlap) | Same  | `{ start, end }` | Clear + repopulate |

### `useSyncExternalStore` Guarantees

1. **Consistent reads** - Won't tear during concurrent renders
2. **Proper subscription** - Re-renders when store changes
3. **SSR support** - `getServerSnapshot` for hydration

### Timing

```txt
Render phase:
  1. useSlidingWindow called
  2. useMemo returns store (new if deps changed, same otherwise)
  3. useSyncExternalStore reads current snapshot
  4. Component renders with current items

Commit phase (useLayoutEffect):
  5. store.updateWindow() called
  6. Store checks state: null → full populate, else → incremental
  7. Store notifies subscribers
  8. React schedules re-render with new items
```

There's still a render → effect → re-render cycle when the window changes, but that's unavoidable with mutable state. The win is API simplicity.

---

## Recommendation

Use **`useSyncExternalStore`** with internal `useLayoutEffect`:

```tsx
const days = useSlidingWindow({
  start: rangeStart,
  end: rangeEnd,
  getItem: (index) => createDay(index, anchor, columns, collection),
  deps: [anchor, collection],
});
```

This provides:

- **Declarative API** - no effects at call site
- **React 18+ safe** - proper concurrent mode support
- **Efficient** - delta-based updates via ring buffer
- **Familiar** - similar mental model to `useMemo`
