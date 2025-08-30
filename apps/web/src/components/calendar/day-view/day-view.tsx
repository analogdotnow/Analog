"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { motion } from "motion/react";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { currentDateAtom } from "@/atoms/view-preferences";
import { DragPreview } from "@/components/calendar/event/drag-preview";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import { EventItem } from "@/components/calendar/event/event-item";
import { HOURS } from "@/components/calendar/timeline/constants";
import {
  TimeIndicator,
  TimeIndicatorBackground,
} from "@/components/calendar/timeline/time-indicator";
import { Timeline } from "@/components/calendar/timeline/timeline";
import { cn } from "@/lib/utils";
import { DragAwareWrapper } from "../event/drag-aware-wrapper";
import { EventCollectionItem } from "../hooks/event-collection";
import { useEdgeAutoScroll } from "../hooks/use-auto-scroll";
import { useDoubleClickToCreate } from "../hooks/use-double-click-to-create";
import { useDragToCreate } from "../hooks/use-drag-to-create";
import { useEventCollection } from "../hooks/use-event-collection";
import { useSelectAction } from "../hooks/use-optimistic-mutations";
import { useScrollToCurrentTime } from "../week-view/use-scroll-to-current-time";

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
      />
    </DragAwareWrapper>
  );
}

export function DayView({ events, scrollContainerRef }: DayViewProps) {
  const currentDate = useAtomValue(currentDateAtom);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const scrollToCurrentTime = useScrollToCurrentTime({ scrollContainerRef });

  React.useEffect(() => {
    scrollToCurrentTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEdgeAutoScroll(scrollContainerRef, { headerRef });

  const eventCollection = useEventCollection(events, currentDate, "day");

  return (
    <div data-slot="day-view" className="contents">
      <AllDayRow ref={headerRef}>
        {eventCollection.allDayEvents.map((item) => (
          <DayViewPositionedEvent
            key={`spanning-${item.event.id}`}
            item={item}
            currentDate={currentDate}
          />
        ))}
      </AllDayRow>

      <div
        ref={containerRef}
        className="relative isolate grid flex-1 grid-cols-[5rem_1fr] overflow-hidden border-border/70"
      >
        <TimeIndicatorBackground />

        <Timeline />

        <div className="relative">
          {eventCollection.positionedEvents.map((positionedEvent) => (
            <PositionedEvent
              key={positionedEvent.item.event.id}
              positionedEvent={positionedEvent}
              containerRef={containerRef}
            />
          ))}

          <TimeIndicator date={currentDate} />

          <MemoizedDayViewTimeSlots />
        </div>
      </div>
    </div>
  );
}

type AllDayRowProps = React.ComponentProps<"div">;

function AllDayRow({ children, className, ref, ...props }: AllDayRowProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "sticky top-0 z-30 border-t border-border/70 bg-background/80 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <div className="grid grid-cols-[5rem_1fr] border-b border-border/70">
        <div className="relative flex min-h-7 flex-col justify-center border-r border-border/70">
          <span className="w-16 max-w-full ps-2 text-right text-[10px] text-muted-foreground/70 sm:ps-4 sm:text-xs">
            All day
          </span>
        </div>
        <div className="relative border-r border-border/70 py-1 last:border-r-0">
          {children}
        </div>
      </div>
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
    <EventItem
      onClick={onClick}
      item={item}
      view="month"
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
    />
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
            className="pointer-events-none h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
          />
        );
      })}
    </>
  );
}

const MemoizedHourColumn = React.memo(HourColumn);
