import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { endOfMonth, startOfMonth } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { currentDateAtom } from "@/atoms/view-preferences";
import { db, eventQuery } from "@/lib/db";
import { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";
import { mapEventsToItems } from "./event-collection";
import { useEventQueryParams } from "./use-events";

const TIME_RANGE_DAYS_PAST = 30;
const TIME_RANGE_DAYS_FUTURE = 30;

export function useEvents() {
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

  return useQuery(
    trpc.events.list.queryOptions({ timeMin, timeMax, defaultTimeZone }),
  );
}

interface EventQueryParams {
  timeMin: Temporal.ZonedDateTime;
  timeMax: Temporal.ZonedDateTime;
}

function useEventQuery(props: EventQueryParams) {
  const { start, end } = React.useMemo(() => {
    return {
      start: props.timeMin.epochMilliseconds,
      end: props.timeMax.epochMilliseconds,
    };
  }, [props.timeMin, props.timeMax]);

  const overlappingEvents = useLiveQuery(
    () =>
      db.events
        .where("endUnix")
        .aboveOrEqual(end)
        .and((event) => event.startUnix <= start)
        .toArray(),
    [start, end],
  );

  const eventsInRange = useLiveQuery(
    () =>
      db.events
        .where("startUnix")
        .between(start, end)
        .or("endUnix")
        .between(start, end)
        .toArray(),
    [start, end],
  );

  return React.useMemo(() => {
    return [...(overlappingEvents ?? []), ...(eventsInRange ?? [])].map(
      eventQuery,
    );
  }, [overlappingEvents, eventsInRange]);
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
      },
    ),
  );
}
