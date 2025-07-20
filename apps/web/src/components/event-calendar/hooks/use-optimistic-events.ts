import { useCallback, useMemo, useOptimistic, useTransition } from "react";
import { useAtom } from "jotai";
import * as R from "remeda";
import { Temporal } from "temporal-polyfill";

import { compareTemporal } from "@repo/temporal";

import { useCalendarSettings } from "@/atoms";
import { SelectedEvents, selectedEventsAtom } from "@/atoms/selected-events";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import {
  EventCollectionItem,
  convertToZonedDateTime,
} from "./event-collection";
import { useEvents } from "./use-events";

export type Action =
  | { type: "draft"; event: DraftEvent }
  | { type: "update"; event: CalendarEvent }
  | { type: "select"; event: CalendarEvent }
  | { type: "unselect"; eventId?: string }
  | { type: "delete"; eventId: string };

type OptimisticAction =
  | { type: "update"; event: CalendarEvent }
  | { type: "delete"; eventId: string };

// Helper function to convert CalendarEvent to EventCollectionItem
function convertEventToItem(
  event: CalendarEvent,
  timeZone: string,
): EventCollectionItem {
  return {
    event,
    start: convertToZonedDateTime(event.start, timeZone),
    end: convertToZonedDateTime(event.end, timeZone).subtract({ seconds: 1 }),
  };
}

export function useOptimisticEvents() {
  const { events, createMutation, updateMutation, deleteMutation } =
    useEvents();
  const [selectedEvents, setSelectedEvents] = useAtom(selectedEventsAtom);
  const { defaultTimeZone } = useCalendarSettings();

  const [isPending, startTransition] = useTransition();

  const [optimisticEvents, applyOptimistic] = useOptimistic(
    events,
    (state: EventCollectionItem[], action: OptimisticAction) => {
      if (action.type === "delete") {
        return state.filter((item) => item.event.id !== action.eventId);
      }

      const withoutEvent = state.filter(
        (item) => item.event.id !== action.event.id,
      );

      // Convert the updated CalendarEvent to EventCollectionItem
      const updatedItem = convertEventToItem(action.event, defaultTimeZone);

      const insertIdx = R.sortedIndexWith(
        withoutEvent,
        (item) => compareTemporal(item.start, updatedItem.start) < 0,
      );

      return [
        ...withoutEvent.slice(0, insertIdx),
        updatedItem,
        ...withoutEvent.slice(insertIdx),
      ];
    },
  );

  const handleEventSave = useCallback(
    (event: CalendarEvent) => {
      startTransition(() => applyOptimistic({ type: "update", event }));

      const exists = optimisticEvents.find(
        (item) => item.event.id === event.id,
      );

      if (!exists) {
        createMutation.mutate(event);
        return;
      }

      updateMutation.mutate(event);
    },
    [applyOptimistic, createMutation, optimisticEvents, updateMutation],
  );

  const asyncUpdateEvent = useCallback(
    async (event: CalendarEvent) => {
      startTransition(() => applyOptimistic({ type: "update", event }));

      const exists = optimisticEvents.find(
        (item) => item.event.id === event.id,
      );

      if (!exists) {
        await createMutation.mutateAsync(event);
        return;
      }

      await updateMutation.mutateAsync(event);
    },
    [applyOptimistic, createMutation, optimisticEvents, updateMutation],
  );

  const handleEventDelete = useCallback(
    (eventId: string) => {
      startTransition(() => applyOptimistic({ type: "delete", eventId }));

      const deletedEventItem = optimisticEvents.find(
        (item) => item.event.id === eventId,
      );

      if (!deletedEventItem) {
        console.error(`Event with id ${eventId} not found`);
        return;
      }

      const deletedEvent = deletedEventItem.event;

      // Remove from selected events first if it's selected
      setSelectedEvents((prev) => prev.filter((e) => e.id !== eventId));

      deleteMutation.mutate({
        accountId: deletedEvent.accountId,
        calendarId: deletedEvent.calendarId,
        eventId,
      });
    },
    [
      applyOptimistic,
      optimisticEvents,
      deleteMutation,
      startTransition,
      setSelectedEvents,
    ],
  );

  const dispatchAction = useCallback(
    (action: Action) => {
      if (action.type === "draft" || action.type === "select") {
        setSelectedEvents([action.event]);
      } else if (action.type === "unselect") {
        setSelectedEvents([]);
      } else if (action.type === "update") {
        handleEventSave(action.event);
      } else if (action.type === "delete") {
        handleEventDelete(action.eventId);
      }
    },
    [handleEventSave, handleEventDelete, setSelectedEvents],
  );

  const dispatchAsyncAction = useCallback(
    async (action: Action) => {
      if (action.type === "update") {
        await asyncUpdateEvent(action.event);
      }
    },
    [asyncUpdateEvent],
  );

  // Derive optimistic selected events from optimistic events - this ensures perfect sync
  const optimisticSelectedEvents = useMemo(() => {
    return selectedEvents.reduce<SelectedEvents>((acc, selectedEvent) => {
      const updatedEventItem = optimisticEvents.find(
        (item) => item.event.id === selectedEvent.id,
      );

      acc.push(updatedEventItem?.event ?? selectedEvent);

      return acc;
    }, []);
  }, [optimisticEvents, selectedEvents]);

  return {
    events: optimisticEvents,
    selectedEvents: optimisticSelectedEvents,
    isPending,
    dispatchAction,
    dispatchAsyncAction,
  };
}
