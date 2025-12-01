import { atom } from "jotai";

import { calendarSettingsAtom } from "./calendar-settings";

interface TimeZone {
  id: string;
  label?: string;
  default: boolean;
}

export const timeZonesAtom = atom<TimeZone[]>((get) => {
  const settings = get(calendarSettingsAtom);

  return [
    {
      id: settings.defaultTimeZone,
      default: true,
    },
  ];
});

// TODO: Add these atoms back in when we have a way to manage timezones
// export const addTimeZoneAtom = atom(null, (get, set, timeZone: TimeZone) => {
//   set(timeZonesAtom, [...get(timeZonesAtom), timeZone]);
// });
//
// export const removeTimeZoneAtom = atom(null, (get, set, timeZone: TimeZone) => {
//   set(
//     timeZonesAtom,
//     get(timeZonesAtom).filter((tz) => tz !== timeZone),
//   );
// });
