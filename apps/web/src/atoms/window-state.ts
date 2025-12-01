import { atom } from "jotai";

import { selectedEventIdsAtom } from "@/atoms/selected-events";

export const windowStateAtom = atom<"default" | "expanded">((get) => {
  const events = get(selectedEventIdsAtom);

  return events.length > 0 ? "expanded" : "default";
});
