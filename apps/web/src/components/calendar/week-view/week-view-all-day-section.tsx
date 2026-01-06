import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday, isWeekend } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { useDoubleClickToCreate } from "@/components/calendar/hooks/drag-and-drop/use-double-click-to-create";
import { WeekEventCollection } from "@/components/calendar/hooks/use-event-collection";
import {
  useMultiDayOverflow,
  type UseMultiDayOverflowResult,
} from "@/components/calendar/hooks/use-multi-day-overflow";
import { useUnselectAllAction } from "@/components/calendar/hooks/use-optimistic-mutations";
import { OverflowIndicator } from "@/components/calendar/overflow/overflow-indicator";
import { eventsStartingOn } from "@/components/calendar/utils/event";
import { WeekViewAllDayEvent } from "@/components/calendar/week-view/week-view-all-day-event";
import { cn } from "@/lib/utils";

interface WeekViewAllDaySectionProps {
  allDays: Temporal.PlainDate[];
  visibleDays: Temporal.PlainDate[];
  eventCollection: WeekEventCollection;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function WeekViewAllDaySection({
  allDays,
  visibleDays,
  eventCollection,
  containerRef,
}: WeekViewAllDaySectionProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  const overflowRef = React.useRef<HTMLDivElement | null>(null);

  const overflow = useMultiDayOverflow({
    events: eventCollection.allDayEvents,
    timeZone: settings.defaultTimeZone,
    containerRef: overflowRef,
    minVisibleLanes: 10,
  });

  return (
    <div className="border-b border-border/70 [--calendar-height:100%]">
      <div className="relative grid grid-cols-(--week-view-grid) transition-[grid-template-columns] duration-200 ease-linear">
        <div className="relative flex min-h-7 flex-col justify-center border-r border-border/70">
          <span className="pe-3 text-right text-[10px] text-muted-foreground/70 select-none sm:pe-4 sm:text-xs">
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
            overflowRef={overflowRef}
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
                columns={visibleDays.length}
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
  overflowRef: React.RefObject<HTMLDivElement | null>;
}

function WeekViewAllDayColumn({
  day,
  isWeekend,
  visibleDays,
  overflow,
  overflowRef,
}: WeekViewAllDayColumnProps) {
  const viewPreferences = useAtomValue(viewPreferencesAtom);

  const { isDayVisible, isLastVisibleDay, dayOverflowEvents } =
    React.useMemo(() => {
      const isDayVisible = viewPreferences.showWeekends || !isWeekend;
      const visibleDayIndex = visibleDays.findIndex(
        (d) => Temporal.PlainDate.compare(d, day) === 0,
      );

      const isLastVisibleDay =
        isDayVisible && visibleDayIndex === visibleDays.length - 1;

      // Filter overflow events to only show those that start on this day
      const dayOverflowEvents = eventsStartingOn(overflow.overflowEvents, day);

      return { isDayVisible, isLastVisibleDay, dayOverflowEvents };
    }, [
      day,
      visibleDays,
      isWeekend,
      overflow.overflowEvents,
      viewPreferences.showWeekends,
    ]);

  const onDoubleClick = useDoubleClickToCreate({
    date: day,
    allDay: true,
  });

  const unselectAllAction = useUnselectAllAction();

  const onBackgroundClick = React.useCallback(() => {
    unselectAllAction();
  }, [unselectAllAction]);

  return (
    <div
      key={day.toString()}
      className={cn(
        "relative border-r border-border/70",
        isLastVisibleDay && "border-r-0",
        isWeekend && "bg-column-weekend",
        isDayVisible ? "visible" : "hidden w-0",
      )}
      onDoubleClick={onDoubleClick}
      onClick={onBackgroundClick}
    >
      {/* Reserve space for multi-day events */}
      <div
        className="min-h-7"
        style={{
          paddingTop: `${overflow.capacityInfo.totalLanes * 28}px`, // 24px event height + 4px gap
        }}
        ref={overflowRef}
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
