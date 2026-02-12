"use client";

import * as React from "react";

import { useWindowStack } from "./window-stack-provider";

const WINDOW_GAP = 16;
const PADDING_BOTTOM = 16;
const PADDING_TOP = 16;

/**
 * Compute bottom-aligned Y offsets for each window.
 * The first window (active/top z-index) appears at the visual bottom,
 * and each subsequent window stacks above it with negative offsets.
 *
 * @param heights - Array of window heights in stack order (active first)
 * @param gapPx - Gap between windows in pixels
 * @returns Array of Y offsets (negative values for windows above the bottom)
 */
export function computeOffsetsFromBottom(heights: number[], gapPx: number) {
  if (heights.length === 0) {
    return [];
  }

  const offsets: number[] = new Array(heights.length);

  let cumulativeHeight = 0;

  // Iterate from top to bottom (forward order)
  // First window (active) gets offset 0 (visual bottom)
  for (let i = 0; i < heights.length; i++) {
    offsets[i] = -cumulativeHeight;
    cumulativeHeight += heights[i]! + gapPx;
  }

  return offsets;
}

/**
 * Compute the total stack height including gaps.
 *
 * @param heights - Array of window heights
 * @param gapPx - Gap between windows in pixels
 * @returns Total height in pixels
 */
export function computeStackHeight(heights: number[], gapPx: number) {
  if (heights.length === 0) {
    return 0;
  }

  const totalHeights = heights.reduce((sum, h) => sum + h, 0);
  const totalGaps = gapPx * (heights.length - 1);

  return totalHeights + totalGaps;
}

interface WindowLayoutContextValue {
  contentHeight: number;
  depths: number[];
  offsets: number[];
  setMeasuredHeight: (id: string, height: number) => void;
  removeMeasuredHeight: (id: string) => void;
}

const WindowLayoutContext =
  React.createContext<WindowLayoutContextValue | null>(null);

interface WindowLayoutProviderProps {
  children: React.ReactNode;
}

export function WindowLayoutProvider({ children }: WindowLayoutProviderProps) {
  "use memo";

  const manager = useWindowStack();

  const [measuredHeights, setMeasuredHeights] = React.useState<
    Record<string, number>
  >({});

  const setMeasuredHeight = (id: string, height: number) => {
    setMeasuredHeights((prev) =>
      prev[id] === height ? prev : { ...prev, [id]: height },
    );
  };

  const removeMeasuredHeight = (id: string) => {
    setMeasuredHeights((prev) => {
      const next = { ...prev };

      delete next[id];

      return next;
    });
  };

  // Compute heights array in display order
  const heights = manager.arrangedWindows.map(
    (entry) => measuredHeights[entry.id] ?? 0,
  );

  // Compute bottom-aligned offsets for expanded mode
  const offsets = computeOffsetsFromBottom(heights, WINDOW_GAP);

  // Compute total stack height for scroll container
  const stackHeight = computeStackHeight(heights, WINDOW_GAP);

  const contentHeight = stackHeight + PADDING_TOP + PADDING_BOTTOM + 16; // +16 for bottom-4 positioning

  // Compute stack depths for stacked mode (0 = active, 1+ = behind)
  const depths = manager.arrangedWindows.map((entry, index) =>
    entry.id === manager.activeWindowId ? 0 : index,
  );

  const value: WindowLayoutContextValue = {
    contentHeight,
    depths,
    offsets,
    setMeasuredHeight,
    removeMeasuredHeight,
  };

  return (
    <WindowLayoutContext.Provider value={value}>
      {children}
    </WindowLayoutContext.Provider>
  );
}

export function useWindowLayout() {
  "use memo";

  const context = React.useContext(WindowLayoutContext);

  if (!context) {
    throw new Error(
      "useWindowLayout must be used within a WindowLayoutProvider",
    );
  }

  return context;
}

export function useWindow() {
  "use memo";

  return React.use(WindowLayoutContext);
}
