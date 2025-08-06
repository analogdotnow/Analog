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
