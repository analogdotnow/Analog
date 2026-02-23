"use client";

import * as React from "react";

import { useSelectAction } from "@/hooks/calendar/use-optimistic-mutations";
import { eventColorVariable } from "@/lib/css";
import { EventDisplayItem } from "@/lib/display-item";
import type { CalendarEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/format";
import {
  useCalendarSettings,
  useDefaultTimeZone,
  useIsEventSelected,
} from "@/store/hooks";

interface EventWrapperProps {
  children: React.ReactNode;
  className?: string;
  event: CalendarEvent;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  "data-selected"?: boolean;
  "data-first-day"?: boolean;
  "data-last-day"?: boolean;
}

function EventItemContainer({
  children,
  className,
  event,
  ...props
}: EventWrapperProps) {
  "use memo";

  return (
    <div
      className={cn(
        "group hover:text-event-hover flex h-full overflow-hidden border border-event bg-event px-1 text-left font-medium text-event backdrop-blur-md transition outline-none select-none hover:border-event-hover hover:bg-event-hover focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "rounded-none data-first-day:rounded-l-sm data-first-day:border-r-0 data-last-day:rounded-r-sm data-last-day:border-l-0 data-first-day:data-last-day:rounded-sm data-first-day:data-last-day:border-r data-first-day:data-last-day:border-l",
        "data-first-day:ml-0.5 data-first-day:w-[calc(100%-0.125rem)] data-last-day:mr-0.5 data-last-day:w-[calc(100%-0.125rem)] data-first-day:data-last-day:mx-0.5 data-first-day:data-last-day:w-[calc(100%-0.25rem)]",
        className,
      )}
      style={{
        "--calendar-color": `var(${eventColorVariable(event)}, var(--color-muted-foreground))`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

const MemoizedEventItemContainer = React.memo(EventItemContainer);

interface MonthEventItemProps {
  children?: React.ReactNode;
  className?: string;
  item: EventDisplayItem;
  isFirstDay?: boolean;
  isLastDay?: boolean;
}

export function MonthEventItem({
  children,
  className,
  item,
  isFirstDay = true,
  isLastDay = true,
}: MonthEventItemProps) {
  "use memo";

  const isSelected = useIsEventSelected(item.event.id);
  const selectAction = useSelectAction();

  const defaultTimeZone = useDefaultTimeZone();
  const { locale, use12Hour } = useCalendarSettings();

  const time = React.useMemo(() => {
    if (item.event.allDay) {
      return "All day";
    }

    return `${formatTime({ value: item.start, use12Hour, locale, timeZone: defaultTimeZone })}`;
  }, [item.start, item.event.allDay, use12Hour, locale, defaultTimeZone]);

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    selectAction(item.event);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <MemoizedEventItemContainer
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={cn(
        "@container/event mt-(--calendar-color-gap) flex h-(--calendar-color-height) items-center gap-x-1.5 py-1 ps-1 pe-2 text-3xs sm:text-xs",
        isSelected &&
          "bg-event-selected text-event-selected hover:bg-event-selected-hover",
        className,
      )}
      event={item.event}
      data-selected={isSelected || undefined}
      data-first-day={isFirstDay || undefined}
      data-last-day={isLastDay || undefined}
    >
      <div
        className={cn(
          "w-1 shrink-0 self-stretch rounded-lg bg-event-selected-hover opacity-40 group-data-[selected=true]:opacity-0",
          !isFirstDay && "hidden",
        )}
      />
      <div className="flex min-w-0 grow items-stretch gap-y-1.5">
        {children}
        {!isFirstDay ? <div className="b h-lh" /> : null}
        {
          <p className="pointer-events-none truncate">
            {item.event.title ?? "(untitled)"}{" "}
            {!item.event.allDay && isFirstDay ? (
              <span className="truncate font-normal tabular-nums opacity-70 sm:text-2xs">
                {time}
              </span>
            ) : null}
          </p>
        }
      </div>
    </MemoizedEventItemContainer>
  );
}

interface WeekEventItemProps {
  children?: React.ReactNode;
  className?: string;
  item: EventDisplayItem;
  isFirstDay?: boolean;
  isLastDay?: boolean;
}

export function WeekEventItem({
  children,
  className,
  item,
  isFirstDay = true,
  isLastDay = true,
}: WeekEventItemProps) {
  "use memo";

  const isSelected = useIsEventSelected(item.event.id);
  const selectAction = useSelectAction();

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    selectAction(item.event);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const defaultTimeZone = useDefaultTimeZone();
  const { locale, use12Hour } = useCalendarSettings();

  const time = React.useMemo(() => {
    if (item.event.allDay) {
      return "All day";
    }

    return `${formatTime({ value: item.start, use12Hour, locale, timeZone: defaultTimeZone })}`;
  }, [item.start, item.event.allDay, use12Hour, locale, defaultTimeZone]);

  const duration = item.start.until(item.end).total({ unit: "minute" });

  return (
    <MemoizedEventItemContainer
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={cn(
        "@container/event @container relative flex gap-x-1.5 py-1 ps-1 pe-2 text-xs ring-1 ring-background/80",
        isSelected &&
          "bg-event-selected text-event-selected hover:bg-event-selected-hover",
        className,
      )}
      event={item.event}
      data-selected={isSelected || undefined}
      data-first-day={isFirstDay || undefined}
      data-last-day={isLastDay || undefined}
    >
      {children}
      <div className="w-1 shrink-0 rounded-lg bg-event-selected-hover opacity-40 group-data-[selected=true]:opacity-0" />
      <div className="pointer-events-none relative flex w-full min-w-0 flex-col items-stretch gap-y-1 font-medium">
        <div className="pointer-events-none truncate font-medium">
          {item.event.title ?? "(untitled)"}{" "}
        </div>
        {duration > 30 ? (
          <span className="pointer-events-none truncate font-normal tabular-nums opacity-70 sm:text-2xs">
            {time}
          </span>
        ) : null}
      </div>
    </MemoizedEventItemContainer>
  );
}

interface AgendaEventItemProps {
  className?: string;
  item: EventDisplayItem;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export function AgendaEventItem({
  className,
  item,
  ...props
}: AgendaEventItemProps) {
  "use memo";

  const isSelected = useIsEventSelected(item.event.id);

  const defaultTimeZone = useDefaultTimeZone();
  const { locale, use12Hour } = useCalendarSettings();

  const time = React.useMemo(() => {
    if (item.event.allDay) {
      return "All day";
    }

    return `${formatTime({ value: item.start, use12Hour, locale, timeZone: defaultTimeZone })}`;
  }, [item.start, item.event.allDay, use12Hour, locale, defaultTimeZone]);

  return (
    <button
      className={cn(
        "group hover:text-event-hover @container/event flex w-full flex-col gap-1 rounded-md border border-event bg-event p-2 text-left text-event transition outline-none hover:border-event-hover hover:bg-event-hover focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isSelected &&
          "bg-event-selected text-event-selected hover:bg-event-selected-hover",
        className,
      )}
      style={{
        "--calendar-color": `var(${eventColorVariable(item.event)}, var(--color-muted-foreground))`,
      }}
      {...props}
    >
      <div className="pointer-events-none text-sm font-medium">
        {item.event.title ?? "(untitled)"}
      </div>
      <div className="pointer-events-none text-xs opacity-70">
        {item.event.allDay ? (
          <span>All day</span>
        ) : (
          <span className="uppercase">{time}</span>
        )}
        {item.event.location ? (
          <>
            <span className="px-1 opacity-70"> · </span>
            <span>{item.event.location}</span>
          </>
        ) : null}
      </div>
      {item.event.description ? (
        <div className="pointer-events-none my-1 text-xs opacity-90">
          {item.event.description}
        </div>
      ) : null}
    </button>
  );
}
