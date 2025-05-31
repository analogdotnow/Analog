"use client";

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";

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
  if (typeof window === "undefined") return false;
  
  // Primary detection methods
  const hasTauriGlobal = "__TAURI__" in window;
  const hasTauriInvoke = "__TAURI_INVOKE__" in window;
  
  // Try to detect by attempting to import Tauri
  let canImportTauri = false;
  try {
    // This will only work in Tauri environment
    if (typeof (window as any).__TAURI_INVOKE__ === "function") {
      canImportTauri = true;
    }
  } catch (e) {
    canImportTauri = false;
  }
  
  // Check user agent
  const userAgent = window.navigator?.userAgent || "";
  const isTauriUserAgent = userAgent.includes("Tauri");
  
  // Check for window.ipc which is Tauri-specific
  const hasIpc = "ipc" in window;
  
  // Check location protocol for tauri://
  const isTauriProtocol = window.location.protocol === "tauri:";
  
  const result = hasTauriGlobal || hasTauriInvoke || canImportTauri || isTauriUserAgent || hasIpc || isTauriProtocol;
  
  
  return result;
};

// Auth commands
export const authCommands = {
  startOAuthServer: (): Promise<number> => invoke("start_oauth_server"),
  openAuthUrl: (port: number): Promise<string> => invoke("open_auth_url", { port }),
  exchangeCodeForTokens: (code: string, port: number): Promise<AuthResponse> =>
    invoke("exchange_code_for_tokens", { code, port }),
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
  onOAuthCallback: (callback: (event: any) => void) =>
    listen("oauth_callback", callback),
  onOAuthError: (callback: (event: any) => void) =>
    listen("oauth_error", callback),
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
    return getVersion();
  },
};