"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { Temporal } from "temporal-polyfill";

import { toDate, toDateWeekStartsOn } from "@repo/temporal";

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
import type { Action } from "@/components/event-calendar/hooks/use-event-operations";
import { useMultiDayOverflow } from "@/components/event-calendar/hooks/use-multi-day-overflow";
import { OverflowIndicator } from "@/components/event-calendar/overflow-indicator";
import {
  getGridPosition,
  isWeekend,
  placeIntoLanes,
} from "@/components/event-calendar/utils";
import { DraftEvent } from "@/lib/interfaces";
import { cn, groupArrayIntoChunks } from "@/lib/utils";
import { createDraftEvent } from "@/lib/utils/calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthViewContextType {
  currentDate: Date;
  days: Date[];
  weeks: Date[][];
  gridTemplateColumns: string;
  eventCollection: EventCollectionForMonth;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventCreate: (draft: DraftEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onEventUpdate: (event: CalendarEvent) => void;
  dispatchAction: (action: Action) => void;
}

const MonthViewContext = createContext<MonthViewContextType | null>(null);
MonthViewContext.displayName = "MonthViewContext";

function useMonthViewContext() {
  const context = useContext(MonthViewContext);
  if (!context) {
    throw new Error(
      "useMonthViewContext must be used within MonthViewProvider",
    );
  }
  return context;
}

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (draft: DraftEvent) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  dispatchAction: (action: Action) => void;
}

export function MonthView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
  onEventUpdate,
  dispatchAction,
}: MonthViewProps) {
  const settings = useCalendarSettings();
  const { days, weeks } = useMemo(() => {
    const weekStartsOn = toDateWeekStartsOn(settings.weekStartsOn);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

    const allDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const weeksResult = groupArrayIntoChunks(allDays, 7);

    return { days: allDays, weeks: weeksResult };
  }, [currentDate, settings.weekStartsOn]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleEventClick = useCallback(
    (event: CalendarEvent, e: React.MouseEvent) => {
      e.stopPropagation();
      onEventSelect(event);
    },
    [onEventSelect],
  );

  // Use the first week from the computed month calendar to derive the layout.
  // This ensures the column order respects the "start of week" setting and that
  // weekend visibility is calculated from the actual `Date` objects.
  const gridTemplateColumns = useGridLayout(weeks[0] ?? []);
  const eventCollection = useEventCollection(events, days, "month");

  const contextValue: MonthViewContextType = {
    currentDate,
    days,
    weeks,
    gridTemplateColumns,
    eventCollection,
    onEventClick: handleEventClick,
    onEventCreate,
    containerRef,
    onEventUpdate,
    dispatchAction,
  };

  const rows = weeks.length;

  return (
    <MonthViewContext.Provider value={contextValue}>
      <div data-slot="month-view" className="contents min-w-0">
        <MonthViewHeader
          style={{ gridTemplateColumns }}
          weekStartsOn={settings.weekStartsOn}
        />
        <div
          ref={containerRef}
          className="grid h-[calc(100%-37px)] min-w-0 flex-1 auto-rows-fr overflow-hidden"
          style={{ position: "relative", zIndex: 1 }}
        >
          {weeks.map((week, weekIndex) => {
            return (
              <MonthViewWeek
                key={weekIndex}
                week={week}
                weekIndex={weekIndex}
                rows={rows}
                gridTemplateColumns={gridTemplateColumns}
                eventCollection={eventCollection}
                onEventClick={handleEventClick}
                onEventUpdate={onEventUpdate}
                dispatchAction={dispatchAction}
                settings={settings}
                containerRef={
                  containerRef as React.RefObject<HTMLDivElement | null>
                }
              />
            );
          })}
        </div>
      </div>
    </MonthViewContext.Provider>
  );
}

type MonthViewHeaderProps = React.ComponentProps<"div"> & {
  /**
   * 1 = Monday … 7 = Sunday (matching Temporal / ISO numbering that the settings use)
   */
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

/**
 * Given the configured start-of-week (1 = Mon … 7 = Sun) and the column index (0-based)
 * within that week, return `true` if the column corresponds to a weekend (Saturday/Sunday).
 */
function isWeekendColumn(index: number, weekStartsOn: number): boolean {
  // Translate the column index back to the day number (1-based, 1 = Mon … 7 = Sun).
  // Example:
  //   weekStartsOn = 1 (Mon)  →  index 5 → (1 + 5 - 1) % 7 + 1 = 6 (Sat)
  //   weekStartsOn = 7 (Sun)  →  index 0 → 7 (Sun)
  const dayNumber = ((weekStartsOn - 1 + index) % 7) + 1; // 1…7
  // Day 6 = Saturday, Day 7 = Sunday.
  return dayNumber === 6 || dayNumber === 7;
}

function MonthViewHeader({ weekStartsOn, ...props }: MonthViewHeaderProps) {
  const viewPreferences = useViewPreferences();

  const weekDays = WEEKDAYS.slice(weekStartsOn - 1).concat(
    WEEKDAYS.slice(0, weekStartsOn - 1),
  );

  return (
    <div
      className="grid justify-items-stretch border-b border-border/70 transition-[grid-template-columns] duration-200 ease-linear"
      {...props}
    >
      {weekDays.map((day, index) => {
        const isDayVisible =
          viewPreferences.showWeekends || !isWeekendColumn(index, weekStartsOn);

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
  week: Date[];
  weekIndex: number;
  rows: number;
  gridTemplateColumns: string;
  eventCollection: EventCollectionForMonth;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  dispatchAction: (action: Action) => void;
  settings: CalendarSettings;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function MonthViewWeek({
  week,
  weekIndex,
  rows,
  gridTemplateColumns,
  eventCollection,
  onEventClick,
  onEventUpdate,
  dispatchAction,
  settings,
  containerRef,
}: MonthViewWeekItemProps) {
  const weekRef = useRef<HTMLDivElement>(null);
  const weekStart = week[0]!;
  const weekEnd = week[6]!;

  // Collect all events from the event collection - treat ALL events as multi-day
  const allEvents: CalendarEvent[] = [];
  eventCollection.eventsByDay.forEach((dayEvents) => {
    allEvents.push(...dayEvents.allEvents);
  });
  const uniqueEvents = allEvents.filter(
    (event, index, self) => index === self.findIndex((e) => e.id === event.id),
  );

  // Include ALL events in the multi-day lane, not just spanning events
  const weekEvents = uniqueEvents.filter((event) => {
    const eventStart = toDate({
      value: event.start,
      timeZone: settings.defaultTimeZone,
    });
    let eventEnd = toDate({
      value: event.end,
      timeZone: settings.defaultTimeZone,
    });

    // All-day events have an exclusive end; subtract one day so the final day is included
    if (event.allDay) {
      eventEnd = subDays(eventEnd, 1);
    }

    return (
      (eventStart >= weekStart && eventStart <= weekEnd) ||
      (eventEnd >= weekStart && eventEnd <= weekEnd) ||
      (eventStart < weekStart && eventEnd > weekEnd)
    );
  });

  // Use overflow hook to manage event display
  const overflow = useMultiDayOverflow({
    events: weekEvents,
    timeZone: settings.defaultTimeZone,
  });

  // Calculate how many lanes multi-day events occupy for this week
  const multiDayLaneCount = useMemo(() => {
    if (weekEvents.length === 0) return 0;
    const lanes = placeIntoLanes(weekEvents, settings.defaultTimeZone);
    return lanes.length;
  }, [weekEvents, settings.defaultTimeZone]);

  return (
    <div
      key={`week-${weekIndex}`}
      ref={weekRef}
      className="relative grid min-w-0 transition-[grid-template-columns] duration-200 ease-linear [&:last-child>*]:border-b-0"
      style={{ gridTemplateColumns }}
    >
      {/* 1. Day cells */}
      {week.map((day, dayIndex) => (
        <MonthViewDay
          key={day.toString()}
          day={day}
          rows={rows}
          weekIndex={weekIndex}
          dayIndex={dayIndex}
          multiDayLaneCount={multiDayLaneCount}
          overflow={overflow}
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
              <PositionedEvent
                rows={rows}
                key={evt.id}
                y={y}
                evt={evt}
                weekStart={weekStart}
                weekEnd={weekEnd}
                settings={settings}
                onEventClick={onEventClick}
                onEventUpdate={onEventUpdate}
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

interface MonthViewDayProps {
  day: Date;
  rows: number;
  weekIndex: number;
  dayIndex: number;
  multiDayLaneCount: number;
  overflow: ReturnType<typeof useMultiDayOverflow>;
}

function MonthViewDay({ day, overflow }: MonthViewDayProps) {
  const { currentDate, onEventCreate, onEventClick } = useMonthViewContext();
  const viewPreferences = useViewPreferences();
  const settings = useCalendarSettings();

  const handleDayClick = useCallback(() => {
    const start = Temporal.ZonedDateTime.from({
      year: day.getFullYear(),
      month: day.getMonth() + 1,
      day: day.getDate(),
      hour: DefaultStartHour,
      minute: 0,
      timeZone: settings.defaultTimeZone,
    });

    const end = start.add({ days: 1 });

    onEventCreate(createDraftEvent({ start, end }));
  }, [day, onEventCreate, settings.defaultTimeZone]);

  if (!day) return null;

  const isCurrentMonth = isSameMonth(day, currentDate);
  const isDayVisible = viewPreferences.showWeekends || !isWeekend(day);
  // const isReferenceCell = weekIndex === 0 && dayIndex === 0;
  const cellId = `month-cell-${day.toISOString()}`;

  // Filter overflow events to only show those that start on this day
  const dayOverflowEvents = overflow.overflowEvents.filter((event) => {
    const eventStart = toDate({
      value: event.start,
      timeZone: settings.defaultTimeZone,
    });
    return isSameDay(eventStart, day);
  });

  const hasOverflowForDay = dayOverflowEvents.length > 0;

  return (
    <div
      className={cn(
        "group relative min-w-0 border-r border-b border-border/70 last:border-r-0 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70",
        !isDayVisible && "w-0",
      )}
      data-today={isToday(day) || undefined}
      data-outside-cell={!isCurrentMonth || undefined}
      style={{
        visibility: isDayVisible ? "visible" : "hidden",
      }}
    >
      <DroppableCell
        id={cellId}
        date={day}
        onClick={handleDayClick}
        className="flex justify-between"
      >
        <div className="relative mt-1 ml-0.5 inline-flex size-6 items-center justify-center rounded-full text-sm group-data-today:bg-primary group-data-today:text-primary-foreground">
          {format(day, "d")}
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
              events={dayOverflowEvents}
              date={day}
              onEventSelect={(event) =>
                onEventClick(event, {} as React.MouseEvent)
              }
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
  evt: CalendarEvent;
  weekStart: Date;
  weekEnd: Date;
  settings: CalendarSettings;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventUpdate: (event: CalendarEvent) => void;
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
  onEventClick,
  onEventUpdate,
  dispatchAction,
  containerRef,
  rows,
}: PositionedEventProps) {
  const { colStart, span } = getGridPosition(
    evt,
    weekStart,
    weekEnd,
    settings.defaultTimeZone,
  );

  // Calculate actual first/last day based on event dates
  const eventStart = toDate({
    value: evt.start,
    timeZone: settings.defaultTimeZone,
  });
  let eventEnd = toDate({ value: evt.end, timeZone: settings.defaultTimeZone });
  if (evt.allDay) {
    eventEnd = subDays(eventEnd, 1);
  }

  // For single-day events, ensure they are properly marked as first and last day
  const isFirstDay = eventStart >= weekStart;
  const isLastDay = eventEnd <= weekEnd;

  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div
      key={evt.id}
      className="pointer-events-auto my-[1px] min-w-0"
      style={{
        gridColumn: `${colStart + 1} / span ${span}`,
        gridRow: y + 1,
        position: isDragging ? "relative" : "static",
        zIndex: isDragging ? 99999 : "auto",
      }}
    >
      <DraggableEvent
        event={evt}
        view="month"
        containerRef={containerRef}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        onClick={(e) => onEventClick(evt, e)}
        onEventUpdate={onEventUpdate}
        dispatchAction={dispatchAction}
        setIsDragging={setIsDragging}
        zIndex={isDragging ? 99999 : undefined}
        rows={rows}
      />
    </div>
  );
}
