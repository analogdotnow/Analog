import { Google, Microsoft } from "@/components/icons";

export const providers = [
  {
    name: "Gmail",
    icon: Google,
    providerId: "google" as const,
  },
];

export type ProviderId = (typeof providers)[number]["providerId"];
