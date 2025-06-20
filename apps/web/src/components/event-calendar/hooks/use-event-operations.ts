import { useCallback } from "react";
import { toast } from "sonner";

import { useDefaultAccount } from "@/hooks/use-default-account";
import { CALENDAR_CONFIG } from "../constants";
import { CalendarEvent } from "../types";
import {
  generateEventId,
  showEventAddedToast,
  showEventDeletedToast,
  showEventMovedToast,
  showEventUpdatedToast,
} from "../utils";
import { useCalendarActions } from "./use-calendar-actions";

export function useEventOperations(onOperationComplete?: () => void) {
  const defaultAccount = useDefaultAccount();
  const { events, createEvent, updateEvent, deleteEvent } =
    useCalendarActions();

  const handleEventSave = useCallback(
    (event: CalendarEvent) => {
      if (event.id) {
        updateEvent(event);
        showEventUpdatedToast(event);
      } else {
        if (!defaultAccount) {
          toast.error("No default account available, sign in again.");
          return;
        }
        const eventWithId = { ...event, id: generateEventId() };
        createEvent({
          ...eventWithId,
          accountId: defaultAccount.id,
          calendarId: CALENDAR_CONFIG.DEFAULT_CALENDAR_ID,
        });
        showEventAddedToast(eventWithId);
      }
      onOperationComplete?.();
    },
    [defaultAccount, createEvent, onOperationComplete, updateEvent],
  );

  const handleEventDelete = useCallback(
    (eventId: string) => {
      const deletedEvent = events.find((e) => e.id === eventId);

      if (!deletedEvent) {
        console.error(`Event with id ${eventId} not found`);
        return;
      }

      deleteEvent({
        accountId: deletedEvent.accountId,
        calendarId: deletedEvent.calendarId,
        eventId,
      });
      onOperationComplete?.();

      if (deletedEvent) {
        showEventDeletedToast(deletedEvent);
      }
    },
    [events, deleteEvent, onOperationComplete],
  );

  const handleEventMove = useCallback(
    (updatedEvent: CalendarEvent) => {
      updateEvent(updatedEvent);
      showEventMovedToast(updatedEvent);
    },
    [updateEvent],
  );

  return {
    events,
    handleEventSave,
    handleEventDelete,
    handleEventMove,
  };
}
