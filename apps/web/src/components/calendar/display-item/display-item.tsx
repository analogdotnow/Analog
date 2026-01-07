"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { isDisplayItemSelected } from "@/atoms/selected-display-items";
import {
  getBorderRadiusClasses,
  getContentPaddingClasses,
} from "@/components/calendar/event/ui";
import { calendarColorVariable } from "@/lib/css";
import {
  DisplayItem,
  InlineDisplayItem,
  isAllDay,
  isEvent,
  isTask,
} from "@/lib/display-item";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/format";

interface DisplayItemWrapperProps {
  color: string;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  "data-selected"?: boolean;
}

function DisplayItemWrapper({
  color,
  isFirstDay = true,
  isLastDay = true,
  onClick,
  className,
  children,
  onMouseDown,
  onTouchStart,
  "data-selected": dataSelected,
}: DisplayItemWrapperProps) {
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
          "--calendar-color": color,
        } as React.CSSProperties
      }
      data-selected={dataSelected || undefined}
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

interface DisplayItemProps {
  item: InlineDisplayItem;
  view: "month" | "week" | "day" | "agenda";
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export function DisplayItemComponent({
  item,
  view,
  onClick,
  showTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  onMouseDown,
  onTouchStart,
}: DisplayItemProps) {
  const isSelectedAtom = React.useMemo(
    () => isDisplayItemSelected(item.id),
    [item.id],
  );
  const isSelected = useAtomValue(isSelectedAtom);

  const duration = React.useMemo(() => {
    return item.start.until(item.end).total({ unit: "minute" });
  }, [item.start, item.end]);

  const { defaultTimeZone, locale, use12Hour } =
    useAtomValue(calendarSettingsAtom);

  const itemTime = React.useMemo(() => {
    if (isAllDay(item)) {
      return "All day";
    }
    return formatTime({
      value: item.start,
      use12Hour,
      locale,
      timeZone: defaultTimeZone,
    });
  }, [item, use12Hour, locale, defaultTimeZone]);

  const { title, color } = getDisplayItemDetails(item);

  if (view === "month") {
    return (
      <DisplayItemWrapper
        color={color}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        onClick={onClick}
        className={cn(
          "@container/event flex gap-x-1.5 py-1 ps-1 pe-2",
          "mt-(--calendar-color-gap) h-(--calendar-color-height) items-center text-[10px] sm:text-xs",
          isSelected &&
            "bg-event-selected text-event-selected hover:bg-event-selected-hover",
          className,
        )}
        data-selected={isSelected || undefined}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div
          className={cn(
            "w-1 shrink-0 self-stretch rounded-lg bg-event-selected-hover opacity-40 group-data-[selected=true]:opacity-0",
            !isFirstDay && "hidden",
          )}
        />
        <div className="flex min-w-0 grow items-stretch gap-y-1.5">
          {children}
          <DisplayItemTypeIndicator item={item} />
          {!isFirstDay ? <div className="h-lh" /> : null}
          <span className="pointer-events-none truncate">
            {title}{" "}
            {!isAllDay(item) && isFirstDay && (
              <span className="truncate font-normal tabular-nums opacity-70 sm:text-[11px]">
                {itemTime}
              </span>
            )}
          </span>
        </div>
      </DisplayItemWrapper>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <DisplayItemWrapper
        color={color}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        onClick={onClick}
        className={cn(
          "@container/event @container relative flex gap-x-1.5 py-1 ps-1 pe-2 ring-1 ring-background/80",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          isSelected &&
            "bg-event-selected text-event-selected hover:bg-event-selected-hover",
          className,
        )}
        data-selected={isSelected || undefined}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {children}
        <div className="w-1 shrink-0 rounded-lg bg-event-selected-hover opacity-40 group-data-[selected=true]:opacity-0" />
        <div className="pointer-events-none relative flex w-full min-w-0 flex-col items-stretch gap-y-1">
          <div className="pointer-events-none flex items-center gap-1 truncate font-medium">
            <DisplayItemTypeIndicator item={item} />
            {title}
          </div>
          {showTime && duration > 30 ? (
            <div className="pointer-events-none truncate font-normal tabular-nums opacity-70 sm:text-[11px]">
              {itemTime}
            </div>
          ) : null}
        </div>
      </DisplayItemWrapper>
    );
  }

  // Agenda view
  return (
    <button
      className={cn(
        "group hover:text-event-hover @container/event flex w-full flex-col gap-1 rounded-md border border-event bg-event p-2 text-left text-event transition outline-none hover:border-event-hover hover:bg-event-hover focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-past-event:line-through data-past-event:opacity-90",
        isSelected &&
          "bg-event-selected text-event-selected hover:bg-event-selected-hover",
        className,
      )}
      style={
        {
          "--calendar-color": color,
        } as React.CSSProperties
      }
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="pointer-events-none flex items-center gap-1.5 text-sm font-medium">
        <DisplayItemTypeIndicator item={item} />
        {title}
      </div>
      <div className="pointer-events-none text-xs opacity-70">
        {isAllDay(item) ? (
          <span>All day</span>
        ) : (
          <span className="uppercase">{itemTime}</span>
        )}
        <AgendaItemDetails item={item} />
      </div>
    </button>
  );
}

function DisplayItemTypeIndicator({ item }: { item: InlineDisplayItem }) {
  if (isTask(item)) {
    return (
      <span className="inline-flex size-3 shrink-0 items-center justify-center rounded border border-current opacity-60">
        <span className="sr-only">Task</span>
      </span>
    );
  }
  return null;
}

function AgendaItemDetails({ item }: { item: InlineDisplayItem }) {
  if (isEvent(item)) {
    const event = item.event;
    return (
      <>
        {event.location ? (
          <>
            <span className="px-1 opacity-70"> · </span>
            <span>{event.location}</span>
          </>
        ) : null}
      </>
    );
  }
  return null;
}

function getDisplayItemDetails(item: DisplayItem): {
  title: string;
  color: string;
} {
  if (isEvent(item)) {
    const event = item.event;
    const title =
      event.title && event.title.length ? event.title : "(untitled)";
    const color =
      event.color ??
      `var(${calendarColorVariable(event.calendar.provider.accountId, event.calendar.id)}, var(--color-muted-foreground))`;
    return { title, color };
  }

  if (isTask(item)) {
    const title = item.value.title || "(untitled task)";
    const color = "var(--color-muted-foreground)";
    return { title, color };
  }

  return { title: "(unknown)", color: "var(--color-muted-foreground)" };
}
