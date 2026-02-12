"use client";

import * as React from "react";

import { CalendarPicker } from "@/components/calendar/header/calendar-picker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { CalendarNavigation } from "./calendar-navigation";
import { CalendarViewMenu } from "./calendar-view-menu";
import { CalendarViewTitle } from "./calendar-view-title";

type CalendarHeaderProps = React.ComponentProps<"header">;

export function CalendarHeader({ className, ...props }: CalendarHeaderProps) {
  return (
    <header
      className={cn(
        "@container/header flex h-12 items-center justify-between gap-2 p-2 ps-4 select-none",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-0 sm:gap-3">
        <SidebarTrigger className="-ml-1 @max-md/header:hidden" />
        <CalendarViewTitle className="h-8 text-sm font-medium @sm/header:text-lg @md/header:text-xl" />
      </div>

      <div className="flex items-center gap-2">
        <CalendarPicker />
        <CalendarNavigation />
        <CalendarViewMenu />
      </div>
    </header>
  );
}

export const MemoizedCalendarHeader = React.memo(CalendarHeader);
