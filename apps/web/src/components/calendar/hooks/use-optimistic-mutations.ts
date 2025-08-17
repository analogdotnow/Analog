"use client";

import * as React from "react";
import { useSetAtom } from "jotai";

import { selectedEventsAtom } from "@/atoms/selected-events";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";

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

export function useCreateDraftAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);

  return React.useCallback(
    (event: DraftEvent) => {
      setSelectedEvents([event]);
    },
    [setSelectedEvents],
  );
}

export function useSelectAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);

  return React.useCallback(
    (event: CalendarEvent) => {
      setSelectedEvents([event]);
    },
    [setSelectedEvents],
  );
}

export function useUnselectAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);

  return React.useCallback(
    (event: CalendarEvent) => {
      setSelectedEvents((prev) => {
        return prev.filter((e) => e.id !== event.id);
      });
    },
    [setSelectedEvents],
  );
}

export function useUnselectAllAction() {
  const setSelectedEvents = useSetAtom(selectedEventsAtom);

  return React.useCallback(() => {
    setSelectedEvents([]);
  }, [setSelectedEvents]);
}
