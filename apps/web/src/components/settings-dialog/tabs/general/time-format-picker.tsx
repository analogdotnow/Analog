"use client";

import * as React from "react";
import { format } from "@formkit/tempo";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useSetCalendarSettings } from "@/store/hooks";

export function TimeFormatPicker() {
  const use12Hour = useCalendarStore((s) => s.calendarSettings.use12Hour);
  const setCalendarSettings = useSetCalendarSettings();

  const time = React.useMemo(() => new Date(), []);

  const onValueChange = React.useCallback(
    (value: string) => {
      setCalendarSettings({ use12Hour: value === "12h" });
    },
    [setCalendarSettings],
  );

  return (
    <div className="w-48">
      <Label htmlFor="settings-time-format" className="sr-only">
        Time format
      </Label>
      <Select value={use12Hour ? "12h" : "24h"} onValueChange={onValueChange}>
        <SelectTrigger id="settings-time-format">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="tabular-nums" value="24h">
            {format(time, "HH:mm")}
          </SelectItem>
          <SelectItem className="tabular-nums" value="12h">
            {format(time, "h:mm a")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
