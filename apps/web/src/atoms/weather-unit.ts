import { atomWithStorage } from "jotai/utils";

export function preferredTempUnitFromLocale(): "C" | "F" {
  const region = new Intl.Locale(navigator.language).region;

  // Regions that primarily use Fahrenheit
  const F_REGIONS = new Set([
    "US",
    "BS",
    "BZ",
    "KY",
    "PW",
    "LR",
    "FM",
    "MH",
    "GU",
    "PR",
    "VI",
    "AS",
    "MP",
    "TC",
  ]);

  return F_REGIONS.has(region?.toUpperCase() ?? "") ? "F" : "C";
}

export const temperatureUnitAtom = atomWithStorage<"C" | "F">(
  "analog-weather-unit",
  preferredTempUnitFromLocale(),
);
