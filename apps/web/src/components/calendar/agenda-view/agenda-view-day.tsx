"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { isToday } from "@repo/temporal";

import { DisplayItem } from "@/lib/display-item";
import { cn } from "@/lib/utils";
import { format } from "@/lib/utils/format";
import { useDefaultTimeZone } from "@/store/hooks";
import { displayItemOverlapsDay } from "../utils/positioning/inline-items";
import { AgendaViewItem } from "./agenda-view-item";

interface AgendaViewDayHeaderProps {
  day: Temporal.PlainDate;
}

export function AgendaViewDayHeader({ day }: AgendaViewDayHeaderProps) {
  "use memo";

  const defaultTimeZone = useDefaultTimeZone();

  return (
    <span
      className={cn(
        "absolute top-8 left-0 flex h-6 items-center bg-background pe-4 text-3xs text-muted-foreground sm:pe-4 sm:text-xs",
        isToday(day, { timeZone: defaultTimeZone }) && "font-medium",
      )}
    >
      {format(day, "ddd, D MMM", defaultTimeZone)}
    </span>
  );
}

interface AgendaViewDayContentProps {
  children: React.ReactNode;
}

function AgendaViewDayContent({ children }: AgendaViewDayContentProps) {
  "use memo";

  return <div className="mt-14 space-y-2 pb-8">{children}</div>;
}

interface AgendaViewDayContainerProps {
  children: React.ReactNode;
}

function AgendaViewDayContainer({ children }: AgendaViewDayContainerProps) {
  "use memo";

  return (
    <div className="relative border-t border-border/70 pt-4">{children}</div>
  );
}

interface AgendaViewDayProps {
  day: Temporal.PlainDate;
  items: DisplayItem[];
}

export function AgendaViewDay({ day, items }: AgendaViewDayProps) {
  "use memo";

  const events = React.useMemo(() => {
    return items.filter((item) => displayItemOverlapsDay(item, day));
  }, [day, items]);

  if (events.length === 0) {
    return null;
  }

  return (
    <AgendaViewDayContainer>
      <AgendaViewDayHeader day={day} />
      <AgendaViewDayContent>
        {events.map((event) => (
          <AgendaViewItem key={event.id} item={event} />
        ))}
      </AgendaViewDayContent>
    </AgendaViewDayContainer>
  );
}
