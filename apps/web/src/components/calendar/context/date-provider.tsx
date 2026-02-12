"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { useDefaultTimeZone } from "@/store/hooks";

interface DateProviderProps {
  children: React.ReactNode;
}

const DateContext = React.createContext<Temporal.PlainDate | null>(null);

/**
 * Provider — supplies the *current* PlainDate and re-renders
 * exactly once per calendrical day (00:00 in TZ) or when `timeZone` changes.
 */
export function DateProvider({ children }: DateProviderProps) {
  const timeZone = useDefaultTimeZone();
  const [date, setDate] = React.useState(() =>
    Temporal.Now.plainDateISO(timeZone),
  );

  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    setDate(Temporal.Now.plainDateISO(timeZone));

    const scheduleNextTick = () => {
      const now = Temporal.Now.zonedDateTimeISO(timeZone);

      const nextMidnight = now.add({ days: 1 }).with({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0,
      });

      const delay = Number(
        nextMidnight.epochMilliseconds - now.epochMilliseconds,
      );

      timerRef.current = window.setTimeout(() => {
        const now = Temporal.Now.plainDateISO(timeZone);

        setDate(now);
        scheduleNextTick();
      }, delay);
    };

    scheduleNextTick();

    return () => clearTimeout(timerRef.current);
  }, [timeZone]);

  return <DateContext.Provider value={date}>{children}</DateContext.Provider>;
}

export function useCurrentDate() {
  const ctx = React.useContext(DateContext);

  if (ctx === null) {
    throw new Error("useCurrentDate must be used inside a <DateProvider>");
  }

  return ctx;
}
