import { atom } from "jotai";

import type { CalendarEvent } from "@/components/calendar/interfaces";
import { DraftEvent } from "@/lib/interfaces";

export type SelectedEvents = (CalendarEvent | DraftEvent)[];

export const selectedEventsAtom = atom<SelectedEvents>([]);
