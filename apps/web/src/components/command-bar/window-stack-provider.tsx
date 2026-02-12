"use client";

import * as React from "react";

import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useSelectedEventList } from "@/store/hooks";
import type { StackWindowEntry } from "./interfaces";

interface WindowStackContextValue {
  activeWindowId: string | null;
  setActiveWindowId: React.Dispatch<React.SetStateAction<string | null>>;
  arrangedWindows: StackWindowEntry[];
}

const WindowStackContext = React.createContext<WindowStackContextValue | null>(
  null,
);

interface WindowStackProviderProps {
  children: React.ReactNode;
}

export function WindowStackProvider({ children }: WindowStackProviderProps) {
  "use memo";

  const selectedEvents = useSelectedEventList();

  const stack = useCalendarStore((s) => s.windowStack);

  const eventWindows = React.useMemo<StackWindowEntry[]>(() => {
    if (selectedEvents.length > 0) {
      const windows: StackWindowEntry[] = [
        ...selectedEvents.map((eventId, index) => ({
          id: `event-${index}`,
          type: "event" as const,
          eventId,
        })),
      ];

      return windows;
    }

    return [
      {
        id: "event-0",
        type: "event" as const,
        eventId: "default",
      },
    ];
  }, [selectedEvents]);

  const windows = React.useMemo<StackWindowEntry[]>(() => {
    return [...eventWindows, ...stack];
  }, [eventWindows, stack]);

  const [activeWindowId, setActiveWindowId] = React.useState<string | null>(
    () => windows[0]?.id ?? null,
  );

  React.useEffect(() => {
    setActiveWindowId((prev) => {
      if (prev && windows.some((entry) => entry.id === prev)) {
        return prev;
      }

      return windows[0]?.id ?? null;
    });
  }, [windows]);

  const firstSelectedEventId = selectedEvents[0] ?? null;
  const previousSelectedEventIdRef = React.useRef<string | null>(
    firstSelectedEventId,
  );

  React.useEffect(() => {
    if (!firstSelectedEventId) {
      previousSelectedEventIdRef.current = null;
      return;
    }

    if (previousSelectedEventIdRef.current === firstSelectedEventId) {
      return;
    }

    previousSelectedEventIdRef.current = firstSelectedEventId;

    const nextActiveWindow = eventWindows.find(
      (entry) =>
        entry.type === "event" && entry.eventId === firstSelectedEventId,
    );

    if (nextActiveWindow) {
      setActiveWindowId(nextActiveWindow.id);
    }
  }, [firstSelectedEventId, eventWindows]);

  const arrangedWindows = React.useMemo(() => {
    if (windows.length === 0 || !activeWindowId) {
      return windows;
    }

    const activeIndex = windows.findIndex(
      (entry) => entry.id === activeWindowId,
    );

    if (activeIndex <= 0) {
      return windows;
    }

    return [
      windows[activeIndex]!,
      ...windows.slice(0, activeIndex),
      ...windows.slice(activeIndex + 1),
    ];
  }, [windows, activeWindowId]);

  const value: WindowStackContextValue = {
    activeWindowId,
    setActiveWindowId,
    arrangedWindows,
  };

  return (
    <WindowStackContext.Provider value={value}>
      {children}
    </WindowStackContext.Provider>
  );
}

export function useWindowStack() {
  "use memo";

  const context = React.useContext(WindowStackContext);

  if (!context) {
    throw new Error("useWindowStack must be used within a WindowStackProvider");
  }

  return context;
}
