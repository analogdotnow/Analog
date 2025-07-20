"use client";

import * as React from "react";
import { format } from "date-fns";
import { isWithinInterval } from "interval-temporal";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";
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
} from "@repo/temporal/v2";

import {
  CalendarSettings,
  useCalendarSettings,
  useViewPreferences,
} from "@/atoms";
import {
  DraggableEvent,
  DroppableCell,
  type CalendarEvent,
} from "@/components/event-calendar";
import { DefaultStartHour } from "@/components/event-calendar/constants";
import {
  useEventCollection,
  useGridLayout,
  type EventCollectionForMonth,
} from "@/components/event-calendar/hooks";
import { useMultiDayOverflow } from "@/components/event-calendar/hooks/use-multi-day-overflow";
import type { Action } from "@/components/event-calendar/hooks/use-optimistic-events";
import { OverflowIndicator } from "@/components/event-calendar/overflow-indicator";
import {
  getEventsStartingOnPlainDate,
  getGridPosition,
  getWeekDays,
  isWeekendIndex,
} from "@/components/event-calendar/utils";
import { cn, groupArrayIntoChunks } from "@/lib/utils";
import { createDraftEvent } from "@/lib/utils/calendar";
import { EventCollectionItem } from "../hooks/event-collection";
import { useDoubleClickToCreate } from "../hooks/use-double-click-to-create";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthViewProps {
  currentDate: Temporal.PlainDate;
  events: EventCollectionItem[];
  dispatchAction: (action: Action) => void;
}

export function MonthView({
  currentDate,
  events,
  dispatchAction,
}: MonthViewProps) {
  const settings = useCalendarSettings();

  // Memoize dispatchAction to prevent cascading re-renders
  const memoizedDispatchAction = React.useCallback(dispatchAction, [
    dispatchAction,
  ]);

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
    <div data-slot="month-view" className="contents min-w-0">
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
              dispatchAction={memoizedDispatchAction}
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
  const viewPreferences = useViewPreferences();
  const settings = useCalendarSettings();

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
  dispatchAction: (action: Action) => void;
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
  dispatchAction,
  settings,
  containerRef,
  currentDate,
}: MonthViewWeekItemProps) {
  const weekRef = React.useRef<HTMLDivElement>(null);
  const viewPreferences = useViewPreferences();
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

  // Use overflow hook to manage event display
  const overflow = useMultiDayOverflow({
    events: weekEvents,
    timeZone: settings.defaultTimeZone,
  });

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
          rows={rows}
          weekIndex={weekIndex}
          dayIndex={dayIndex}
          overflow={overflow}
          dispatchAction={dispatchAction}
          currentDate={currentDate}
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
          lane.map((evt) => {
            return (
              <MemoizedPositionedEvent
                rows={rows}
                key={evt.event.id}
                y={y}
                evt={evt}
                weekStart={weekStart}
                weekEnd={weekEnd}
                settings={settings}
                dispatchAction={dispatchAction}
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
      prevProps.dispatchAction === nextProps.dispatchAction &&
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
      prevProps.rows === nextProps.rows &&
      prevProps.weekIndex === nextProps.weekIndex &&
      prevProps.dayIndex === nextProps.dayIndex &&
      prevProps.overflow === nextProps.overflow &&
      prevProps.dispatchAction === nextProps.dispatchAction &&
      prevProps.currentDate.equals(nextProps.currentDate)
    );
  },
);

interface MonthViewDayProps {
  day: Temporal.PlainDate;
  rows: number;
  weekIndex: number;
  dayIndex: number;
  overflow: ReturnType<typeof useMultiDayOverflow>;
  dispatchAction: (action: Action) => void;
  currentDate: Temporal.PlainDate;
}

function MonthViewDay({
  day,
  overflow,
  dispatchAction,
  currentDate,
}: MonthViewDayProps) {
  const viewPreferences = useViewPreferences();
  const settings = useCalendarSettings();

  const handleDayClick = React.useCallback(() => {
    const start = day.toZonedDateTime({
      timeZone: settings.defaultTimeZone,
      plainTime: { hour: DefaultStartHour, minute: 0 },
    });
    const end = start.add({ hours: 1 });

    dispatchAction({ type: "draft", event: createDraftEvent({ start, end }) });
  }, [day, dispatchAction, settings.defaultTimeZone]);

  const cellRef = React.useRef<HTMLDivElement>(null);

  const { onDoubleClick } = useDoubleClickToCreate({
    dispatchAction,
    date: currentDate,
    columnRef: cellRef,
  });

  if (!day) return null;

  const isCurrentMonth = isSameMonth(day, currentDate);
  const isDayVisible = viewPreferences.showWeekends || !isWeekend(day);
  // const isReferenceCell = weekIndex === 0 && dayIndex === 0;
  const cellId = `month-cell-${day.toString()}`;

  // Filter overflow events to only show those that start on this day
  const dayOverflowEvents = getEventsStartingOnPlainDate(
    overflow.overflowEvents,
    day,
    settings.defaultTimeZone,
  );

  const hasOverflowForDay = dayOverflowEvents.length > 0;

  const legacyDay = toDate({ value: day, timeZone: settings.defaultTimeZone });

  return (
    <div
      ref={cellRef}
      onDoubleClick={onDoubleClick}
      className={cn(
        "group relative min-w-0 border-r border-b border-border/70 last:border-r-0 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70",
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
          ref={overflow.containerRef}
        ></div>

        {/* Show overflow indicator for this day if there are overflow events that start on this day */}
        {hasOverflowForDay && (
          <div className="pointer-events-auto z-10 flex flex-col items-center place-self-stretch pb-1">
            <OverflowIndicator
              count={dayOverflowEvents.length}
              items={dayOverflowEvents}
              date={day}
              dispatchAction={dispatchAction}
              className=""
            />
          </div>
        )}
      </DroppableCell>
    </div>
  );
}

interface PositionedEventProps {
  y: number;
  evt: EventCollectionItem;
  weekStart: Temporal.PlainDate;
  weekEnd: Temporal.PlainDate;
  settings: CalendarSettings;
  dispatchAction: (action: Action) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  rows: number;
}
function PositionedEvent({
  y,
  evt,
  weekStart,
  weekEnd,
  settings,
  dispatchAction,
  containerRef,
  rows,
}: PositionedEventProps) {
  const { colStart, span } = React.useMemo(
    () => getGridPosition(evt, weekStart, weekEnd, settings.defaultTimeZone),
    [evt, weekStart, weekEnd, settings.defaultTimeZone],
  );

  // Calculate actual first/last day based on event dates
  const eventStart = evt.start.toPlainDate();
  const eventEnd = evt.end.toPlainDate();

  // For single-day events, ensure they are properly marked as first and last day
  const isFirstDay =
    isAfter(eventStart, weekStart) || isSameDay(eventStart, weekStart);
  const isLastDay = isBefore(eventEnd, weekEnd) || isSameDay(eventEnd, weekEnd);

  const [isDragging, setIsDragging] = React.useState(false);

  const handleEventClick = React.useCallback(
    (e: React.MouseEvent, event: CalendarEvent) => {
      e.stopPropagation();
      dispatchAction({ type: "select", event });
    },
    [dispatchAction],
  );

  return (
    <div
      key={evt.event.id}
      className="pointer-events-auto my-[1px] min-w-0"
      style={{
        gridColumn: `${colStart + 1} / span ${span}`,
        gridRow: y + 1,
        position: isDragging ? "relative" : "static",
        zIndex: isDragging ? 99999 : "auto",
      }}
    >
      <DraggableEvent
        event={evt.event}
        view="month"
        containerRef={containerRef}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        onClick={(e) => handleEventClick(e, evt.event)}
        dispatchAction={dispatchAction}
        setIsDragging={setIsDragging}
        zIndex={isDragging ? 99999 : undefined}
        rows={rows}
      />
    </div>
  );
}

// Memoize PositionedEvent to prevent unnecessary re-renders
const MemoizedPositionedEvent = React.memo(
  PositionedEvent,
  (prevProps, nextProps) => {
    return (
      prevProps.y === nextProps.y &&
      prevProps.evt === nextProps.evt &&
      prevProps.weekStart.equals(nextProps.weekStart) &&
      prevProps.weekEnd.equals(nextProps.weekEnd) &&
      prevProps.settings === nextProps.settings &&
      prevProps.dispatchAction === nextProps.dispatchAction &&
      prevProps.containerRef === nextProps.containerRef &&
      prevProps.rows === nextProps.rows
    );
  },
);
