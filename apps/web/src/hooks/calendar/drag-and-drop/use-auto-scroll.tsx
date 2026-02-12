import * as React from "react";

import { getCalendarStore } from "@/providers/calendar-store-provider";

const HORIZONTAL_EDGE_ZONE = 64;
const HORIZONTAL_MAX_SPEED = 12;

function parsePxValue(value: string) {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

interface UseEdgeAutoScrollOptions {
  headerRef?: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
  /**
   * Top edge trigger zone starts below the header and extends topThreshold px down.
   * Default: 96.
   */
  topThreshold?: number;
  /**
   * Bottom edge trigger zone is when y is within bottomThreshold px from the bottom edge.
   * Default: 48.
   */
  bottomThreshold?: number;
  maxSpeed?: number;
}

export function useEdgeAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseEdgeAutoScrollOptions,
) {
  const {
    enabled = true,
    topThreshold = 96,
    bottomThreshold = 48,
    maxSpeed = 2,
    headerRef,
  } = options;

  // Helper to read current drag / resize status without subscribing React state
  const isActive = React.useCallback(() => {
    const state = getCalendarStore().getState();
    return (
      enabled && (state.isDragging || state.draggingEventId || state.isResizing)
    );
  }, [enabled]);

  // Animation frame id
  const frame = React.useRef<number | null>(null);
  // Latest pointer position
  const pointerX = React.useRef(0);
  const pointerY = React.useRef(0);

  const verticalDirection = React.useRef<"up" | "down" | null>(null);
  // Handle to the delay timer before vertical auto-scroll starts
  const delayTimeout = React.useRef<number | null>(null);
  // Whether the vertical auto-scroll loop is currently running
  const isVerticalScrolling = React.useRef(false);

  React.useEffect(() => {
    const element = containerRef.current;

    if (!element || !enabled) {
      return;
    }

    const header = headerRef?.current;

    const clearDelay = () => {
      if (delayTimeout.current !== null) {
        clearTimeout(delayTimeout.current);
        delayTimeout.current = null;
      }
    };

    const startLoop = () => {
      if (frame.current === null) {
        frame.current = requestAnimationFrame(step);
      }
    };

    const stopLoop = () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }

      isVerticalScrolling.current = false;
      verticalDirection.current = null;
      clearDelay();
    };

    const onPointerMove = (e: PointerEvent) => {
      // Only handle events when dragging or resizing is active
      if (!isActive()) {
        stopLoop();
        return;
      }

      pointerX.current = e.clientX;
      pointerY.current = e.clientY;

      const rect = element.getBoundingClientRect();

      // Abort if pointer is outside container horizontally
      if (e.clientX < rect.left || e.clientX > rect.right) {
        stopLoop();
        return;
      }

      const y = e.clientY - rect.top;
      const headerHeight = header?.clientHeight ?? 0;
      const currentTopEnd = headerHeight + topThreshold;

      let desiredDir: "up" | "down" | null = null;

      if (y > headerHeight && y < currentTopEnd) {
        desiredDir = "up";
      } else if (y > rect.height - bottomThreshold) {
        desiredDir = "down";
      }

      if (desiredDir !== verticalDirection.current) {
        clearDelay();

        if (isVerticalScrolling.current) {
          isVerticalScrolling.current = false;
        }

        verticalDirection.current = desiredDir;

        if (desiredDir !== null) {
          delayTimeout.current = window.setTimeout(() => {
            isVerticalScrolling.current = true;
            startLoop();
          }, 200);
        }
      }

      // Always start the loop when active (for horizontal scrolling)
      startLoop();
    };

    const step = () => {
      if (!isActive()) {
        stopLoop();
        return;
      }

      const rect = element.getBoundingClientRect();
      let needsNextFrame = false;

      // --- Vertical scrolling (with delay) ---
      if (isVerticalScrolling.current && verticalDirection.current !== null) {
        const headerHeight = header?.clientHeight ?? 0;
        const currentTopEnd = headerHeight + topThreshold;

        const distance =
          verticalDirection.current === "up"
            ? currentTopEnd - (pointerY.current - rect.top)
            : pointerY.current - (rect.bottom - bottomThreshold);

        const zoneSize =
          verticalDirection.current === "up" ? topThreshold : bottomThreshold;
        const ratio = Math.min(distance / zoneSize, 1);
        const delta =
          (verticalDirection.current === "up" ? -1 : 1) * ratio * maxSpeed;

        element.scrollBy({ top: delta });
        needsNextFrame = true;
      }

      // --- Horizontal scrolling (no delay) ---
      const x = pointerX.current;
      const y = pointerY.current;

      if (y >= rect.top && y <= rect.bottom) {
        const scrollPaddingStart = parsePxValue(
          getComputedStyle(element).scrollPaddingInlineStart,
        );
        const leftEdge = rect.left + scrollPaddingStart;
        const rightEdge = rect.right;

        if (x >= leftEdge && x <= rightEdge) {
          let horizontalDelta = 0;

          if (x < leftEdge + HORIZONTAL_EDGE_ZONE) {
            const ratio =
              (leftEdge + HORIZONTAL_EDGE_ZONE - x) / HORIZONTAL_EDGE_ZONE;
            horizontalDelta = -Math.max(1, ratio * HORIZONTAL_MAX_SPEED);
          } else if (x > rightEdge - HORIZONTAL_EDGE_ZONE) {
            const ratio =
              (x - (rightEdge - HORIZONTAL_EDGE_ZONE)) / HORIZONTAL_EDGE_ZONE;
            horizontalDelta = Math.max(1, ratio * HORIZONTAL_MAX_SPEED);
          }

          if (horizontalDelta !== 0) {
            element.scrollBy({ left: horizontalDelta });
            needsNextFrame = true;
          }
        }
      }

      if (needsNextFrame) {
        frame.current = requestAnimationFrame(step);
      } else {
        frame.current = null;
      }
    };

    const abortController = new AbortController();

    window.addEventListener("pointermove", onPointerMove, {
      signal: abortController.signal,
    });
    window.addEventListener("pointerleave", stopLoop, {
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
      stopLoop();
    };
  }, [
    isActive,
    bottomThreshold,
    maxSpeed,
    containerRef,
    headerRef,
    topThreshold,
    enabled,
  ]);
}
