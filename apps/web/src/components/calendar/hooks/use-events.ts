import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { endOfMonth, startOfMonth } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { currentDateAtom } from "@/atoms/view-preferences";
import { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";
import { mapEventsToItems } from "./event-collection";

const TIME_RANGE_DAYS_PAST = 30;
const TIME_RANGE_DAYS_FUTURE = 30;

export function useEventQueryParams() {
  const trpc = useTRPC();
  const currentDate = useAtomValue(currentDateAtom);
  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  const { timeMin, timeMax } = React.useMemo(() => {
    const start = currentDate
      .subtract({
        days: TIME_RANGE_DAYS_PAST,
      })
      .toZonedDateTime({
        timeZone: defaultTimeZone,
      });

    const end = currentDate
      .add({
        days: TIME_RANGE_DAYS_FUTURE,
      })
      .toZonedDateTime({
        timeZone: defaultTimeZone,
      });

    return {
      timeMin: startOfMonth(start),
      timeMax: endOfMonth(end),
    };
  }, [defaultTimeZone, currentDate]);

  const queryKey = React.useMemo(
    () =>
      trpc.events.list.queryOptions({ timeMin, timeMax, defaultTimeZone })
        .queryKey,
    [trpc.events.list, timeMin, timeMax, defaultTimeZone],
  );

  return { timeMin, timeMax, defaultTimeZone, queryKey };
}

export function useEventsForDisplay() {
  const trpc = useTRPC();
  const { timeMin, timeMax, defaultTimeZone } = useEventQueryParams();

  const select = React.useCallback(
    (data: RouterOutputs["events"]["list"]) => {
      if (!data.events) {
        return {
          events: [],
          recurringMasterEvents: {},
        };
      }

      return {
        events: mapEventsToItems(data.events, defaultTimeZone),
        recurringMasterEvents: data.recurringMasterEvents,
      };
    },
    [defaultTimeZone],
  );

  return useQuery(
    trpc.events.list.queryOptions(
      { timeMin, timeMax, defaultTimeZone },
      {
        select,
        placeholderData: (previousData) => previousData,
      },
    ),
  );
}
