import { useCallback, useMemo, useOptimistic, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import * as R from "remeda";
import { Temporal } from "temporal-polyfill";

import {
  compareTemporal,
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from "@repo/temporal";

import {
  SelectedEvents,
  selectedEventsAtom,
  useCalendarSettings,
} from "@/atoms";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { DraftEvent } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import { CalendarEvent } from "../types";
import {
  showEventAddedToast,
  showEventDeletedToast,
  showEventMovedToast,
  showEventUpdatedToast,
} from "../utils";
import { useCalendarMutations } from "./use-calendar-mutations";

export type OptimisticAction =
  | { type: "draft"; event: DraftEvent }
  | { type: "update"; event: CalendarEvent }
  | { type: "select"; event: CalendarEvent }
  | { type: "unselect"; eventId: string }
  | { type: "delete"; eventId: string };

export type EventAction =
  | { type: "update"; event: CalendarEvent }
  | { type: "delete"; eventId: string };

export function useEvents() {
  const trpc = useTRPC();
  const { currentDate } = useCalendarState();

  const { defaultTimeZone, weekStartsOn } = useCalendarSettings();

  const timeMin = useMemo(() => {
    const base = Temporal.PlainDate.from(
      currentDate.toISOString().split("T")[0]!,
    )
      .subtract({
        days: 30,
      })
      .toZonedDateTime({
        timeZone: defaultTimeZone,
      });

    const start = startOfWeek({
      value: base,
      timeZone: defaultTimeZone,
      weekStartsOn,
    });

    return startOfDay({
      value: start,
      timeZone: defaultTimeZone,
    });
  }, [defaultTimeZone, currentDate, weekStartsOn]);

  const timeMax = useMemo(() => {
    const base = Temporal.PlainDate.from(
      currentDate.toISOString().split("T")[0]!,
    )
      .add({
        days: 30,
      })
      .toZonedDateTime({
        timeZone: defaultTimeZone,
      });

    const start = endOfWeek({
      value: base,
      timeZone: defaultTimeZone,
      weekStartsOn,
    });

    return endOfDay({
      value: start,
      timeZone: defaultTimeZone,
    });
  }, [defaultTimeZone, currentDate, weekStartsOn]);

  const query = useQuery(
    trpc.events.list.queryOptions({
      timeMin,
      timeMax,
    }),
  );

  return query;
}

export function useOptimisticEvents(onOperationComplete?: () => void) {
  const query = useEvents();
  const { createMutation, updateMutation, deleteMutation } =
    useCalendarMutations();
  const [selectedEvents, setSelectedEvents] = useAtom(selectedEventsAtom);

  // Transition state for concurrent UI feedback
  const [isPending, startTransition] = useTransition();

  // Optimistic state handling to reflect changes instantly in the UI
  const [optimisticEvents, applyOptimistic] = useOptimistic(
    query.data?.events ?? [],
    (state: CalendarEvent[], action: EventAction) => {
      if (action.type === "delete") {
        return state.filter((e) => e.id !== action.eventId);
      }

      const withoutEvent = state.filter((e) => e.id !== action.event.id);

      // Remove old instance, re-insert respecting sort order
      const insertIdx = R.sortedIndexWith(
        withoutEvent,
        (item) => compareTemporal(item.start, action.event.start) < 0,
      );

      return [
        ...withoutEvent.slice(0, insertIdx),
        { ...action.event },
        ...withoutEvent.slice(insertIdx),
      ];
    },
  );

  const updateEvent = useCallback(
    (event: CalendarEvent) => {
      const exists = optimisticEvents.find((e) => e.id === event.id);

      if (!exists) {
        startTransition(() => applyOptimistic({ type: "update", event }));

        createMutation.mutate(event);
        showEventAddedToast(event);
        onOperationComplete?.();
        return;
      }

      // Optimistically update UI
      startTransition(() => applyOptimistic({ type: "update", event }));

      updateMutation.mutate(event);
      showEventUpdatedToast(event);

      onOperationComplete?.();
    },
    [
      applyOptimistic,
      createMutation,
      onOperationComplete,
      optimisticEvents,
      updateMutation,
    ],
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      const deletedEvent = optimisticEvents.find((e) => e.id === eventId);

      if (!deletedEvent) {
        console.error(`Event with id ${eventId} not found`);
        return;
      }

      // Remove from selected events first if it's selected
      setSelectedEvents((prev) => prev.filter((e) => e.id !== eventId));

      // Optimistically remove event from UI
      startTransition(() => applyOptimistic({ type: "delete", eventId }));

      deleteMutation.mutate({
        accountId: deletedEvent.accountId,
        calendarId: deletedEvent.calendarId,
        eventId,
      });
      showEventDeletedToast(deletedEvent);
      onOperationComplete?.();
    },
    [
      applyOptimistic,
      optimisticEvents,
      deleteMutation,
      onOperationComplete,
      startTransition,
      setSelectedEvents,
    ],
  );

  const moveEvent = useCallback(
    (updatedEvent: CalendarEvent) => {
      // Optimistically move event in UI
      startTransition(() =>
        applyOptimistic({ type: "update", event: updatedEvent }),
      );

      updateMutation.mutate(updatedEvent);
      showEventMovedToast(updatedEvent);
    },
    [applyOptimistic, startTransition, updateMutation],
  );

  const selectEvent = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvents([]);
      setSelectedEvents((prev) => [
        event,
        ...prev.filter((e) => e.id !== event.id),
      ]);
    },
    [setSelectedEvents],
  );

  const draftEvent = useCallback(
    (draft: DraftEvent) => {
      setSelectedEvents([]);
      setSelectedEvents((prev) => [draft, ...prev]);
    },
    [setSelectedEvents],
  );

  const clearSelectedEvents = useCallback(() => {
    setSelectedEvents([]);
  }, [setSelectedEvents]);

  const dispatchAction = useCallback(
    (action: OptimisticAction) => {
      if (action.type === "draft" || action.type === "select") {
        setSelectedEvents([action.event]);
      } else if (action.type === "unselect") {
        setSelectedEvents([]);
      } else if (action.type === "update") {
        updateEvent(action.event);
      } else if (action.type === "delete") {
        deleteEvent(action.eventId);
      }
    },
    [updateEvent, deleteEvent, setSelectedEvents],
  );

  // Derive optimistic selected events from optimistic events - this ensures perfect sync
  const optimisticSelectedEvents = useMemo(() => {
    return selectedEvents.reduce<SelectedEvents>((acc, selectedEvent) => {
      const updatedEvent = optimisticEvents.find(
        (e) => e.id === selectedEvent.id,
      );

      acc.push(updatedEvent ?? selectedEvent);

      return acc;
    }, []);
  }, [optimisticEvents, selectedEvents]);

  return {
    events: optimisticEvents,
    selectedEvents: optimisticSelectedEvents,
    isPending,
    updateEvent,
    deleteEvent,
    moveEvent,
    selectEvent,
    clearSelectedEvents,
    draftEvent,
    dispatchAction,
  };
}
