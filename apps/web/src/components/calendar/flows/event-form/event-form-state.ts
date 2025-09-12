import { assign, fromPromise, setup } from "xstate";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: 'is declared but its value is never read': https://github.com/statelyai/xstate/issues/5090
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Guard } from "xstate/guards";

import type { CalendarEvent } from "@/lib/interfaces";
import { hasEventChanged } from "./utils";

export interface QueueEvent {
  type: "QUEUE";
  item: CalendarEvent;
}

export interface SaveEvent {
  type: "SAVE";
  notify?: boolean;
}

export type UpdateEvent = (event: CalendarEvent) => Promise<CalendarEvent>;
export type FormMachineEvent = QueueEvent | SaveEvent;

export interface Ctx {
  formEvent: CalendarEvent | null;
  originalEvent: CalendarEvent | null;
  queuedEvent?: CalendarEvent;
  saved: boolean;
}

export interface CreateEventFormMachineOptions {
  updateEvent: UpdateEvent;
}

export function createEventFormMachine({
  updateEvent,
}: CreateEventFormMachineOptions) {
  return setup({
    types: {
      context: {} as Ctx,
      events: {} as FormMachineEvent,
    },
    actions: {
      enqueue: assign(({ event }) => ({
        queuedEvent: (event as QueueEvent).item,
      })),
      finalize: assign(({ event }) => ({
        formEvent: (event as QueueEvent).item,
      })),
    },
    guards: {
      noActiveEvent: ({ context }) => {
        // console.log("noActiveEvent", context.formEvent, context.originalEvent);
        return context.formEvent === null;
      },
      differentId: ({ context, event }) => {
        // console.log("differentId", context.formEvent, context.originalEvent);
        if (context.formEvent === null) {
          return false;
        }

        return (event as QueueEvent).item.id !== context.formEvent.id;
      },
      sameIdShouldUpdate: ({ context, event }) => {
        // console.log(
        //   "sameIdShouldUpdate",
        //   context.formEvent,
        //   context.originalEvent,
        // );
        if (context.formEvent === null || context.originalEvent === null) {
          return false;
        }

        // if (
        //   !hasEventChanged((event as QueueEvent).item, context.originalEvent)
        // ) {
        //   return false;
        // }

        return true;
      },
      hasQueuedEvent: ({ context }) => context.queuedEvent !== undefined,
    },
    actors: {
      updateEventActor: fromPromise(
        async ({ input }: { input: CalendarEvent }) => updateEvent(input),
      ),
    },
  }).createMachine({
    id: "eventForm",
    context: {
      formEvent: null,
      originalEvent: null,
      queuedEvent: undefined,
      saved: true,
    },
    initial: "ready",
    states: {
      loading: {
        on: {
          QUEUE: { target: "ready" },
        },
      },
      ready: {
        on: {
          QUEUE: [
            {
              guard: "noActiveEvent",
              actions: ["setFormEvent"],
            },
            {
              guard: "differentId",
              // target: "saving",
              actions: ["setFormEvent"],
            },
            {
              guard: "sameIdShouldUpdate",
              actions: ["setFormEvent"],
            },
          ],
          SAVE: { target: "saving" },
        },
      },
      saving: {
        invoke: {
          src: "updateEventActor",
          input: ({ context }) => context.formEvent!,
          onDone: [
            {
              guard: "hasQueuedEvent",
              target: "ready",
              actions: ["refreshWithSaved", "clearQueue"],
            },
            {
              target: "ready",
              actions: "refreshWithSaved",
            },
          ],
        },
        on: {
          QUEUE: {
            actions: "queueEvent",
          },
        },
      },
    },
  });
}

export type EventFormMachine = ReturnType<typeof createEventFormMachine>;
