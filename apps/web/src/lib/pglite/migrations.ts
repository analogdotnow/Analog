"use client";

import type { PGlite } from "@electric-sql/pglite";

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS "calendar" (
  "calendar_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "etag" text,
  "time_zone" text,
  "primary" boolean NOT NULL DEFAULT false,
  "account_id" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "color" text,
  "read_only" boolean NOT NULL DEFAULT false,
  "sync_token" text,
  PRIMARY KEY ("account_id", "calendar_id")
);

CREATE INDEX IF NOT EXISTS "calendar_account_idx"
  ON "calendar" ("account_id");

CREATE INDEX IF NOT EXISTS "calendar_provider_account_idx"
  ON "calendar" ("provider_id", "account_id");

CREATE TABLE IF NOT EXISTS "event" (
  "id" text NOT NULL,
  "start" jsonb NOT NULL,
  "end" jsonb NOT NULL,
  "calendar_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "recurring_event_id" text,
  "read_only" boolean NOT NULL DEFAULT false,
  "visibility" text,
  "availability" text,
  "status" text,
  "etag" text,
  "title" text,
  "description" text,
  "location" text,
  "url" text,
  "color" text,
  "all_day" boolean,
  "created_at" text,
  "updated_at" text,
  "response_status" text,
  "attendees" jsonb,
  "metadata" jsonb,
  "conference" jsonb,
  "recurrence" jsonb,
  "start_instant" timestamp with time zone NOT NULL,
  "end_instant" timestamp with time zone NOT NULL,
  PRIMARY KEY ("provider_account_id", "calendar_id", "id"),
  CONSTRAINT "event_calendar_fk" FOREIGN KEY ("provider_account_id", "calendar_id")
    REFERENCES "calendar" ("account_id", "calendar_id")
);

CREATE INDEX IF NOT EXISTS "event_calendar_start_idx"
  ON "event" ("calendar_id", "start_instant");

CREATE INDEX IF NOT EXISTS "event_account_start_idx"
  ON "event" ("provider_account_id", "start_instant");

CREATE INDEX IF NOT EXISTS "event_provider_calendar_idx"
  ON "event" ("provider_id", "calendar_id");

CREATE INDEX IF NOT EXISTS "event_provider_account_idx"
  ON "event" ("provider_id", "provider_account_id");

CREATE INDEX IF NOT EXISTS "event_start_end_idx"
  ON "event" ("start_instant", "end_instant");

CREATE INDEX IF NOT EXISTS "event_response_status_idx"
  ON "event" ("response_status");
`;

export async function runMigrations(client: PGlite): Promise<void> {
  await client.exec(MIGRATION_SQL);
}
