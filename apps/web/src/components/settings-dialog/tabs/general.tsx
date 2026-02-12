import * as React from "react";

import {
  SettingsPage,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "@/components/settings-dialog/settings-page";
import { EasterEggSelector } from "./general/easter-egg-section";
import { StartOfWeekPicker } from "./general/start-or-week-picker";
import { ThemePicker } from "./general/theme-picker";
import { TimeFormatPicker } from "./general/time-format-picker";

export function General() {
  return (
    <SettingsPage>
      <SettingsSection>
        <SettingsSectionHeader>
          <SettingsSectionTitle>Theme</SettingsSectionTitle>
          <SettingsSectionDescription>
            Select a theme to customize the look of your calendar
          </SettingsSectionDescription>
        </SettingsSectionHeader>
        <ThemePicker />
      </SettingsSection>

      <SettingsSection>
        <div className="flex items-center justify-between gap-4">
          <SettingsSectionHeader>
            <SettingsSectionTitle>Start of week</SettingsSectionTitle>
            <SettingsSectionDescription>
              Which day should be shown as the first day of the week.
            </SettingsSectionDescription>
          </SettingsSectionHeader>
          <StartOfWeekPicker />
        </div>

        <div className="flex items-center justify-between gap-4">
          <SettingsSectionHeader>
            <SettingsSectionTitle>Time format</SettingsSectionTitle>
            <SettingsSectionDescription>
              Which format used to display a time.
            </SettingsSectionDescription>
          </SettingsSectionHeader>
          <TimeFormatPicker />
        </div>

        {/* TODO: Finish implementation for date format */}
        {/* <div className="flex items-center justify-between gap-4">
          <SettingsSectionHeader>
            <SettingsSectionTitle>Date format</SettingsSectionTitle>
            <SettingsSectionDescription>
              Which format used to display a date.
            </SettingsSectionDescription>
          </SettingsSectionHeader>
          <DateFormatPicker />
        </div> */}

        {/* When adding new settings, make sure this stays at the bottom of the section */}
        <EasterEggSelector />
      </SettingsSection>
    </SettingsPage>
  );
}
