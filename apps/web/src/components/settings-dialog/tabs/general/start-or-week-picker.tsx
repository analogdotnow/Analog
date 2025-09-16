"use client";

import * as React from "react";
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

const weekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type WeekDay = (typeof weekDays)[number];

export function StartOfWeekPicker() {
  const [calendarSettings, setCalendarSettings] = useAtom(calendarSettingsAtom);
  const value = weekDays[calendarSettings.weekStartsOn - 1];

  const onValueChange = React.useCallback(
    (value: WeekDay) => {
      const weekStartsOn = weekDays.indexOf(value) + 1;

      setCalendarSettings((prev) => ({
        ...prev,
        weekStartsOn: weekStartsOn as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      }));
    },
    [setCalendarSettings],
  );

  return (
    <div className="w-48">
      <Label htmlFor="settings-start-of-week" className="sr-only">
        Start of week
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="settings-start-of-week">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="monday">Monday</SelectItem>
          <SelectItem value="tuesday">Tuesday</SelectItem>
          <SelectItem value="wednesday">Wednesday</SelectItem>
          <SelectItem value="thursday">Thursday</SelectItem>
          <SelectItem value="friday">Friday</SelectItem>
          <SelectItem value="saturday">Saturday</SelectItem>
          <SelectItem value="sunday">Sunday</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
