"use client";

import { useCalendarNavigation } from "@/components/event-calendar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCalendarContext } from "@/contexts/calendar-context";
import { cn } from "@/lib/utils";
import { CalendarNavigation } from "./calendar-navigation";
import { CalendarViewSelector } from "./calendar-view-selector";
import { CalendarViewTitle } from "./calendar-view-title";
import { ViewPreferencesPopover } from "./view-preferences-popover";

interface CalendarHeaderProps {
  className?: string;
}

export function CalendarHeader({ className }: CalendarHeaderProps) {
  const { currentDate, view, setView, setCurrentDate } = useCalendarContext();
  const { handlePrevious, handleNext, handleToday } = useCalendarNavigation({
    currentDate,
    setCurrentDate,
    view,
  });

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between gap-2 border-b p-2 px-4 sm:p-4",
        className,
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
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
        />

        <CalendarViewSelector currentView={view} onViewChange={setView} />

        <ViewPreferencesPopover />
      </div>
    </header>
  );
}
