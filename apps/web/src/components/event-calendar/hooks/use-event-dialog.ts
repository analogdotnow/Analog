import { useCallback, useState } from "react";

import { TIME_INTERVALS } from "../calendar-constants";
import { CalendarEvent } from "../types";
import { addHoursToDate, snapTimeToInterval } from "../utils";

export function useEventDialog(): {
  isEventDialogOpen: boolean;
  selectedEvent: CalendarEvent | null;
  handleEventSelect: (event: CalendarEvent) => void;
  handleEventCreate: (startTime: Date) => void;
  handleDialogClose: () => void;
} {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
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
      start: {
        dateTime: snappedTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: addHoursToDate(
          snappedTime,
          TIME_INTERVALS.DEFAULT_EVENT_DURATION_HOURS,
        ).toISOString(),
        timeZone: "UTC",
      },
      allDay: false,
      calendarId: "primary", // the primary calendar of the logged in user
      accountId: "", // will be set when saved
      providerId: "google", // will be set when saved
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
