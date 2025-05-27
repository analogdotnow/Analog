"use client";

import { useCalendarContext } from "@/contexts/calendar-context";
import { useCalendarNavigation } from "@/components/event-calendar";
import { CalendarViewTitle } from "./calendar-view-title";
import { CalendarNavigation } from "./calendar-navigation";
import { CalendarViewSelector } from "./calendar-view-selector";
import { ViewPreferencesPopover } from "./view-preferences-popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
        "flex items-center justify-between p-2 sm:p-4 h-16 gap-2 border-b px-4",
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
