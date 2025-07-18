import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { calendarPreferencesAtom } from "@/atoms/calendar-preferences";
import { useTRPC } from "@/lib/trpc/client";

export function useCalendars() {
  const trpc = useTRPC();
  const preferences = useAtomValue(calendarPreferencesAtom);

  return useQuery({
    ...trpc.calendars.list.queryOptions(),
    select: (data) => {
      const accounts = data.accounts.map((account) => ({
        ...account,
        calendars: account.calendars
          .map((calendar, index) => {
            const key = `${calendar.accountId}.${calendar.id}`;
            const pref = preferences[key];
            return {
              ...calendar,
              color: pref?.color ?? calendar.color,
              hidden: pref?.hidden ?? false,
              order: pref?.order,
              _idx: index,
            };
          })
          .sort((a, b) => {
            const orderA = a.order ?? Number.POSITIVE_INFINITY;
            const orderB = b.order ?? Number.POSITIVE_INFINITY;
            if (orderA === orderB) return a._idx - b._idx;
            return orderA - orderB;
          })
          .map(({ _idx, ...cal }) => cal),
      }));

      const defaultKey = `${data.defaultCalendar.accountId}.${data.defaultCalendar.id}`;
      const defaultPref = preferences[defaultKey];

      return {
        ...data,
        defaultCalendar: {
          ...data.defaultCalendar,
          color: defaultPref?.color ?? data.defaultCalendar.color,
        },
        accounts,
      };
    },
  });
}
