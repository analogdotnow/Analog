import type {
  ConferenceDataInput,
  CreateConferenceRequest,
} from "@analog/google-calendar";
import { detectMeetingLink } from "@analog/meeting-links";

import type { Conference } from "../../../../interfaces";
import type { GoogleCalendarEvent } from "../../interfaces";

function parseConferenceRequestStatus(status?: string) {
  if (status === "pending" || status === "success" || status === "failure") {
    return status;
  }

  return undefined;
}

function extractUrls(text: string) {
  const urlRegex = /https?:\/\/[^\s<>"'{}|\\^`[\]]+/gi;

  return text.match(urlRegex) ?? [];
}

function parseMeetingLink(url: string): Conference | undefined {
  const service = detectMeetingLink(url);

  if (!service) {
    return undefined;
  }

  return {
    type: "conference",
    providerId: "google",
    id: service.id,
    name: service.name,
    video: {
      joinUrl: {
        value: service.joinUrl,
      },
    },
  };
}

function parseConferenceFallback(
  event: GoogleCalendarEvent,
): Conference | undefined {
  // 1. Check hangoutLink (legacy Google Meet)
  if (event.hangoutLink) {
    const service = parseMeetingLink(event.hangoutLink);

    if (service) {
      return service;
    }
  }

  // 2. Check description for meeting links
  if (event.description) {
    const urls = extractUrls(event.description);

    for (const url of urls) {
      const service = parseMeetingLink(url);

      if (service) {
        return service;
      }
    }
  }

  // 3. Check location field
  if (event.location) {
    const urls = extractUrls(event.location);

    for (const url of urls) {
      const service = parseMeetingLink(url);

      if (service) {
        return service;
      }
    }
  }

  // 4. Check source.url
  if (event.source?.url) {
    const service = parseMeetingLink(event.source.url);

    if (service) {
      return service;
    }
  }

  // 6. Check attachments
  if (event.attachments) {
    for (const attachment of event.attachments) {
      if (attachment.fileUrl) {
        const service = parseMeetingLink(attachment.fileUrl);

        if (service) {
          return service;
        }
      }
    }
  }

  // 7. Check gadget.link (legacy)
  if (event.gadget?.link) {
    const service = parseMeetingLink(event.gadget.link);

    if (service) {
      return service;
    }
  }

  return undefined;
}

function isCreatingConferenceRequest(
  createRequest?: CreateConferenceRequest,
): createRequest is CreateConferenceRequest {
  if (!createRequest) {
    return false;
  }

  return createRequest.status?.statusCode !== "success";
}

export function parseConferenceData(
  event: GoogleCalendarEvent,
): Conference | undefined {
  if (isCreatingConferenceRequest(event.conferenceData?.createRequest)) {
    return {
      type: "create",
      providerId: "google",
      requestId: event.conferenceData.createRequest.requestId!,
      status: parseConferenceRequestStatus(
        event.conferenceData.createRequest.status?.statusCode,
      ),
    };
  }

  if (!event.conferenceData?.entryPoints?.length) {
    // If no conference data, fall back to searching other fields
    return parseConferenceFallback(event);
  }

  // There is at most one video entry point
  const videoEntryPoint = event.conferenceData.entryPoints.find(
    (e) => e.entryPointType === "video",
  );

  // There is at most one sip entry point
  const sipEntryPoint = event.conferenceData.entryPoints.find(
    (e) => e.entryPointType === "sip",
  );

  // There can be multiple phone entry points
  const phoneEntryPoints = event.conferenceData.entryPoints.filter(
    (e) => e.entryPointType === "phone" && e.uri,
  );

  // TODO: handle "more" type entry points
  return {
    type: "conference",
    providerId: "google",
    ...(videoEntryPoint?.uri
      ? { id: detectMeetingLink(videoEntryPoint.uri)?.id }
      : {}),
    conferenceId: event.conferenceData.conferenceId,
    name: event.conferenceData.conferenceSolution?.name,
    ...(videoEntryPoint?.uri
      ? {
          video: {
            joinUrl: {
              label: videoEntryPoint.label,
              value: videoEntryPoint.uri,
            },
            meetingCode:
              videoEntryPoint.meetingCode ?? event.conferenceData.conferenceId,
            accessCode: videoEntryPoint.accessCode,
            password: videoEntryPoint.password,
            pin: videoEntryPoint.pin,
          },
        }
      : {}),
    ...(sipEntryPoint?.uri
      ? {
          sip: {
            joinUrl: {
              label: sipEntryPoint.label,
              value: sipEntryPoint.uri,
            },
            meetingCode: sipEntryPoint.meetingCode,
            accessCode: sipEntryPoint.accessCode,
            password: sipEntryPoint.password,
            pin: sipEntryPoint.pin,
          },
        }
      : {}),
    ...(phoneEntryPoints.length > 0
      ? {
          phone: phoneEntryPoints.map((entryPoint) => ({
            joinUrl: {
              label: entryPoint.label,
              value: entryPoint.uri!,
            },
            meetingCode: entryPoint.meetingCode,
            accessCode: entryPoint.accessCode,
            password: entryPoint.password,
            pin: entryPoint.pin,
          })),
        }
      : {}),
  };
}

export function toConferenceData(
  conference: Conference,
): ConferenceDataInput | undefined {
  if (conference.type === "conference") {
    return undefined;
  }

  return {
    createRequest: {
      requestId: conference.requestId,
      conferenceSolutionKey: {
        type: "hangoutsMeet",
      },
    },
  };
}
