"use client";

import * as React from "react";
import { createActorContext } from "@xstate/react";

import { CalendarEvent } from "@/lib/interfaces";
import { createEventFormMachine } from "./event-form-state";
import { LiveUpdateProvider } from "./live-update";

export const EventFormStateContext = createActorContext(
  createEventFormMachine({
    updateEvent: async () => {
      throw new Error("Not implemented");
    },
  }),
);

interface EventFormStateProviderProps {
  children: React.ReactNode;
}

export function EventFormStateProvider({
  children,
}: EventFormStateProviderProps) {
  const updateEvent = React.useCallback(async (item: CalendarEvent) => {
    return item;
  }, []);

  const logic = React.useMemo(() => {
    return createEventFormMachine({
      updateEvent,
    });
  }, [updateEvent]);

  return (
    <EventFormStateContext.Provider logic={logic}>
      <LiveUpdateProvider>{children}</LiveUpdateProvider>
    </EventFormStateContext.Provider>
  );
}
