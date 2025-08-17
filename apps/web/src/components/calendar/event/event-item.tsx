"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import {
  getBorderRadiusClasses,
  getContentPaddingClasses,
} from "@/components/calendar/event/ui";
import { calendarColorVariable } from "@/lib/css";
import type { CalendarEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/format";
import { EventCollectionItem } from "../hooks/event-collection";
import { selectedEventsAtom } from "@/atoms/selected-events";

interface EventWrapperProps {
  event: CalendarEvent;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  onClick,
  className,
  children,
  onMouseDown,
  onTouchStart,
  "data-selected": dataSelected,
}: EventWrapperProps & { "data-selected"?: boolean }) {
  return (
    <div
      className={cn(
        "group hover:text-event-hover flex h-full overflow-hidden border border-event bg-event px-1 text-left font-medium text-event backdrop-blur-md transition outline-none select-none hover:border-event-hover hover:bg-event-hover focus-visible:ring-[3px] focus-visible:ring-ring/50 data-past-event:line-through",
        getBorderRadiusClasses(isFirstDay, isLastDay),
        getContentPaddingClasses(isFirstDay, isLastDay),
        className,
      )}
      style={
        {
          "--calendar-color": event.color ?? "var(--color-muted-foreground)",
        } as React.CSSProperties
      }
      data-selected={dataSelected || undefined}
      // data-past-event={isEventInPast || undefined}
      data-first-day={isFirstDay || undefined}
      data-last-day={isLastDay || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {children}
    </div>
  );
}

interface EventItemProps {
  item: EventCollectionItem;
  view: "month" | "week" | "day" | "agenda";
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
  currentTime?: Temporal.ZonedDateTime; // For updating time during drag
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export function EventItem({
  item,
  view,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  onMouseDown,
  onTouchStart,
}: EventItemProps) {
  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = currentTime ?? item.start;
  const displayEnd = currentTime ?? item.end;

  const selectedEvents = useAtomValue(selectedEventsAtom);

  const isSelected = selectedEvents.some((e) => e.id === item.event.id);

  const duration = React.useMemo(() => {
    return displayStart.until(displayEnd).total({ unit: "minute" });
  }, [displayStart, displayEnd]);

  const { defaultTimeZone, locale, use12Hour } =
    useAtomValue(calendarSettingsAtom);
  const eventTime = React.useMemo(() => {
    if (item.event.allDay) {
      return "All day";
    }

    return `${formatTime({ value: displayStart, use12Hour, locale, timeZone: defaultTimeZone })}`;
  }, [displayStart, item.event.allDay, use12Hour, locale, defaultTimeZone]);


  const displayTitle =
    item.event.title && item.event.title.length
      ? item.event.title
      : "(untitled)";

  const color =
    item.event.color ??
    `var(${calendarColorVariable(item.event.accountId, item.event.calendarId)}, var(--color-muted-foreground))`;

  if (view === "month") {
    return (
      <EventWrapper
        event={{ ...item.event, color }}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        onClick={onClick}
        className={cn(
          "@container/event flex gap-x-1.5 py-1 ps-1 pe-2",
          "mt-[var(--calendar-color-gap)] h-[var(--calendar-color-height)] items-center text-[10px] sm:text-xs",
          isSelected && "bg-event-selected hover:bg-event-selected-hover text-event-selected",
          className,
        )}
        data-selected={isSelected || undefined}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div
          className={cn(
            "w-1 shrink-0 self-stretch rounded-lg bg-[color-mix(in_oklab,var(--background),var(--calendar-color)_90%)] opacity-40 group-data-[selected=true]:opacity-0",
            !isFirstDay && "hidden",
          )}
        />
        <div className="flex min-w-0 grow items-stretch gap-y-1.5">
          {children}
          {!isFirstDay ? <div className="b h-lh" /> : null}
          {
            <span className="pointer-events-none truncate ">
              {displayTitle}{" "}
              {!item.event.allDay && isFirstDay && (
                <span className="truncate font-normal  tabular-nums opacity-70 sm:text-[11px]">
                  {eventTime}
                </span>
              )}
            </span>
          }
        </div>
      </EventWrapper>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={{ ...item.event, color }}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        onClick={onClick}
        className={cn(
          "@container/event relative flex gap-x-1.5 py-1 ps-1 pe-2 ring-1 ring-background/80",
          // duration.total({ unit: "minute" }) < 45 && "pe-1",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          isSelected && "bg-event-selected hover:bg-event-selected-hover text-event-selected",
          className,
        )}
        data-selected={isSelected || undefined}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {children}
        <div className="w-1 shrink-0 rounded-lg bg-[color-mix(in_oklab,var(--background),var(--calendar-color)_90%)] opacity-40 group-data-[selected=true]:opacity-0" />
        <div
          className={cn(
            // durationMinutes < 45 ? "items-center" : "flex-col",
            "pointer-events-none relative flex w-full min-w-0 flex-col items-stretch gap-y-1",
          )}
        >
          <div className="pointer-events-none truncate font-medium">
                {item.event.title ?? "(untitled)"}{" "}
              </div>
              {showTime && duration > 30 ? (
                <div className="pointer-events-none truncate font-normal tabular-nums opacity-70 sm:text-[11px]">
                  {eventTime}
                </div>
              ) : null}
        </div>
      </EventWrapper>
    );
  }

  // Agenda view - kept separate since it's significantly different
  return (
    <button
      className={`${cn(
        "@container/event flex w-full flex-col gap-1 rounded p-2 text-left transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-past-event:line-through data-past-event:opacity-90",
        "border-[color-mix(in_oklab,var(--background),var(--calendar-color)_30%)] bg-[color-mix(in_oklab,var(--background),var(--calendar-color)_20%)]",
        className,
      )} `}
      style={
        {
          "--calendar-color": color,
        } as React.CSSProperties
      }
      // data-past-event={isPast(toDate(event.end, { timeZone })) || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="pointer-events-none text-sm font-medium">
        {displayTitle}
      </div>
      <div className="pointer-events-none text-xs opacity-70">
        {item.event.allDay ? (
          <span>All day</span>
        ) : (
          <span className="uppercase">{eventTime}</span>
        )}
        {item.event.location && (
          <>
            <span className="px-1 opacity-35"> · </span>
            <span>{item.event.location}</span>
          </>
        )}
      </div>
      {item.event.description && (
        <div className="pointer-events-none my-1 text-xs opacity-90">
          {item.event.description}
        </div>
      )}
    </button>
  );
}
