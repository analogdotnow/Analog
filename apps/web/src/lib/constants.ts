import { Google, Microsoft, Zoom } from "@/components/icons";

export const providers = [
  {
    name: "Gmail",
    icon: Google,
    providerId: "google" as const,
  },
  {
    name: "Outlook",
    icon: Microsoft,
    providerId: "microsoft" as const,
  },
];

export const connections = [
  {
    name: "Zoom",
    icon: Zoom,
    connectionId: "zoom" as const,
  },
];

export type ProviderId = (typeof providers)[number]["providerId"];
export type ConnectionId = (typeof connections)[number]["connectionId"];
