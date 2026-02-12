export type RingOp = "seed" | "noop" | "replace" | "shift-left" | "shift-right";

export interface RingMeta<TCursor> {
  op: RingOp;
  delta: number;
  capacity: number;
  relativeIndex: number;
  anchor: TCursor;
  start: TCursor;
  end: TCursor;
  configVersion: string;
  sourceVersion: unknown;
}

export interface RingSnapshot<TItem, TCursor> {
  items: readonly TItem[];
  meta: RingMeta<TCursor>;
}

interface CreateRangeArgs<TCursor> {
  start: TCursor;
  count: number;
  anchor: TCursor;
  indexStart: number;
}

export interface DeriveRingBufferArgs<TItem, TCursor> {
  previous: RingSnapshot<TItem, TCursor> | null;
  capacity: number;
  anchor: TCursor;
  sourceVersion: unknown;
  configVersion: string;
  forceReplace?: boolean;
  getWindow: (anchor: TCursor) => { start: TCursor; end: TCursor };
  compareCursor: (a: TCursor, b: TCursor) => number;
  addCursor: (cursor: TCursor, amount: number) => TCursor;
  deltaFromAnchor: (previousAnchor: TCursor, nextAnchor: TCursor) => number;
  createRange: (args: CreateRangeArgs<TCursor>) => readonly TItem[];
}

function overlaps<TCursor>(
  compareCursor: (a: TCursor, b: TCursor) => number,
  a: { start: TCursor; end: TCursor },
  b: { start: TCursor; end: TCursor },
) {
  if (compareCursor(a.end, b.start) < 0) {
    return false;
  }

  if (compareCursor(b.end, a.start) < 0) {
    return false;
  }

  return true;
}

interface BuildSnapshotArgs<TItem, TCursor> {
  op: RingOp;
  delta: number;
  capacity: number;
  relativeIndex: number;
  anchor: TCursor;
  start: TCursor;
  end: TCursor;
  configVersion: string;
  sourceVersion: unknown;
  items: readonly TItem[];
}

function buildSnapshot<TItem, TCursor>({
  op,
  delta,
  capacity,
  relativeIndex,
  anchor,
  start,
  end,
  configVersion,
  sourceVersion,
  items,
}: BuildSnapshotArgs<TItem, TCursor>): RingSnapshot<TItem, TCursor> {
  return {
    items,
    meta: {
      op,
      delta,
      capacity,
      relativeIndex,
      anchor,
      start,
      end,
      configVersion,
      sourceVersion,
    },
  };
}

interface ReplaceArgs<TItem, TCursor> {
  args: DeriveRingBufferArgs<TItem, TCursor>;
  op: RingOp;
  delta: number;
  relativeIndex: number;
  window: { start: TCursor; end: TCursor };
}

function replaceSnapshot<TItem, TCursor>({
  args,
  op,
  delta,
  relativeIndex,
  window,
}: ReplaceArgs<TItem, TCursor>) {
  const items = args.createRange({
    start: window.start,
    count: args.capacity,
    anchor: args.anchor,
    indexStart: relativeIndex,
  });

  return buildSnapshot({
    op,
    delta,
    capacity: args.capacity,
    relativeIndex,
    anchor: args.anchor,
    start: window.start,
    end: window.end,
    configVersion: args.configVersion,
    sourceVersion: args.sourceVersion,
    items,
  });
}

export function deriveRingBufferSnapshot<TItem, TCursor>(
  args: DeriveRingBufferArgs<TItem, TCursor>,
) {
  if (args.capacity < 0) {
    throw new Error("deriveRingBufferSnapshot capacity must be >= 0");
  }

  const window = args.getWindow(args.anchor);
  const previous = args.previous;

  if (previous === null) {
    return replaceSnapshot({
      args,
      op: "seed",
      delta: 0,
      relativeIndex: 0,
      window,
    });
  }

  const previousMeta = previous.meta;
  const delta = args.deltaFromAnchor(previousMeta.anchor, args.anchor);
  const configChanged = previousMeta.configVersion !== args.configVersion;
  const capacityChanged =
    previousMeta.capacity !== args.capacity ||
    previous.items.length !== args.capacity;
  const sourceChanged = previousMeta.sourceVersion !== args.sourceVersion;
  const hasOverlap = overlaps(args.compareCursor, previousMeta, window);

  if (args.forceReplace || configChanged || capacityChanged || !hasOverlap) {
    return replaceSnapshot({
      args,
      op: "replace",
      delta,
      relativeIndex: 0,
      window,
    });
  }

  if (sourceChanged) {
    return replaceSnapshot({
      args,
      op: "replace",
      delta,
      relativeIndex: previousMeta.relativeIndex + delta,
      window,
    });
  }

  if (delta === 0) {
    return previous;
  }

  if (Math.abs(delta) >= args.capacity) {
    return replaceSnapshot({
      args,
      op: "replace",
      delta,
      relativeIndex: previousMeta.relativeIndex + delta,
      window,
    });
  }

  if (delta > 0) {
    const enteringCount = Math.min(delta, args.capacity);
    const kept = previous.items.slice(enteringCount);
    const entering = args.createRange({
      start: args.addCursor(previousMeta.end, 1),
      count: enteringCount,
      anchor: args.anchor,
      indexStart: previousMeta.relativeIndex + args.capacity,
    });
    const nextRelativeIndex = previousMeta.relativeIndex + delta;

    return buildSnapshot({
      op: "shift-right",
      delta,
      capacity: args.capacity,
      relativeIndex: nextRelativeIndex,
      anchor: args.anchor,
      start: window.start,
      end: window.end,
      configVersion: args.configVersion,
      sourceVersion: args.sourceVersion,
      items: [...kept, ...entering],
    });
  }

  const enteringCount = Math.min(Math.abs(delta), args.capacity);
  const kept = previous.items.slice(0, args.capacity - enteringCount);
  const nextRelativeIndex = previousMeta.relativeIndex + delta;
  const entering = args.createRange({
    start: window.start,
    count: enteringCount,
    anchor: args.anchor,
    indexStart: nextRelativeIndex,
  });

  return buildSnapshot({
    op: "shift-left",
    delta,
    capacity: args.capacity,
    relativeIndex: nextRelativeIndex,
    anchor: args.anchor,
    start: window.start,
    end: window.end,
    configVersion: args.configVersion,
    sourceVersion: args.sourceVersion,
    items: [...entering, ...kept],
  });
}
