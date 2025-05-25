"use client";

import { CalendarView } from "./types";
import { getViewTitleData } from "./utils";

interface CalendarViewTitleProps {
  currentDate: Date;
  view: CalendarView;
  className?: string;
}

/**
 * Component that renders the calendar view title with responsive breakpoints
 */
export function CalendarViewTitle({
  currentDate,
  view,
  className,
}: CalendarViewTitleProps) {
  const titleData = getViewTitleData(currentDate, view);

  if (view === "day") {
    return (
      <h2 className={className}>
        <span className="min-[480px]:hidden" aria-hidden="true">
          {titleData.short}
        </span>
        <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
          {titleData.medium}
        </span>
        <span className="max-md:hidden">{titleData.full}</span>
      </h2>
    );
  }

  return (
    <h2 className={className}>
      <span className="md:hidden" aria-hidden="true">
        {titleData.short}
      </span>
      <span className="max-md:hidden">{titleData.full}</span>
    </h2>
  );
}
