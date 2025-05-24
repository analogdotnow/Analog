"use client";

import { useId, useState } from "react";
import { RiFilter3Line } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

export interface ViewPreferences {
  showWeekends: boolean;
  showPastEvents: boolean;
  showDeclinedEvents: boolean;
  showWeekNumbers: boolean;
}

export interface ViewPreferencesPopoverProps {
  settings: ViewPreferences;
  onSettingsChange: (settings: ViewPreferences) => void;
}

export function CalendarSettingsPopover({
  settings,
  onSettingsChange,
}: ViewPreferencesPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const showWeekendsId = useId();
  const showPastEventsId = useId();
  const showDeclinedEventsId = useId();
  const showWeekNumbersId = useId();

  const handleSettingChange = (key: keyof ViewPreferences, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Calendar settings"
          className="gap-1.5 max-[479px]:h-8"
        >
          <RiFilter3Line size={16} aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">View Settings</h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={showWeekendsId} className="text-sm font-normal">
                Weekends
              </Label>
              <Switch
                id={showWeekendsId}
                checked={settings.showWeekends}
                onCheckedChange={(checked) =>
                  handleSettingChange("showWeekends", checked)
                }
                className="h-5 w-8 [&_span]:size-4 data-[state=checked]:[&_span]:translate-x-3 data-[state=checked]:[&_span]:rtl:-translate-x-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor={showPastEventsId} className="text-sm font-normal">
                Past events
              </Label>
              <Switch
                id={showPastEventsId}
                checked={settings.showPastEvents}
                onCheckedChange={(checked) =>
                  handleSettingChange("showPastEvents", checked)
                }
                className="h-5 w-8 [&_span]:size-4 data-[state=checked]:[&_span]:translate-x-3 data-[state=checked]:[&_span]:rtl:-translate-x-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor={showDeclinedEventsId}
                className="text-sm font-normal"
              >
                Declined events
              </Label>
              <Switch
                id={showDeclinedEventsId}
                checked={settings.showDeclinedEvents}
                onCheckedChange={(checked) =>
                  handleSettingChange("showDeclinedEvents", checked)
                }
                className="h-5 w-8 [&_span]:size-4 data-[state=checked]:[&_span]:translate-x-3 data-[state=checked]:[&_span]:rtl:-translate-x-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor={showWeekNumbersId}
                className="text-sm font-normal"
              >
                Week numbers
              </Label>
              <Switch
                id={showWeekNumbersId}
                checked={settings.showWeekNumbers}
                onCheckedChange={(checked) =>
                  handleSettingChange("showWeekNumbers", checked)
                }
                className="h-5 w-8 [&_span]:size-4 data-[state=checked]:[&_span]:translate-x-3 data-[state=checked]:[&_span]:rtl:-translate-x-3"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
