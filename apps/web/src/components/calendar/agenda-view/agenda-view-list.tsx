"use client";

// Required to ensure the scroll position is reset on fast refresh
// @refresh reset
import * as React from "react";
// Polyfills the scrollend event; remove once scrollend browser support on caniuse.com reaches 90%
import "scrollyfills";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Temporal } from "temporal-polyfill";

import { isInlineItem } from "@/lib/display-item";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { AgendaViewDay } from "./agenda-view-day";
import { useAgendaView } from "./agenda-view-provider";

const EDGE_DAYS = 14;
const EDGE_ITEMS = 10;
// Backward runway floor in viewport-heights: below this much loaded content
// above the viewport, extend regardless of the day/item-based triggers.
// Sized for a strong fling: it must cover the distance momentum travels
// during one uncached chunk round trip, or the fling reaches the top while
// extension is stalled on the network.
const START_RUNWAY_VIEWPORTS = 5;
const SCROLL_SILENCE_MS = 160;

// WebKit drops programmatic scrollTop writes while a momentum gesture is
// live, so prepend compensation cannot land mid-fling there. Engine-level,
// not browser-level: iOS Chrome (CriOS) and Firefox (FxiOS) are WebKit too
// and neither matches the exclusion list.
const IS_WEBKIT =
  typeof navigator !== "undefined" &&
  /AppleWebKit/.test(navigator.userAgent) &&
  !/Chrome|Chromium|Edg/.test(navigator.userAgent);

function AgendaViewEmpty() {
  "use memo";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center py-16 text-center">
      <CalendarIcon className="mb-2 text-muted-foreground/50" />
      <h3 className="text-lg font-medium">No items found</h3>
      <p className="text-muted-foreground">
        There are no items scheduled for this time period.
      </p>
    </div>
  );
}

// No "use memo": the React Compiler cannot observe when
// virtualizer.getVirtualItems() changes and would over-memoize.
export function AgendaViewList() {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const {
    days,
    loadedStart,
    loadedEnd,
    isPending,
    canExtendBackward,
    canExtendForward,
    extendBackward,
    extendForward,
    resetWindowAround,
  } = useAgendaView();

  const currentDate = useCalendarStore((s) => s.currentDate);
  const navigationNonce = useCalendarStore((s) => s.navigationNonce);
  const setCurrentDate = useCalendarStore((s) => s.setCurrentDate);

  const virtualizer = useVirtualizer({
    count: days.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      96 + days[index]!.items.filter(isInlineItem).length * 48,
    overscan: 5,
    getItemKey: (index) => days[index]!.key,
  });

  // Single-writer rule: the core's own size-change adjustments write
  // scrollTop inside ResizeObserver callbacks, one task before React commits
  // the matching item positions — each measurement batch paints a frame of
  // content shifted against the gesture. All compensation happens instead in
  // the per-commit layout effect below, atomically with the positions it
  // compensates for.
  virtualizer.shouldAdjustScrollPositionOnItemSizeChange = () => false;

  // Viewport anchor: the topmost visible day group and its content-space
  // position (DOM rect + scrollTop). Content-space is invariant under
  // scrolling, so the compensation delta is exactly how far layout changes
  // moved the anchor — user scrolling between capture and commit cancels out.
  const anchorRef = React.useRef<{ key: string; contentPos: number } | null>(
    null,
  );
  const lastSyncedDayRef = React.useRef<string | null>(null);
  const pendingTargetRef = React.useRef<Temporal.PlainDate | null>(null);
  const isScrollingRef = React.useRef(false);
  const pendingPrependRef = React.useRef(false);

  const keyIndex = React.useMemo(
    () => new Map(days.map((day, index) => [day.key, index])),
    [days],
  );

  // Content-space position of a day group, read from the DOM when its
  // element is mounted (the painted truth — the virtualizer's measurement
  // cache can run ahead of the DOM between commits), from the virtualizer's
  // layout otherwise (identical to the committed DOM within one commit).
  const anchorContentPos = React.useEffectEvent(
    (scrollElement: HTMLDivElement, key: string) => {
      const element = virtualizer.elementsCache.get(key);

      if (element) {
        return (
          element.getBoundingClientRect().top -
          scrollElement.getBoundingClientRect().top +
          scrollElement.scrollTop
        );
      }

      const index = keyIndex.get(key);

      if (index === undefined) {
        return undefined;
      }

      const offset = virtualizer.getOffsetForIndex(index, "start");

      if (!offset) {
        return undefined;
      }

      return offset[0];
    },
  );

  const updateAnchor = React.useEffectEvent(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const item = virtualizer.getVirtualItemForOffset(scrollElement.scrollTop);

    if (!item) {
      anchorRef.current = null;
      return;
    }

    const key = String(item.key);
    const contentPos = anchorContentPos(scrollElement, key);

    if (contentPos === undefined) {
      anchorRef.current = null;
      return;
    }

    anchorRef.current = { key, contentPos };
  });

  const compensate = React.useEffectEvent(() => {
    const scrollElement = scrollRef.current;
    const anchor = anchorRef.current;

    if (!scrollElement || !anchor) {
      return;
    }

    const contentPos = anchorContentPos(scrollElement, anchor.key);

    if (contentPos === undefined) {
      // The anchored day group no longer exists; re-anchor to whatever is at
      // the current offset so later commits stay compensated.
      updateAnchor();
      return;
    }

    const delta = contentPos - anchor.contentPos;

    // Sub-pixel deltas are skipped without rebaselining so they accumulate
    // until correctable instead of drifting.
    if (Math.abs(delta) < 1) {
      return;
    }

    scrollElement.scrollTop += delta;
    anchor.contentPos = contentPos;
  });

  // Compensation runs in every commit, before paint: any commit may move the
  // anchored day group (prepended/evicted day groups above it, or
  // estimate→measured corrections of groups above it) and the scrollTop
  // write must land atomically with the item positions it compensates for.
  React.useLayoutEffect(() => {
    compensate();
  });

  const syncFromScroll = React.useEffectEvent(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement || pendingTargetRef.current) {
      return;
    }

    const item = virtualizer.getVirtualItemForOffset(scrollElement.scrollTop);

    if (!item) {
      return;
    }

    const day = days[item.index];

    if (!day || lastSyncedDayRef.current === day.key) {
      return;
    }

    lastSyncedDayRef.current = day.key;
    setCurrentDate(day.date, { keepTimeRange: true });
  });

  const checkEdges = React.useEffectEvent(() => {
    if (pendingTargetRef.current || isPending) {
      return;
    }

    if (days.length === 0) {
      if (canExtendForward) {
        extendForward();
      }

      if (canExtendBackward) {
        extendBackward();
      }

      return;
    }

    const virtualItems = virtualizer.getVirtualItems();
    const first = virtualItems[0];
    const last = virtualItems.at(-1);

    if (!first || !last) {
      return;
    }

    const nearEnd =
      last.index >= days.length - EDGE_ITEMS ||
      loadedEnd.since(days[last.index]!.date).days <= EDGE_DAYS;

    const scrollElement = scrollRef.current;

    // Three triggers, each covering a density the others miss: item count
    // (sparse stretches — the day-distance test alone stalls after an empty
    // prepend, because the gap to loadedStart only ever grows), day distance
    // (dense top region where EDGE_ITEMS spans too few days), and a pixel
    // runway floor (few tall day groups where either count is misleading).
    const nearStart =
      first.index < EDGE_ITEMS ||
      days[first.index]!.date.since(loadedStart).days <= EDGE_DAYS ||
      (scrollElement !== null &&
        scrollElement.scrollTop <
          scrollElement.clientHeight * START_RUNWAY_VIEWPORTS);

    // One side per pass: at the MAX_CHUNKS cap an extension evicts from the
    // far side, so firing both would ping-pong extend/evict forever.
    const forwardFirst =
      !nearStart || virtualizer.scrollDirection === "forward";

    if (nearEnd && forwardFirst && canExtendForward) {
      extendForward();
    } else if (nearStart && canExtendBackward) {
      // On WebKit, prepends are deferred while a gesture/momentum is live;
      // applying the insertion mid-momentum needs the compensating scrollTop
      // write that engine drops. Blink and Gecko honor mid-momentum writes,
      // so they prepend immediately and a fling never reaches the top edge.
      if (IS_WEBKIT && isScrollingRef.current) {
        pendingPrependRef.current = true;
      } else {
        extendBackward();
      }
    }
  });

  const flushDeferredPrepend = React.useEffectEvent(() => {
    isScrollingRef.current = false;

    if (!pendingPrependRef.current) {
      return;
    }

    pendingPrependRef.current = false;

    if (!isPending && canExtendBackward) {
      extendBackward();
    }
  });

  React.useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    let frame: number | null = null;
    let silenceTimer: number | null = null;

    const onScroll = () => {
      updateAnchor();
      isScrollingRef.current = true;

      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
      }

      silenceTimer = window.setTimeout(() => {
        silenceTimer = null;
        flushDeferredPrepend();
      }, SCROLL_SILENCE_MS);

      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;
        syncFromScroll();
        checkEdges();
      });
    };

    const onScrollEnd = () => {
      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
        silenceTimer = null;
      }

      flushDeferredPrepend();
    };

    const controller = new AbortController();

    scrollElement.addEventListener("scroll", onScroll, {
      passive: true,
      signal: controller.signal,
    });

    scrollElement.addEventListener("scrollend", onScrollEnd, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }

      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
      }
    };
  }, []);

  const correctPendingScroll = React.useEffectEvent(
    (target: Temporal.PlainDate) => {
      // Re-derived from the target date: a prepend landing between the first
      // scrollToIndex and this correction shifts every index.
      const index = days.findIndex(
        (day) => Temporal.PlainDate.compare(day.date, target) >= 0,
      );

      if (index === -1) {
        return;
      }

      virtualizer.scrollToIndex(index, { align: "start" });
      updateAnchor();
    },
  );

  const attemptPendingScroll = React.useEffectEvent(() => {
    const target = pendingTargetRef.current;

    if (!target || isPending) {
      return;
    }

    const index = days.findIndex(
      (day) => Temporal.PlainDate.compare(day.date, target) >= 0,
    );

    if (index === -1) {
      // Empty target stretch: keep extending forward until a day group
      // appears or the auto-extension cap is reached.
      if (canExtendForward) {
        extendForward();
        return;
      }

      pendingTargetRef.current = null;
      updateAnchor();
      return;
    }

    pendingTargetRef.current = null;
    virtualizer.scrollToIndex(index, { align: "start" });
    updateAnchor();

    requestAnimationFrame(() => {
      // One post-layout correction pass: the first scroll lands on estimates.
      correctPendingScroll(target);
    });
  });

  React.useLayoutEffect(() => {
    attemptPendingScroll();
  });

  const navigate = React.useEffectEvent(() => {
    pendingTargetRef.current = currentDate;
    lastSyncedDayRef.current = null;

    if (
      Temporal.PlainDate.compare(currentDate, loadedStart) < 0 ||
      Temporal.PlainDate.compare(currentDate, loadedEnd) > 0
    ) {
      resetWindowAround(currentDate);
      return;
    }

    attemptPendingScroll();
  });

  // Keyed on navigationNonce only; currentDate is read imperatively so
  // scroll-driven currentDate writes don't re-trigger navigation.
  React.useLayoutEffect(() => {
    navigate();
  }, [navigationNonce]);

  React.useEffect(() => {
    checkEdges();
  }, [days, isPending]);

  const virtualItems = virtualizer.getVirtualItems();

  // overflow-anchor: none — the manual compensation above is the only active
  // compensation path; Chrome's native scroll anchoring would double-shift
  // and Safari has no overflow-anchor at all.
  return (
    <div
      ref={scrollRef}
      data-slot="agenda-view"
      className="relative scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 [overflow-anchor:none]"
    >
      <div
        className="relative border-t border-border/70"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((item) => {
          const day = days[item.index];

          if (!day) {
            return null;
          }

          return (
            <div
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              <AgendaViewDay day={day.date} items={day.items} />
            </div>
          );
        })}
      </div>
      {days.length === 0 && !isPending ? <AgendaViewEmpty /> : null}
    </div>
  );
}
