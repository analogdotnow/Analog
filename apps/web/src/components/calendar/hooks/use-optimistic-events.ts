import * as React from "react";
import { useAtomValue } from "jotai";

import { isBefore } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { convertEventToItem } from "./event-collection";
import { optimisticActionsByEventIdAtom } from "./optimistic-actions";
import { insertIntoSorted, useEvents } from "./use-events";

export type Action =
  | { type: "draft"; event: DraftEvent }
  | {
      type: "update";
      event: CalendarEvent;
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" };
    }
  | { type: "select"; event: CalendarEvent }
  | { type: "unselect"; eventId?: string }
  | {
      type: "delete";
      eventId: string;
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" };
    }
  | {
      type: "move";
      eventId: string;
      source: { accountId: string; calendarId: string };
      destination: { accountId: string; calendarId: string };
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" };
    };

export function useOptimisticEvents() {
  const optimisticActions = useAtomValue(optimisticActionsByEventIdAtom);

  const query = useEvents();

  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  const optimisticEvents = React.useMemo(() => {
    const events = query.data?.events ?? [];

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
    }

    return clearedEvents;
  }, [query.data?.events, optimisticActions, defaultTimeZone]);

  return optimisticEvents;
}
