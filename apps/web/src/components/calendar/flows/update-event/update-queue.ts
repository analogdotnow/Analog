import { assign, fromPromise, setup } from "xstate";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: 'is declared but its value is never read': https://github.com/statelyai/xstate/issues/5090
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Guard } from "xstate/guards";

import type { CalendarEvent } from "@/lib/interfaces";

// Success passes back the canonical event returned by the provider (absent
// when the update diffed to nothing), so callers can advance the baseline
// they diff subsequent edits against.
export type OnUpdateSuccess = (event?: CalendarEvent) => void;

export interface UpdateQueueRequest {
  changes: Partial<CalendarEvent> & Required<Pick<CalendarEvent, "id">>;
  scope?: "series" | "instance";
  notify?: boolean;
  onSuccess?: OnUpdateSuccess;
}

export interface ReplaceQueueRequest {
  event: CalendarEvent;
  // The snapshot the edit was based on. The diff and If-Match etag must use
  // it — not the current db event — when the two can diverge (remote edits
  // landing while a dirty form suppresses rehydration), so untouched fields
  // are never re-emitted and true conflicts 412 at the provider.
  previous?: CalendarEvent;
  scope?: "series" | "instance";
  notify?: boolean;
  onSuccess?: OnUpdateSuccess;
}

export interface UpdateQueueItem {
  optimisticId: string;
  event: CalendarEvent;
  previous?: CalendarEvent;
  scope?: "series" | "instance";
  notify?: boolean;
  onSuccess?: OnUpdateSuccess;
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
}

export interface CreateUpdateQueueMachineOptions {
  updateEvent: UpdateEvent;
  removeOptimisticAction: RemoveOptimisticAction;
}

interface UpdateEventActorOptions {
  input: UpdateQueueItem;
}

interface UpdateEventMutateContextOptions {
  context: Ctx;
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
      clear: assign(() => ({ item: null })),
    },
    actors: {
      updateEventActor: fromPromise(
        async ({ input }: UpdateEventActorOptions) => updateEvent(input),
      ),
    },
  }).createMachine({
    id: "updateEvent",
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
        },
      },

      askNotifyAttendee: {
        on: {
          NOTIFY_CHOICE: { target: "route", actions: "setNotify" },
          CANCEL: { target: "rollback" },
        },
      },

      mutate: {
        invoke: {
          src: "updateEventActor",
          input: ({ context }: UpdateEventMutateContextOptions) =>
            context.item!,
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

export type UpdateQueueMachine = ReturnType<typeof createUpdateQueueMachine>;
