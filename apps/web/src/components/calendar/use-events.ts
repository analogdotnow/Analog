import * as React from "react";
import { and, gt, lt, useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { endOfMonth, startOfMonth } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { currentDateAtom } from "@/atoms/view-preferences";
import { eventsCollection } from "@/lib/pglite/collections/events";
import { useTRPC } from "@/lib/trpc/client";
import { applyOptimisticActions } from "./hooks/apply-optimistic-actions";
import { mapEventsToItems } from "./hooks/event-collection";
import { optimisticActionsByEventIdAtom } from "./hooks/optimistic-actions";

const TIME_RANGE_DAYS_PAST = 30;
const TIME_RANGE_DAYS_FUTURE = 30;



export function useEvents() {
  const trpc = useTRPC();
  const currentDate = useAtomValue(currentDateAtom);
  const defaultTimeZone = useAtomValue(calendarSettingsAtom).defaultTimeZone;
  const optimisticActions = useAtomValue(optimisticActionsByEventIdAtom);

  const timeMin = React.useMemo(() => {
    const start = currentDate
      .subtract({
        days: TIME_RANGE_DAYS_PAST,
      })
      .toZonedDateTime({
        timeZone: defaultTimeZone,
      });

    return startOfMonth(start);
  }, [currentDate, defaultTimeZone]);

  const timeMax = React.useMemo(() => {
    const end = currentDate
      .add({
        days: TIME_RANGE_DAYS_FUTURE,
      })
      .toZonedDateTime({
        timeZone: defaultTimeZone,
      });

    return endOfMonth(end);
  }, [currentDate, defaultTimeZone]);

  const query = useLiveQuery(
    (q) =>
      q
        .from({ event: eventsCollection })
        .where(({ event }) => and(lt(event.start, timeMax), gt(event.end, timeMin))),
    [timeMin, timeMax],
  );

  const fallbackQuery = useQuery(
    trpc.events.list.queryOptions(
      { timeMin, timeMax, defaultTimeZone },
      {
        enabled: !query.isReady,
      },
    ),
  );


  // const viewPreferences = useAtomValue(viewPreferencesAtom);
  // const calendarPreferences = useAtomValue(calendarPreferencesAtom);

  return React.useMemo(() => {
    if (query.isReady) {
      return applyOptimisticActions({
        items: mapEventsToItems(query.data, defaultTimeZone),
        timeZone: defaultTimeZone,
        optimisticActions,
      });
    }

    return applyOptimisticActions({
      items: mapEventsToItems(fallbackQuery.data?.events ?? [], defaultTimeZone),
      timeZone: defaultTimeZone,
      optimisticActions,
    });

    // const pastFiltered = filterPastEvents(
    //   events,
    //   viewPreferences.showPastEvents,
    //   defaultTimeZone,
    // );

    // return pastFiltered.filter((eventItem) => {
    //   const preference = getCalendarPreference(
    //     calendarPreferences,
    //     eventItem.event.accountId,
    //     eventItem.event.calendarId,
    //   );

    //   return !(preference?.hidden === true);
    // });
  }, [query.isReady, query.data, fallbackQuery.data?.events, defaultTimeZone, optimisticActions]);
}
