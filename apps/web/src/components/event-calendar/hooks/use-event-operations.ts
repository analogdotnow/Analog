/**
 * Event Operations Hook
 *
 * Handles all event CRUD operations including:
 * - Event creation, updating, and deletion
 * - Toast notifications for user feedback
 * - Event ID generation for new events
 * - Coordination with external event handlers
 *
 * This hook encapsulates all event operation logic and side effects
 * that were previously scattered in the EventCalendar component.
 */

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
        // Update existing event
        onEventUpdate?.(event);
        showEventUpdatedToast(event);
      } else {
        // Create new event
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
