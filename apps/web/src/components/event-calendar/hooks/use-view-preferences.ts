import { useAtomValue } from "jotai";
import { viewPreferencesAtom } from "@/atoms";

export function useViewPreferences() {
  return useAtomValue(viewPreferencesAtom);
}
