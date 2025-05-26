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
  onOperationComplete: () => void;
}

export function useEventOperations({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  onOperationComplete,
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
      onOperationComplete();
    },
    [onEventAdd, onEventUpdate, onOperationComplete],
  );

  const handleEventDelete = useCallback(
    (eventId: string) => {
      const deletedEvent = events.find((e) => e.id === eventId);
      onEventDelete?.(eventId);
      onOperationComplete();

      if (deletedEvent) {
        showEventDeletedToast(deletedEvent);
      }
    },
    [events, onEventDelete, onOperationComplete],
  );

  const handleEventMove = useCallback(
    (updatedEvent: CalendarEvent) => {
      onEventUpdate?.(updatedEvent);
      showEventMovedToast(updatedEvent);
    },
    [onEventUpdate],
  );

  return {
    handleEventSave,
    handleEventDelete,
    handleEventMove,
  };
}
