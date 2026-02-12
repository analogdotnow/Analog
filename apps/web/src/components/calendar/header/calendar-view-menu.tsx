"use client";

import { ChevronDownIcon } from "lucide-react";

import { CalendarView } from "@/components/calendar/interfaces";
import { Button } from "@/components/ui/button";
import { Key } from "@/components/ui/keyboard-shortcut";
import {
  Menu,
  MenuCheckboxItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "@/components/ui/menu";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import type { ViewPreferences } from "@/store/calendar-store";
import {
  useCalendarView,
  useSetCalendarView,
  useSetViewPreferences,
  useViewPreferences,
} from "@/store/hooks";

function CalendarViewPreferences() {
  "use memo";

  const preferences = useViewPreferences();
  const setViewPreferences = useSetViewPreferences();

  const onPreferenceChange = (key: keyof ViewPreferences, value: boolean) => {
    setViewPreferences({ [key]: value });
  };

  return (
    <>
      <MenuCheckboxItem
        checked={preferences.showWeekends}
        onCheckedChange={(checked) =>
          onPreferenceChange("showWeekends", checked)
        }
      >
        Show weekends
      </MenuCheckboxItem>
      <MenuCheckboxItem
        checked={preferences.showWeekNumbers}
        onCheckedChange={(checked) =>
          onPreferenceChange("showWeekNumbers", checked)
        }
      >
        Show week numbers
      </MenuCheckboxItem>
      <MenuCheckboxItem
        checked={preferences.showDeclinedEvents}
        onCheckedChange={(checked) =>
          onPreferenceChange("showDeclinedEvents", checked)
        }
      >
        Show declined events
      </MenuCheckboxItem>
      <MenuCheckboxItem
        checked={preferences.showPastEvents}
        onCheckedChange={(checked) =>
          onPreferenceChange("showPastEvents", checked)
        }
      >
        Show past events
      </MenuCheckboxItem>
    </>
  );
}

const VIEW_OPTIONS = [
  { value: "month" as const, label: "Month", shortcut: "M" },
  { value: "week" as const, label: "Week", shortcut: "W" },
  { value: "day" as const, label: "Day", shortcut: "D" },
  { value: "agenda" as const, label: "Agenda", shortcut: "A" },
];

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

function NumberOfDaysSubmenu() {
  "use memo";

  const weekViewNumberOfDays = useCalendarStore(
    (s) => s.viewPreferences.weekViewNumberOfDays,
  );
  const setViewPreferences = useSetViewPreferences();

  const onDaysChange = (days: string) => {
    setViewPreferences({ weekViewNumberOfDays: parseInt(days, 10) });
  };

  return (
    <MenuSub>
      <MenuSubTrigger inset>Number of days</MenuSubTrigger>
      <MenuSubPopup className="min-w-48">
        <MenuRadioGroup
          value={String(weekViewNumberOfDays ?? 7)}
          onValueChange={onDaysChange}
        >
          {DAYS_OPTIONS.map((days) => (
            <MenuRadioItem key={days} value={String(days)}>
              {days} {days === 1 ? "day" : "days"}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuSubPopup>
    </MenuSub>
  );
}

export function CalendarViewMenu() {
  "use memo";

  const view = useCalendarView();
  const setView = useSetCalendarView();

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant="outline" className="h-8 gap-1.5">
            <span>
              <span className="@min-md/header:hidden" aria-hidden="true">
                {view.charAt(0).toUpperCase()}
              </span>
              <span className="@max-md/header:sr-only">
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </span>
            </span>
            <ChevronDownIcon
              className="-me-1 opacity-60"
              size={16}
              aria-hidden="true"
            />
          </Button>
        }
      />
      <MenuPopup align="end" className="min-w-64">
        <MenuRadioGroup
          value={view}
          onValueChange={(value: CalendarView) => setView(value)}
        >
          {VIEW_OPTIONS.map(({ value, label, shortcut }) => (
            <MenuRadioItem key={value} value={value}>
              {label}
              <MenuShortcut className="min-w-4 justify-center text-center">
                <Key>{shortcut}</Key>
              </MenuShortcut>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        <MenuSeparator />
        <NumberOfDaysSubmenu />
        <MenuSeparator />
        <CalendarViewPreferences />
      </MenuPopup>
    </Menu>
  );
}
