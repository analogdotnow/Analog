CREATE TYPE "public"."notification_type" AS ENUM('reminder', 'event_update', 'event_cancellation', 'custom');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"calendar_source" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"message" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_source_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notification_source_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"event_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_source_event" ADD CONSTRAINT "notification_source_event_notification_id_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_source_event" ADD CONSTRAINT "notification_source_event_source_id_notification_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."notification_source"("id") ON DELETE cascade ON UPDATE no action;