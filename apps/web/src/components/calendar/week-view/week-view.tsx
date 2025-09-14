"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { isWeekend } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { currentDateAtom, viewPreferencesAtom } from "@/atoms/view-preferences";
import { useEdgeAutoScroll } from "@/components/calendar/hooks/drag-and-drop/use-auto-scroll";
import type { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { useEventCollection } from "@/components/calendar/hooks/use-event-collection";
import { useGridLayout } from "@/components/calendar/hooks/use-grid-layout";
import { TimeIndicatorBackground } from "@/components/calendar/timeline/time-indicator";
import { Timeline } from "@/components/calendar/timeline/timeline";
import { getWeek } from "@/components/calendar/utils/date-time";
import { useScrollToCurrentTime } from "./use-scroll-to-current-time";
import { WeekViewAllDaySection } from "./week-view-all-day-section";
import { WeekViewDayColumn } from "./week-view-column";
import { WeekViewHeader } from "./week-view-header";

interface WeekViewProps extends React.ComponentProps<"div"> {
  events: EventCollectionItem[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function WeekView({
  events,
  scrollContainerRef,
  ...props
}: WeekViewProps) {
  const currentDate = useAtomValue(currentDateAtom);
  const viewPreferences = useAtomValue(viewPreferencesAtom);

  const settings = useAtomValue(calendarSettingsAtom);
  const { week, visibleDays } = React.useMemo(() => {
    const week = getWeek(currentDate, settings.weekStartsOn);

    if (!viewPreferences.showWeekends) {
      return {
        week,
        visibleDays: week.days.filter((day) => !isWeekend(day)),
      };
    }

    return {
      week,
      visibleDays: week.days,
    };
  }, [currentDate, settings.weekStartsOn, viewPreferences.showWeekends]);

  const gridTemplateColumns = useGridLayout(week.days, {
    includeTimeColumn: true,
  });

  const eventCollection = useEventCollection(events, visibleDays, "week");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  useEdgeAutoScroll(scrollContainerRef, { headerRef });

  const scrollToCurrentTime = useScrollToCurrentTime({ scrollContainerRef });

  React.useEffect(() => {
    scrollToCurrentTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      data-slot="week-view"
      className="isolate flex flex-col"
      style={{ "--week-view-grid": gridTemplateColumns } as React.CSSProperties}
      {...props}
    >
      <div
        ref={headerRef}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-md"
      >
        <WeekViewHeader allDays={week.days} />
        <WeekViewAllDaySection
          allDays={week.days}
          visibleDays={visibleDays}
          eventCollection={eventCollection}
          containerRef={containerRef}
        />
      </div>

      <div
        ref={containerRef}
        className="relative isolate grid flex-1 grid-cols-(--week-view-grid) overflow-hidden transition-[grid-template-columns] duration-200 ease-linear"
      >
        <TimeIndicatorBackground />
        <Timeline />
        {week.days.map((date) => (
          <WeekViewDayColumn
            key={date.toString()}
            date={date}
            visibleDays={visibleDays}
            eventCollection={eventCollection}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}
