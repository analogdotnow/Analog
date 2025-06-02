import { Google, Microsoft } from "@/components/icons";

export const providers = [
  {
    name: "Gmail",
    icon: Google,
    providerId: "google",
  },
  {
    name: "Outlook",
    icon: Microsoft,
    providerId: "microsoft",
  },
];

export type ProviderId = (typeof providers)[number]["providerId"];
