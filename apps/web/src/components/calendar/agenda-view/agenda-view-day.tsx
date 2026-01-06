"use client";

import * as React from "react";
import { format } from "@formkit/tempo";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { eventOverlapsDay } from "@/components/calendar/utils/positioning";
import { EventCollectionItem } from "../hooks/event-collection";
import { AgendaViewEvent } from "./agenda-view-event";

interface AgendaViewDayHeaderProps {
  day: Temporal.PlainDate;
}

export function AgendaViewDayHeader({ day }: AgendaViewDayHeaderProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  return (
    <span
      className="absolute -top-3.5 left-0 flex h-6 items-center bg-background pe-4 text-[10px] text-muted-foreground data-today:font-medium sm:pe-4 sm:text-xs"
      data-today={
        isToday(day, { timeZone: settings.defaultTimeZone }) || undefined
      }
    >
      {format(day.toString(), "ddd, D MMM")}
    </span>
  );
}

interface AgendaViewDayContentProps {
  children: React.ReactNode;
}

function AgendaViewDayContent({ children }: AgendaViewDayContentProps) {
  return <div className="mt-6 space-y-2">{children}</div>;
}

interface AgendaViewDayContainerProps {
  children: React.ReactNode;
}

function AgendaViewDayContainer({ children }: AgendaViewDayContainerProps) {
  return (
    <div className="relative my-12 border-t border-border/70">{children}</div>
  );
}

interface AgendaViewDayProps {
  day: Temporal.PlainDate;
  items: EventCollectionItem[];
}

export function AgendaViewDay({ day, items }: AgendaViewDayProps) {
  const events = React.useMemo(() => {
    return items.filter((item) => eventOverlapsDay(item, day));
  }, [day, items]);

  if (events.length === 0) {
    return null;
  }

  return (
    <AgendaViewDayContainer>
      <AgendaViewDayHeader day={day} />
      <AgendaViewDayContent>
        {events.map((event) => (
          <AgendaViewEvent key={event.event.id} item={event} />
        ))}
      </AgendaViewDayContent>
    </AgendaViewDayContainer>
  );
}
