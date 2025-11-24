import { assign, setup } from "xstate";

import type { CalendarEvent } from "@/lib/interfaces";

export interface LoadEvent {
  type: "LOAD";
  item: CalendarEvent;
}

export interface ConfirmedEvent {
  type: "CONFIRMED";
}

export interface SaveEvent {
  type: "SAVE";
  notify?: boolean;
}

export type FormMachineEvent = LoadEvent | ConfirmedEvent | SaveEvent;

export interface Ctx {
  formEvent: CalendarEvent | null;
  originalEvent: CalendarEvent | null;
  queuedEvent?: CalendarEvent;
  saved: boolean;
}

export interface CreateEventFormMachineOptions {
  // Reserved for future use; not used by the new state flow.
  updateEvent?: (event: CalendarEvent) => Promise<CalendarEvent>;
}

export function createEventFormMachine(options: CreateEventFormMachineOptions) {
  return setup({
    types: {
      context: {} as Ctx,
      events: {} as FormMachineEvent,
    },
    actions: {
      queueEvent: assign(({ event }) => ({
        queuedEvent: (event as LoadEvent).item,
      })),
      dequeueToFormEvent: assign(({ context }) => ({
        formEvent: context.queuedEvent ?? null,
        queuedEvent: undefined,
      })),
    },
    guards: {
      hasQueuedEvent: ({ context }) => context.queuedEvent !== undefined,
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
      ready: {
        on: {
          LOAD: { actions: ["queueEvent"] },
          // Keep SAVE accepted but do nothing in this flow
          SAVE: {},
        },
        always: [
          {
            guard: "hasQueuedEvent",
            target: "loading",
            actions: ["dequeueToFormEvent"],
          },
        ],
      },
      loading: {
        on: {
          CONFIRMED: { target: "ready" },
          LOAD: { actions: ["queueEvent"] },
        },
        always: [
          {
            guard: "hasQueuedEvent",
            actions: ["dequeueToFormEvent"],
          },
        ],
      },
    },
  });
}

export type EventFormMachine = ReturnType<typeof createEventFormMachine>;
