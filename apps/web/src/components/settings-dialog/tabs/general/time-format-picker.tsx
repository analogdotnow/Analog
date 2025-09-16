"use client";

import * as React from "react";
import { format } from "@formkit/tempo";
import { useAtom } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TimeFormatPicker() {
  const [calendarSettings, setCalendarSettings] = useAtom(calendarSettingsAtom);

  const time = React.useRef(new Date());

  const onValueChange = React.useCallback(
    (value: string) => {
      setCalendarSettings((prev) => ({
        ...prev,
        use12Hour: value === "12h",
      }));
    },
    [setCalendarSettings],
  );

  return (
    <div className="w-48">
      <Label htmlFor="settings-time-format" className="sr-only">
        Time format
      </Label>
      <Select
        value={calendarSettings.use12Hour ? "12h" : "24h"}
        onValueChange={onValueChange}
      >
        <SelectTrigger id="settings-time-format">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="tabular-nums" value="24h">
            {format(time.current, "HH:mm")}
          </SelectItem>
          <SelectItem className="tabular-nums" value="12h">
            {format(time.current, "h:mm a")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
