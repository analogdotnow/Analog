import * as React from "react";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday, isWeekend } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { DragPreview } from "@/components/calendar/event/drag-preview";
import { useDoubleClickToCreate } from "@/components/calendar/hooks/drag-and-drop/use-double-click-to-create";
import { useDragToCreate } from "@/components/calendar/hooks/drag-and-drop/use-drag-to-create";
import { EventCollectionForWeek } from "@/components/calendar/hooks/use-event-collection";
import { HOURS } from "@/components/calendar/timeline/constants";
import { TimeIndicator } from "@/components/calendar/timeline/time-indicator";
import type { PositionedEvent } from "@/components/calendar/utils/event";
import { cn } from "@/lib/utils";
import { WeekViewEvent } from "./week-view-event";

interface WeekViewDayColumnsProps {
  date: Temporal.PlainDate;
  visibleDays: Temporal.PlainDate[];
  eventCollection: EventCollectionForWeek;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function WeekViewDayColumn({
  date,
  visibleDays,
  eventCollection,
  containerRef,
}: WeekViewDayColumnsProps) {
  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  const { isDayVisible, isLastVisibleDay, visibleDayIndex, weekend } =
    React.useMemo(() => {
      const weekend = isWeekend(date);
      const isDayVisible = viewPreferences.showWeekends || !weekend;
      const visibleDayIndex = visibleDays.findIndex(
        (d) => Temporal.PlainDate.compare(d, date) === 0,
      );
      const isLastVisibleDay =
        isDayVisible && visibleDayIndex === visibleDays.length - 1;

      return { isDayVisible, isLastVisibleDay, visibleDayIndex, weekend };
    }, [viewPreferences.showWeekends, visibleDays, date]);

  const positionedEvents =
    eventCollection.positionedEvents[visibleDayIndex] ?? [];

  return (
    <div
      key={date.toString()}
      className={cn(
        "relative grid auto-cols-fr border-r border-border/70",
        isLastVisibleDay && "border-r-0",
        weekend && "bg-column-weekend",
        isDayVisible ? "visible" : "hidden w-0 overflow-hidden",
      )}
      data-today={isToday(date, { timeZone: defaultTimeZone }) || undefined}
    >
      {positionedEvents.map((positionedEvent: PositionedEvent) => (
        <WeekViewEvent
          key={positionedEvent.item.event.id}
          positionedEvent={positionedEvent}
          containerRef={containerRef}
        />
      ))}

      <TimeIndicator date={date} />
      <MemoizedWeekViewDayTimeSlots date={date} />
    </div>
  );
}

interface WeekViewDayTimeSlotsProps {
  date: Temporal.PlainDate;
}

function WeekViewDayTimeSlots({ date }: WeekViewDayTimeSlotsProps) {
  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  const columnRef = React.useRef<HTMLDivElement>(null);

  const { onDragStart, onDrag, onDragEnd, top, height, opacity } =
    useDragToCreate({
      date,
      timeZone: defaultTimeZone,
      columnRef,
    });

  const onDoubleClick = useDoubleClickToCreate({
    date,
    columnRef,
  });

  return (
    <motion.div
      className="touch-manipulation select-none"
      ref={columnRef}
      onPanStart={onDragStart}
      onPan={onDrag}
      onPanEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
    >
      {HOURS.map((hour) => (
        <div
          key={hour.toString()}
          className="pointer-events-none min-h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
        />
      ))}
      <DragPreview style={{ top, height, opacity }} />
    </motion.div>
  );
}

const MemoizedWeekViewDayTimeSlots = React.memo(WeekViewDayTimeSlots);
