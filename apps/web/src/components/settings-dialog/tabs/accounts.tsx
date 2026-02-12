import * as React from "react";

import {
  SettingsPage,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "@/components/settings-dialog/settings-page";
import { AddAccountButton } from "./accounts/add-account-button";
import { ConnectedAccountsList } from "./accounts/connected-accounts-list";
import { DefaultCalendarPicker } from "./accounts/default-calendar-picker";

export function Accounts() {
  return (
    <SettingsPage>
      <SettingsSection>
        <SettingsSectionHeader>
          <SettingsSectionTitle>Default Calendar</SettingsSectionTitle>
          <SettingsSectionDescription>
            Events will be created in this calendar by default
          </SettingsSectionDescription>
        </SettingsSectionHeader>

        <DefaultCalendarPicker />
      </SettingsSection>

      <SettingsSection>
        <div className="flex items-center justify-between">
          <SettingsSectionHeader>
            <SettingsSectionTitle>Connected Accounts</SettingsSectionTitle>
            <SettingsSectionDescription>
              Accounts that Analog can read and write to
            </SettingsSectionDescription>
          </SettingsSectionHeader>
          <AddAccountButton />
        </div>

        <ConnectedAccountsList />
      </SettingsSection>
    </SettingsPage>
  );
}
