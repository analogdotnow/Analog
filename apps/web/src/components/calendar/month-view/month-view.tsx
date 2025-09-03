"use client";

import * as React from "react";
import { format } from "date-fns";
import { isWithinInterval } from "interval-temporal";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  isWeekend,
  startOfMonth,
  startOfWeek,
  toDate,
} from "@repo/temporal";

import {
  CalendarSettings,
  calendarSettingsAtom,
} from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { DefaultStartHour } from "@/components/calendar/constants";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import { useMultiDayOverflow } from "@/components/calendar/hooks/use-multi-day-overflow";
import { DroppableCell } from "@/components/calendar/month-view/droppable-cell";
import { OverflowIndicator } from "@/components/calendar/overflow/overflow-indicator";
import {
  getWeekDays,
  isWeekendIndex,
} from "@/components/calendar/utils/date-time";
import { getEventsStartingOnPlainDate } from "@/components/calendar/utils/event";
import { getGridPosition } from "@/components/calendar/utils/multi-day-layout";
import { cn, groupArrayIntoChunks } from "@/lib/utils";
import { createDraftEvent } from "@/lib/utils/calendar";
import { DragAwareWrapper } from "../event/drag-aware-wrapper";
import { EventCollectionItem } from "../hooks/event-collection";
import { useDoubleClickToCreate } from "../hooks/use-double-click-to-create";
import {
  useEventCollection,
  type EventCollectionForMonth,
} from "../hooks/use-event-collection";
import { useGridLayout } from "../hooks/use-grid-layout";
import { useCreateDraftAction } from "../hooks/use-optimistic-mutations";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthViewProps {
  currentDate: Temporal.PlainDate;
  events: EventCollectionItem[];
}

export function MonthView({ currentDate, events }: MonthViewProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  const { days, weeks } = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, {
      weekStartsOn: settings.weekStartsOn,
    });
    const calendarEnd = endOfWeek(monthEnd, {
      weekStartsOn: settings.weekStartsOn,
    });

    const allDays = eachDayOfInterval(calendarStart, calendarEnd);

    const weeksResult = groupArrayIntoChunks(allDays, 7);

    return { days: allDays, weeks: weeksResult };
  }, [currentDate, settings.weekStartsOn]);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const gridTemplateColumns = useGridLayout(getWeekDays(currentDate));
  const eventCollection = useEventCollection(events, days, "month");

  const rows = weeks.length;

  return (
    <div data-slot="month-view" className="min-w-0 h-full isolate">
      <MonthViewHeader style={{ gridTemplateColumns }} />
      <div
        ref={containerRef}
        className="grid h-[calc(100%-37px)] min-w-0 flex-1 auto-rows-fr overflow-hidden"
        style={{ position: "relative", zIndex: 1 }}
      >
        {weeks.map((week, weekIndex) => {
          return (
            <MemorizedMonthViewWeek
              key={weekIndex}
              week={week}
              weekIndex={weekIndex}
              rows={rows}
              gridTemplateColumns={gridTemplateColumns}
              eventCollection={eventCollection}
              settings={settings}
              containerRef={containerRef}
              currentDate={currentDate}
            />
          );
        })}
      </div>
    </div>
  );
}

type MonthViewHeaderProps = React.ComponentProps<"div">;

function MonthViewHeader(props: MonthViewHeaderProps) {
  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const settings = useAtomValue(calendarSettingsAtom);

  const weekDays = React.useMemo(() => {
    return [
      ...WEEKDAYS.slice(settings.weekStartsOn),
      ...WEEKDAYS.slice(0, settings.weekStartsOn),
    ];
  }, [settings.weekStartsOn]);

  return (
    <div
      className="grid justify-items-stretch border-b border-border/70 transition-[grid-template-columns] duration-200 ease-linear"
      {...props}
    >
      {weekDays.map((day, index) => {
        const isDayVisible =
          viewPreferences.showWeekends || !isWeekendIndex(index);

        return (
          <div
            key={day}
            className={cn(
              "relative py-2 text-center text-sm text-muted-foreground/70",
              !isDayVisible && "w-0",
            )}
            style={{ visibility: isDayVisible ? "visible" : "hidden" }}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

interface MonthViewWeekItemProps {
  week: Temporal.PlainDate[];
  weekIndex: number;
  rows: number;
  gridTemplateColumns: string;
  eventCollection: EventCollectionForMonth;

  settings: CalendarSettings;
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentDate: Temporal.PlainDate;
}

function MonthViewWeek({
  week,
  weekIndex,
  rows,
  gridTemplateColumns,
  eventCollection,
  settings,
  containerRef,
  currentDate,
}: MonthViewWeekItemProps) {
  const weekRef = React.useRef<HTMLDivElement>(null);
  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const weekStart = week[0]!;
  const weekEnd = week[6]!;

  const weekEvents = React.useMemo(() => {
    // Collect all events from the event collection - treat ALL events as multi-day
    const allEvents: EventCollectionItem[] = [];
    eventCollection.eventsByDay.forEach((dayEvents) => {
      allEvents.push(...dayEvents.allEvents);
    });
    const uniqueEvents = allEvents.filter(
      (event, index, self) =>
        index === self.findIndex((e) => e.event.id === event.event.id),
    );

    // Include ALL events in the multi-day lane, not just spanning events
    return uniqueEvents.filter((item) => {
      const eventStart = item.start.toPlainDate();
      const eventEnd = item.end.toPlainDate();

      // All-day events have an exclusive end; subtract one day so the final day is included

      // Check if event is within the week range
      const isInWeek =
        isWithinInterval(eventStart, { start: weekStart, end: weekEnd }) ||
        isWithinInterval(eventEnd, { start: weekStart, end: weekEnd });

      if (!isInWeek) {
        return false;
      }

      // If weekends are hidden, exclude events that only occur on weekends
      if (!viewPreferences.showWeekends) {
        // Get all days that this event spans within the week
        const eventDays = eachDayOfInterval(
          isBefore(eventStart, weekStart) ? weekStart : eventStart,
          isAfter(eventEnd, weekEnd) ? weekEnd : eventEnd,
        );

        // Check if event has at least one day that's not a weekend
        const hasNonWeekendDay = eventDays.some((day) => !isWeekend(day));

        if (!hasNonWeekendDay) {
          return false;
        }
      }

      return true;
    });
  }, [
    eventCollection.eventsByDay,
    viewPreferences.showWeekends,
    weekStart,
    weekEnd,
  ]);

  const overflowRef = React.useRef<HTMLDivElement | null>(null);
  // Use overflow hook to manage event display
  const overflow = useMultiDayOverflow({
    events: weekEvents,
    timeZone: settings.defaultTimeZone,
    containerRef: overflowRef,
  });

  console.log("overflow", JSON.stringify(overflow, null, 2));

  return (
    <div
      key={`week-${weekIndex}`}
      ref={weekRef}
      className="relative grid min-w-0 transition-[grid-template-columns] duration-200 ease-linear [&:last-child>*]:border-b-0"
      style={{ gridTemplateColumns }}
    >
      {/* 1. Day cells */}
      {week.map((day, dayIndex) => (
        <MemoizedMonthViewDay
          key={day.toString()}
          day={day}
          dayIndex={dayIndex}
          overflow={overflow}
          currentDate={currentDate}
          overflowRef={overflowRef}
        />
      ))}

      {/* 2. Multi-day event overlay */}
      <div
        // ref={overflow.containerRef}
        className="pointer-events-none absolute inset-x-0 top-7.5 bottom-0 grid min-w-0 auto-rows-max"
        style={{ gridTemplateColumns }}
      >
        {/* Render only visible events */}
        {overflow.capacityInfo.visibleLanes.map((lane, y) =>
          lane.map((item) => {
            return (
              <MemoizedPositionedEvent
                rows={rows}
                key={item.event.id}
                y={y}
                item={item}
                weekStart={weekStart}
                weekEnd={weekEnd}
                containerRef={containerRef}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

const MemorizedMonthViewWeek = React.memo(
  MonthViewWeek,
  (prevProps, nextProps) => {
    // Deep comparison for week array
    if (prevProps.week.length !== nextProps.week.length) return false;
    for (let i = 0; i < prevProps.week.length; i++) {
      if (!prevProps.week[i]!.equals(nextProps.week[i]!)) return false;
    }

    // Compare other props
    return (
      prevProps.weekIndex === nextProps.weekIndex &&
      prevProps.rows === nextProps.rows &&
      prevProps.gridTemplateColumns === nextProps.gridTemplateColumns &&
      prevProps.eventCollection === nextProps.eventCollection &&
      prevProps.settings === nextProps.settings &&
      prevProps.containerRef === nextProps.containerRef &&
      prevProps.currentDate.equals(nextProps.currentDate)
    );
  },
);

// Also memoize MonthViewDay to prevent unnecessary re-renders
const MemoizedMonthViewDay = React.memo(
  MonthViewDay,
  (prevProps, nextProps) => {
    return (
      prevProps.day.equals(nextProps.day) &&
      prevProps.dayIndex === nextProps.dayIndex &&
      prevProps.overflow === nextProps.overflow &&
      prevProps.currentDate.equals(nextProps.currentDate)
    );
  },
);

interface MonthViewDayProps {
  day: Temporal.PlainDate;
  dayIndex: number;
  overflow: ReturnType<typeof useMultiDayOverflow>;
  overflowRef: React.RefObject<HTMLDivElement | null>;
  currentDate: Temporal.PlainDate;
}

function MonthViewDay({
  day,
  dayIndex,
  overflow,
  overflowRef,
  currentDate,
}: MonthViewDayProps) {
  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const settings = useAtomValue(calendarSettingsAtom);
  const createDraftAction = useCreateDraftAction();

  const handleDayClick = React.useCallback(() => {
    const start = day.toZonedDateTime({
      timeZone: settings.defaultTimeZone,
      plainTime: { hour: DefaultStartHour, minute: 0 },
    });
    const end = start.add({ hours: 1 });

    createDraftAction(createDraftEvent({ start, end }));
  }, [day, createDraftAction, settings.defaultTimeZone]);

  const cellRef = React.useRef<HTMLDivElement>(null);

  const onDoubleClick = useDoubleClickToCreate({
    date: currentDate,
    columnRef: cellRef,
  });

  if (!day) return null;

  const isCurrentMonth = isSameMonth(day, currentDate);
  const isDayVisible = viewPreferences.showWeekends || !isWeekend(day);

  // Determine if this day is in the last visible column
  const isLastVisibleColumn = viewPreferences.showWeekends
    ? dayIndex === 6 // Saturday is last when weekends shown
    : dayIndex === 5; // Friday is last when weekends hidden

  const cellId = `month-cell-${day.toString()}`;

  // Filter overflow events to only show those that start on this day
  const dayOverflowEvents = getEventsStartingOnPlainDate(
    overflow.overflowEvents,
    day,
  );

  const hasOverflowForDay = dayOverflowEvents.length > 0;

  const legacyDay = toDate(day, { timeZone: settings.defaultTimeZone });

  return (
    <div
      ref={cellRef}
      onDoubleClick={onDoubleClick}
      className={cn(
        "group relative min-w-0 border-b border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70",
        !isLastVisibleColumn && "border-r",
        !isDayVisible && "w-0",
      )}
      data-today={
        isToday(day, { timeZone: settings.defaultTimeZone }) || undefined
      }
      data-outside-cell={!isCurrentMonth || undefined}
      style={{
        visibility: isDayVisible ? "visible" : "hidden",
      }}
    >
      <DroppableCell
        id={cellId}
        onClick={handleDayClick}
        className="flex justify-between"
      >
        <div className="relative mt-1 ml-0.5 inline-flex size-6 items-center justify-center rounded-full text-sm group-data-today:bg-primary group-data-today:text-primary-foreground">
          {format(legacyDay, "d")}
        </div>

        <div
          className="flex grow flex-col justify-end place-self-stretch"
          ref={overflowRef}
        ></div>

        {/* Show overflow indicator for this day if there are overflow events that start on this day */}
        {hasOverflowForDay ? (
          <div className="pointer-events-auto z-10 flex flex-col items-center place-self-stretch pb-1">
            <OverflowIndicator
              items={dayOverflowEvents}
              date={day}
              className=""
            />
          </div>
        ) : null}
      </DroppableCell>
    </div>
  );
}

interface PositionedEventProps {
  y: number;
  item: EventCollectionItem;
  weekStart: Temporal.PlainDate;
  weekEnd: Temporal.PlainDate;
  containerRef: React.RefObject<HTMLDivElement | null>;
  rows: number;
}
function PositionedEvent({
  y,
  item,
  weekStart,
  weekEnd,
  containerRef,
  rows,
}: PositionedEventProps) {
  const { colStart, span } = React.useMemo(
    () => getGridPosition(item, weekStart, weekEnd),
    [item, weekStart, weekEnd],
  );

  // Calculate actual first/last day based on event dates
  const eventStart = item.start.toPlainDate();
  const eventEnd = item.end.toPlainDate();

  // For single-day events, ensure they are properly marked as first and last day
  const isFirstDay =
    isAfter(eventStart, weekStart) || isSameDay(eventStart, weekStart);
  const isLastDay = isBefore(eventEnd, weekEnd) || isSameDay(eventEnd, weekEnd);

  return (
    <DragAwareWrapper
      key={item.event.id}
      eventId={item.event.id}
      className="pointer-events-auto my-[1px] min-w-0"
      style={{
        gridColumn: `${colStart + 1} / span ${span}`,
        gridRow: y + 1,
      }}
    >
      <DraggableEvent
        item={item}
        view="month"
        containerRef={containerRef}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        rows={rows}
      />
    </DragAwareWrapper>
  );
}

// Memoize PositionedEvent to prevent unnecessary re-renders
const MemoizedPositionedEvent = React.memo(
  PositionedEvent,
  (prevProps, nextProps) => {
    return (
      prevProps.y === nextProps.y &&
      prevProps.item === nextProps.item &&
      prevProps.weekStart.equals(nextProps.weekStart) &&
      prevProps.weekEnd.equals(nextProps.weekEnd) &&
      prevProps.containerRef === nextProps.containerRef &&
      prevProps.rows === nextProps.rows
    );
  },
);
