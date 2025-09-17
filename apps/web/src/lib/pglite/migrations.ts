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
  "event_id" text NOT NULL,
  "start" jsonb NOT NULL,
  "end" jsonb NOT NULL,
  "raw" jsonb NOT NULL,
  "calendar_id" text NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "recurring_event_id" text,
  "read_only" boolean NOT NULL DEFAULT false,
  "visibility" text,
  "availability" text,
  "status" text,
  "etag" text,
  "title" text,
  "location" text,
  "url" text,
  "color" text,
  "created_at" jsonb,
  "updated_at" jsonb,
  "start_unix" bigint NOT NULL,
  "end_unix" bigint NOT NULL,
  "response_status" text,
  PRIMARY KEY ("account_id", "calendar_id", "event_id")
);

CREATE INDEX IF NOT EXISTS "event_calendar_start_idx"
  ON "event" ("calendar_id", "start_unix");

CREATE INDEX IF NOT EXISTS "event_account_start_idx"
  ON "event" ("account_id", "start_unix");

CREATE INDEX IF NOT EXISTS "event_provider_calendar_idx"
  ON "event" ("provider_id", "calendar_id");

CREATE INDEX IF NOT EXISTS "event_provider_account_idx"
  ON "event" ("provider_id", "account_id");

CREATE INDEX IF NOT EXISTS "event_start_end_idx"
  ON "event" ("start_unix", "end_unix");

CREATE INDEX IF NOT EXISTS "event_response_status_idx"
  ON "event" ("response_status");
`;

export async function runMigrations(client: PGlite): Promise<void> {
  await client.exec(MIGRATION_SQL);
}
