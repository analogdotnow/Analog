"use client";

import { viewPreferencesAtom } from "@/atoms";
import {
  DraggableEvent,
  DroppableCell,
  EventItem,
  useCurrentTimeIndicator,
  WeekCellsHeight,
  type CalendarEvent,
} from "@/components/event-calendar";
import { EndHour, StartHour } from "@/components/event-calendar/constants";
import { cn } from "@/lib/utils";
import {
  addHours,
  eachHourOfInterval,
  format,
  getHours,
  isBefore,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { useAtom } from "jotai";
import React, { useMemo } from "react";
import { getWeekDays, filterDaysByWeekendPreference } from "./utils/date-time";
import {
  getAllDayEventsForDays,
  calculateWeekViewEventPositions,
  type PositionedEvent,
} from "./utils/event";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date) => void;
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: WeekViewProps) {
  const [viewPreferences] = useAtom(viewPreferencesAtom);

  const allDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const days = useMemo(
    () => filterDaysByWeekendPreference(allDays, viewPreferences.showWeekends),
    [allDays, viewPreferences.showWeekends]
  );

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate]
  );

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    });
  }, [currentDate]);

  const allDayEvents = useMemo(
    () => getAllDayEventsForDays(events, days),
    [events, days]
  );

  const processedDayEvents = useMemo(
    () =>
      calculateWeekViewEventPositions(events, days, StartHour, WeekCellsHeight),
    [events, days]
  );

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "week"
  );
  const gridTemplateColumns = `4rem repeat(${days.length}, 1fr)`;

  return (
    <div data-slot="week-view" className="flex flex-col isolate">
      <div className="sticky top-0 z-30 backdrop-blur-md bg-background/80">
        <WeekViewHeader days={days} gridTemplateColumns={gridTemplateColumns} />

        {showAllDaySection && (
          <WeekViewAllDaySection
            days={days}
            allDayEvents={allDayEvents}
            weekStart={weekStart}
            gridTemplateColumns={gridTemplateColumns}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      <div
        className="grid flex-1 overflow-hidden transition-[grid-template-columns] duration-200 ease-linear"
        style={{ gridTemplateColumns }}
      >
        <WeekViewTimeColumn hours={hours} />

        {days.map((day, dayIndex) => (
          <WeekViewDayColumn
            key={day.toString()}
            day={day}
            hours={hours}
            positionedEvents={processedDayEvents[dayIndex] ?? []}
            currentTimePosition={currentTimePosition}
            currentTimeVisible={currentTimeVisible}
            onEventClick={handleEventClick}
            onEventCreate={onEventCreate}
          />
        ))}
      </div>
    </div>
  );
}

function WeekViewHeader({
  days,
  gridTemplateColumns,
}: {
  days: Date[];
  gridTemplateColumns: string;
}) {
  return (
    <div
      className="border-border/70 grid border-b transition-[grid-template-columns] duration-200 ease-linear"
      style={{ gridTemplateColumns }}
    >
      <div className="text-muted-foreground/70 py-2 text-center text-sm">
        <span className="max-[479px]:sr-only">{format(new Date(), "O")}</span>
      </div>
      {days.map((day) => (
        <div
          key={day.toString()}
          className="data-today:text-foreground text-muted-foreground/70 py-2 text-center text-sm data-today:font-medium"
          data-today={isToday(day) || undefined}
        >
          <span className="sm:hidden" aria-hidden="true">
            {format(day, "E")[0]} {format(day, "d")}
          </span>
          <span className="max-sm:hidden">{format(day, "EEE dd")}</span>
        </div>
      ))}
    </div>
  );
}

function WeekViewAllDaySection({
  days,
  allDayEvents,
  weekStart,
  gridTemplateColumns,
  onEventClick,
}: {
  days: Date[];
  allDayEvents: CalendarEvent[];
  weekStart: Date;
  gridTemplateColumns: string;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}) {
  return (
    <div className="border-border/70 border-b">
      <div
        className="grid transition-[grid-template-columns] duration-200 ease-linear"
        style={{ gridTemplateColumns }}
      >
        <div className="border-border/70 relative border-r">
          <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
            All day
          </span>
        </div>
        {days.map((day, dayIndex) => {
          const dayAllDayEvents = allDayEvents.filter((event) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            return (
              isSameDay(day, eventStart) ||
              (day > eventStart && day < eventEnd) ||
              isSameDay(day, eventEnd)
            );
          });

          return (
            <div
              key={day.toString()}
              className="border-border/70 relative border-r p-1 last:border-r-0"
              data-today={isToday(day) || undefined}
            >
              {dayAllDayEvents.map((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                const isFirstDay = isSameDay(day, eventStart);
                const isLastDay = isSameDay(day, eventEnd);
                const isFirstVisibleDay =
                  dayIndex === 0 && isBefore(eventStart, weekStart);
                const shouldShowTitle = isFirstDay || isFirstVisibleDay;

                return (
                  <EventItem
                    key={`spanning-${event.id}`}
                    onClick={(e) => onEventClick(event, e)}
                    event={event}
                    view="month"
                    isFirstDay={isFirstDay}
                    isLastDay={isLastDay}
                  >
                    <div
                      className={cn(
                        "truncate",
                        !shouldShowTitle && "invisible"
                      )}
                      aria-hidden={!shouldShowTitle}
                    >
                      {event.title}
                    </div>
                  </EventItem>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekViewTimeColumn({ hours }: { hours: Date[] }) {
  return (
    <div className="border-border/70 grid auto-cols-fr border-r">
      {hours.map((hour, index) => (
        <div
          key={hour.toString()}
          className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
        >
          {index > 0 && (
            <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
              {format(hour, "h a")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function WeekViewDayColumn({
  day,
  hours,
  positionedEvents,
  currentTimePosition,
  currentTimeVisible,
  onEventClick,
  onEventCreate,
}: {
  day: Date;
  hours: Date[];
  positionedEvents: PositionedEvent[];
  currentTimePosition: number;
  currentTimeVisible: boolean;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventCreate: (startTime: Date) => void;
}) {
  return (
    <div
      key={day.toString()}
      className="border-border/70 relative grid auto-cols-fr border-r last:border-r-0"
      data-today={isToday(day) || undefined}
    >
      {positionedEvents.map((positionedEvent) => (
        <div
          key={positionedEvent.event.id}
          className="absolute z-10 px-0.5"
          style={{
            top: `${positionedEvent.top}px`,
            height: `${positionedEvent.height}px`,
            left: `${positionedEvent.left * 100}%`,
            width: `${positionedEvent.width * 100}%`,
            zIndex: positionedEvent.zIndex,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="size-full">
            <DraggableEvent
              event={positionedEvent.event}
              view="week"
              onClick={(e) => onEventClick(positionedEvent.event, e)}
              showTime
              height={positionedEvent.height}
            />
          </div>
        </div>
      ))}

      {currentTimeVisible && isToday(day) && (
        <div
          className="pointer-events-none absolute right-0 left-0 z-20"
          style={{ top: `${currentTimePosition}%` }}
        >
          <div className="relative flex items-center">
            <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
            <div className="bg-primary h-[2px] w-full"></div>
          </div>
        </div>
      )}

      {hours.map((hour) => {
        const hourValue = getHours(hour);
        return (
          <div
            key={hour.toString()}
            className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
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
                    quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]"
                  )}
                  onClick={() => {
                    const startTime = new Date(day);
                    startTime.setHours(hourValue);
                    startTime.setMinutes(quarter * 15);
                    onEventCreate(startTime);
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
