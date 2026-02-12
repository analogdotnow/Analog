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
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);
  const setCalendarSettings = useSetCalendarSettings();
  const value = weekDays[weekStartsOn - 1];

  const onValueChange = React.useCallback(
    (value: WeekDay) => {
      const weekStartsOn = weekDays.indexOf(value) + 1;

      setCalendarSettings({
        weekStartsOn: weekStartsOn as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      });
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
