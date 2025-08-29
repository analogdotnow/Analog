import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { account } from "./auth";

export const calendars = pgTable(
  "calendar",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    description: text("description"),
    timeZone: text("time_zone"),
    primary: boolean("primary").default(false).notNull(),
    color: text("color"),
    etag: text("etag"),
    readOnly: boolean("read_only").default(false).notNull(),

    calendarId: text("calendar_id").notNull(),

    syncToken: text("sync_token"),

    providerId: text("provider_id", {
      enum: ["google", "microsoft"],
    }).notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("calendar_account_idx").on(table.accountId),
    uniqueIndex("calendar_calendar_id_account_unique").on(
      table.calendarId,
      table.accountId,
    ),
  ],
);

export const events = pgTable(
  "event",
  {
    id: text("id").primaryKey(),
    title: text("title"),
    description: text("description"),

    start: timestamp("start", { withTimezone: true }).notNull(),
    startTimeZone: text("start_time_zone"),

    end: timestamp("end", { withTimezone: true }).notNull(),
    endTimeZone: text("end_time_zone"),

    allDay: boolean("all_day").default(false),
    location: text("location"),
    status: text("status"),
    url: text("url"),
    etag: text("etag"),
    readOnly: boolean("read_only").default(false).notNull(),

    conference: jsonb("conference"),
    metadata: jsonb("metadata"),
    response: jsonb("response"),

    syncToken: text("sync_token"),
    recurringEventId: text("recurring_event_id"),
    recurrenceId: text("recurrence_id").references(() => recurrence.id, {
      onDelete: "set null",
    }),

    calendarId: text("calendar_id")
      .notNull()
      .references(() => calendars.id, { onDelete: "cascade" }),
    providerId: text("provider_id", {
      enum: ["google", "microsoft"],
    }).notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),

    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("event_account_idx").on(table.accountId),
    index("event_recurrence_idx").on(table.recurrenceId),
    index("event_account_calendar_idx").on(table.accountId, table.calendarId),
    uniqueIndex("event_id_calendar_account_unique").on(
      table.id,
      table.calendarId,
      table.accountId,
    ),
  ],
);

export const recurrence = pgTable("recurrence", {
  id: text("id").primaryKey(),

  // Core recurrence fields
  freq: text("freq", {
    enum: [
      "SECONDLY",
      "MINUTELY",
      "HOURLY",
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "YEARLY",
    ],
  }).notNull(),
  interval: integer("interval").default(1),
  count: integer("count"),
  until: timestamp("until", { withTimezone: true }),
  wkst: text("wkst", {
    enum: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
  }),

  // BY* rules stored as JSONB arrays
  byDay: jsonb("by_day"), // Weekday[]
  byMonth: jsonb("by_month"), // number[]
  byMonthDay: jsonb("by_month_day"), // number[]
  byYearDay: jsonb("by_year_day"), // number[]
  byWeekNo: jsonb("by_week_no"), // number[]
  byHour: jsonb("by_hour"), // number[]
  byMinute: jsonb("by_minute"), // number[]
  bySecond: jsonb("by_second"), // number[]
  bySetPos: jsonb("by_set_pos"), // number[]

  // Exception and inclusion dates
  exDate: jsonb("ex_date"), // Temporal dates array
  rDate: jsonb("r_date"), // Temporal dates array

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const attendees = pgTable(
  "attendee",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    status: text("status", {
      enum: ["accepted", "tentative", "declined", "unknown"],
    }).notNull(),
    type: text("type", {
      enum: ["required", "optional", "resource"],
    }).notNull(),
    comment: text("comment"),
    organizer: boolean("organizer").default(false),
    additionalGuests: integer("additional_guests"),

    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),

    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("attendee_event_idx").on(table.eventId),
    index("attendee_email_idx").on(table.email),
  ],
);

export const calendarsRelations = relations(calendars, ({ one, many }) => ({
  account: one(account, {
    fields: [calendars.accountId],
    references: [account.id],
  }),
  events: many(events),
}));

export const recurrenceRelations = relations(recurrence, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  calendar: one(calendars, {
    fields: [events.calendarId],
    references: [calendars.id],
  }),
  account: one(account, {
    fields: [events.accountId],
    references: [account.id],
  }),
  recurrence: one(recurrence, {
    fields: [events.recurrenceId],
    references: [recurrence.id],
  }),
  attendees: many(attendees),
}));

export const attendeesRelations = relations(attendees, ({ one }) => ({
  event: one(events, {
    fields: [attendees.eventId],
    references: [events.id],
  }),
}));
