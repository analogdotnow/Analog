import { assign, setup } from "xstate";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: 'is declared but its value is never read': https://github.com/statelyai/xstate/issues/5090
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Guard } from "xstate/guards";

import type { CalendarEvent } from "@/lib/interfaces";
import type { OnWriteSuccess, StageToken } from "../write-lane";

export interface CreateQueueRequest {
  event: CalendarEvent;
  notify?: boolean;
  onSuccess?: OnWriteSuccess;
  // Called when the user dismisses the notify prompt for this create.
  onCancel?: () => void;
}

export interface CreateQueueItem {
  event: CalendarEvent;
  token: StageToken;
  notify?: boolean;
  onSuccess?: OnWriteSuccess;
  onCancel?: () => void;
}

export function hasAttendees(event: CalendarEvent) {
  return (event.attendees?.length ?? 0) > 0;
}

export type Dispatch = (item: CreateQueueItem) => void;
export type CancelItem = (item: CreateQueueItem) => void;

export type Start = { type: "START"; item: CreateQueueItem };
export type NotifyChoice = { type: "NOTIFY_CHOICE"; notify: boolean };
export type Cancel = { type: "CANCEL" };

export type FlowEvent = Start | NotifyChoice | Cancel;

export interface Ctx {
  items: CreateQueueItem[];
  item: CreateQueueItem | undefined;
}

export interface CreateCreateQueueMachineOptions {
  dispatch: Dispatch;
  cancel: CancelItem;
}

// Prompts one item at a time for notify and hands it to the write lane; items
// arriving while a prompt is open wait in `items`.
export function createCreateQueueMachine({
  dispatch,
  cancel,
}: CreateCreateQueueMachineOptions) {
  return setup({
    types: {
      context: {} as Ctx,
      events: {} as FlowEvent,
    },
    guards: {
      hasItems: ({ context }) => context.items.length > 0,
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
    id: "createEvent",
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
          { guard: "needsNotify", target: "askNotifyAttendee" },
          { target: "dispatch" },
        ],
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

export type CreateQueueMachine = ReturnType<typeof createCreateQueueMachine>;
