"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";

import { useSyncDefaultCalendar } from "@/hooks/calendar/use-sync-default-calendar";
import {
  createCalendarStore,
  type CalendarStore,
} from "@/store/calendar-store";

export type CalendarStoreApi = ReturnType<typeof createCalendarStore>;

export const CalendarStoreContext = createContext<CalendarStoreApi | undefined>(
  undefined,
);

let calendarStoreRef: CalendarStoreApi | null = null;

export function getCalendarStore(): CalendarStoreApi {
  if (!calendarStoreRef) {
    throw new Error(
      "Calendar store not initialized. Make sure CalendarStoreProvider is mounted.",
    );
  }
  return calendarStoreRef;
}

interface CalendarStoreProviderProps {
  children: ReactNode;
}

function CalendarStoreSync({ children }: { children: ReactNode }) {
  useSyncDefaultCalendar();
  return children;
}

export function CalendarStoreProvider({
  children,
}: CalendarStoreProviderProps) {
  const [store] = useState(() => createCalendarStore());

  useEffect(() => {
    calendarStoreRef = store;

    return () => {
      if (calendarStoreRef === store) {
        calendarStoreRef = null;
      }
    };
  }, [store]);

  return (
    <CalendarStoreContext.Provider value={store}>
      <CalendarStoreSync>{children}</CalendarStoreSync>
    </CalendarStoreContext.Provider>
  );
}

export const useCalendarStore = <T,>(
  selector: (store: CalendarStore) => T,
): T => {
  const calendarStoreContext = useContext(CalendarStoreContext);

  if (!calendarStoreContext) {
    throw new Error(
      "useCalendarStore must be used within CalendarStoreProvider",
    );
  }

  return useStore(calendarStoreContext, selector);
};
