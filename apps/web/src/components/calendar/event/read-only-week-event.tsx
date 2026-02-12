"use client";

import { EventContextMenu } from "@/components/calendar/event/event-context-menu";
import {
  MonthEventItem,
  WeekEventItem,
} from "@/components/calendar/event/event-item";
import { isAllDayOrMultiDay } from "@/components/calendar/utils/positioning/inline-items";
import { ContextMenuTrigger } from "@/components/ui/context-menu";
import { EventDisplayItem } from "@/lib/display-item";

interface ReadOnlyWeekEventProps {
  item: EventDisplayItem;
  height?: number;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  zIndex?: number;
}

export function ReadOnlyWeekEvent({
  item,
  height,
  isFirstDay = true,
  isLastDay = true,
  zIndex,
}: ReadOnlyWeekEventProps) {
  "use memo";

  if (isAllDayOrMultiDay(item)) {
    return (
      <div className="size-full" style={{ zIndex }}>
        <EventContextMenu event={item.event}>
          <ContextMenuTrigger>
            <MonthEventItem
              item={item}
              isFirstDay={isFirstDay}
              isLastDay={isLastDay}
            />
          </ContextMenuTrigger>
        </EventContextMenu>
      </div>
    );
  }

  return (
    <div className="size-full" style={{ height, zIndex }}>
      <EventContextMenu event={item.event}>
        <ContextMenuTrigger className="size-full">
          <WeekEventItem
            item={item}
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
          />
        </ContextMenuTrigger>
      </EventContextMenu>
    </div>
  );
}
