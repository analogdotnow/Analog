"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { jotaiStore } from "@/atoms/store";
import { formAtom } from "@/components/event-form/atoms/form";
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useUpdateEventMutation,
} from "@/hooks/calendar/use-event-mutations";
import { db, mapEventQueryInput } from "@/lib/db";
import type { CalendarEvent } from "@/lib/interfaces";
import type { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";
import { useSetSelectedEventIds } from "@/store/hooks";
import {
  createWriteLane,
  type WriteLane,
  type WriteLaneDeps,
} from "./write-lane";

type EventsList = RouterOutputs["events"]["list"];

const WriteLaneContext = React.createContext<WriteLane | null>(null);

export function useWriteLane() {
  const lane = React.useContext(WriteLaneContext);

  if (!lane) {
    throw new Error("useWriteLane must be used within WriteLaneProvider");
  }

  return lane;
}

function replaceEvent(data: EventsList | undefined, event: CalendarEvent) {
  if (!data) {
    return data;
  }

  if (data.recurringMasterEvents[event.id]) {
    return {
      ...data,
      recurringMasterEvents: {
        ...data.recurringMasterEvents,
        [event.id]: event,
      },
    };
  }

  return {
    ...data,
    events: data.events.map((item) => (item.id === event.id ? event : item)),
  };
}

function removeEvent(data: EventsList | undefined, eventId: string) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    recurringMasterEvents: Object.fromEntries(
      Object.entries(data.recurringMasterEvents).filter(
        ([id]) => id !== eventId,
      ),
    ),
    events: data.events.filter((item) => item.id !== eventId),
  };
}

interface WriteLaneProviderProps {
  children: React.ReactNode;
}

export function WriteLaneProvider({ children }: WriteLaneProviderProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const deleteMutation = useDeleteEventMutation();
  const setSelectedEventIds = useSetSelectedEventIds();

  const deps: WriteLaneDeps = {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    writeThrough: async (event) => {
      queryClient.setQueriesData<EventsList>(
        { queryKey: trpc.events.list.pathKey() },
        (prev) => replaceEvent(prev, event),
      );
      await db.events.put(mapEventQueryInput(event));
    },
    remove: async (eventId) => {
      queryClient.setQueriesData<EventsList>(
        { queryKey: trpc.events.list.pathKey() },
        (prev) => removeEvent(prev, eventId),
      );
      await db.events.delete(eventId);
    },
    settle: () =>
      queryClient.invalidateQueries({ queryKey: trpc.events.list.pathKey() }),
    onIdChanged: (previousId, event) => {
      setSelectedEventIds((prev) =>
        prev.map((id) => (id === previousId ? event.id : id)),
      );
      jotaiStore.set(formAtom, (prev) =>
        prev.event?.id === previousId
          ? { event, values: { ...prev.values, id: event.id } }
          : prev,
      );
    },
  };

  const [lane] = React.useState(() => createWriteLane(deps));

  React.useEffect(() => {
    lane.setDeps(deps);
  });

  return (
    <WriteLaneContext.Provider value={lane}>
      {children}
    </WriteLaneContext.Provider>
  );
}
