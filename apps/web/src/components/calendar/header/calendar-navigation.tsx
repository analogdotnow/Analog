"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Temporal } from "temporal-polyfill";

import {
  navigateToNext,
  navigateToPrevious,
} from "@/components/calendar/utils/date-time";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCalendarStore } from "@/providers/calendar-store-provider";
import {
  useCalendarView,
  useDefaultTimeZone,
  useNavigateTo,
} from "@/store/hooks";

export function CalendarNavigation() {
  "use memo";

  const navigateTo = useNavigateTo();
  const view = useCalendarView();
  const defaultTimeZone = useDefaultTimeZone();

  const onPrevious = () => {
    const prevDate = getCalendarStore().getState().currentDate;

    navigateTo(navigateToPrevious(prevDate, view));
  };

  const onNext = () => {
    const prevDate = getCalendarStore().getState().currentDate;

    navigateTo(navigateToNext(prevDate, view));
  };

  const onToday = () => {
    navigateTo(Temporal.Now.plainDateISO(defaultTimeZone));
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="size-8"
            >
              <ChevronLeftIcon className="text-muted-foreground" />
              <span className="sr-only">Previous</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            Move previous
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="size-8"
            >
              <ChevronRightIcon className="text-muted-foreground" />
              <span className="sr-only">Next</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            Move next
          </TooltipContent>
        </Tooltip>
      </div>
      <Button
        variant="outline"
        className="h-8 @max-md/header:hidden"
        onClick={onToday}
      >
        Today
      </Button>
    </div>
  );
}
