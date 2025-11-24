import { atom } from "jotai";

interface TimeZone {
  id: string;
  label: string;
  default?: boolean;
}

export const timeZonesAtom = atom<TimeZone[]>([
  {
    id: "America/Los_Angeles",
    label: "UTC",
  },
  {
    id: "Europe/Amsterdam",
    label: "CEST",
    default: true,
  },
]);

export const addTimeZoneAtom = atom(null, (get, set, timeZone: TimeZone) => {
  set(timeZonesAtom, [...get(timeZonesAtom), timeZone]);
});

export const removeTimeZoneAtom = atom(null, (get, set, timeZone: TimeZone) => {
  set(
    timeZonesAtom,
    get(timeZonesAtom).filter((tz) => tz !== timeZone),
  );
});
