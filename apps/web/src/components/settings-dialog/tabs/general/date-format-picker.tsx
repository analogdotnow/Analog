"use client";

import * as React from "react";

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

export function DateFormatPicker() {
  const locale = useCalendarStore((s) => s.calendarSettings.locale);
  const setCalendarSettings = useSetCalendarSettings();

  const onValueChange = React.useCallback(
    (value: string) => {
      setCalendarSettings({ locale: value });
    },
    [setCalendarSettings],
  );

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="w-48">
        <Label htmlFor="settings-date-format" className="sr-only">
          Date format
        </Label>
        <Select value={locale} onValueChange={onValueChange}>
          <SelectTrigger id="settings-date-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">16 Nov 2023</SelectItem>
            <SelectItem value="en-GB">16/11/2023</SelectItem>
            <SelectItem value="en-CA">11/16/2023</SelectItem>
            <SelectItem value="en-ISO">2023-11-16</SelectItem>
            <SelectItem value="en-AU">Nov 16, 2023</SelectItem>
            <SelectItem value="en-NZ">16-11-2023</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
