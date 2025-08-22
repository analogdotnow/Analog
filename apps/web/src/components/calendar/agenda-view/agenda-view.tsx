"use client";

import * as React from "react";
import { format } from "@formkit/tempo";
import { RiCalendarEventLine } from "@remixicon/react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { AgendaDaysToShow } from "@/components/calendar/constants";
import { EventItem } from "@/components/calendar/event/event-item";
import type { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { eventOverlapsDay } from "@/components/calendar/utils/event";
import { useSelectAction } from "../hooks/use-optimistic-mutations";

function EmptyAgenda() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
      <RiCalendarEventLine
        size={32}
        className="mb-2 text-muted-foreground/50"
      />
      <h3 className="text-lg font-medium">No events found</h3>
      <p className="text-muted-foreground">
        There are no events scheduled for this time period.
      </p>
    </div>
  );
}

interface AgendaViewProps {
  currentDate: Temporal.PlainDate;
  events: EventCollectionItem[];
}

export function AgendaView({ currentDate, events }: AgendaViewProps) {
  // Show events for the next days based on constant
  const days = React.useMemo(() => {
    const days = Array.from({ length: AgendaDaysToShow }, (_, i) =>
      currentDate.add({ days: i }),
    );

    return days.map((day) => {
      const dayEventItems = events.filter((event) =>
        eventOverlapsDay(event, day),
      );

      return {
        day,
        items: dayEventItems,
      };
    });
  }, [currentDate, events]);

  const settings = useAtomValue(calendarSettingsAtom);

  // Check if there are any days with events
  const hasEvents = days.some((day) => day.items.length > 0);

  return (
    <div className="border-t border-border/70 px-4">
      {!hasEvents ? (
        <EmptyAgenda />
      ) : (
        days.map((day) => {
          if (day.items.length === 0) {
            return null;
          }

          return (
            <div
              key={day.day.toString()}
              className="relative my-12 border-t border-border/70"
            >
              <span
                className="absolute -top-3.5 left-0 flex h-6 items-center bg-background pe-4 text-[10px] text-muted-foreground data-today:font-medium sm:pe-4 sm:text-xs"
                data-today={
                  isToday(day.day, { timeZone: settings.defaultTimeZone }) ||
                  undefined
                }
              >
                {format(day.day.toString(), "ddd, D MMM")}
              </span>
              <div className="mt-6 space-y-2">
                {day.items.map((item) => (
                  <AgendaViewEvent key={item.event.id} item={item} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

interface AgendaViewEventProps {
  item: EventCollectionItem;
}

function AgendaViewEvent({ item }: AgendaViewEventProps) {
  const selectAction = useSelectAction();

  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectAction(item.event);
    },
    [selectAction, item.event],
  );

  return (
    <EventItem
      key={item.event.id}
      item={item}
      view="agenda"
      onClick={onClick}
    />
  );
}
