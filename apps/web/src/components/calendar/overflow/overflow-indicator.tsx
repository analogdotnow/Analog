"use client";

import * as React from "react";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { XIcon } from "lucide-react";
import { Temporal } from "temporal-polyfill";

import { isSameDay, toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { DisplayItemComponent } from "@/components/calendar/display-item/display-item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InlineDisplayItem, isEvent } from "@/lib/display-item";
import { cn } from "@/lib/utils";
import { useSelectAction } from "../hooks/use-optimistic-mutations";

interface OverflowIndicatorProps {
  items: InlineDisplayItem[];
  date: Temporal.PlainDate;

  gridColumn?: string;
  className?: string;
}

export function OverflowIndicator({
  items,
  date,
  gridColumn,
  className,
}: OverflowIndicatorProps) {
  const [open, setOpen] = React.useState(false);

  const timeZone = useAtomValue(calendarSettingsAtom).defaultTimeZone;

  const selectAction = useSelectAction();
  const onItemClick = React.useCallback(
    (item: InlineDisplayItem) => {
      if (isEvent(item)) {
        selectAction(item.event);
      }
      setOpen(false);
    },
    [selectAction],
  );

  const legacyDate = React.useMemo(
    () => toDate(date, { timeZone }),
    [date, timeZone],
  );

  if (items.length <= 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            className={cn(
              "pointer-events-auto text-xs text-muted-foreground hover:text-foreground",
              "rounded-md px-2 py-1 transition-colors hover:bg-muted/50",
              className,
            )}
            style={gridColumn ? { gridColumn } : undefined}
          />
        }
      >
        +{items.length} more
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex items-center justify-between px-2 py-1">
          <h3 className="text-sm font-medium">
            {format(legacyDate, "d MMMM yyyy")}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-1 hover:bg-muted"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-auto px-2 pb-2">
          {items.length === 0 ? (
            <div className="py-2 text-sm text-muted-foreground">No items</div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <OverflowItem
                  key={item.id}
                  item={item}
                  date={date}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface OverflowItemProps {
  item: InlineDisplayItem;
  date: Temporal.PlainDate;
  onItemClick: (item: InlineDisplayItem) => void;
}

function OverflowItem({ item, date, onItemClick }: OverflowItemProps) {
  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  const isFirstDay = isSameDay(date, item.start, { timeZone: defaultTimeZone });
  const isLastDay = isSameDay(date, item.end, { timeZone: defaultTimeZone });

  return (
    <div
      key={item.id}
      className="cursor-pointer"
      onClick={() => onItemClick(item)}
    >
      <DisplayItemComponent
        item={item}
        view="agenda"
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
      />
    </div>
  );
}
