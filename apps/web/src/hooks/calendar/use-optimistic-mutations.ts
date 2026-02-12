"use client";

import * as React from "react";
import { useSetAtom } from "jotai";

import { EventFormStateContext } from "@/components/calendar/flows/event-form/event-form-state-provider";
import type { CalendarEvent } from "@/lib/interfaces";
import {
  createDraftEvent,
  type CreateDraftEventOptions,
} from "@/lib/utils/calendar";
import {
  useDefaultCalendar,
  useSelectedEventList,
  useSetSelectedEventIds,
} from "@/store/hooks";
import {
  addOptimisticActionAtom,
  removeDraftOptimisticActionsByEventIdAtom,
} from "./optimistic-actions";

export function useCreateDraftAction() {
  const setSelectedEventIds = useSetSelectedEventIds();
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);
  const defaultCalendar = useDefaultCalendar();
  const actorRef = EventFormStateContext.useActorRef();
  const unselectAllAction = useUnselectAllAction();

  return React.useCallback(
    (options: CreateDraftEventOptions) => {
      if (!defaultCalendar) {
        return;
      }

      const event = createDraftEvent(options);

      unselectAllAction();

      addOptimisticAction({
        type: "draft",
        eventId: event.id,
        event: {
          ...event,
          type: "draft",
          readOnly: false,
          calendar: {
            id: defaultCalendar.id,
            provider: defaultCalendar.provider,
          },
        } as CalendarEvent,
      });

      setSelectedEventIds([event.id]);

      actorRef.send({ type: "LOAD", item: event as CalendarEvent });
    },
    [
      actorRef,
      defaultCalendar,
      addOptimisticAction,
      setSelectedEventIds,
      unselectAllAction,
    ],
  );
}

export function useSelectAction() {
  const selectedEventIds = useSelectedEventList();
  const setSelectedEventIds = useSetSelectedEventIds();
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );
  const actorRef = EventFormStateContext.useActorRef();

  return React.useCallback(
    (event: CalendarEvent) => {
      for (const eventId of selectedEventIds) {
        if (eventId === event.id) {
          continue;
        }

        removeDraftOptimisticActionsByEventId(eventId);
      }

      setSelectedEventIds([event.id]);

      actorRef.send({ type: "LOAD", item: event });
    },
    [
      setSelectedEventIds,
      actorRef,
      removeDraftOptimisticActionsByEventId,
      selectedEventIds,
    ],
  );
}

export function useUnselectAction() {
  const setSelectedEventIds = useSetSelectedEventIds();
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );

  return React.useCallback(
    (event: CalendarEvent) => {
      if (event.type === "draft") {
        removeDraftOptimisticActionsByEventId(event.id);
      }

      setSelectedEventIds((prev) => prev.filter((id) => id !== event.id));
    },
    [removeDraftOptimisticActionsByEventId, setSelectedEventIds],
  );
}

export function useUnselectAllAction() {
  const selectedEventIds = useSelectedEventList();
  const setSelectedEventIds = useSetSelectedEventIds();
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );

  return React.useCallback(() => {
    for (const eventId of selectedEventIds) {
      removeDraftOptimisticActionsByEventId(eventId);
    }

    setSelectedEventIds([]);
  }, [
    selectedEventIds,
    removeDraftOptimisticActionsByEventId,
    setSelectedEventIds,
  ]);
}
