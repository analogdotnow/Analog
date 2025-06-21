import {
  zInstantInstance,
  zPlainDateInstance,
  zZonedDateTimeInstance,
} from "temporal-zod";
import { z } from "zod/v3";

const conferenceEntryPointSchema = z.object({
  joinUrl: z.object({
    label: z.string().optional(),
    value: z.string(),
  }),
  meetingCode: z.string().optional(),
  accessCode: z.string().optional(),
  password: z.string().optional(),
});

const conferenceSchema = z.object({
  id: z.string().optional(),
  conferenceId: z.string().optional(),
  name: z.string().optional(),
  video: conferenceEntryPointSchema.optional(),
  sip: conferenceEntryPointSchema.optional(),
  phone: z.array(conferenceEntryPointSchema).optional(),
  hostUrl: z.string().url().optional(),
  notes: z.string().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

const microsoftMetadataSchema = z.object({
  originalStartTimeZone: z
    .object({
      raw: z.string(),
      parsed: z.string().optional(),
    })
    .optional(),
  originalEndTimeZone: z
    .object({
      raw: z.string(),
      parsed: z.string().optional(),
    })
    .optional(),
  onlineMeeting: z
    .object({
      conferenceId: z.string().optional(),
      joinUrl: z.string().url().optional(),
      phones: z
        .object({
          number: z.string(),
          type: z.enum([
            "home",
            "business",
            "mobile",
            "other",
            "assistant",
            "homeFax",
            "businessFax",
            "otherFax",
            "pager",
            "radio",
          ]),
        })
        .array()
        .optional(),
      quickDial: z.string().optional(),
      tollFreeNumbers: z.array(z.string()).optional(),
      tollNumber: z.string().optional(),
    })
    .optional(),
});

const googleMetadataSchema = z.object({
  conferenceData: z
    .object({
      conferenceId: z.string().optional(),
      conferenceSolution: z
        .object({
          name: z.string().optional(),
          key: z
            .object({
              type: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      entryPoints: z
        .array(
          z.object({
            entryPointType: z.string().optional(),
            uri: z.string().optional(),
            label: z.string().optional(),
            meetingCode: z.string().optional(),
            accessCode: z.string().optional(),
            password: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

export const dateInputSchema = z.union([
  zPlainDateInstance,
  zInstantInstance,
  zZonedDateTimeInstance,
]);

const attendeeSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().optional(),
  status: z.enum(["accepted", "tentative", "declined", "unknown"]),
  type: z.enum(["required", "optional", "resource"]),
  comment: z.string().optional(),
  organizer: z.boolean().optional(),
  additionalGuests: z.number().int().optional(),
});

export const reccurrenceSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.number().int().min(1).default(1),
  count: z.number().int().min(1).optional(),
  until: dateInputSchema.optional(),
  byDay: z.array(z.enum(["SU", "MO", "TU", "WE", "TH", "FR", "SA"])).optional(),
  byMonth: z.array(z.number().int().min(1).max(12)).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
  byYearDay: z.array(z.number().int().min(1).max(366)).optional(),
  byWeekNo: z.array(z.number().int().min(1).max(53)).optional(),
  byHour: z.array(z.number().int().min(0).max(23)).optional(),
  byMinute: z.array(z.number().int().min(0).max(59)).optional(),
  bySecond: z.array(z.number().int().min(0).max(59)).optional(),
}).partial().default({ frequency: "daily", interval: 1 });

export const createEventInputSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  start: dateInputSchema,
  end: dateInputSchema,
  allDay: z.boolean().optional(),
  recurrence: reccurrenceSchema.optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  color: z.string().optional(),
  accountId: z.string(),
  calendarId: z.string(),
  providerId: z.enum(["google", "microsoft"]),
  readOnly: z.boolean(),
  metadata: z.union([microsoftMetadataSchema, googleMetadataSchema]).optional(),
  attendees: z.array(attendeeSchema).optional(),
  conference: conferenceSchema.optional(),
});

export const updateEventInputSchema = createEventInputSchema.extend({
  id: z.string(),
  conference: conferenceSchema.optional(),
  metadata: z.union([microsoftMetadataSchema, googleMetadataSchema]).optional(),
  response: z
    .object({
      status: z.enum(["accepted", "tentative", "declined", "unknown"]),
      comment: z.string().optional(),
      sendUpdate: z.boolean().default(false),
    })
    .optional(),
});

export type CreateEventInput = z.infer<typeof createEventInputSchema>;
export type UpdateEventInput = z.infer<typeof updateEventInputSchema>;

export type MicrosoftEventMetadata = z.infer<typeof microsoftMetadataSchema>;
export type GoogleEventMetadata = z.infer<typeof googleMetadataSchema>;
