import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isAfter } from "@repo/temporal";

import { applyOptimisticActions } from "@/hooks/calendar/apply-optimistic-actions";
import { optimisticActionsByEventIdAtom } from "@/hooks/calendar/optimistic-actions";
import { DisplayItem, isEvent } from "@/lib/display-item";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { getCalendarPreference } from "@/store/calendar-store";
import { useDefaultTimeZone } from "@/store/hooks";

export function useProcessedDisplayItems(items: DisplayItem[]) {
  "use memo";

  const defaultTimeZone = useDefaultTimeZone();
  const optimisticActions = useAtomValue(optimisticActionsByEventIdAtom);

  const showPastEvents = useCalendarStore(
    (s) => s.viewPreferences.showPastEvents,
  );
  const calendarPreferences = useCalendarStore((s) => s.calendarPreferences);

  return React.useMemo(() => {
    const eventItems = applyOptimisticActions({
      items,
      timeZone: defaultTimeZone,
      optimisticActions,
    });

    const now = Temporal.Now.zonedDateTimeISO(defaultTimeZone);

    const pastFiltered = showPastEvents
      ? eventItems
      : eventItems.filter((item) => isAfter(item.end, now));

    return pastFiltered.filter((item) => {
      if (!isEvent(item)) {
        return true;
      }

      const preference = getCalendarPreference(
        calendarPreferences,
        item.event.calendar.provider.accountId,
        item.event.calendar.id,
      );

      return !(preference?.hidden === true);
    });
  }, [
    items,
    defaultTimeZone,
    optimisticActions,
    showPastEvents,
    calendarPreferences,
  ]);
}
