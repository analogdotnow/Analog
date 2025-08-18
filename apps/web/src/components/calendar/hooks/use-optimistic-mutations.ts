"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import { selectedEventsAtom } from "@/atoms/selected-events";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import {
  addOptimisticActionAtom,
  removeDraftOptimisticActionsByEventIdAtom,
} from "./optimistic-actions";

export function useCreateDraftAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);
  const trpc = useTRPC();
  const query = useQuery(trpc.calendars.list.queryOptions());

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
    },
    [
      unselectAllAction,
      query.data?.defaultCalendar,
      addOptimisticAction,
      setSelectedEvents,
    ],
  );
}

export function useSelectAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );

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
    },
    [setSelectedEvents, removeDraftOptimisticActionsByEventId],
  );
}

export function useUnselectAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);
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
    },
    [setSelectedEvents, removeDraftOptimisticActionsByEventId],
  );
}

export function useUnselectAllAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);
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
  }, [setSelectedEvents, removeDraftOptimisticActionsByEventId]);
}
