import { isBefore, isSameType } from "@repo/temporal";
import { Temporal } from "temporal-polyfill";
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


export const recurrenceSchema = z
  .object({
    freq: z
      .enum([
        "SECONDLY",
        "MINUTELY",
        "HOURLY",
        "DAILY",
        "WEEKLY",
        "MONTHLY",
        "YEARLY",
      ])
      .optional(),
    interval: z.number().int().min(1).optional(),
    count: z.number().int().min(1).optional(),
    until: dateInputSchema.optional(),
    byDay: z
      .array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]))
      .optional(),
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
    rscale: z
      .enum([
        "GREGORIAN",
        "BUDDHIST",
        "CHINESE",
        "COPTIC",
        "DANGI",
        "ETHIOPIC",
        "ETHIOAA",
        "HEBREW",
        "INDIAN",
        "ISLAMIC",
        "ISLAMIC-CIVIL",
        "ISLAMIC-TBLA",
        "ISLAMIC-UMALQURA",
        "ISLAMIC-RGSA",
        "ISO8601",
        "JAPANESE",
        "PERSIAN",
        "ROC",
      ])
      .optional(),
    skip: z.enum(["OMIT", "BACKWARD", "FORWARD"]).optional(),
  })
  .refine(
    (data) =>
      data.freq !== undefined || (data.exDate && data.exDate.length > 0),
    {
      message: "Recurrence must include freq or exDate",
    },
  );

export const createEventInputSchema = z
  .object({
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
    createdAt: z.instanceof(Temporal.Instant).optional(),
    updatedAt: z.instanceof(Temporal.Instant).optional(),
  })
  .refine((data) => !isSameType(data.start, data.end) || isBefore(data.start, data.end), {
    message: "Event start time must be earlier than end time",
    path: ["start"],
  });

export const updateEventInputSchema = createEventInputSchema.safeExtend({
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
