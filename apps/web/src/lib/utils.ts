import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function range(start: number, end: number, step = 1) {
  const output: number[] = [];

  for (let i = start; i <= end; i += step) {
    output.push(i);
  }

  return output;
}

export function groupArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getBrowserLocale() {
  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages;
  }
  return [navigator.language];
}

export function getPrimaryBrowserLocale() {
  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages[0];
  }
  return navigator.language;
}

export function getBrowserDateFormat(): "DMY" | "MDY" | "YMD" {
  const parts = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(new Date());

  const order = parts
    .filter((p) => p.type === "day" || p.type === "month" || p.type === "year")
    .map((p) => p.type)
    .join("");
  switch (order) {
    case "daymonthyear":
      return "DMY";
    case "monthdayyear":
      return "MDY";
    case "yeardaymonth":
    case "yearmonthday":
      return "YMD";
    default:
      return "MDY";
  }
}

interface LocaleWithNonStandardWeekInfo extends Intl.Locale {
  weekInfo: {
    firstDay: number;
  };
}

interface LocaleWithGetWeekInfo extends Intl.Locale {
  getWeekInfo: () => {
    firstDay: number;
  };
}

export function getWeekStartsOn(): number {
  try {
    const info = new Intl.Locale(navigator.language) as LocaleWithGetWeekInfo;

    if (info && typeof info.getWeekInfo().firstDay === "number") {
      return info.getWeekInfo().firstDay;
    }
  } catch (e) {
    // ignore
  }

  try {
    const info = new Intl.Locale(navigator.language) as LocaleWithNonStandardWeekInfo;

    if (info && typeof info.weekInfo.firstDay === "number") {
      return info.weekInfo.firstDay;
    }
  } catch (e) {
    // ignore
  }

  // Fallback to Monday
  return 1;
}

export function uses24HourClock(): boolean {
  const hourCycle = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
  }).resolvedOptions().hourCycle;
  
  return hourCycle === "h23" || hourCycle === "h24";
}

export function getConferencingProviderId(uri?: string) {
  try {
    if (!uri) {
      return "none";
    }

    const url = new URL(uri);
    const hostname = url.hostname.toLowerCase();

    if (
      hostname.includes("meet.google.com") ||
      hostname.includes("hangouts.google.com")
    ) {
      return "google";
    }

    if (hostname.includes("zoom.us") || hostname.includes("zoom.com")) {
      return "zoom";
    }

    return "none";
  } catch {
    // Fallback to string matching for non-URL strings
    const lowerUri = uri?.toLowerCase();
    if (lowerUri?.includes("google")) return "google";
    if (lowerUri?.includes("zoom")) return "zoom";
    return "none";
  }
}
