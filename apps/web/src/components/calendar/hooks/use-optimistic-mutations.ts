"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import {
  selectedEventIdsAtom,
  selectedEventsAtom,
} from "@/atoms/selected-events";
import { useSidebarWithSide } from "@/components/ui/sidebar";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import {
  addOptimisticActionAtom,
  removeDraftOptimisticActionsByEventIdAtom,
} from "./optimistic-actions";

export function useCreateDraftAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);
  const setSelectedEventIds = useSetAtom(selectedEventIdsAtom);
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);
  const trpc = useTRPC();
  const query = useQuery(trpc.calendars.list.queryOptions());
  const { setOpen: setRightSidebarOpen } = useSidebarWithSide("right");

  const unselectAllAction = useUnselectAllAction();
  return React.useCallback(
    (event: DraftEvent) => {
      unselectAllAction();
      const defaultCalendar = query.data?.defaultCalendar;

      if (!defaultCalendar) {
        throw new Error("Default calendar not found");
      }

      addOptimisticAction({
        type: "draft",
        eventId: event.id,
        event: {
          ...event,
          type: "draft",
          readOnly: false,
          providerId: defaultCalendar.providerId,
          accountId: defaultCalendar.accountId,
          calendarId: defaultCalendar.id,
        },
      });
      setSelectedEvents([event]);
      setSelectedEventIds([event.id]);
      setRightSidebarOpen(true);
    },
    [
      unselectAllAction,
      query.data?.defaultCalendar,
      addOptimisticAction,
      setSelectedEvents,
      setSelectedEventIds,
      setRightSidebarOpen,
    ],
  );
}

export function useSelectAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);
  const setSelectedEventIds = useSetAtom(selectedEventIdsAtom);
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );
  const { setOpen: setRightSidebarOpen } = useSidebarWithSide("right");

  return React.useCallback(
    (event: CalendarEvent) => {
      setSelectedEvents((prev) => {
        for (const e of prev) {
          if (e.type === "draft" && e.id !== event.id) {
            removeDraftOptimisticActionsByEventId(e.id);
          }
        }
        return [event];
      });
      setSelectedEventIds((prev) => [...prev, event.id]);
      setRightSidebarOpen(true);
    },
    [
      setSelectedEvents,
      removeDraftOptimisticActionsByEventId,
      setSelectedEventIds,
      setRightSidebarOpen,
    ],
  );
}

export function useUnselectAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);
  const setSelectedEventIds = useSetAtom(selectedEventIdsAtom);
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );

  return React.useCallback(
    (event: CalendarEvent) => {
      setSelectedEvents((prev) => {
        return prev.filter((e) => e.id !== event.id);
      });
      if (event.type === "draft") {
        removeDraftOptimisticActionsByEventId(event.id);
      }
      setSelectedEventIds((prev) => prev.filter((id) => id !== event.id));
    },
    [
      setSelectedEvents,
      removeDraftOptimisticActionsByEventId,
      setSelectedEventIds,
    ],
  );
}

export function useUnselectAllAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);
  const setSelectedEventIds = useSetAtom(selectedEventIdsAtom);
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );

  return React.useCallback(() => {
    setSelectedEvents((prev) => {
      for (const e of prev) {
        if (e.type === "draft") {
          removeDraftOptimisticActionsByEventId(e.id);
        }
      }
      return [];
    });
    setSelectedEventIds([]);
  }, [
    setSelectedEvents,
    removeDraftOptimisticActionsByEventId,
    setSelectedEventIds,
  ]);
}
