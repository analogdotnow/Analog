import { zZonedDateTimeInstance } from "temporal-zod";
import * as z from "zod";

import { recurrenceSchema } from "@repo/schemas";

export const conferenceEntryPointSchema = z.object({
  joinUrl: z.object({
    label: z.string().optional(),
    value: z.string(),
  }),
  meetingCode: z.string().optional(),
  accessCode: z.string().optional(),
  password: z.string().optional(),
  pin: z.string().optional(),
});

export const conferenceSchema = z.union([
  z.object({
    type: z.literal("create"),
    providerId: z.union([z.literal("google"), z.literal("microsoft")]),
    requestId: z.string(),
  }),
  z.object({
    type: z.literal("conference"),
    providerId: z.union([z.literal("google"), z.literal("microsoft")]),
    id: z.string().optional(),
    conferenceId: z.string().optional(),
    name: z.string().optional(),
    video: conferenceEntryPointSchema.optional(),
    sip: conferenceEntryPointSchema.optional(),
    phone: z.array(conferenceEntryPointSchema).optional(),
    hostUrl: z.string().url().optional(),
    notes: z.string().optional(),
    extra: z.record(z.string(), z.unknown()).optional(),
  }),
]);

export type FormConference = z.infer<typeof conferenceSchema>;

const attendeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string(),
  status: z.enum(["accepted", "declined", "tentative", "unknown"]),
  type: z.enum(["required", "optional", "resource"]),
  organizer: z.boolean().optional(),
  comment: z.string().optional(),
});

export type FormAttendee = z.infer<typeof attendeeSchema>;

export const formSchema = z.object({
  id: z.string(),
  type: z.enum(["draft", "event"]),
  title: z.string(),
  start: zZonedDateTimeInstance,
  end: zZonedDateTimeInstance,
  isAllDay: z.boolean(),
  location: z.string(),
  availability: z.enum(["busy", "free"]),
  recurrence: recurrenceSchema.nullable().optional(),
  recurringEventId: z.string().optional(),
  description: z.string(),
  calendar: z.object({
    id: z.string(),
    provider: z.object({
      id: z.enum(["google", "microsoft"]),
      accountId: z.string(),
    }),
  }),
  attendees: z.array(attendeeSchema),
  conference: conferenceSchema.nullable().optional(),
  visibility: z.enum(["default", "public", "private", "confidential"]),
});

export type FormValues = z.infer<typeof formSchema>;
