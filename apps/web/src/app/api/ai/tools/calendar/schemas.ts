import { z } from "zod";

export const moveEventSchema = z.object({
  eventId: z.string().describe("The Google Calendar event ID (or iCal UID)."),
  newStart: z
    .string()
    .describe("New ISO-8601 start date-time in the event owner's TZ."),
});

export const emailAttendeesSchema = z.object({
  subject: z.string().describe("Email subject line."),
  body: z.string().describe("Plain-text or HTML body."),
});

export const remindPendingAttendeesSchema = z.object({
  message: z.string().describe("Short reminder message (Markdown allowed)."),
});

export const getDirectionsSchema = z.object({
  transportMode: z
    .enum(["driving", "transit", "walking", "cycling"])
    .describe("Preferred transport option."),
});

export const addMeetingLinkSchema = z.object({
  provider: z.enum(["default"]).describe("Video-conference provider to use."),
});

export const inviteAttendeesSchema = z.object({
  emails: z
    .array(z.string().email())
    .min(1)
    .describe("E-mail addresses of the people to invite."),
});

export const joinMeetingSchema = z.object({
  meetingUrl: z
    .string()
    .url()
    .optional()
    .describe("Override meeting URL if multiple links exist (optional)."),
});

export const searchEventsByPersonSchema = z.object({
  query: z
    .string()
    .describe(
      'Name or e-mail to search for, e.g. "Ada Lovelace" or "ada@example.com".',
    ),
  start: z
    .string()
    .optional()
    .describe("ISO-8601 start of search window (optional)."),
  end: z
    .string()
    .optional()
    .describe("ISO-8601 end of search window (optional, defaults to +1 year)."),
});

export const addReminderSchema = z.object({
  reminder: z.union([
    z.object({
      type: z.literal("standard"),
      minutesBefore: z
        .number()
        .int()
        .positive()
        .describe("Minutes before event start."),
    }),
    z.object({
      type: z.literal("leave"),
      transportMode: z
        .enum(["walking", "driving", "publicTransport", "cycling"])
        .describe("Travel mode used to estimate journey time."),
    }),
  ]),
});

export const addTaskDependencySchema = z.object({
  title: z
    .string()
    .optional()
    .describe('Short task title. Defaults to "Task for <event summary>".'),

  description: z
    .string()
    .optional()
    .describe("Long-form notes or checklist (Markdown allowed)."),

  durationMinutes: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Estimated time to complete the task (minutes)."),

  deadline: z
    .union([
      z.object({
        type: z.literal("relative"),
        minutesBefore: z
          .number()
          .int()
          .positive()
          .describe("Task is due this many minutes before event start."),
      }),
      z.object({
        type: z.literal("absolute"),
        dateTimeIso: z
          .string()
          .describe("ISO-8601 date-time when the task is due."),
      }),
    ])
    .optional()
    .describe("Due-time for the task. Omit to leave the task unscheduled."),
});
