"use client";

import * as React from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";

import type { DisplayItem } from "@/lib/display-item";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { AgendaViewDay } from "./agenda-view-day";

function AgendaViewEmpty() {
  "use memo";

  return (
    <div className="absolute inset-0 hidden flex-col items-center justify-center py-16 text-center only:flex">
      <CalendarIcon className="mb-2 text-muted-foreground/50" />
      <h3 className="text-lg font-medium">No items found</h3>
      <p className="text-muted-foreground">
        There are no items scheduled for this time period.
      </p>
    </div>
  );
}

interface AgendaViewProps {
  items: DisplayItem[];
}

export function AgendaView({ items }: AgendaViewProps) {
  "use memo";

  const currentDate = useCalendarStore((s) => s.currentDate);

  const days = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => currentDate.add({ days: i }));
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
