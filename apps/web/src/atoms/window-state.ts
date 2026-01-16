import { atom } from "jotai";

import { selectedEventIdsAtom } from "@/atoms/selected-display-items";

export const windowStateAtom = atom<"default" | "expanded">((get) => {
  const events = get(selectedEventIdsAtom);

  return events.length > 0 ? "expanded" : "default";
});
