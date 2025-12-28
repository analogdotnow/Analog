import { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { MinHeap } from "@/lib/data-structures/min-heap";

interface LaneEntry {
  laneIndex: number;
  endEpoch: number;
}

export interface CachedEvent {
  item: EventCollectionItem;
  startEpoch: number;
  endEpoch: number;
  durationDays: number;
}

/**
 * Stateful lane packer using greedy interval partitioning.
 *
 * Current usage: Create fresh instance per render (stateless behavior).
 * Future infinite scroll: Reuse instance, call insertEvents() incrementally.
 *
 * @complexity O(n log k) where n = events, k = concurrent lanes
 */
export class LanePacker {
  private lanes: EventCollectionItem[][] = [];
  private heap = new MinHeap<LaneEntry>((a, b) =>
    a.endEpoch !== b.endEpoch
      ? a.endEpoch - b.endEpoch
      : a.laneIndex - b.laneIndex,
  );

  constructor(events?: CachedEvent[]) {
    if (events) {
      this.insertEvents(events);
    }
  }

  /**
   * Insert a batch of events (must be sorted by startEpoch, then -durationDays).
   *
   * Expects inclusive intervals: startEpoch and endEpoch represent the first and
   * last day of the event (not closed-open). Lane reuse uses strict `>` comparison,
   * so an event starting the day after another ends will share a lane.
   */
  insertEvents(events: CachedEvent[]) {
    for (const { item, startEpoch, endEpoch } of events) {
      const top = this.heap.peek();

      if (top && startEpoch > top.endEpoch) {
        // Reuse existing lane - O(log k)
        this.heap.pop();
        this.lanes[top.laneIndex]!.push(item);
        this.heap.push({ laneIndex: top.laneIndex, endEpoch });

        continue;
      }

      // Create new lane - O(log k)
      const laneIndex = this.lanes.length;

      this.lanes.push([item]);
      this.heap.push({ laneIndex, endEpoch });
    }
  }

  /**
   * Evict events that end before threshold (for infinite scroll).
   * Call when window scrolls forward to free memory.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evictBefore(epochThreshold: number) {
    // Filter events from lanes and rebuild heap
    // (Implementation deferred until infinite scroll is added)
  }

  /**
   * Evict events that start after threshold (for infinite scroll).
   * Call when window scrolls forward to free memory.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evictAfter(epochThreshold: number) {
    // Filter events from lanes and rebuild heap
    // (Implementation deferred until infinite scroll is added)
  }

  /** Get current lane layout */
  getLanes() {
    return this.lanes;
  }

  /** Reset for fresh computation */
  reset() {
    this.lanes = [];
    this.heap = new MinHeap<LaneEntry>((a, b) =>
      a.endEpoch !== b.endEpoch
        ? a.endEpoch - b.endEpoch
        : a.laneIndex - b.laneIndex,
    );
  }
}

export function lanePacker(events?: CachedEvent[]) {
  return new LanePacker(events);
}
