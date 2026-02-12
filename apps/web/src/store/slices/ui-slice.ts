import type { StateCreator } from "zustand";

import type { StackWindowEntry } from "@/components/command-bar/interfaces";
import type { CalendarStore } from "../calendar-store";

export interface UISlice {
  // State
  commandMenuOpen: boolean;
  commandMenuPages: string[];
  activeLayout: "form" | "calendar" | undefined;
  windowStack: StackWindowEntry[];
  windowsExpanded: boolean;

  // Actions
  setCommandMenuOpen: (open: boolean) => void;
  pushCommandMenuPage: (page: string) => void;
  popCommandMenuPage: () => void;
  resetCommandMenuPages: () => void;
  setActiveLayout: (layout: "form" | "calendar" | undefined) => void;
  addWindow: (payload: { eventId: string }) => void;
  removeWindow: (id: string) => void;
  setWindowsExpanded: (expanded: boolean) => void;
  toggleWindowsExpanded: () => void;
}

function createWindowId() {
  return `window-${crypto.randomUUID()}`;
}

export const createUISlice: StateCreator<
  CalendarStore,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  UISlice
> = (set, get) => ({
  // Initial state
  commandMenuOpen: false,
  commandMenuPages: [],
  activeLayout: undefined,
  windowStack: [],
  windowsExpanded: false,

  // Actions
  setCommandMenuOpen: (open) =>
    set({ commandMenuOpen: open }, undefined, "commandMenu/setOpen"),

  pushCommandMenuPage: (page) =>
    set(
      (state) => ({
        commandMenuPages: [...state.commandMenuPages, page],
      }),
      undefined,
      "commandMenu/pushPage",
    ),

  popCommandMenuPage: () =>
    set(
      (state) => ({
        commandMenuPages: state.commandMenuPages.slice(0, -1),
      }),
      undefined,
      "commandMenu/popPage",
    ),

  resetCommandMenuPages: () =>
    set({ commandMenuPages: [] }, undefined, "commandMenu/resetPages"),

  setActiveLayout: (layout) =>
    set({ activeLayout: layout }, undefined, "layout/setActive"),

  addWindow: (payload) => {
    const stack = get().windowStack;

    if (stack.some((w) => "eventId" in w && w.eventId === payload.eventId)) {
      return;
    }

    const window: StackWindowEntry = {
      id: createWindowId(),
      type: "event",
      eventId: payload.eventId,
    };

    set({ windowStack: [...stack, window] }, undefined, "window/add");
  },

  removeWindow: (id) =>
    set(
      (state) => ({
        windowStack: state.windowStack.filter((w) => w.id !== id),
      }),
      undefined,
      "window/remove",
    ),

  setWindowsExpanded: (expanded) =>
    set({ windowsExpanded: expanded }, undefined, "windows/setExpanded"),

  toggleWindowsExpanded: () =>
    set(
      (state) => ({ windowsExpanded: !state.windowsExpanded }),
      undefined,
      "windows/toggleExpanded",
    ),
});
