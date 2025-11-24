import { atom } from "jotai";

import { StackWindowEntry } from "@/components/command-bar/stacked-window";
import { selectedEventIdsAtom } from "./selected-events";

function createWindowId() {
  return `window-${crypto.randomUUID()}`;
}

export const windowStackAtom = atom<StackWindowEntry[]>([]);

export const activeWindowIdAtom = atom<string | null>((get) => {
  const stack = get(windowStackAtom);

  if (stack.length === 0) {
    return null;
  }

  return stack[stack.length - 1]!.id;
});

const eventWindowsAtom = atom<StackWindowEntry[]>((get) => {
  return get(selectedEventIdsAtom).map((eventId) => ({
    id: `window/event.${eventId}`,
    type: "event" as const,
    eventId,
  }));
});

export const arrangedWindowsAtom = atom<StackWindowEntry[]>((get) => {
  const stack = get(windowStackAtom);
  const eventIds = get(selectedEventIdsAtom);

  const eventWindows = eventIds.map((eventId) => ({
    id: `window/event.${eventId}`,
    type: "event" as const,
    eventId,
  }));

  return [...stack];
});

interface AddWindowPayload {
  eventId: string;
}

export const addWindowAtom = atom(
  null,
  (get, set, payload: AddWindowPayload) => {
    const stack = get(windowStackAtom);

    if (stack.some((w) => w.eventId === payload.eventId)) {
      return;
    }

    const window: StackWindowEntry = {
      id: createWindowId(),
      type: "event",
      eventId: payload.eventId,
    };

    set(windowStackAtom, [...stack, window]);
  },
);

export const removeWindowAtom = atom(null, (get, set, id: string) => {
  const stack = get(windowStackAtom);
  set(
    windowStackAtom,
    stack.filter((window) => window.id !== id),
  );
});
