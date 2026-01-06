"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { getWeekDays } from "@/components/calendar/utils/date-time";
import { groupArrayIntoChunks } from "@/lib/utils";
import { EventCollectionItem } from "../hooks/event-collection";
import { useMonthEventCollection } from "../hooks/use-event-collection";
import { useGridLayout } from "../hooks/use-grid-layout";
import { useUnselectAllAction } from "../hooks/use-optimistic-mutations";
import { MonthViewHeader } from "./month-view-header";
import { MemorizedMonthViewWeek } from "./month-view-week";

interface MonthViewProps {
  currentDate: Temporal.PlainDate;
  events: EventCollectionItem[];
}

export function MonthView({ currentDate, events }: MonthViewProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  const { days, weeks } = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, {
      weekStartsOn: settings.weekStartsOn,
    });
    const calendarEnd = endOfWeek(monthEnd, {
      weekStartsOn: settings.weekStartsOn,
    });

    const allDays = eachDayOfInterval(calendarStart, calendarEnd);

    const weeksResult = groupArrayIntoChunks(allDays, 7);

    return { days: allDays, weeks: weeksResult };
  }, [currentDate, settings.weekStartsOn]);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const gridTemplateColumns = useGridLayout(getWeekDays(currentDate));
  const eventCollection = useMonthEventCollection(events, days);

  const rows = weeks.length;

  const unselectAllAction = useUnselectAllAction();

  return (
    <div
      data-slot="month-view"
      className="isolate h-full min-w-0"
      style={
        { "--month-view-grid": gridTemplateColumns } as React.CSSProperties
      }
    >
      <MonthViewHeader />
      <div
        ref={containerRef}
        className="grid h-[calc(100%-37px)] min-w-0 flex-1 auto-rows-fr overflow-hidden"
        style={{ position: "relative", zIndex: 1 }}
        onClick={unselectAllAction}
      >
        {weeks.map((week, weekIndex) => {
          return (
            <MemorizedMonthViewWeek
              key={weekIndex}
              week={week}
              weekIndex={weekIndex}
              rows={rows}
              eventCollection={eventCollection}
              settings={settings}
              containerRef={containerRef}
              currentDate={currentDate}
            />
          );
        })}
      </div>
    </div>
  );
}
