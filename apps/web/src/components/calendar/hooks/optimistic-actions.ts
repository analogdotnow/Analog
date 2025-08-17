import { atom } from "jotai";

import { CalendarEvent, DraftEvent } from "@/lib/interfaces";

export type OptimisticAction =
  | { id?: string; type: "draft"; eventId: string; event: DraftEvent }
  | { id?: string; type: "create"; eventId: string; event: CalendarEvent }
  | { id?: string; type: "update"; eventId: string; event: CalendarEvent }
  // | { type: "select"; eventId: string; event: CalendarEvent }
  // | { type: "unselect"; eventId: string }
  | { id?: string; type: "delete"; eventId: string }
  | {
      id?: string;
      type: "move";
      eventId: string;
      source: { accountId: string; calendarId: string };
      destination: { accountId: string; calendarId: string };
    };

export const optimisticActionsAtom = atom<Record<string, OptimisticAction>>({});

export const optimisticActionsByEventIdAtom = atom((get) => {
  const actions = get(optimisticActionsAtom);
  return Object.values(actions).reduce(
    (acc, action) => {
      acc[action.eventId] = action;
      return acc;
    },
    {} as Record<string, OptimisticAction>,
  );
});

export const generateOptimisticId = () =>
  `opt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const isEventAffectedByOptimisticAction = (
  eventId: string,
  actionType?: string,
) =>
  atom((get) => {
    const actions = get(optimisticActionsAtom);
    return Object.values(actions).some((action) => {
      if (actionType && action.type !== actionType) return false;
      return action.eventId === eventId;
    });
  });

export const getEventOptimisticActions = (eventId: string) =>
  atom((get) => {
    const actions = get(optimisticActionsAtom);
    return Object.entries(actions)
      .filter(([_, action]) => action.eventId === eventId)
      .map(([id, action]) => ({ id, ...action }));
  });

export const addOptimisticActionAtom = atom(
  null,
  (get, set, action: OptimisticAction) => {
    const id = action.id ?? generateOptimisticId();
    const currentActions = get(optimisticActionsAtom);
    set(optimisticActionsAtom, {
      ...currentActions,
      [id]: action,
    });
    return id;
  },
);

export const removeOptimisticActionAtom = atom(null, (get, set, id: string) => {
  const currentActions = get(optimisticActionsAtom);
  const { [id]: _, ...rest } = currentActions;
  set(optimisticActionsAtom, rest);
});
