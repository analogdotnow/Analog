"use client";

import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "@/components/settings-dialog/settings-page";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useSetCalendarSettings } from "@/store/hooks";

export function EasterEggSelector() {
  const easterEggsEnabled = useCalendarStore(
    (s) => s.calendarSettings.easterEggsEnabled,
  );
  const setCalendarSettings = useSetCalendarSettings();
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
    setCalendarSettings({ easterEggsEnabled: !easterEggsEnabled });
  }, [setCalendarSettings, easterEggsEnabled]);

  if (!easterEggSettingsVisible && !easterEggsEnabled) {
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
          checked={easterEggsEnabled}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
}
