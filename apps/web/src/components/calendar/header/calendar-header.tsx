"use client";

import { CalendarPicker } from "@/components/calendar-picker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { CalendarNavigation } from "./calendar-navigation";
import { CalendarViewMenu } from "./calendar-view-menu";
import { CalendarViewTitle } from "./calendar-view-title";

type CalendarHeaderProps = React.ComponentProps<"header">;

export function CalendarHeader({
  className,
  ref,
  ...props
}: CalendarHeaderProps) {
  return (
    <header
      className={cn(
        "@container/header flex h-12 items-center justify-between gap-2 p-2 ps-4",
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="flex flex-1 items-center gap-1 sm:gap-4">
        <SidebarTrigger className="-ml-1 @max-md/header:hidden" />
        <CalendarViewTitle className="text-sm font-medium sm:text-lg md:text-xl" />
      </div>

      <div className="flex items-center gap-2">
        <CalendarPicker />

        <CalendarNavigation />

        <CalendarViewMenu />
      </div>
    </header>
  );
}
