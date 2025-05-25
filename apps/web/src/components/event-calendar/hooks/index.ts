/**
 * Event Calendar Hooks
 *
 * Centralized exports for all custom hooks used throughout the event calendar.
 * Organized by functionality for better maintainability.
 */

// Core state management hooks
export { useCalendarStateManagement } from "./use-calendar-state-management";

// Individual focused hooks
export { useCalendarNavigation } from "./use-calendar-navigation";
export { useEventDialog } from "./use-event-dialog";
export { useEventOperations } from "./use-event-operations";
export { useKeyboardShortcuts } from "./use-keyboard-shortcuts";

// Utility hooks (existing)
export { useCurrentTimeIndicator } from "./use-current-time-indicator";
export { useEventVisibility } from "./use-event-visibility";
