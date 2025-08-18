import * as React from "react";
import { useAtomValue } from "jotai";

import { isBefore } from "@repo/temporal";

import { convertEventToItem, mapEventsToItems } from "./event-collection";
import { optimisticActionsByEventIdAtom } from "./optimistic-actions";
import { insertIntoSorted, useEventQueryParams } from "./use-events";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useOptimisticEvents() {
  const optimisticActions = useAtomValue(optimisticActionsByEventIdAtom);

  const trpc = useTRPC();
  const { timeMin, timeMax, defaultTimeZone } = useEventQueryParams();

  const { data } = useQuery(
    trpc.events.list.queryOptions(
      { timeMin, timeMax, defaultTimeZone },
      {
        select: (data) => {
          return {
            events: mapEventsToItems(data.events, defaultTimeZone),
            recurringMasterEvents: data.recurringMasterEvents,
          };
        },
      },
    ),
  );

  const optimisticEvents = React.useMemo(() => {
    const events = data?.events ?? [];

    let clearedEvents = events.filter(
      (event) => optimisticActions[event.event.id] === undefined,
    );

    for (const action of Object.values(optimisticActions)) {
      if (action.type === "update") {
        const item = convertEventToItem(action.event, defaultTimeZone);

        clearedEvents = insertIntoSorted(clearedEvents, item, (a) =>
          isBefore(a.start, action.event.start, {
            timeZone: defaultTimeZone,
          }),
        );
      }

      if (action.type === "delete") {
        clearedEvents = clearedEvents.filter(
          (event) => event.event.id !== action.eventId,
        );
      }

      if (action.type === "create") {
        const item = convertEventToItem(action.event, defaultTimeZone);
        clearedEvents = insertIntoSorted(clearedEvents, item, (a) =>
          isBefore(a.start, action.event.start, {
            timeZone: defaultTimeZone,
          }),
        );
      }

      if (action.type === "draft") {
        const item = convertEventToItem(action.event, defaultTimeZone);

        clearedEvents = insertIntoSorted(clearedEvents, item, (a) =>
          isBefore(a.start, action.event.start, {
            timeZone: defaultTimeZone,
          }),
        );
      }
    }

    return clearedEvents;
  }, [data?.events, optimisticActions, defaultTimeZone]);

  return optimisticEvents;
}
