"use client";

import { CalendarView } from "./types";
import { CalendarViewTitle } from "./calendar-view-title";
import { CalendarNavigation } from "./calendar-navigation";
import { CalendarViewSelector } from "./calendar-view-selector";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  className?: string;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  className,
}: CalendarHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between p-2 sm:p-4 h-16 gap-2 border-b px-4",
        className
      )}
    >
      <div className="flex items-center gap-1 sm:gap-4">
        <SidebarTrigger className="-ml-1" />
        <CalendarViewTitle
          currentDate={currentDate}
          view={view}
          className="text-sm font-semibold sm:text-lg md:text-xl"
        />
      </div>

      <div className="flex items-center gap-2">
        <CalendarNavigation
          onPrevious={onPrevious}
          onNext={onNext}
          onToday={onToday}
        />

        <CalendarViewSelector currentView={view} onViewChange={onViewChange} />
      </div>
    </header>
  );
}
