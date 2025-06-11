CREATE TYPE "public"."notification_type" AS ENUM('reminder', 'event_update', 'event_cancellation', 'event_invitation', 'event_confirmation', 'event_rejection', 'event_reschedule', 'event_creation', 'custom', 'system_alert', 'user_message', 'task_reminder', 'task_update', 'task_assignment', 'task_completion', 'task_cancellation', 'task_overdue', 'task_priority_change', 'task_comment');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"source_event" uuid NOT NULL,
	"message" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_push_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"expiration_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_push_subscription_endpoint_unique" UNIQUE("endpoint")
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
	"source_id" uuid NOT NULL,
	"event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_source_event_notification_source_event_id_fk" FOREIGN KEY ("source_event") REFERENCES "public"."notification_source_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_push_subscription" ADD CONSTRAINT "notification_push_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_source_event" ADD CONSTRAINT "notification_source_event_source_id_notification_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."notification_source"("id") ON DELETE cascade ON UPDATE no action;