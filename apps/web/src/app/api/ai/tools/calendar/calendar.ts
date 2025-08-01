import { tool, type ToolCallUnion } from "ai";
import * as schemas from "./schemas";
import { CalendarEvent } from "@/lib/interfaces";
import { detectMeetingLink } from "@analog/meeting-links";

function createTools(event: CalendarEvent) {
  const moveEventTool = tool({
    description: "Move a calendar event to a new start/end time.",
    inputSchema: schemas.moveEventSchema,
    execute: async ({ newStart }) => {
      return {
        title: `Move to ${newStart.toLocaleString()}`,
        data: {
          event,
        },
        parameters: {
          newStart,
        },
      };
    },
  });
  
  const emailAttendeesTool = tool({
    description: "Email all attendees of a calendar event.",
    inputSchema: schemas.emailAttendeesSchema,
    execute: async ({ subject, body }) => {
      return {
        title: `Email attendees`,
        data: {
          event,
        },
        parameters: {
          subject,
          body,
        },
      };
    },
  });
  
  const remindPendingAttendeesTool = tool({
    description:
      "Send a reminder to attendees who have not yet accepted the invite.",
    inputSchema: schemas.remindPendingAttendeesSchema,
    execute: async ({ message }) => {
      return {
        title: `Send reminder to attendees`,
        data: {
          event,
        },
        parameters: {
          message,
        },
      };
    },
  });
  
  const getDirectionsTool = tool({
    description:
      "Return navigation directions to the event's physical address.",
    inputSchema: schemas.getDirectionsSchema,
    execute: async ({ transportMode }) => {
      return {
        title: `Get directions to ${event.location}`,
        data: {
          event,
        },
        parameters: {
          transportMode,
        },
      };
    },
  });
  
  const addMeetingLinkTool = tool({
    description:
      "Create & attach a video-conference link, then update the event.",
    inputSchema: schemas.addMeetingLinkSchema,
    execute: async ({ provider }) => {
      return {
        title: `Add meeting link`,
        data: {
          event,
        },
        parameters: {
          provider,
        },
      };
    },
  });
  
  const inviteAttendeesTool = tool({
    description: "Add one or more attendees to an existing event.",
    inputSchema: schemas.inviteAttendeesSchema,
    execute: async ({ attendees }) => {
      return {
        title: `Invite attendees`,
        data: {
          event,
        },
      };
    },
  });
  
  const joinMeetingTool = tool({
    description:
      "Open the attached meeting link if the event starts in ≤10 minutes.",
    inputSchema: schemas.joinMeetingSchema,
    execute: async ({ meetingUrl }) => {
      return {
        title: `Join meeting ${meetingUrl}`,
        data: {
          event,
        },
        parameters: {
          meetingUrl,
        },
      };
    },
  });
  

  
  const searchEventsByPersonTool = tool({
    description:
      "Find calendar events that include the given person as organizer or attendee.",
    inputSchema: schemas.searchEventsByPersonSchema,
    execute: async ({ query, start, end }) => {
      return {
        title: `Search for other events from ${query}`,
        data: {
          event,
        },
      };
  });
  
  const addReminderTool = tool({
    description:
      "Create a reminder relative to the event start time or to the moment you must leave.",
    inputSchema: schemas.addReminderSchema,
    execute: async ({ message }) => {
      return {
        title: `Add reminder`,
        data: {
          event,
        },
      };
    },
  });
  
  const addTaskDependencyTool = tool({
    description:
      "Add a task associated with an event; useful when the event is read-only or prep work is required.",
    inputSchema: schemas.addTaskDependencySchema,
  });
  
  const calendarTools = {
    moveEvent: moveEventTool,
    emailAttendees: emailAttendeesTool,
    remindPendingAttendees: remindPendingAttendeesTool,
    getDirections: getDirectionsTool,
    addOnlineMeetingLink: addOnlineMeetingLinkTool,
    inviteAttendees: inviteAttendeesTool,
    joinMeeting: joinMeetingTool,
    cancelRecurringSeries: cancelRecurringSeriesTool,
    searchEventsByPerson: searchEventsByPersonTool,
    addReminder: addReminderTool,
    addTaskDependency: addTaskDependencyTool,
  };

  return calendarTools;
}

export type CalendarTools = ReturnType<typeof createTools>;
export type CalendarToolCall = ToolCallUnion<CalendarTools>;

function availableTools(event: CalendarEvent) {
  const allTools = createTools(event);
  const tools: Partial<CalendarTools> = {};

  if (!event.readOnly) {
    tools.moveEvent = allTools.moveEvent;
    tools.addOnlineMeetingLink = allTools.addOnlineMeetingLink;
    tools.inviteAttendees = allTools.inviteAttendees;
  }

  if (event.attendees && event.attendees.length > 1) {
    tools.emailAttendees = allTools.emailAttendees;

    if (event.attendees.some((attendee) => !["accepted", "declined"].includes(attendee.status))) {
      tools.remindPendingAttendees = allTools.remindPendingAttendees;
    }
  }

  if (event.location) {
    const meetingLink = detectMeetingLink(event.location);

    if (meetingLink) {
      tools.joinMeeting = allTools.joinMeeting;
    } else {
      tools.getDirections = allTools.getDirections;
    }
  }

  return tools;
}


