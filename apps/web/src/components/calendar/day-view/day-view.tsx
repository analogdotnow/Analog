"use client";

import * as React from "react";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { motion } from "motion/react";
import { Temporal } from "temporal-polyfill";

import { isToday, toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { timeZonesAtom } from "@/atoms/timezones";
import { currentDateAtom } from "@/atoms/view-preferences";
import { DragAwareWrapper } from "@/components/calendar/event/drag-aware-wrapper";
import { DragPreview } from "@/components/calendar/event/drag-preview";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import { EventItem } from "@/components/calendar/event/event-item";
import { useEdgeAutoScroll } from "@/components/calendar/hooks/drag-and-drop/use-auto-scroll";
import { useDoubleClickToCreate } from "@/components/calendar/hooks/drag-and-drop/use-double-click-to-create";
import { useDragToCreate } from "@/components/calendar/hooks/drag-and-drop/use-drag-to-create";
import type { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { useWeekEventCollection } from "@/components/calendar/hooks/use-event-collection";
import { useGridLayout } from "@/components/calendar/hooks/use-grid-layout";
import { useSelectAction } from "@/components/calendar/hooks/use-optimistic-mutations";
import { HOURS } from "@/components/calendar/timeline/constants";
import {
  TimeIndicator,
  TimeIndicatorBackground,
} from "@/components/calendar/timeline/time-indicator";
import { Timeline } from "@/components/calendar/timeline/timeline";
import { TimelineHeader } from "@/components/calendar/timeline/timeline-header";
import { useScrollToCurrentTime } from "@/components/calendar/week-view/use-scroll-to-current-time";
import { cn } from "@/lib/utils";

interface DayViewProps {
  currentDate: Temporal.PlainDate;
  events: EventCollectionItem[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

interface PositionedEventProps {
  positionedEvent: {
    item: EventCollectionItem;
    top: number;
    height: number;
    left: number;
    width: number;
    zIndex: number;
  };
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function PositionedEvent({
  positionedEvent,
  containerRef,
}: PositionedEventProps) {
  return (
    <DragAwareWrapper
      key={positionedEvent.item.event.id}
      eventId={positionedEvent.item.event.id}
      className="absolute z-10"
      style={{
        top: `${positionedEvent.top}px`,
        height: `${positionedEvent.height}px`,
        left: `${positionedEvent.left * 100}%`,
        width: `${positionedEvent.width * 100}%`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <DraggableEvent
        item={positionedEvent.item}
        view="day"
        showTime
        height={positionedEvent.height}
        containerRef={containerRef}
        columns={1}
      />
    </DragAwareWrapper>
  );
}

export function DayView({ events, scrollContainerRef }: DayViewProps) {
  const currentDate = useAtomValue(currentDateAtom);
  const timeZones = useAtomValue(timeZonesAtom);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const scrollToCurrentTime = useScrollToCurrentTime({ scrollContainerRef });

  React.useEffect(() => {
    scrollToCurrentTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEdgeAutoScroll(scrollContainerRef, { headerRef });

  const eventCollection = useWeekEventCollection(events, [currentDate]);

  const gridTemplateColumns = useGridLayout([currentDate], {
    includeTimeColumn: true,
    ignoreWeekendPreference: true,
  });

  const style = React.useMemo(() => {
    return {
      "--time-columns": `${timeZones.length}`,
      "--day-view-grid": gridTemplateColumns,
    } as React.CSSProperties;
  }, [timeZones, gridTemplateColumns]);

  return (
    <div
      data-slot="day-view"
      className="isolate flex flex-col [--time-column-width:3rem] [--timeline-container-width:calc(var(--time-columns)*2.5rem+0.5rem)] [--week-view-bottom-padding:16rem] sm:[--time-column-width:5rem] sm:[--timeline-container-width:calc(var(--time-columns)*3rem+1rem)]"
      style={style}
    >
      <div ref={headerRef} className="sticky top-0 z-30 bg-background">
        <DayViewHeader day={currentDate} />
        <AllDayRow gridTemplateColumns={gridTemplateColumns}>
          {eventCollection.allDayEvents.map((item) => (
            <DayViewPositionedEvent
              key={`spanning-${item.event.id}`}
              item={item}
              currentDate={currentDate}
            />
          ))}
        </AllDayRow>
      </div>

      <div
        ref={containerRef}
        className="relative isolate grid flex-1 grid-cols-(--day-view-grid) overflow-hidden border-border/70 transition-[grid-template-columns] duration-200 ease-linear"
      >
        <Timeline />
        <div className="relative">
          {eventCollection.positionedEvents[0]?.map((positionedEvent) => (
            <PositionedEvent
              key={positionedEvent.item.event.id}
              positionedEvent={positionedEvent}
              containerRef={containerRef}
            />
          ))}

          <TimeIndicator date={currentDate} />
          <MemoizedDayViewTimeSlots />
        </div>
        <TimeIndicatorBackground />
      </div>
    </div>
  );
}

interface AllDayRowProps extends React.ComponentProps<"div"> {
  gridTemplateColumns: string;
}

function AllDayRow({
  children,
  gridTemplateColumns,
  ...props
}: AllDayRowProps) {
  return (
    <div
      className="grid border-b border-border/70"
      style={{ gridTemplateColumns }}
      {...props}
    >
      <div className="relative flex min-h-7 flex-col justify-center border-r border-border/70">
        <span className="pe-3 text-right text-[10px] text-muted-foreground/70 select-none sm:pe-4 sm:text-xs">
          All day
        </span>
      </div>
      <div className="relative flex flex-col border-r border-border/70 last:border-r-0">
        {children}
      </div>
    </div>
  );
}

interface DayViewHeaderProps {
  day: Temporal.PlainDate;
}

function DayViewHeader({ day }: DayViewHeaderProps) {
  return (
    <div className="grid grid-cols-(--day-view-grid) border-b border-border/70 transition-[grid-template-columns] duration-200 ease-linear select-none">
      <TimelineHeader />
      <DayViewHeaderDay day={day} />
    </div>
  );
}

function DayViewHeaderDay({ day }: DayViewHeaderProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  const value = React.useMemo(
    () => toDate(day, { timeZone: settings.defaultTimeZone }),
    [day, settings.defaultTimeZone],
  );

  return (
    <div
      className={cn(
        "overflow-hidden py-2 text-center text-base font-medium text-muted-foreground/70",
        isToday(day, { timeZone: settings.defaultTimeZone }) &&
          "text-foreground",
      )}
    >
      <span
        className="truncate text-xs @xs/calendar-view:text-sm @md/calendar-view:hidden"
        aria-hidden="true"
      >
        {format(value, "E")[0]} {format(value, "d")}
      </span>
      <span className="truncate text-sm @max-md/calendar-view:hidden @lg/calendar-view:text-base">
        {format(value, "EEE d")}
      </span>
    </div>
  );
}

interface DayViewPositionedEventProps {
  item: EventCollectionItem;
  currentDate: Temporal.PlainDate;
}

function DayViewPositionedEvent({
  item,
  currentDate,
}: DayViewPositionedEventProps) {
  const selectAction = useSelectAction();

  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectAction(item.event);
    },
    [selectAction, item.event],
  );

  const { isFirstDay, isLastDay } = React.useMemo(() => {
    // For single-day events, ensure they are properly marked as first and last day
    const isFirstDay = Temporal.PlainDate.compare(item.start, currentDate) >= 0;
    const isLastDay = Temporal.PlainDate.compare(item.end, currentDate) <= 0;

    return { isFirstDay, isLastDay };
  }, [item.start, item.end, currentDate]);

  return (
    <div className="my-px">
      <EventItem
        onClick={onClick}
        item={item}
        view="month"
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
      />
    </div>
  );
}

function DayViewTimeSlots() {
  const currentDate = useAtomValue(currentDateAtom);
  const settings = useAtomValue(calendarSettingsAtom);
  const columnRef = React.useRef<HTMLDivElement>(null);

  const { onDragStart, onDrag, onDragEnd, top, height, opacity } =
    useDragToCreate({
      date: currentDate,
      timeZone: settings.defaultTimeZone,
      columnRef,
    });

  const onDoubleClick = useDoubleClickToCreate({
    date: currentDate,
    columnRef,
  });

  return (
    <motion.div
      ref={columnRef}
      onPanStart={onDragStart}
      onPan={onDrag}
      onPanEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
    >
      <MemoizedHourColumn />
      <DragPreview style={{ top, height, opacity }} />
    </motion.div>
  );
}

const MemoizedDayViewTimeSlots = React.memo(DayViewTimeSlots);

function HourColumn() {
  return (
    <>
      {HOURS.map((hour) => {
        return (
          <div
            key={hour.toString()}
            className="pointer-events-none h-(--week-cells-height) border-b border-border/70 last:border-b-0"
          />
        );
      })}
    </>
  );
}

const MemoizedHourColumn = React.memo(HourColumn);
