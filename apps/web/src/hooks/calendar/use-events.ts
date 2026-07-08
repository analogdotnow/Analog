import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { createEventDisplayItem } from "@/lib/display-item";
import { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

export function useEventQueryParams() {
  "use memo";

  const trpc = useTRPC();
  const defaultTimeZone = useDefaultTimeZone();
  const timeMin = useCalendarStore((s) => s.timeMin);
  const timeMax = useCalendarStore((s) => s.timeMax);

  const queryKey = React.useMemo(
    () =>
      trpc.events.list.queryOptions({
        timeMin: timeMin.toZonedDateTime({ timeZone: defaultTimeZone }),
        timeMax: timeMax.toZonedDateTime({ timeZone: defaultTimeZone }),
        defaultTimeZone,
      }).queryKey,
    [trpc.events.list, timeMin, timeMax, defaultTimeZone],
  );

  return { timeMin, timeMax, defaultTimeZone, queryKey };
}

export function useSelectDisplayItems() {
  "use memo";

  const defaultTimeZone = useDefaultTimeZone();

  return React.useCallback(
    (data: RouterOutputs["events"]["list"]) => {
      if (!data.events) {
        return [];
      }

      return data.events.map((event) =>
        createEventDisplayItem(event, defaultTimeZone),
      );
    },
    [defaultTimeZone],
  );
}

export function useEventsForDisplay() {
  "use memo";

  const trpc = useTRPC();
  const { timeMin, timeMax, defaultTimeZone } = useEventQueryParams();

  // const mockItems = React.useMemo(
  //   () =>
  //     generateMockDisplayItems({
  //       timeZone: defaultTimeZone,
  //       taskCount: 3,
  //       locationCount: 2,
  //       journeyCount: 1,
  //     }),
  //   [defaultTimeZone],
  // );

  const selectDisplayItems = useSelectDisplayItems();

  const select = React.useCallback(
    (data: RouterOutputs["events"]["list"]) => {
      const events = selectDisplayItems(data);
      // events.push(...mockItems);
      return {
        events,
        recurringMasterEvents: data.recurringMasterEvents,
      };
    },
    [selectDisplayItems],
  );

  const { data } = useQuery(
    trpc.events.list.queryOptions(
      {
        timeMin: timeMin.toZonedDateTime({ timeZone: defaultTimeZone }),
        timeMax: timeMax.toZonedDateTime({ timeZone: defaultTimeZone }),
        defaultTimeZone,
      },
      {
        select,
        placeholderData: (previousData) => previousData,
      },
    ),
  );

  return { data };
}
