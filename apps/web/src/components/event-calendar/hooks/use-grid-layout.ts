import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import { isWeekend } from "@repo/temporal/v2";

import { useViewPreferences } from "@/atoms";

interface GridLayoutOptions {
  /**
   * Include a time column at the start (for week view)
   * When true, adds "6rem" as the first column
   */
  includeTimeColumn?: boolean;
  /**
   * Custom time column width (defaults to "6rem")
   */
  timeColumnWidth?: string;
}

/**
 * Hook for calculating grid template columns based on weekend visibility preferences
 *
 * @param days - Array of Date objects representing the days to display
 * @param options - Configuration options for the grid layout
 * @returns CSS grid-template-columns string
 */
export function useGridLayout(
  days: Temporal.PlainDate[],
  options: GridLayoutOptions = {},
) {
  const { includeTimeColumn = false, timeColumnWidth = "5rem" } = options;

  const viewPreferences = useViewPreferences();

  const gridTemplateColumns = useMemo(() => {
    const columnSizes = days.map((day) => {
      // A day is visible if either the user wants to show weekends or the day is **not** a weekend.
      // We always rely on the actual `Date` object instead of a numeric index so that the check works
      // regardless of what day the week starts on (Monday-first, Sunday-first, etc.).
      const isDayVisible = viewPreferences.showWeekends || !isWeekend(day);

      return isDayVisible ? "minmax(0,1fr)" : "0fr";
    });

    const dayColumns = columnSizes.join(" ");

    return includeTimeColumn ? `${timeColumnWidth} ${dayColumns}` : dayColumns;
  }, [days, viewPreferences.showWeekends, includeTimeColumn, timeColumnWidth]);

  return gridTemplateColumns;
}
