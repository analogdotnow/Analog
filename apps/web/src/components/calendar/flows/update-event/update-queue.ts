import { assign, fromPromise, setup } from "xstate";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: 'is declared but its value is never read': https://github.com/statelyai/xstate/issues/5090
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Guard } from "xstate/guards";

import type { CalendarEvent } from "@/lib/interfaces";

export interface UpdateQueueRequest {
  event: CalendarEvent;
  scope?: "series" | "instance";
  notify?: boolean;
}

export interface UpdateQueueItem {
  optimisticId: string;
  event: CalendarEvent;
  scope?: "series" | "instance";
  notify?: boolean;
}

export function isRecurring(event: CalendarEvent) {
  return !!event.recurringEventId;
}

export function hasAttendees(event: CalendarEvent) {
  return !!event.attendees && event.attendees.length > 0;
}

export type UpdateEvent = (item: UpdateQueueItem) => Promise<unknown>;
export type RemoveOptimisticAction = (optimisticId: string) => void;

export type Start = { type: "START"; item: UpdateQueueItem };
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
  item: UpdateQueueItem | null;
  queue: UpdateQueueItem[];
}

export interface CreateUpdateQueueMachineOptions {
  updateEvent: UpdateEvent;
  removeOptimisticAction: RemoveOptimisticAction;
}

export function createUpdateQueueMachine({
  updateEvent,
  removeOptimisticAction,
}: CreateUpdateQueueMachineOptions) {
  return setup({
    types: {
      context: {} as Ctx,
      events: {} as FlowEvent,
    },
    guards: {
      promptRecurringScope: ({ context }) => {
        if (!context.item?.event || !isRecurring(context.item.event)) {
          return false;
        }

        return context.item?.scope === undefined;
      },
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
      enqueueItem: assign(({ context, event }) => ({
        queue: [...context.queue, (event as Start).item],
      })),
      processNextInQueue: assign(({ context }) => ({
        item: context.queue[0] || null,
        queue: context.queue.slice(1),
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
      clearQueueOptimisticActions: ({ context }) => {
        // Clean up optimistic actions for queued items that won't be processed
        context.queue.forEach((item) => {
          if (item.optimisticId) {
            removeOptimisticAction(item.optimisticId);
          }
        });
      },
      clear: assign(() => ({ item: null, queue: [] })),
    },
    actors: {
      updateEventActor: fromPromise(
        async ({ input }: { input: UpdateQueueItem }) => updateEvent(input),
      ),
    },
  }).createMachine({
    id: "updateEvent",
    context: { item: null, queue: [] },
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
            target: "checkQueue",
          },
          { guard: "promptRecurringScope", target: "askRecurringScope" },
          { guard: "needsNotify", target: "askNotifyAttendee" },
          { target: "mutate" },
        ],
      },

      askRecurringScope: {
        on: {
          SCOPE_INSTANCE: { target: "route", actions: "setScopeInstance" },
          SCOPE_SERIES: { target: "route", actions: "setScopeSeries" },
          CANCEL: { target: "rollback" },
          START: { actions: "enqueueItem" },
        },
      },

      askNotifyAttendee: {
        on: {
          NOTIFY_CHOICE: { target: "route", actions: "setNotify" },
          CANCEL: { target: "rollback" },
          START: { actions: "enqueueItem" },
        },
      },

      mutate: {
        on: {
          START: { actions: "enqueueItem" },
        },
        invoke: {
          src: "updateEventActor",
          input: ({ context }: { context: Ctx }) => context.item!,
          onDone: { target: "checkQueue" },
          onError: { target: "rollback" },
        },
      },

      rollback: {
        entry: "removeOptimisticAction",
        always: { target: "checkQueue", actions: "clear" },
      },

      checkQueue: {
        always: [
          {
            guard: ({ context }) => context.queue.length > 0,
            target: "route",
            actions: "processNextInQueue",
          },
          { target: "idle" },
        ],
      },
    },
  });
}

export type UpdateQueueMachine = ReturnType<typeof createUpdateQueueMachine>;
