import * as React from "react";
import { useAtomValue } from "jotai";

import { selectedEventsAtom } from "@/atoms/selected-events";
import { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { optimisticActionsByEventIdAtom } from "./optimistic-actions";

export function useSelectedEvents() {
  const selectedEvents = useAtomValue(selectedEventsAtom);
  const optimisticActions = useAtomValue(optimisticActionsByEventIdAtom);

  const optimisticSelectedEvents = React.useMemo(() => {
    const updated: (CalendarEvent | DraftEvent)[] = [];

    for (const selectedEvent of selectedEvents) {
      // const item = events.data?.events.find((e) => e.event.id === selectedEvent.id);

      const action = optimisticActions[selectedEvent.id];

      if (!action) {
        updated.push(selectedEvent);

        continue;
      }

      if (action.type === "delete") {
        continue;
      }

      if (action.type === "update") {
        updated.push(action.event);
      }

      updated.push(selectedEvent);
    }

    return updated;
  }, [selectedEvents, optimisticActions]);

  return optimisticSelectedEvents;
}
