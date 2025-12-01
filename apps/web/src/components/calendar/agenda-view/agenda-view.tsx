"use client";

import * as React from "react";
import { RiCalendarEventLine } from "@remixicon/react";
import { Temporal } from "temporal-polyfill";

import { AgendaDaysToShow } from "@/components/calendar/constants";
import type { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { AgendaViewDay } from "./agenda-view-day";

function AgendaViewEmpty() {
  return (
    <div className="hidden min-h-[70svh] flex-col items-center justify-center py-16 text-center only:flex">
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
  items: EventCollectionItem[];
}

export function AgendaView({ currentDate, items }: AgendaViewProps) {
  const days = React.useMemo(() => {
    return Array.from({ length: AgendaDaysToShow }, (_, i) =>
      currentDate.add({ days: i }),
    );
  }, [currentDate]);

  return (
    <AgendaViewDayContainer>
      <AgendaViewEmpty />
      {days.map((day) => (
        <AgendaViewDay key={day.toString()} day={day} items={items} />
      ))}
    </AgendaViewDayContainer>
  );
}

interface AgendaViewDayContainerProps {
  children: React.ReactNode;
}

function AgendaViewDayContainer({ children }: AgendaViewDayContainerProps) {
  return <div className="border-t border-border/70 px-4">{children}</div>;
}
