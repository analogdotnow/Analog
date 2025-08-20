import * as React from "react";
import { useAtomValue } from "jotai";

import { selectedEventsAtom } from "@/atoms/selected-events";
import { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { optimisticActionsByEventIdAtom } from "./optimistic-actions";
import { useOptimisticEvents } from "./use-optimistic-events";

export function useSelectedEvents() {
  const events = useOptimisticEvents();
  const selectedEvents = useAtomValue(selectedEventsAtom);
  const optimisticActions = useAtomValue(optimisticActionsByEventIdAtom);

  const optimisticSelectedEvents = React.useMemo(() => {
    const updated: (CalendarEvent | DraftEvent)[] = [];

    for (const selectedEvent of selectedEvents) {
      // const item = events.data?.events.find((e) => e.event.id === selectedEvent.id);

      const event = events.find((e) => e.event.id === selectedEvent.id);

      if (!event) {
        // updated.push(selectedEvent);
        continue;
      }

      const action = optimisticActions[selectedEvent.id];

      if (!action) {
        updated.push(event.event);

        continue;
      }

      if (action.type === "delete") {
        continue;
      }

      if (action.type === "update") {
        updated.push(action.event);

        continue;
      }

      updated.push(selectedEvent);
    }

    return updated;
  }, [selectedEvents, events, optimisticActions]);

  return optimisticSelectedEvents;
}
