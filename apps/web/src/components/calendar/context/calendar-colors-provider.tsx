"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import {
  calendarPreferencesAtom,
  getCalendarPreference,
} from "@/atoms/calendar-preferences";
import { calendarColorVariable } from "@/lib/css";
import { useTRPC } from "@/lib/trpc/client";

type CalendarColorsProviderProps = React.ComponentProps<"div">;

export function CalendarColorsProvider({
  children,
}: CalendarColorsProviderProps) {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());
  const calendarPreferences = useAtomValue(calendarPreferencesAtom);

  React.useEffect(() => {
    const calendars = data?.accounts.flatMap((a) => a.calendars) ?? [];

    for (const calendar of calendars) {
      const preference = getCalendarPreference(
        calendarPreferences,
        calendar.accountId,
        calendar.id,
      );

      document.documentElement.style.setProperty(
        calendarColorVariable(calendar.accountId, calendar.id),
        preference?.color ?? calendar.color ?? "var(--color-muted-foreground)",
      );
    }
  }, [data, calendarPreferences]);

  return <>{children}</>;
}
