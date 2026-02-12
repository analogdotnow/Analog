import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { DisplayItem, createEventDisplayItem } from "@/lib/display-item";
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

  const select = React.useCallback(
    (data: RouterOutputs["events"]["list"]) => {
      if (!data.events) {
        return {
          events: [],
          recurringMasterEvents: {},
        };
      }

      const events: DisplayItem[] = data.events.map((event) =>
        createEventDisplayItem(event, defaultTimeZone),
      );
      // events.push(...mockItems);
      return {
        events,
        recurringMasterEvents: data.recurringMasterEvents,
      };
    },
    [defaultTimeZone],
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
