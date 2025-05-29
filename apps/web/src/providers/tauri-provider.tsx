"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isTauri, eventListeners, authCommands, calendarCommands, shortcutCommands } from "@/lib/tauri";

interface TauriContextType {
  isDesktop: boolean;
  isLoading: boolean;
  auth: typeof authCommands;
  calendar: typeof calendarCommands;
  shortcuts: typeof shortcutCommands;
  events: typeof eventListeners;
}

const TauriContext = createContext<TauriContextType | null>(null);

export function TauriProvider({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTauri = async () => {
      setIsDesktop(isTauri());
      setIsLoading(false);
    };

    checkTauri();
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    // Set up global event listeners for desktop app
    const unlisten: (() => void)[] = [];

    const setupEventListeners = async () => {
      try {
        // Listen for auth events
        const unlistenAuthSuccess = await eventListeners.onAuthSuccess((event) => {
          console.log("Auth success:", event.payload);
          // Handle auth success in your app
        });
        unlisten.push(unlistenAuthSuccess);

        const unlistenAuthLogout = await eventListeners.onAuthLogout(() => {
          console.log("Auth logout");
          // Handle logout in your app
        });
        unlisten.push(unlistenAuthLogout);

        // Listen for global shortcuts
        const unlistenGlobalShortcut = await eventListeners.onGlobalShortcut((event) => {
          console.log("Global shortcut triggered:", event.payload);
          handleGlobalShortcut(event.payload);
        });
        unlisten.push(unlistenGlobalShortcut);

        // Listen for calendar events
        const unlistenCalendarSync = await eventListeners.onCalendarSyncCompleted(() => {
          console.log("Calendar sync completed");
          // Refresh calendar data
        });
        unlisten.push(unlistenCalendarSync);
      } catch (error) {
        console.error("Failed to setup event listeners:", error);
      }
    };

    setupEventListeners();

    return () => {
      unlisten.forEach((fn) => {
        try {
          fn();
        } catch (error) {
          console.error("Failed to unlisten:", error);
        }
      });
    };
  }, [isDesktop]);

  const handleGlobalShortcut = (action: string) => {
    switch (action) {
      case "new-event":
        // Trigger new event dialog
        window.dispatchEvent(new CustomEvent("tauri:new-event"));
        break;
      case "show-today":
        // Navigate to today
        window.dispatchEvent(new CustomEvent("tauri:show-today"));
        break;
      case "week-view":
        // Switch to week view
        window.dispatchEvent(new CustomEvent("tauri:week-view"));
        break;
      case "month-view":
        // Switch to month view
        window.dispatchEvent(new CustomEvent("tauri:month-view"));
        break;
      case "day-view":
        // Switch to day view
        window.dispatchEvent(new CustomEvent("tauri:day-view"));
        break;
      default:
        console.log("Unknown shortcut action:", action);
    }
  };

  const value: TauriContextType = {
    isDesktop,
    isLoading,
    auth: authCommands,
    calendar: calendarCommands,
    shortcuts: shortcutCommands,
    events: eventListeners,
  };

  return <TauriContext.Provider value={value}>{children}</TauriContext.Provider>;
}

export function useTauri() {
  const context = useContext(TauriContext);
  if (!context) {
    throw new Error("useTauri must be used within a TauriProvider");
  }
  return context;
}

export function useIsDesktop() {
  const { isDesktop } = useTauri();
  return isDesktop;
}