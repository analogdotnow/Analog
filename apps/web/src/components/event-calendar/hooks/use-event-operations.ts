import { useCallback } from "react";
import { CalendarEvent } from "../types";
import {
  generateEventId,
  showEventAddedToast,
  showEventDeletedToast,
  showEventMovedToast,
  showEventUpdatedToast,
} from "../utils";

interface UseEventOperationsProps {
  events: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onDialogClose: () => void;
}

export function useEventOperations({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  onDialogClose,
}: UseEventOperationsProps) {
  const handleEventSave = useCallback(
    (event: CalendarEvent) => {
      if (event.id) {
        onEventUpdate?.(event);
        showEventUpdatedToast(event);
      } else {
        const eventWithId = { ...event, id: generateEventId() };
        onEventAdd?.(eventWithId);
        showEventAddedToast(eventWithId);
      }
      onDialogClose();
    },
    [onEventAdd, onEventUpdate, onDialogClose]
  );

  const handleEventDelete = useCallback(
    (eventId: string) => {
      const deletedEvent = events.find((e) => e.id === eventId);
      onEventDelete?.(eventId);
      onDialogClose();

      if (deletedEvent) {
        showEventDeletedToast(deletedEvent);
      }
    },
    [events, onEventDelete, onDialogClose]
  );

  const handleEventMove = useCallback(
    (updatedEvent: CalendarEvent) => {
      onEventUpdate?.(updatedEvent);
      showEventMovedToast(updatedEvent);
    },
    [onEventUpdate]
  );

  return {
    handleEventSave,
    handleEventDelete,
    handleEventMove,
  };
}
