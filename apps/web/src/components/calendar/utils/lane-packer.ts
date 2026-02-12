import { MinMaxHeap } from "@/lib/data-structures/min-max-heap";
import { InlineDisplayItem } from "@/lib/display-item";

interface LaneEntry {
  laneIndex: number;
  endEpoch: number;
}

export interface CachedDisplayItem {
  item: InlineDisplayItem;
  startEpoch: number;
  endEpoch: number;
  durationDays: number;
}

/**
 * Stateful lane packer using greedy interval partitioning.
 *
 * Current usage: Create fresh instance per render (stateless behavior).
 * Future infinite scroll: Reuse instance, call insertItems() incrementally.
 *
 * @complexity O(n log k) where n = items, k = concurrent lanes
 */
export class LanePacker {
  private lanes: InlineDisplayItem[][] = [];
  private compareActive = (a: LaneEntry, b: LaneEntry) =>
    a.endEpoch !== b.endEpoch
      ? a.endEpoch - b.endEpoch
      : a.laneIndex - b.laneIndex;
  private compareAvailable = (a: LaneEntry, b: LaneEntry) =>
    a.endEpoch !== b.endEpoch
      ? a.endEpoch - b.endEpoch
      : b.laneIndex - a.laneIndex;
  private active = new MinMaxHeap<LaneEntry>(this.compareActive);
  private available = new MinMaxHeap<LaneEntry>(this.compareAvailable);

  constructor(items?: CachedDisplayItem[]) {
    if (items) {
      this.insertItems(items);
    }
  }

  /**
   * Insert a batch of items (must be sorted by startEpoch, then -durationDays).
   *
   * Expects inclusive intervals: startEpoch and endEpoch represent the first and
   * last day of the item (not closed-open). Lane reuse uses strict `>` comparison,
   * so an item starting the day after another ends will share a lane.
   *
   * When multiple lanes are valid, prefers the one ending latest (most recent)
   * to keep consecutive items visually grouped in the same lane.
   */
  insertItems(items: CachedDisplayItem[]) {
    for (const { item, startEpoch, endEpoch } of items) {
      // Move ended lanes to available (strictly before, per inclusive interval rule)
      while (this.active.size > 0) {
        const earliest = this.active.peekMin();

        if (!earliest || startEpoch <= earliest.endEpoch) {
          break;
        }

        const ended = this.active.popMin();

        if (ended) {
          this.available.push(ended);
        }
      }

      const bestLane = this.available.popMax();

      if (bestLane) {
        this.lanes[bestLane.laneIndex]!.push(item);
        this.active.push({ laneIndex: bestLane.laneIndex, endEpoch });
        continue;
      }

      const laneIndex = this.lanes.length;

      this.lanes.push([item]);
      this.active.push({ laneIndex, endEpoch });
    }
  }

  /**
   * Evict items that end before threshold (for infinite scroll).
   * Call when window scrolls forward to free memory.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evictBefore(epochThreshold: number) {
    // Filter items from lanes and rebuild heap
    // (Implementation deferred until infinite scroll is added)
  }

  /**
   * Evict items that start after threshold (for infinite scroll).
   * Call when window scrolls forward to free memory.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evictAfter(epochThreshold: number) {
    // Filter items from lanes and rebuild heap
    // (Implementation deferred until infinite scroll is added)
  }

  /** Get current lane layout */
  getLanes() {
    return this.lanes;
  }

  /** Reset for fresh computation */
  reset() {
    this.lanes = [];
    this.active = new MinMaxHeap<LaneEntry>(this.compareActive);
    this.available = new MinMaxHeap<LaneEntry>(this.compareAvailable);
  }
}

export function lanePacker(items?: CachedDisplayItem[]) {
  return new LanePacker(items);
}
