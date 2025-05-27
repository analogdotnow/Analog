import { useAtom } from "jotai";

import { calendarsVisibilityAtom } from "@/atoms";

export function useCalendarsVisibility() {
  return useAtom(calendarsVisibilityAtom);
}
