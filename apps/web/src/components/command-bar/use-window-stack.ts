import * as React from "react";
import { useAtomValue } from "jotai";

import { selectedEventIdsAtom } from "@/atoms/selected-events";
import { windowStackAtom } from "@/atoms/window-stack";
import { StackWindowEntry } from "./stacked-window";

export function useWindowStack() {
  const selectedEvents = useAtomValue(selectedEventIdsAtom);

  const stack = useAtomValue(windowStackAtom);

  const eventWindows = React.useMemo<StackWindowEntry[]>(() => {
    if (selectedEvents.length > 0) {
      return [
        ...selectedEvents.map((eventId, index) => ({
          id: `event-${index}`,
          type: "event" as const,
          eventId,
        })),
      ];
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

  return {
    activeWindowId,
    setActiveWindowId,
    arrangedWindows,
  };
}
