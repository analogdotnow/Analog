"use client";

import * as React from "react";

import {
  SettingsPage,
  SettingsSection,
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionTitle,
} from "@/components/settings-dialog/settings-page";
import { IntegrationsList } from "./connected-accounts/integrations-list";

export function ConnectedAccounts() {
  return (
    <SettingsPage>
      <SettingsSection>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SettingsSectionHeader>
            <SettingsSectionTitle>Connected Accounts</SettingsSectionTitle>
            <SettingsSectionDescription>
              Grant access so Analog can automate work across your other tools.
            </SettingsSectionDescription>
          </SettingsSectionHeader>
        </div>
        <IntegrationsList />
      </SettingsSection>
    </SettingsPage>
  );
}
