import type { Conference } from "@repo/providers/interfaces";

interface IsConferenceLinkOptions {
  location: string;
  conference: Conference | null | undefined;
}

export function isConferenceLink({
  location,
  conference,
}: IsConferenceLinkOptions): boolean {
  if (!conference) {
    return false;
  }

  if (conference.type === "create") {
    return false;
  }

  return location === conference.video?.joinUrl.value;
}
