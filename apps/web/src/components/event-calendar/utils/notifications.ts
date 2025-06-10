/**
 * Notification Utilities
 *
 * This file contains utility functions for:
 * - Toast notifications for event operations (add, update, delete, move)
 * - User feedback and status messages
 * - Formatting and message handling
 */

import { format } from "date-fns";
import { toast } from "sonner";

import { toDate } from "@/lib/temporal";
import { TOAST_CONFIG } from "../calendar-constants";
import { CalendarEvent } from "../types";

export function showEventAddedToast(event: CalendarEvent): void {
  toast(`Event "${event.title}" added`, {
    description: format(
      toDate({ value: event.start, timeZone: "UTC" }),
      "MMM d, yyyy",
    ),
    position: TOAST_CONFIG.POSITION,
  });
}

export function showEventUpdatedToast(event: CalendarEvent): void {
  toast(`Event "${event.title}" updated`, {
    description: format(
      toDate({ value: event.start, timeZone: "UTC" }),
      "MMM d, yyyy",
    ),
    position: TOAST_CONFIG.POSITION,
  });
}

export function showEventMovedToast(event: CalendarEvent): void {
  console.log(event.start.toString());
  toast(`Event "${event.title}" moved`, {
    description: format(
      toDate({ value: event.start, timeZone: "UTC" }),
      "MMM d, yyyy",
    ),
    position: TOAST_CONFIG.POSITION,
  });
}

export function showEventDeletedToast(event: CalendarEvent): void {
  toast(`Event "${event.title}" deleted`, {
    description: format(
      toDate({ value: event.start, timeZone: "UTC" }),
      "MMM d, yyyy",
    ),
    position: TOAST_CONFIG.POSITION,
  });
}
