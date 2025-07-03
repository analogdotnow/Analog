import { atom, useAtom, useAtomValue } from "jotai";

import type { CalendarEvent } from "@/components/event-calendar";

export type SelectedEvents = CalendarEvent[];

export const selectedEventsAtom = atom<SelectedEvents>([]);

export function useSelectedEvents() {
  const [selectedEvents, setSelectedEvents] = useAtom(selectedEventsAtom);

  const selectedEvent = selectedEvents[0] ?? null;

  function selectEvent(event: CalendarEvent) {
    setSelectedEvents((prev) => {
      const filtered = prev.filter((e) => e.id !== event.id);
      return [event, ...filtered];
    });
  }

  function unselectEvent(eventId: string) {
    setSelectedEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  function clearSelectedEvents() {
    setSelectedEvents([]);
  }

  return {
    selectedEvent,
    selectedEvents,
    selectEvent,
    unselectEvent,
    clearSelectedEvents,
  };
}

export function useSelectedEvent() {
  const selectedEvents = useAtomValue(selectedEventsAtom);

  const selectedEvent = selectedEvents[0] ?? null;

  return selectedEvent;
}
