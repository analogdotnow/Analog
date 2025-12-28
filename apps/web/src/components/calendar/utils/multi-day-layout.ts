/**
 * MULTI-DAY EVENT LAYOUT UTILITIES
 *
 * ## Interval Convention
 * Events use inclusive intervals [startDay, endDay]:
 * - 1-day event on Monday: start=Mon, end=Mon
 * - 3-day Mon-Wed: start=Mon, end=Wed
 *
 * Note: EventCollectionItem.end is made inclusive upstream by subtracting
 * 1 second from the exclusive end. This module then works entirely with
 * inclusive day ranges.
 *
 * ## Algorithm: Greedy Interval Partitioning
 * Events are assigned to horizontal "lanes" to avoid overlap.
 * A min-heap tracks the soonest-ending lane, achieving O(log k)
 * per insertion where k = number of concurrent lanes.
 *
 * ## Future: Infinite Scroll
 * The LanePacker class supports incremental insertions.
 * When infinite scroll is implemented:
 * 1. Maintain a single LanePacker instance per scroll container
 * 2. Call insertEvents() with newly-visible events on scroll
 * 3. Call evictBefore() to free memory as events scroll out
 */
import { Temporal } from "temporal-polyfill";

import { isAfter, isBefore, startOfDay } from "@repo/temporal";

import { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { CachedEvent, lanePacker } from "./lane-packer";

// ============================================================================
// CACHING & SORTING HELPERS
// ============================================================================

/** Convert events to cached format with precomputed epoch values */
function cacheEventMetadata(events: EventCollectionItem[], timeZone: string) {
  return events.map((item) => {
    const start = item.start.toPlainDate();
    const end = item.end.toPlainDate();

    const startEpoch = startOfDay(start, { timeZone }).toInstant()
      .epochMilliseconds;
    const endEpoch = startOfDay(end, { timeZone }).toInstant()
      .epochMilliseconds;

    // +1 so a 1-day event has durationDays === 1
    const durationDays = start.until(end).total({ unit: "days" }) + 1;

    return { item, startEpoch, endEpoch, durationDays };
  });
}

/** Sort: earliest start first, longer duration first on ties, then by id for stability */
function sortByStartThenDuration(cached: CachedEvent[]) {
  return cached.slice().sort((a, b) => {
    if (a.startEpoch !== b.startEpoch) {
      return a.startEpoch - b.startEpoch;
    }

    if (b.durationDays !== a.durationDays) {
      return b.durationDays - a.durationDays;
    }

    return a.item.event.id.localeCompare(b.item.event.id);
  });
}

// ============================================================================
// MAIN LANE PLACEMENT FUNCTION
// ============================================================================

/**
 * Place multi-day events into lanes to avoid overlaps.
 * Returns an array of lanes, where each lane contains non-overlapping events.
 *
 * @complexity O(n log n) for sorting + O(n log k) for placement = O(n log n)
 */
function placeIntoLanes(events: EventCollectionItem[], timeZone: string) {
  if (events.length === 0) {
    return [];
  }

  const cached = cacheEventMetadata(events, timeZone);
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

export interface EventCapacityInfo {
  totalLanes: number;
  visibleLanes: EventCollectionItem[][];
  overflowLanes: EventCollectionItem[][];
}

/**
 * Calculate the maximum number of event lanes that can fit in the available space
 */
function calculateEventCapacity(
  availableHeight: number,
  eventHeight: number = 24,
  eventGap: number = 4,
  minVisibleLanes: number = 2,
) {
  if (availableHeight <= 0) {
    return minVisibleLanes;
  }

  const eventSpacePerLane = eventHeight + eventGap;
  const calculatedLanes = Math.floor(availableHeight / eventSpacePerLane);

  // Always show at least minVisibleLanes, even if it overflows
  return Math.max(calculatedLanes, minVisibleLanes);
}

interface OrganizeEventsWithOverflowOptions {
  events: EventCollectionItem[];
  availableHeight: number;
  timeZone: string;
  eventHeight?: number;
  eventGap?: number;
}

/**
 * Organize events into visible and overflow lanes based on available space
 */
export function organizeEventsWithOverflow({
  events,
  availableHeight,
  timeZone,
  eventHeight = 24,
  eventGap = 4,
}: OrganizeEventsWithOverflowOptions): EventCapacityInfo {
  if (events.length === 0) {
    return {
      totalLanes: 0,
      visibleLanes: [],
      overflowLanes: [],
    };
  }

  // Calculate all lanes
  const allLanes = placeIntoLanes(events, timeZone);
  const totalLanes = allLanes.length;

  // Step 1: How many event lanes *could* fit given the available space?
  const maxVisibleLanes = calculateEventCapacity(
    availableHeight,
    eventHeight,
    eventGap,
  );

  // Step 2: Slice lanes based on the initial capacity.
  const overflowLanes = allLanes.slice(maxVisibleLanes);

  // Step 3: If there is any overflow we need to reserve one lane for the
  // "+X more" button. We do this by reducing the visible lane count by one.
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
 * Calculate the grid position for a multi-day event within a week row
 */
export function getGridPosition(
  item: EventCollectionItem,
  weekStart: Temporal.PlainDate,
  weekEnd: Temporal.PlainDate,
): GridPosition {
  const startDate = item.start.toPlainDate();
  const endDate = item.end.toPlainDate();

  // Clamp the event to the week's visible range
  const clampedStart = isBefore(startDate, weekStart) ? weekStart : startDate;
  const clampedEnd = isAfter(endDate, weekEnd) ? weekEnd : endDate;

  // Calculate column start (0-based index)
  const colStart = weekStart.until(clampedStart).total({ unit: "days" });

  // Calculate span (number of days the event covers in this week)
  const span = clampedStart.until(clampedEnd).total({ unit: "days" }) + 1;

  return { colStart, span };
}
