"use client";

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  calendar_id: string;
  location?: string;
  attendees: string[];
  all_day: boolean;
  recurring: boolean;
  reminder_minutes?: number;
}

export interface CalendarEventCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  calendar_id: string;
  location?: string;
  attendees: string[];
  all_day: boolean;
  recurring: boolean;
  reminder_minutes?: number;
}

export interface CalendarEventUpdate {
  id: string;
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  attendees?: string[];
  all_day?: boolean;
  recurring?: boolean;
  reminder_minutes?: number;
}

export interface CalendarEventFilter {
  start_date: string;
  end_date: string;
  calendar_ids?: string[];
}

export interface ShortcutConfig {
  key: string;
  modifiers: string[];
  action: string;
  description: string;
}

export interface ShortcutRegistration {
  shortcuts: ShortcutConfig[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user_id: string;
    email: string;
  };
}

// Check if we're running in Tauri
export const isTauri = () => {
  return typeof window !== "undefined" && "__TAURI__" in window;
};

// Auth commands
export const authCommands = {
  openAuthUrl: (): Promise<string> => invoke("open_auth_url"),
  handleAuthCallback: (callbackUrl: string): Promise<AuthResponse> =>
    invoke("handle_auth_callback", { callbackUrl }),
  getAuthStatus: (): Promise<boolean> => invoke("get_auth_status"),
  logout: (): Promise<string> => invoke("logout"),
};

// Calendar commands
export const calendarCommands = {
  getCalendarEvents: (filter: CalendarEventFilter): Promise<CalendarEvent[]> =>
    invoke("get_calendar_events", { filter }),
  createCalendarEvent: (eventData: CalendarEventCreate): Promise<CalendarEvent> =>
    invoke("create_calendar_event", { eventData }),
  updateCalendarEvent: (eventUpdate: CalendarEventUpdate): Promise<CalendarEvent> =>
    invoke("update_calendar_event", { eventUpdate }),
  deleteCalendarEvent: (eventId: string): Promise<string> =>
    invoke("delete_calendar_event", { eventId }),
  syncCalendars: (): Promise<string> => invoke("sync_calendars"),
};

// Shortcut commands
export const shortcutCommands = {
  registerGlobalShortcuts: (shortcuts: ShortcutRegistration): Promise<string> =>
    invoke("register_global_shortcuts", { shortcuts }),
  unregisterGlobalShortcuts: (): Promise<string> =>
    invoke("unregister_global_shortcuts"),
  getRegisteredShortcuts: (): Promise<ShortcutConfig[]> =>
    invoke("get_registered_shortcuts"),
};

// Event listeners
export const eventListeners = {
  onAuthSuccess: (callback: (event: any) => void) =>
    listen("auth-success", callback),
  onAuthLogout: (callback: (event: any) => void) =>
    listen("auth-logout", callback),
  onCalendarEventCreated: (callback: (event: any) => void) =>
    listen("calendar-event-created", callback),
  onCalendarEventUpdated: (callback: (event: any) => void) =>
    listen("calendar-event-updated", callback),
  onCalendarEventDeleted: (callback: (event: any) => void) =>
    listen("calendar-event-deleted", callback),
  onCalendarSyncStarted: (callback: (event: any) => void) =>
    listen("calendar-sync-started", callback),
  onCalendarSyncCompleted: (callback: (event: any) => void) =>
    listen("calendar-sync-completed", callback),
  onGlobalShortcut: (callback: (event: any) => void) =>
    listen("global-shortcut", callback),
};

// Utility functions
export const tauriUtils = {
  isTauri,
  isDesktop: isTauri,
  getVersion: () => {
    if (!isTauri()) return Promise.resolve("web");
    return invoke("tauri", { cmd: "getVersion" });
  },
};