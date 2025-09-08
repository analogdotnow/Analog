import {
  zInstantInstance,
  zPlainDateInstance,
  zZonedDateTimeInstance,
} from "temporal-zod";
import * as z from "zod";

const conferenceEntryPointSchema = z.object({
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
            pin: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  // Preserve original recurrence strings from Google Calendar for debugging/reference
  originalRecurrence: z.array(z.string()).optional(),
  // Store the recurring event ID for instances of recurring events
  recurringEventId: z.string().optional(),
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

// export const rruleSchema = z
//   .object({
//     /* Required */
//     freq: z.enum([
//       "YEARLY",
//       "MONTHLY",
//       "WEEKLY",
//       "DAILY",
//       "HOURLY",
//       "MINUTELY",
//       "SECONDLY",
//     ]),

//     /* Core modifiers */
//     interval: z.number().int().gte(1).lte(Number.MAX_SAFE_INTEGER).optional(),
//     count:    z.number().int().gte(1).lte(Number.MAX_SAFE_INTEGER).optional(),
//     until:    z.instanceof(Temporal.ZonedDateTime).optional(),

//     /* BY* filters */
//     byHour:   z.array(z.number().int().gte(0).lte(23)).optional(),
//     byMinute: z.array(z.number().int().gte(0).lte(59)).optional(),
//     bySecond: z.array(z.number().int().gte(0).lte(59)).optional(),
//     byDay:    z.array(weekdayEnum).optional(),
//     byMonth:  z.array(z.number().int().gte(1).lte(12)).optional(),
//     byMonthDay: signedList(1, 31).optional(),
//     byYearDay:  signedList(1, 366).optional(),
//     byWeekNo:   signedList(1, 53).optional(),
//     bySetPos:   signedList(1, 366).optional(),

//     /* Week-start */
//     wkst: weekdayEnum.optional(),

//     /* Inclusions / exclusions */
//     rDate: z.array(z.instanceof(Temporal.ZonedDateTime)).optional(),
//     exDate: z.array(z.instanceof(Temporal.ZonedDateTime)).optional(),

//     /* Time-zone context */
//     tzid: tzidSchema.optional(),

//     /* Generation options */
//     maxIterations: z.number().int().gte(1).lte(Number.MAX_SAFE_INTEGER).optional(),
//     includeDtstart: z.boolean().optional(),

//     /* DTSTART (often stored alongside RRULE) */
//     dtstart: z.instanceof(Temporal.ZonedDateTime).optional(),
//   })
//   .strict();

export const recurrenceSchema = z.object({
  freq: z.enum([
    "SECONDLY",
    "MINUTELY",
    "HOURLY",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "YEARLY",
  ]),
  interval: z.number().int().min(1).optional(),
  count: z.number().int().min(1).optional(),
  until: dateInputSchema.optional(),
  byDay: z.array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"])).optional(),
  byMonth: z.array(z.number().int().min(1).max(12)).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
  byYearDay: z.array(z.number().int().min(1).max(366)).optional(),
  byWeekNo: z.array(z.number().int().min(1).max(53)).optional(),
  byHour: z.array(z.number().int().min(0).max(23)).optional(),
  byMinute: z.array(z.number().int().min(0).max(59)).optional(),
  bySecond: z.array(z.number().int().min(0).max(59)).optional(),
  bySetPos: z
    .array(
      z
        .number()
        .int()
        .min(-366)
        .max(366)
        .refine((val) => val !== 0, {
          message: "bySetPos values cannot be zero",
        }),
    )
    .optional(),
  wkst: z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]).optional(),
  rDate: z.array(dateInputSchema).optional(),
  exDate: z.array(dateInputSchema).optional(),
});

export const createEventInputSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  start: dateInputSchema,
  end: dateInputSchema,
  allDay: z.boolean().optional(),
  recurrence: recurrenceSchema.optional(),
  recurringEventId: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  availability: z.enum(["busy", "free"]).optional(),
  color: z.string().optional(),
  visibility: z
    .enum(["default", "public", "private", "confidential"])
    .optional(),
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
  etag: z.string().optional(),
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
