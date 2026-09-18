import { assign, setup } from "xstate";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: 'is declared but its value is never read': https://github.com/statelyai/xstate/issues/5090
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Guard } from "xstate/guards";

import type { CalendarEvent } from "@/lib/interfaces";

export interface DeleteQueueRequest {
  event: CalendarEvent;
  scope?: "series" | "instance";
  notify?: boolean;
}

export interface DeleteQueueItem {
  event: CalendarEvent;
  scope?: "series" | "instance";
  notify?: boolean;
}

export function isRecurring(event: CalendarEvent) {
  return Boolean(event.recurringEventId);
}

export function hasAttendees(event: CalendarEvent) {
  return (event.attendees?.length ?? 0) > 0;
}

export type Dispatch = (item: DeleteQueueItem) => void;
export type CancelItem = (item: DeleteQueueItem) => void;

export type Start = { type: "START"; item: DeleteQueueItem };
export type ScopeInstance = { type: "SCOPE_INSTANCE" };
export type ScopeSeries = { type: "SCOPE_SERIES" };
export type NotifyChoice = { type: "NOTIFY_CHOICE"; notify: boolean };
export type Cancel = { type: "CANCEL" };

export type FlowEvent =
  | Start
  | ScopeInstance
  | ScopeSeries
  | NotifyChoice
  | Cancel;

export interface Ctx {
  items: DeleteQueueItem[];
  item: DeleteQueueItem | undefined;
}

export interface CreateDeleteQueueMachineOptions {
  dispatch: Dispatch;
  cancel: CancelItem;
}

// Prompts one item at a time for scope/notify and hands it to the write lane;
// items arriving while a prompt is open wait in `items`.
export function createDeleteQueueMachine({
  dispatch,
  cancel,
}: CreateDeleteQueueMachineOptions) {
  return setup({
    types: {
      context: {} as Ctx,
      events: {} as FlowEvent,
    },
    guards: {
      hasItems: ({ context }) => context.items.length > 0,
      promptRecurringScope: ({ context }) => {
        if (!context.item || !isRecurring(context.item.event)) {
          return false;
        }

        return context.item.scope === undefined;
      },
      needsNotify: ({ context }) => {
        if (!context.item || !hasAttendees(context.item.event)) {
          return false;
        }

        return context.item.notify === undefined;
      },
    },
    actions: {
      enqueue: assign(({ context, event }) =>
        event.type === "START" ? { items: [...context.items, event.item] } : {},
      ),
      shift: assign(({ context }) => ({
        item: context.items[0],
        items: context.items.slice(1),
      })),
      setScopeInstance: assign(({ context }) => ({
        item: context.item
          ? { ...context.item, scope: "instance" as const }
          : context.item,
      })),
      setScopeSeries: assign(({ context }) => ({
        item: context.item
          ? { ...context.item, scope: "series" as const }
          : context.item,
      })),
      setNotify: assign(({ context, event }) => ({
        item:
          context.item && event.type === "NOTIFY_CHOICE"
            ? { ...context.item, notify: event.notify }
            : context.item,
      })),
      dispatch: ({ context }) => {
        if (context.item) {
          dispatch(context.item);
        }
      },
      cancel: ({ context }) => {
        if (context.item) {
          cancel(context.item);
        }
      },
      clear: assign(() => ({ item: undefined })),
    },
  }).createMachine({
    id: "deleteQueue",
    context: { items: [], item: undefined },
    initial: "idle",
    on: {
      START: { actions: "enqueue" },
    },
    states: {
      idle: {
        on: {
          START: { target: "next", actions: "enqueue" },
        },
      },

      next: {
        always: [
          { guard: "hasItems", target: "route", actions: "shift" },
          { target: "idle" },
        ],
      },

      route: {
        always: [
          { guard: "promptRecurringScope", target: "askRecurringScope" },
          { guard: "needsNotify", target: "askNotifyAttendee" },
          { target: "dispatch" },
        ],
      },

      askRecurringScope: {
        on: {
          SCOPE_INSTANCE: { target: "route", actions: "setScopeInstance" },
          SCOPE_SERIES: { target: "route", actions: "setScopeSeries" },
          CANCEL: { target: "next", actions: ["cancel", "clear"] },
        },
      },

      askNotifyAttendee: {
        on: {
          NOTIFY_CHOICE: { target: "route", actions: "setNotify" },
          CANCEL: { target: "next", actions: ["cancel", "clear"] },
        },
      },

      dispatch: {
        entry: ["dispatch", "clear"],
        always: { target: "next" },
      },
    },
  });
}

export type QueueMachine = ReturnType<typeof createDeleteQueueMachine>;
