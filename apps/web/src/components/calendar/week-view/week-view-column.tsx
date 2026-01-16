import * as React from "react";
import { useAtomValue } from "jotai";
import { motion } from "motion/react";
import { Temporal } from "temporal-polyfill";

import { isToday, isWeekend } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { DragPreview } from "@/components/calendar/event/drag-preview";
import { useDoubleClickToCreate } from "@/components/calendar/hooks/drag-and-drop/use-double-click-to-create";
import { useDragToCreate } from "@/components/calendar/hooks/drag-and-drop/use-drag-to-create";
import { WeekDisplayCollection } from "@/components/calendar/hooks/use-event-collection";
import { HOURS } from "@/components/calendar/timeline/constants";
import { TimeIndicator } from "@/components/calendar/timeline/time-indicator";
import type { PositionedDisplayItem } from "@/components/calendar/utils/positioning";
import { cn } from "@/lib/utils";
import { WeekViewEvent } from "./week-view-event";

interface WeekViewDayColumnsProps {
  date: Temporal.PlainDate;
  visibleDays: Temporal.PlainDate[];
  displayCollection: WeekDisplayCollection;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function WeekViewDayColumn({
  date,
  visibleDays,
  displayCollection,
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

  const positionedItems =
    displayCollection.positionedItems[visibleDayIndex] ?? [];

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
      {positionedItems.map((positionedItem: PositionedDisplayItem) => (
        <WeekViewEvent
          key={positionedItem.item.id}
          positionedItem={positionedItem}
          containerRef={containerRef}
          columns={visibleDays.length}
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
      <div>
        {HOURS.map((hour) => (
          <div
            key={hour.toString()}
            className="pointer-events-none min-h-(--week-cells-height) border-b border-border/70 last:border-b-0"
          />
        ))}
      </div>
      <DragPreview style={{ top, height, opacity }} />
      <div className="pointer-events-none h-(--week-view-bottom-padding)" />
    </motion.div>
  );
}

const MemoizedWeekViewDayTimeSlots = React.memo(WeekViewDayTimeSlots);
