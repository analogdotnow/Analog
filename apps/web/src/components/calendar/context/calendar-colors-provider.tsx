"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { calendarColorVariable } from "@/lib/css";
import { useTRPC } from "@/lib/trpc/client";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { getCalendarPreference } from "@/store/calendar-store";

type CalendarColorsProviderProps = React.ComponentProps<"div">;

export function CalendarColorsProvider({
  children,
}: CalendarColorsProviderProps) {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());
  const calendarPreferences = useCalendarStore((s) => s.calendarPreferences);

  React.useEffect(() => {
    const calendars = data?.accounts.flatMap((a) => a.calendars) ?? [];

    for (const calendar of calendars) {
      const preference = getCalendarPreference(
        calendarPreferences,
        calendar.provider.accountId,
        calendar.id,
      );

      document.documentElement.style.setProperty(
        calendarColorVariable(calendar.provider.accountId, calendar.id),
        preference?.color ?? calendar.color ?? "var(--color-muted-foreground)",
      );
    }
  }, [data, calendarPreferences]);

  return <>{children}</>;
}
