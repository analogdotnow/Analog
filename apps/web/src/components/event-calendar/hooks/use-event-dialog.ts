/**
 * Event Dialog Hook
 *
 * Manages the state and logic for the event dialog including:
 * - Dialog open/close state
 * - Selected event state
 * - Event selection and creation handlers
 * - Dialog state synchronization
 *
 * This hook encapsulates all event dialog related state management
 * that was previously inline in the EventCalendar component.
 */

import { useCallback, useState } from "react";
import { CalendarEvent } from "../types";
import { addHoursToDate, snapTimeToInterval, TIME_INTERVALS } from "../utils";

export function useEventDialog() {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }, []);

  const handleEventCreate = useCallback((startTime: Date) => {
    const snappedTime = snapTimeToInterval(startTime);

    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      start: snappedTime,
      end: addHoursToDate(
        snappedTime,
        TIME_INTERVALS.DEFAULT_EVENT_DURATION_HOURS
      ),
      allDay: false,
    };

    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  }, []);

  return {
    isEventDialogOpen,
    selectedEvent,
    handleEventSelect,
    handleEventCreate,
    handleDialogClose,
  };
}
