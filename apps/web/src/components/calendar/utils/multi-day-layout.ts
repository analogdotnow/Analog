/**
 * MULTI-DAY DISPLAY ITEM LAYOUT UTILITIES
 *
 * ## Interval Convention
 * Items use inclusive intervals [startDay, endDay]:
 * - 1-day item on Monday: start=Mon, end=Mon
 * - 3-day Mon-Wed: start=Mon, end=Wed
 *
 * Note: DisplayItem.end is made inclusive upstream by subtracting
 * 1 second from the exclusive end. This module then works entirely with
 * inclusive day ranges.
 *
 * ## Algorithm: Greedy Interval Partitioning
 * Items are assigned to horizontal "lanes" to avoid overlap.
 * A min-heap tracks the soonest-ending lane, achieving O(log k)
 * per insertion where k = number of concurrent lanes.
 *
 * ## Future: Infinite Scroll
 * The LanePacker class supports incremental insertions.
 * When infinite scroll is implemented:
 * 1. Maintain a single LanePacker instance per scroll container
 * 2. Call insertItems() with newly-visible items on scroll
 * 3. Call evictBefore() to free memory as items scroll out
 */
import { Temporal } from "temporal-polyfill";

import { isAfter, isBefore, startOfDay } from "@repo/temporal";

import { InlineDisplayItem } from "@/lib/display-item";
import { CachedDisplayItem, lanePacker } from "./lane-packer";

// ============================================================================
// CACHING & SORTING HELPERS
// ============================================================================

/** Convert items to cached format with precomputed epoch values */
function cacheItemMetadata(
  items: InlineDisplayItem[],
  timeZone: string,
): CachedDisplayItem[] {
  return items.map((item) => {
    const start = item.start.toPlainDate();
    const end = item.end.toPlainDate();

    const startEpoch = startOfDay(start, { timeZone }).toInstant()
      .epochMilliseconds;
    const endEpoch = startOfDay(end, { timeZone }).toInstant()
      .epochMilliseconds;

    // +1 so a 1-day item has durationDays === 1
    const durationDays = start.until(end).total({ unit: "days" }) + 1;

    return { item, startEpoch, endEpoch, durationDays };
  });
}

/** Sort: earliest start first, longer duration first on ties, then by id for stability */
function sortByStartThenDuration(cached: CachedDisplayItem[]) {
  return cached.slice().sort((a, b) => {
    if (a.startEpoch !== b.startEpoch) {
      return a.startEpoch - b.startEpoch;
    }

    if (b.durationDays !== a.durationDays) {
      return b.durationDays - a.durationDays;
    }

    return a.item.id.localeCompare(b.item.id);
  });
}

// ============================================================================
// MAIN LANE PLACEMENT FUNCTION
// ============================================================================

/**
 * Place multi-day items into lanes to avoid overlaps.
 * Returns an array of lanes, where each lane contains non-overlapping items.
 *
 * @complexity O(n log n) for sorting + O(n log k) for placement = O(n log n)
 */
function placeIntoLanes(items: InlineDisplayItem[], timeZone: string) {
  if (items.length === 0) {
    return [];
  }

  const cached = cacheItemMetadata(items, timeZone);
  const sorted = sortByStartThenDuration(cached);

  return lanePacker(sorted).getLanes();
}

// ============================================================================
// PUBLIC API
// ============================================================================

interface GridPosition {
  colStart: number;
  span: number;
}

export interface DisplayItemCapacityInfo {
  totalLanes: number;
  visibleLanes: InlineDisplayItem[][];
  overflowLanes: InlineDisplayItem[][];
}

/**
 * Calculate the maximum number of item lanes that can fit in the available space
 */
function calculateItemCapacity(
  availableHeight: number,
  itemHeight: number = 24,
  itemGap: number = 4,
  minVisibleLanes: number = 2,
) {
  if (availableHeight <= 0) {
    return minVisibleLanes;
  }

  const itemSpacePerLane = itemHeight + itemGap;
  const calculatedLanes = Math.floor(availableHeight / itemSpacePerLane);

  return Math.max(calculatedLanes, minVisibleLanes);
}

interface OrganizeItemsWithOverflowOptions {
  items: InlineDisplayItem[];
  availableHeight: number;
  timeZone: string;
  itemHeight?: number;
  itemGap?: number;
}

/**
 * Organize items into visible and overflow lanes based on available space
 */
export function organizeItemsWithOverflow({
  items,
  availableHeight,
  timeZone,
  itemHeight = 24,
  itemGap = 4,
}: OrganizeItemsWithOverflowOptions): DisplayItemCapacityInfo {
  if (items.length === 0) {
    return {
      totalLanes: 0,
      visibleLanes: [],
      overflowLanes: [],
    };
  }

  const allLanes = placeIntoLanes(items, timeZone);
  const totalLanes = allLanes.length;

  const maxVisibleLanes = calculateItemCapacity(
    availableHeight,
    itemHeight,
    itemGap,
  );

  const overflowLanes = allLanes.slice(maxVisibleLanes);

  if (overflowLanes.length === 0) {
    return { totalLanes, visibleLanes: allLanes, overflowLanes: [] };
  }

  return {
    totalLanes,
    visibleLanes: allLanes.slice(0, maxVisibleLanes - 1),
    overflowLanes: allLanes.slice(maxVisibleLanes - 1),
  };
}

/**
 * Calculate the grid position for a multi-day item within a week row
 */
export function getGridPosition(
  item: InlineDisplayItem,
  weekStart: Temporal.PlainDate,
  weekEnd: Temporal.PlainDate,
): GridPosition {
  const startDate = item.start.toPlainDate();
  const endDate = item.end.toPlainDate();

  const clampedStart = isBefore(startDate, weekStart) ? weekStart : startDate;
  const clampedEnd = isAfter(endDate, weekEnd) ? weekEnd : endDate;

  const colStart = weekStart.until(clampedStart).total({ unit: "days" });
  const span = clampedStart.until(clampedEnd).total({ unit: "days" }) + 1;

  return { colStart, span };
}
