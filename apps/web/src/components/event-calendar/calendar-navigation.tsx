"use client";

import { RiCalendarCheckLine } from "@remixicon/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface CalendarNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarNavigation({
  onPrevious,
  onNext,
  onToday,
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center sm:gap-2">
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              aria-label="Previous"
              aria-labelledby="previous-button"
              aria-description="Go previous"
            >
              <ChevronLeftIcon size={16} aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-[200px]"
            sideOffset={4}
          >
            Go previous
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-labelledby="next-button"
              aria-description="Go next"
              onClick={onNext}
              aria-label="Next"
            >
              <ChevronRightIcon size={16} aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-[200px]"
            sideOffset={4}
          >
            Go next
          </TooltipContent>
        </Tooltip>
      </div>

      <Button
        variant="outline"
        className="aspect-square max-[479px]:p-0!"
        onClick={onToday}
      >
        <RiCalendarCheckLine
          className="min-[480px]:hidden"
          size={16}
          aria-hidden="true"
        />
        <span className="max-[479px]:sr-only">Today</span>
      </Button>
    </div>
  );
}
