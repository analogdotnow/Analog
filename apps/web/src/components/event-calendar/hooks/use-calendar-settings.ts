import { useAtomValue } from "jotai";

import { calendarSettingsAtom } from "@/atoms";

export function useCalendarSettings() {
  return useAtomValue(calendarSettingsAtom);
}
