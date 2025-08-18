import { atom } from "jotai";

import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";

export type SelectedEvents = (CalendarEvent | DraftEvent)[];

export const selectedEventsAtom = atom<SelectedEvents>([]);

export const selectedEventIdsAtom = atom<string[]>([]);

export const formEventAtom = atom<CalendarEvent | DraftEvent | undefined>(undefined);