"use client";

import React, { createContext, useContext, useMemo, useRef } from "react";
import {
  addHours,
  eachHourOfInterval,
  format,
  getHours,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";

import { useCalendarSettings, useViewPreferences } from "@/atoms";
import {
  DraggableEvent,
  DroppableCell,
  type CalendarEvent,
} from "@/components/event-calendar";
import { EndHour, StartHour } from "@/components/event-calendar/constants";
import {
  useCurrentTimeIndicator,
  useEventCollection,
  useGridLayout,
  type EventCollectionForWeek,
} from "@/components/event-calendar/hooks";
import {
  filterDaysByWeekendPreference,
  getWeekDays,
  isWeekend,
  type PositionedEvent,
} from "@/components/event-calendar/utils";
import { DraftEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { createDraftEvent } from "@/lib/utils/calendar";

interface WeekViewContextType {
  allDays: Date[];
  visibleDays: Date[];
  hours: Date[];
  eventCollection: EventCollectionForWeek;
  currentDate: Date;
  gridTemplateColumns: string;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventCreate: (draft: DraftEvent) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const WeekViewContext = createContext<WeekViewContextType | null>(null);

function useWeekViewContext() {
  const context = useContext(WeekViewContext);
  if (!context) {
    throw new Error("useWeekViewContext must be used within WeekViewProvider");
  }
  return context;
}

interface WeekViewProps extends React.ComponentProps<"div"> {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (draft: DraftEvent) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  headerRef: React.RefObject<HTMLDivElement | null>;
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
  onEventUpdate,
  headerRef,
  ...props
}: WeekViewProps) {
  const viewPreferences = useViewPreferences();

  const allDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const visibleDays = useMemo(
    () => filterDaysByWeekendPreference(allDays, viewPreferences.showWeekends),
    [allDays, viewPreferences.showWeekends],
  );

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    });
  }, [currentDate]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const gridTemplateColumns = useGridLayout(allDays, {
    includeTimeColumn: true,
  });
  const eventCollection = useEventCollection(events, visibleDays, "week");

  const containerRef = useRef<HTMLDivElement>(null);
  const contextValue: WeekViewContextType = {
    allDays,
    visibleDays,
    hours,
    eventCollection,
    currentDate,
    gridTemplateColumns,
    onEventClick: handleEventClick,
    onEventCreate,
    onEventUpdate,
    containerRef,
  };

  return (
    <WeekViewContext.Provider value={contextValue}>
      <div data-slot="week-view" className="isolate flex flex-col" {...props}>
        <div
          ref={headerRef}
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-md"
        >
          <WeekViewHeader />
          <WeekViewAllDaySection />
        </div>

        <div
          ref={containerRef}
          className="isolate grid flex-1 overflow-hidden transition-[grid-template-columns] duration-200 ease-linear"
          style={{ gridTemplateColumns }}
        >
          <WeekViewTimeColumn />
          <WeekViewDayColumns />
        </div>
      </div>
    </WeekViewContext.Provider>
  );
}

function WeekViewHeader() {
  const { allDays, gridTemplateColumns } = useWeekViewContext();
  const viewPreferences = useViewPreferences();
  const settings = useCalendarSettings();

  const timeZone = useMemo(() => {
    const parts = new Intl.DateTimeFormat(settings.locale, {
      timeZoneName: "short",
      timeZone: settings.defaultTimeZone,
    }).formatToParts(allDays[0]!);

    return parts.find((part) => part.type === "timeZoneName")?.value ?? " ";
  }, [allDays, settings.defaultTimeZone, settings.locale]);

  return (
    <div
      className="grid border-b border-border/70 transition-[grid-template-columns] duration-200 ease-linear"
      style={{ gridTemplateColumns }}
    >
      <div className="flex flex-col items-end justify-end py-2 pe-2 pb-2.5 text-center text-sm text-[10px] font-medium text-muted-foreground/70 sm:pe-4 sm:text-xs">
        <span className="max-[479px]:sr-only">{timeZone}</span>
      </div>
      {allDays.map((day) => {
        const isDayVisible = viewPreferences.showWeekends || !isWeekend(day);

        return (
          <div
            key={day.toString()}
            className={cn(
              "overflow-hidden py-2 text-center text-base font-medium text-muted-foreground/70 data-today:text-foreground",
              !isDayVisible && "w-0",
            )}
            data-today={isToday(day) || undefined}
            style={{ visibility: isDayVisible ? "visible" : "hidden" }}
          >
            <span className="truncate sm:hidden" aria-hidden="true">
              {format(day, "E")[0]} {format(day, "d")}
            </span>
            <span className="truncate max-sm:hidden">
              {format(day, "EEE d")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WeekViewAllDaySection() {
  const {
    allDays,
    visibleDays,
    eventCollection,
    gridTemplateColumns,
    onEventClick,
    currentDate,
    containerRef,
    onEventUpdate,
    onEventCreate,
  } = useWeekViewContext();
  const viewPreferences = useViewPreferences();
  const settings = useCalendarSettings();

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate],
  );
  const allDayEvents =
    eventCollection.type === "week" ? eventCollection.allDayEvents : [];

  // if (allDayEvents.length === 0) {
  //   return null;
  // }

  return (
    <div className="border-b border-border/70 [--calendar-height:100%]">
      <div
        className="grid transition-[grid-template-columns] duration-200 ease-linear"
        style={{ gridTemplateColumns }}
      >
        <div className="relative flex min-h-7 flex-col justify-center border-r border-border/70">
          <span className="w-16 max-w-full ps-2 text-right text-[10px] text-muted-foreground/70 sm:ps-4 sm:text-xs">
            All day
          </span>
        </div>

        {allDays.map((day) => {
          const isDayVisible = viewPreferences.showWeekends || !isWeekend(day);
          const visibleDayIndex = visibleDays.findIndex(
            (d) => d.getTime() === day.getTime(),
          );
          const isLastVisibleDay =
            isDayVisible && visibleDayIndex === visibleDays.length - 1;
          const dayAllDayEvents = allDayEvents.filter((event) => {
            const eventStart = toDate({
              value: event.start,
              timeZone: settings.defaultTimeZone,
            });
            const eventEnd = toDate({
              value: event.end,
              timeZone: settings.defaultTimeZone,
            });
            // if (event.allDay && !isSameDay(day, eventEnd)) {
            //   return false;
            // }

            return (
              isSameDay(day, eventStart) ||
              (day > eventStart && day < eventEnd) ||
              isSameDay(day, eventEnd)
            );
          });

          return (
            <div
              key={day.toString()}
              className={cn(
                "relative grid auto-cols-fr space-y-[1px] border-r border-border/70",
                isLastVisibleDay && "border-r-0",
                isDayVisible ? "" : "w-0",
              )}
              data-today={isToday(day) || undefined}
              style={{ visibility: isDayVisible ? "visible" : "hidden" }}
              onClick={() => {
                const start = Temporal.PlainDate.from({
                  year: day.getFullYear(),
                  month: day.getMonth() + 1,
                  day: day.getDate(),
                });

                const end = start.add({ days: 1 });

                onEventCreate(createDraftEvent({ start, end }));
              }}
            >
              {dayAllDayEvents.map((event) => {
                const eventStart = toDate({
                  value: event.start,
                  timeZone: settings.defaultTimeZone,
                });
                const eventEnd = toDate({
                  value: event.end,
                  timeZone: settings.defaultTimeZone,
                });
                const isFirstDay = isSameDay(day, eventStart);
                const isLastDay = isSameDay(day, eventEnd);
                // const isFirstVisibleDay =
                //   dayIndex === 0 && isBefore(eventStart, weekStart);
                // const shouldShowTitle = isFirstDay || isFirstVisibleDay;
                // const isSingleDay = event.allDay
                //   ? isSameDay(eventStart, subDays(eventEnd, 1))
                //   : isSameDay(eventStart, eventEnd);

                if (event.allDay && isLastDay) {
                  return null;
                }

                return (
                  <div
                    className="relative z-[9999] w-full min-w-0"
                    key={`spanning-${event.id}-${event.accountId}`}
                  >
                    <DraggableEvent
                      // className={cn(!isSingleDay && !isFirstDay && "opacity-0")}
                      onClick={(e) => onEventClick(event, e)}
                      event={event}
                      view="month"
                      isFirstDay={isFirstDay}
                      isLastDay={
                        event.allDay
                          ? isSameDay(day, subDays(eventEnd, 1))
                          : isLastDay
                      }
                      containerRef={containerRef}
                      onEventUpdate={onEventUpdate}
                    >
                      {/* <div
                        className={cn(
                          "truncate",
                          !shouldShowTitle && "invisible",
                        )}
                        aria-hidden={!shouldShowTitle}
                      >
                        {event.title}
                      </div> */}
                    </DraggableEvent>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekViewTimeColumn() {
  const { hours } = useWeekViewContext();

  const timeFormat = "24";

  return (
    <div className="grid auto-cols-fr border-r border-border/70">
      {hours.map((hour, index) => (
        <div
          key={hour.toString()}
          className="relative min-h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
        >
          {index > 0 && (
            <span className="absolute -top-3 left-0 flex h-6 w-20 max-w-full items-center justify-end bg-background pe-2 text-[10px] font-medium text-muted-foreground/70 sm:pe-4 sm:text-xs">
              {timeFormat === "24"
                ? format(hour, "HH:mm")
                : format(hour, "h aa")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

interface PositionedEventProps {
  positionedEvent: PositionedEvent;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function PositionedEvent({
  positionedEvent,
  onEventClick,
  onEventUpdate,
  containerRef,
}: PositionedEventProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div
      key={positionedEvent.event.id}
      className="absolute z-10"
      style={{
        top: `${positionedEvent.top}px`,
        height: `${positionedEvent.height}px`,
        left: `${positionedEvent.left * 100}%`,
        width: `${positionedEvent.width * 100}%`,
        zIndex: isDragging ? 9999 : positionedEvent.zIndex,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <DraggableEvent
        event={positionedEvent.event}
        view="week"
        onClick={(e) => onEventClick(positionedEvent.event, e)}
        onEventUpdate={onEventUpdate}
        showTime
        height={positionedEvent.height}
        containerRef={containerRef}
        setIsDragging={setIsDragging}
      />
    </div>
  );
}

function WeekViewDayColumns() {
  const {
    allDays,
    visibleDays,
    eventCollection,
    currentDate,
    onEventClick,
    onEventUpdate,
    containerRef,
    hours,
  } = useWeekViewContext();
  const viewPreferences = useViewPreferences();

  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "week",
  );

  return (
    <>
      {allDays.map((day) => {
        const isDayVisible = viewPreferences.showWeekends || !isWeekend(day);
        const visibleDayIndex = visibleDays.findIndex(
          (d) => d.getTime() === day.getTime(),
        );
        const isLastVisibleDay =
          isDayVisible && visibleDayIndex === visibleDays.length - 1;

        const positionedEvents =
          eventCollection.type === "week" && visibleDayIndex >= 0
            ? (eventCollection.positionedEvents[visibleDayIndex] ?? [])
            : [];

        return (
          <div
            key={day.toString()}
            className={cn(
              "relative grid auto-cols-fr border-r border-border/70",
              isLastVisibleDay && "border-r-0",
              !isDayVisible && "w-0 overflow-hidden",
            )}
            data-today={isToday(day) || undefined}
            style={{ visibility: isDayVisible ? "visible" : "hidden" }}
          >
            {positionedEvents.map((positionedEvent: PositionedEvent) => (
              <PositionedEvent
                key={positionedEvent.event.id}
                positionedEvent={positionedEvent}
                onEventClick={onEventClick}
                onEventUpdate={onEventUpdate}
                containerRef={containerRef}
              />
            ))}

            {currentTimeVisible && isToday(day) && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="relative flex items-center">
                  <div className="absolute -left-1 h-2 w-2 rounded-full bg-primary"></div>
                  <div className="h-[2px] w-full bg-primary"></div>
                </div>
              </div>
            )}
            <div>
              <MemoizedWeekViewDayTimeSlots day={day} hours={hours} />
            </div>
          </div>
        );
      })}
    </>
  );
}

function WeekViewDayTimeSlots({ day, hours }: { day: Date; hours: Date[] }) {
  // TODO: replace context
  const { onEventCreate } = useWeekViewContext();

  const settings = useCalendarSettings();

  return (
    <>
      {hours.map((hour) => {
        const hourValue = getHours(hour);
        return (
          <div
            key={hour.toString()}
            className="relative min-h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
          >
            {[0, 1, 2, 3].map((quarter) => {
              const quarterHourTime = hourValue + quarter * 0.25;
              return (
                <DroppableCell
                  key={`${hour.toString()}-${quarter}`}
                  id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                  date={day}
                  time={quarterHourTime}
                  className={cn(
                    "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                    quarter === 0 && "top-0",
                    quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
                    quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
                    quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]",
                  )}
                  onClick={() => {
                    const start = Temporal.ZonedDateTime.from({
                      year: day.getFullYear(),
                      month: day.getMonth() + 1,
                      day: day.getDate(),
                      hour: hourValue,
                      minute: quarter * 15,
                      timeZone: settings.defaultTimeZone,
                    });

                    const end = start.add({ minutes: 15 });

                    onEventCreate(createDraftEvent({ start, end }));
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

const MemoizedWeekViewDayTimeSlots = React.memo(WeekViewDayTimeSlots);
