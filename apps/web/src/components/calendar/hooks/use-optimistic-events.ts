import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deepEqual } from "fast-equals";
import { useAtom, useAtomValue } from "jotai";
import * as R from "remeda";

import { isBefore } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { SelectedEvents, selectedEventsAtom } from "@/atoms/selected-events";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { isUserOnlyAttendee } from "@/lib/utils/events";
import { EventCollectionItem, convertEventToItem } from "./event-collection";
import { insertIntoSorted, useEvents } from "./use-events";

export type Action =
  | { type: "draft"; event: DraftEvent }
  | { type: "update"; event: CalendarEvent; force?: { sendUpdate: boolean } }
  | { type: "select"; event: CalendarEvent }
  | { type: "unselect"; eventId?: string }
  | { type: "delete"; eventId: string; force?: { sendUpdate: boolean } };

type OptimisticAction =
  | { type: "update"; event: CalendarEvent }
  | { type: "delete"; eventId: string };

type ConfirmationDialogState = {
  open: boolean;
  type: "update" | "delete";
  event: CalendarEvent | null;
  onConfirm: (sendUpdate: boolean) => void;
  onCancel: () => void;
};

export function useOptimisticEvents() {
  const {
    events,
    createMutation,
    updateMutation,
    deleteMutation,
    eventsQueryKey,
  } = useEvents();
  const [selectedEvents, setSelectedEvents] = useAtom(selectedEventsAtom);
  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  const [isPending, startTransition] = useTransition();
  const [confirmationDialog, setConfirmationDialog] =
    useState<ConfirmationDialogState>({
      open: false,
      type: "update",
      event: null,
      onConfirm: () => {},
      onCancel: () => {},
    });

  const [optimisticEvents, applyOptimistic] = useOptimistic(
    events,
    (state: EventCollectionItem[], action: OptimisticAction) => {
      if (action.type === "delete") {
        return state.filter((item) => item.event.id !== action.eventId);
      }

      const withoutEvent = state.filter(
        (item) => item.event.id !== action.event.id,
      );

      const updatedItem = convertEventToItem(action.event, defaultTimeZone);

      const insertIdx = R.sortedIndexWith(withoutEvent, (item) =>
        isBefore(item.start, updatedItem.start),
      );

      return [
        ...withoutEvent.slice(0, insertIdx),
        updatedItem,
        ...withoutEvent.slice(insertIdx),
      ];
    },
  );

  const queryClient = useQueryClient();

  const handleEventSave = useCallback(
    (event: CalendarEvent, force?: { sendUpdate: boolean }) => {
      startTransition(() => applyOptimistic({ type: "update", event }));

      const exists = optimisticEvents.find(
        (item) => item.event.id === event.id,
      );

      if (!exists) {
        createMutation.mutate(event);
        return;
      }

      if (deepEqual(event, exists.event)) {
        return;
      }

      if (force || !event.attendees || isUserOnlyAttendee(event.attendees)) {
        updateMutation.mutate({
          ...event,
          response: force
            ? {
                status: "unknown" as const,
                sendUpdate: force.sendUpdate,
              }
            : undefined,
        });
        return;
      }

      const previousEvents = queryClient.getQueryData(eventsQueryKey);

      queryClient.setQueryData(eventsQueryKey, (prev) => {
        if (!prev) {
          return prev;
        }

        const withoutEvent = prev.events.filter((e) => e.id !== event.id);

        const events = insertIntoSorted(withoutEvent, event, (a) =>
          isBefore(a.start, event.start, { timeZone: defaultTimeZone }),
        );

        return {
          ...prev,
          events,
        };
      });

      setConfirmationDialog({
        open: true,
        type: "update",
        event,
        onConfirm: (sendUpdate: boolean) => {
          updateMutation.mutate({
            ...event,
            response: {
              status: "unknown" as const,
              sendUpdate,
            },
          });

          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
        onCancel: () => {
          queryClient.setQueryData(eventsQueryKey, previousEvents);
          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [
      optimisticEvents,
      queryClient,
      eventsQueryKey,
      applyOptimistic,
      createMutation,
      updateMutation,
      defaultTimeZone,
    ],
  );

  const asyncUpdateEvent = useCallback(
    async (event: CalendarEvent, force?: { sendUpdate: boolean }) => {
      startTransition(() => applyOptimistic({ type: "update", event }));

      const exists = optimisticEvents.find(
        (item) => item.event.id === event.id,
      );

      if (!exists) {
        await createMutation.mutateAsync(event);
        return;
      }

      if (deepEqual(event, exists.event)) {
        return;
      }

      if (force || !event.attendees || isUserOnlyAttendee(event.attendees)) {
        await updateMutation.mutateAsync({
          ...event,
          response: force
            ? {
                status: "unknown" as const,
                sendUpdate: force.sendUpdate,
              }
            : undefined,
        });
        return;
      }

      setConfirmationDialog({
        open: true,
        type: "update",
        event,
        onConfirm: async (sendUpdate: boolean) => {
          await updateMutation.mutateAsync({
            ...event,
            response: {
              status: "unknown" as const,
              sendUpdate,
            },
          });

          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
        onCancel: () => {
          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [applyOptimistic, createMutation, optimisticEvents, updateMutation],
  );

  const handleEventDelete = useCallback(
    (eventId: string, force?: { sendUpdate: boolean }) => {
      startTransition(() => applyOptimistic({ type: "delete", eventId }));

      const deletedEventItem = optimisticEvents.find(
        (item) => item.event.id === eventId,
      );

      if (!deletedEventItem) {
        console.error(`Event with id ${eventId} not found`);
        return;
      }

      const deletedEvent = deletedEventItem.event;

      if (
        force ||
        !deletedEvent.attendees ||
        isUserOnlyAttendee(deletedEvent.attendees)
      ) {
        setSelectedEvents((prev) => prev.filter((e) => e.id !== eventId));

        deleteMutation.mutate({
          accountId: deletedEvent.accountId,
          calendarId: deletedEvent.calendarId,
          eventId,
          sendUpdate: force?.sendUpdate,
        });

        return;
      }

      setConfirmationDialog({
        open: true,
        type: "delete",
        event: deletedEvent,
        onConfirm: (sendUpdate: boolean) => {
          setSelectedEvents((prev) => prev.filter((e) => e.id !== eventId));

          deleteMutation.mutate({
            accountId: deletedEvent.accountId,
            calendarId: deletedEvent.calendarId,
            eventId,
            sendUpdate,
          });

          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
        onCancel: () => {
          // Revert the optimistic delete
          applyOptimistic({ type: "update", event: deletedEvent });
          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
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
        handleEventSave(action.event, action.force);
      } else if (action.type === "delete") {
        handleEventDelete(action.eventId, action.force);
      }
    },
    [handleEventSave, handleEventDelete, setSelectedEvents],
  );

  const dispatchAsyncAction = useCallback(
    async (action: Action) => {
      if (action.type === "update") {
        await asyncUpdateEvent(action.event, action.force);
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
    confirmationDialog,
  };
}
