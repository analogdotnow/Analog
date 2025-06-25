import { useCallback, useOptimistic, useTransition } from "react";
import * as R from "remeda";

import { compareTemporal } from "@repo/temporal";

import { CALENDAR_CONFIG } from "../constants";
import { CalendarEvent } from "../types";
import {
  generateEventId,
  showEventAddedToast,
  showEventDeletedToast,
  showEventMovedToast,
  showEventUpdatedToast,
} from "../utils";
import { useCalendar } from "./use-calendar-actions";

// Types for optimistic reducer actions
type OptimisticAction =
  | { type: "add"; event: CalendarEvent }
  | { type: "update"; event: CalendarEvent }
  | { type: "delete"; eventId: string };

export function useEventOperations(onOperationComplete?: () => void) {
  const { events, createEvent, updateEvent, deleteEvent } = useCalendar();

  // Transition state for concurrent UI feedback
  const [isPending, startTransition] = useTransition();

  // Optimistic state handling to reflect changes instantly in the UI
  const [optimisticEvents, applyOptimistic] = useOptimistic(
    events,
    (state: CalendarEvent[], action: OptimisticAction) => {
      switch (action.type) {
        case "add": {
          // Find correct insertion point (binary-search) to keep list sorted chronologically
          const insertIdx = R.sortedIndexWith(
            state,
            (item) => compareTemporal(item.start, action.event.start) < 0,
          );
          return [
            ...state.slice(0, insertIdx),
            action.event,
            ...state.slice(insertIdx),
          ];
        }
        case "update": {
          // Remove old instance, re-insert respecting sort order
          const withoutOld = state.filter((evt) => evt.id !== action.event.id);
          const insertIdx = R.sortedIndexWith(
            withoutOld,
            (item) => compareTemporal(item.start, action.event.start) < 0,
          );
          return [
            ...withoutOld.slice(0, insertIdx),
            { ...action.event },
            ...withoutOld.slice(insertIdx),
          ];
        }
        case "delete":
          return state.filter((evt) => evt.id !== action.eventId);
        default:
          return state;
      }
    },
  );

  const handleEventSave = useCallback(
    (event: CalendarEvent) => {
      if (event.id) {
        // Optimistically update UI
        startTransition(() => applyOptimistic({ type: "update", event }));

        updateEvent(event);
        showEventUpdatedToast(event);
      } else {
        const eventWithId = { ...event, id: generateEventId() };

        // Optimistically add event to UI
        startTransition(() =>
          applyOptimistic({ type: "add", event: eventWithId }),
        );

        createEvent({
          ...eventWithId,
          calendarId: CALENDAR_CONFIG.DEFAULT_CALENDAR_ID,
        });
        showEventAddedToast(eventWithId);
      }
      onOperationComplete?.();
    },
    [
      applyOptimistic,
      createEvent,
      onOperationComplete,
      startTransition,
      updateEvent,
    ],
  );

  const handleEventDelete = useCallback(
    (eventId: string) => {
      const deletedEvent = optimisticEvents.find((e) => e.id === eventId);

      if (!deletedEvent) {
        console.error(`Event with id ${eventId} not found`);
        return;
      }

      // Optimistically remove event from UI
      startTransition(() => applyOptimistic({ type: "delete", eventId }));

      deleteEvent({
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
      deleteEvent,
      onOperationComplete,
      startTransition,
    ],
  );

  const handleEventMove = useCallback(
    (updatedEvent: CalendarEvent) => {
      // Optimistically move event in UI
      startTransition(() =>
        applyOptimistic({ type: "update", event: updatedEvent }),
      );

      updateEvent(updatedEvent);
      showEventMovedToast(updatedEvent);
    },
    [applyOptimistic, startTransition, updateEvent],
  );

  return {
    events: optimisticEvents,
    isPending,
    handleEventSave,
    handleEventDelete,
    handleEventMove,
  };
}
