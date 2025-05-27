"use client";

import { useCallback } from "react";
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

const VIEW_OPTIONS = [
  { value: "month" as const, label: "Month", shortcut: "M" },
  { value: "week" as const, label: "Week", shortcut: "W" },
  { value: "day" as const, label: "Day", shortcut: "D" },
  { value: "agenda" as const, label: "Agenda", shortcut: "A" },
];

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

  const handleViewChange = useCallback(
    (view: CalendarView) => {
      onViewChange(view);
    },
    [onViewChange],
  );

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
        {VIEW_OPTIONS.map(({ value, label, shortcut }) => (
          <DropdownMenuItem key={value} onClick={() => handleViewChange(value)}>
            {label}{" "}
            <DropdownMenuShortcut className="min-w-5 text-center font-thin">
              {shortcut}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
