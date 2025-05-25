"use client";

import { RiCalendarCheckLine } from "@remixicon/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          aria-label="Previous"
        >
          <ChevronLeftIcon size={16} aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext} aria-label="Next">
          <ChevronRightIcon size={16} aria-hidden="true" />
        </Button>
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
