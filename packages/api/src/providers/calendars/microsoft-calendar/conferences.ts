import { detectMeetingLink } from "@analog/meeting-links";
import type { Event as MicrosoftEvent } from "@microsoft/microsoft-graph-types";

import type { Conference } from "../../../interfaces";

export function toMicrosoftConferenceData(conference: Conference) {
  if (conference.type !== "create") {
    return undefined;
  }

  return {
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness" as const,
  };
}

function parseConferenceFallback(
  event: MicrosoftEvent,
): Conference | undefined {
  if (!event.location) {
    return undefined;
  }

  if (event.location.locationUri) {
    const service = detectMeetingLink(event.location.locationUri);

    if (service) {
      return {
        type: "conference",
        providerId: "microsoft",
        id: service.id,
        name: service.name,
        video: {
          joinUrl: {
            value: service.joinUrl,
          },
        },
      };
    }
  }

  if (!event.location.displayName) {
    return undefined;
  }

  const service = detectMeetingLink(event.location.displayName);

  if (!service) {
    return undefined;
  }

  return {
    type: "conference",
    providerId: "microsoft",
    id: service.id,
    name: service.name,
    video: {
      joinUrl: {
        value: service.joinUrl,
      },
    },
  };
}

export function parseMicrosoftConference(
  event: MicrosoftEvent,
): Conference | undefined {
  const joinUrl = event.onlineMeeting?.joinUrl ?? event.onlineMeetingUrl;

  if (!joinUrl) {
    return parseConferenceFallback(event);
  }

  const phoneNumbers = event.onlineMeeting?.phones
    ?.map((p) => p.number)
    .filter((n): n is string => Boolean(n));

  // TODO: how to handle toll/toll-free numbers and quick dial?
  return {
    type: "conference",
    providerId: "microsoft",
    id: detectMeetingLink(joinUrl)?.id,
    conferenceId: event.onlineMeeting?.conferenceId ?? undefined,
    name:
      event.onlineMeetingProvider === "teamsForBusiness"
        ? "Microsoft Teams"
        : undefined,
    video: {
      joinUrl: {
        value: joinUrl,
      },
      meetingCode: event.onlineMeeting?.conferenceId ?? undefined,
    },
    ...(phoneNumbers &&
      phoneNumbers.length && {
        phone: phoneNumbers.map((number) => ({
          joinUrl: {
            label: number,
            value: number.startsWith("tel:")
              ? number
              : `tel:${number.replace(/[- ]/g, "")}`,
          },
        })),
      }),
  };
}
