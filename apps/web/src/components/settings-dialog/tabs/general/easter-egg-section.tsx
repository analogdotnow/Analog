"use client";

import * as React from "react";
import { useAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "../../settings-page";

export function EasterEggSelector() {
  const [calendarSettings, setCalendarSettings] = useAtom(calendarSettingsAtom);
  const [easterEggSettingsVisible, setEasterEggSettingsVisible] =
    React.useState(false);

  useHotkeys(
    "shift",
    () => setEasterEggSettingsVisible(true),
    { keydown: true, keyup: false },
    [],
  );

  useHotkeys(
    "shift",
    () => setEasterEggSettingsVisible(false),
    { keydown: false, keyup: true },
    [],
  );

  const onCheckedChange = React.useCallback(() => {
    setCalendarSettings((prev) => ({
      ...prev,
      easterEggsEnabled: !prev.easterEggsEnabled,
    }));
  }, [setCalendarSettings]);

  if (!easterEggSettingsVisible && !calendarSettings.easterEggsEnabled) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <SettingsSectionHeader>
        <SettingsSectionTitle>Easter Eggs</SettingsSectionTitle>
        <SettingsSectionDescription>
          Do you have what it takes to find all the easter eggs?
        </SettingsSectionDescription>
      </SettingsSectionHeader>
      <div className="flex w-48 justify-end">
        <Label htmlFor="settings-easter-eggs" className="sr-only">
          Easter eggs
        </Label>
        <Checkbox
          id="settings-easter-eggs"
          checked={calendarSettings.easterEggsEnabled}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
}
