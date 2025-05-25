/**
 * Calendar State Management Hook
 *
 * Consolidates all calendar state management including:
 * - Date and view state (with context integration)
 * - Event dialog state management
 * - Navigation handlers
 * - Event operation handlers
 * - Keyboard shortcuts
 *
 * This hook serves as the single source of truth for calendar state,
 * eliminating the confusion between local state and context state.
 */

import { useState } from "react";
import { useCalendarContextOptional } from "@/contexts/calendar-context";
import { CalendarEvent, CalendarView } from "../types";
import { useCalendarNavigation } from "./use-calendar-navigation";
import { useEventDialog } from "./use-event-dialog";
import { useEventOperations } from "./use-event-operations";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";

interface UseCalendarStateManagementProps {
  events: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  initialView?: CalendarView;
}

export function useCalendarStateManagement({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  initialView = "week",
}: UseCalendarStateManagementProps) {
  // Unified state management - use context if available, otherwise local state
  const context = useCalendarContextOptional();
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());
  const [localView, setLocalView] = useState<CalendarView>(initialView);

  // Determine the active state source
  const currentDate = context?.currentDate ?? localCurrentDate;
  const setCurrentDate = context?.setCurrentDate ?? setLocalCurrentDate;
  const view = context?.view ?? localView;
  const setView = context?.setView ?? setLocalView;

  // Event dialog state
  const {
    isEventDialogOpen,
    selectedEvent,
    handleEventSelect,
    handleEventCreate,
    handleDialogClose,
  } = useEventDialog();

  // Navigation handlers
  const { handlePrevious, handleNext, handleToday } = useCalendarNavigation({
    currentDate,
    setCurrentDate,
    view,
  });

  // Event operation handlers
  const { handleEventSave, handleEventDelete, handleEventMove } =
    useEventOperations({
      events,
      onEventAdd,
      onEventUpdate,
      onEventDelete,
      onDialogClose: handleDialogClose,
    });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    setView,
    isEventDialogOpen,
  });

  return {
    // State
    currentDate,
    view,
    setView,
    isEventDialogOpen,
    selectedEvent,

    // Navigation
    handlePrevious,
    handleNext,
    handleToday,

    // Event management
    handleEventSelect,
    handleEventCreate,
    handleEventSave,
    handleEventDelete,
    handleEventMove,
    handleDialogClose,
  };
}
