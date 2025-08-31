import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday, isWeekend } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { EventCollectionForWeek } from "@/components/calendar/hooks/use-event-collection";
import {
  useMultiDayOverflow,
  type UseMultiDayOverflowResult,
} from "@/components/calendar/hooks/use-multi-day-overflow";
import { useCreateDraftAction } from "@/components/calendar/hooks/use-optimistic-mutations";
import { OverflowIndicator } from "@/components/calendar/overflow/overflow-indicator";
import { getEventsStartingOnPlainDate } from "@/components/calendar/utils/event";
import { WeekViewAllDayEvent } from "@/components/calendar/week-view/week-view-all-day-event";
import { cn } from "@/lib/utils";
import { createDraftEvent } from "@/lib/utils/calendar";

interface WeekViewAllDaySectionProps {
  allDays: Temporal.PlainDate[];
  visibleDays: Temporal.PlainDate[];
  eventCollection: EventCollectionForWeek;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function WeekViewAllDaySection({
  allDays,
  visibleDays,
  eventCollection,
  containerRef,
}: WeekViewAllDaySectionProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  // Use overflow hook for all-day events
  const overflow = useMultiDayOverflow({
    events: eventCollection.allDayEvents,
    timeZone: settings.defaultTimeZone,
    minVisibleLanes: 10,
  });

  return (
    <div className="border-b border-border/70 [--calendar-height:100%]">
      <div className="relative grid grid-cols-(--week-view-grid) transition-[grid-template-columns] duration-200 ease-linear">
        <div className="relative flex min-h-7 flex-col justify-center border-r border-border/70">
          <span className="w-16 max-w-full ps-2 text-right text-[10px] text-muted-foreground/70 select-none sm:ps-4 sm:text-xs">
            All day
          </span>
        </div>

        {allDays.map((day) => (
          <WeekViewAllDayColumn
            key={day.toString()}
            day={day}
            isWeekend={isWeekend(day)}
            visibleDays={visibleDays}
            overflow={overflow}
          />
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 grid min-w-0 auto-rows-max grid-cols-(--week-view-grid)">
          <div />

          {overflow.capacityInfo.visibleLanes.map((lane, y) =>
            lane.map((evt) => (
              <WeekViewAllDayEvent
                key={evt.event.id}
                y={y}
                item={evt}
                weekStart={allDays[0]!}
                weekEnd={allDays[allDays.length - 1]!}
                containerRef={containerRef}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}

interface WeekViewAllDayColumnProps {
  day: Temporal.PlainDate;
  isWeekend: boolean;
  visibleDays: Temporal.PlainDate[];
  overflow: UseMultiDayOverflowResult;
}

function WeekViewAllDayColumn({
  day,
  isWeekend,
  visibleDays,
  overflow,
}: WeekViewAllDayColumnProps) {
  const settings = useAtomValue(calendarSettingsAtom);
  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const createDraftAction = useCreateDraftAction();

  const { isDayVisible, isLastVisibleDay, dayOverflowEvents } =
    React.useMemo(() => {
      const isDayVisible = viewPreferences.showWeekends || !isWeekend;
      const visibleDayIndex = visibleDays.findIndex(
        (d) => Temporal.PlainDate.compare(d, day) === 0,
      );

      const isLastVisibleDay =
        isDayVisible && visibleDayIndex === visibleDays.length - 1;

      // Filter overflow events to only show those that start on this day
      const dayOverflowEvents = getEventsStartingOnPlainDate(
        overflow.overflowEvents,
        day,
      );

      return { isDayVisible, isLastVisibleDay, dayOverflowEvents };
    }, [
      day,
      visibleDays,
      isWeekend,
      overflow.overflowEvents,
      viewPreferences.showWeekends,
    ]);

  const onClick = React.useCallback(() => {
    const start = day;

    const end = start.add({ days: 1 });

    createDraftAction(createDraftEvent({ start, end }));
  }, [day, createDraftAction]);

  return (
    <div
      key={day.toString()}
      className={cn(
        "relative border-r border-border/70",
        isLastVisibleDay && "border-r-0",
        isWeekend && "bg-column-weekend",
        isDayVisible ? "visible" : "hidden w-0",
      )}
      data-today={
        isToday(day, { timeZone: settings.defaultTimeZone }) || undefined
      }
      onClick={onClick}
    >
      {/* Reserve space for multi-day events */}
      <div
        className="min-h-7"
        style={{
          paddingTop: `${overflow.capacityInfo.totalLanes * 28}px`, // 24px event height + 4px gap
        }}
        ref={overflow.containerRef}
      />

      {/* Show overflow indicator for this day if there are overflow events that start on this day */}
      {dayOverflowEvents.length > 0 ? (
        <div className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 transform">
          <OverflowIndicator
            items={dayOverflowEvents}
            date={day}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground shadow-md transition-colors hover:bg-muted/80"
          />
        </div>
      ) : null}
    </div>
  );
}
