"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";

import { selectedEventIdsAtom } from "@/atoms/selected-events";
import { useSidebarWithSide } from "@/components/ui/sidebar";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import { EventFormStateContext } from "../flows/event-form/event-form-state-provider";
import {
  addOptimisticActionAtom,
  generateOptimisticId,
  removeDraftOptimisticActionsByEventIdAtom,
} from "./optimistic-actions";

export function useCreateDraftAction() {
  const setSelectedEventIds = useSetAtom(selectedEventIdsAtom);
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);
  const trpc = useTRPC();
  const query = useQuery(trpc.calendars.list.queryOptions());
  const { setOpen: setRightSidebarOpen } = useSidebarWithSide("right");
  const actorRef = EventFormStateContext.useActorRef();
  const unselectAllAction = useUnselectAllAction();

  return React.useCallback(
    (event: DraftEvent) => {
      const defaultCalendar = query.data?.defaultCalendar;

      if (!defaultCalendar) {
        return;
      }

      unselectAllAction();

      const optimisticId = generateOptimisticId();

      addOptimisticAction({
        type: "draft",
        eventId: event.id,
        id: optimisticId,
        event: {
          ...event,
          type: "draft",
          readOnly: false,
          providerId: defaultCalendar.providerId,
          accountId: defaultCalendar.accountId,
          calendarId: defaultCalendar.id,
        },
      });

      setSelectedEventIds([event.id]);
      setRightSidebarOpen(true);

      actorRef.send({ type: "LOAD", item: event as CalendarEvent });
    },
    [
      actorRef,
      query.data?.defaultCalendar,
      addOptimisticAction,
      setSelectedEventIds,
      setRightSidebarOpen,
      unselectAllAction,
    ],
  );
}

export function useSelectAction() {
  const [selectedEventIds, setSelectedEventIds] = useAtom(selectedEventIdsAtom);
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );
  const { setOpen: setRightSidebarOpen } = useSidebarWithSide("right");
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
      setRightSidebarOpen(true);

      actorRef.send({ type: "LOAD", item: event });
    },
    [
      setSelectedEventIds,
      setRightSidebarOpen,
      actorRef,
      removeDraftOptimisticActionsByEventId,
      selectedEventIds,
    ],
  );
}

export function useUnselectAction() {
  const setSelectedEventIds = useSetAtom(selectedEventIdsAtom);
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
  const [selectedEventIds, setSelectedEventIds] = useAtom(selectedEventIdsAtom);
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
