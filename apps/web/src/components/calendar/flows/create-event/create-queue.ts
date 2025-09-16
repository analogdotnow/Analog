import { assign, fromPromise, setup } from "xstate";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: 'is declared but its value is never read': https://github.com/statelyai/xstate/issues/5090
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Guard } from "xstate/guards";

import type { CalendarEvent } from "@/lib/interfaces";

export interface CreateQueueRequest {
  event: CalendarEvent;
  notify?: boolean;
  onSuccess?: () => void;
}

export interface CreateQueueItem {
  optimisticId: string;
  event: CalendarEvent;
  notify?: boolean;
  onSuccess?: () => void;
}

export function hasAttendees(event: CalendarEvent) {
  return !!event.attendees && event.attendees.length > 0;
}

export type CreateEvent = (item: CreateQueueItem) => Promise<unknown>;
export type RemoveOptimisticAction = (optimisticId: string) => void;

export type Start = { type: "START"; item: CreateQueueItem };
export type NotifyChoice = { type: "NOTIFY_CHOICE"; notify: boolean };
export type Cancel = { type: "CANCEL" };

export type FlowEvent = Start | NotifyChoice | Cancel;

export interface Ctx {
  item: CreateQueueItem | null;
}

export interface CreateCreateQueueMachineOptions {
  createEvent: CreateEvent;
  removeOptimisticAction: RemoveOptimisticAction;
}

export function createCreateQueueMachine({
  createEvent,
  removeOptimisticAction,
}: CreateCreateQueueMachineOptions) {
  return setup({
    types: {
      context: {} as Ctx,
      events: {} as FlowEvent,
    },
    guards: {
      needsNotify: ({ context }) => {
        if (!context.item?.event || !hasAttendees(context.item.event)) {
          return false;
        }

        return context.item?.notify === undefined;
      },
    },
    actions: {
      setItem: assign(({ event }) => ({
        item: (event as Start).item,
      })),
      setNotify: assign(({ context, event }) => ({
        item: context.item
          ? { ...context.item, notify: (event as NotifyChoice).notify }
          : context.item,
      })),
      removeOptimisticAction: ({ context }) => {
        if (!context.item?.optimisticId) {
          return;
        }
        removeOptimisticAction(context.item.optimisticId);
      },
      clear: assign(() => ({ item: null })),
    },
    actors: {
      createEventActor: fromPromise(
        async ({ input }: { input: CreateQueueItem }) => createEvent(input),
      ),
    },
  }).createMachine({
    id: "createEvent",
    context: { item: null },
    initial: "idle",
    states: {
      idle: {
        on: {
          START: { target: "route", actions: "setItem" },
        },
      },

      route: {
        always: [
          {
            guard: ({ context }) => !context.item?.event,
            target: "finalize",
          },
          { guard: "needsNotify", target: "askNotifyAttendee" },
          { target: "mutate" },
        ],
      },

      askNotifyAttendee: {
        on: {
          NOTIFY_CHOICE: { target: "route", actions: "setNotify" },
          CANCEL: { target: "rollback" },
        },
      },

      mutate: {
        invoke: {
          src: "createEventActor",
          input: ({ context }: { context: Ctx }) => context.item!,
          onDone: { target: "finalize" },
          onError: { target: "rollback" },
        },
      },

      rollback: {
        entry: "removeOptimisticAction",
        always: { target: "idle", actions: "clear" },
      },

      finalize: {
        always: { target: "idle", actions: "clear" },
      },
    },
  });
}

export type CreateQueueMachine = ReturnType<typeof createCreateQueueMachine>;
