"use client";

import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarView } from "./types";

interface CalendarViewSelectorProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarViewSelector({
  currentView,
  onViewChange,
}: CalendarViewSelectorProps) {
  const viewDisplayName =
    currentView.charAt(0).toUpperCase() + currentView.slice(1);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
          <span>
            <span className="min-[480px]:hidden" aria-hidden="true">
              {currentView.charAt(0).toUpperCase()}
            </span>
            <span className="max-[479px]:sr-only">{viewDisplayName}</span>
          </span>
          <ChevronDownIcon
            className="-me-1 opacity-60"
            size={16}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuItem onClick={() => onViewChange("month")} disabled>
          Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange("week")}>
          Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange("day")}>
          Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange("agenda")} disabled>
          Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
