import { atom, useAtom } from "jotai";

import { CalendarEvent } from "@/lib/interfaces";

export type Action =
  | { id: string; type: "update"; event: CalendarEvent }
  | { id: string; type: "delete"; eventId: string };

export const optimisticActionsAtom = atom<Record<string, Action>>({});

export function useOptimisticActions() {
  const [optimisticActions, setOptimisticActions] = useAtom(
    optimisticActionsAtom,
  );

  return {
    optimisticActions,
    setOptimisticActions,
  };
}

export const addOptimisticActionAtom = atom(
  null,
  (get, set, action: Action) => {
    const currentActions = get(optimisticActionsAtom);

    set(optimisticActionsAtom, {
      ...currentActions,
      [action.id]: action,
    });

    return action.id;
  },
);

export const removeOptimisticActionAtom = atom(null, (get, set, id: string) => {
  const currentActions = get(optimisticActionsAtom);

  const { [id]: action, ...rest } = currentActions;

  set(optimisticActionsAtom, rest);

  return action;
});
