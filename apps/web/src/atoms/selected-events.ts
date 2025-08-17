import { atom } from "jotai";

import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";

export type SelectedEvents = (CalendarEvent | DraftEvent)[];

export const selectedEventsAtom = atom<SelectedEvents>([]);
