import { Google, Microsoft } from "@/components/icons";

export const providers = [
  {
    name: "Google",
    icon: Google,
    id: "google" as const,
  },
  {
    name: "Microsoft",
    icon: Microsoft,
    id: "microsoft" as const,
  },
];

export type ProviderId = "google" | "microsoft";

// Microsoft Graph always emails attendees, so saving without notifying is unsupported.
export function isNotifyRequired(providerId: ProviderId | undefined): boolean {
  return providerId === "microsoft";
}
