import { Temporal } from "temporal-polyfill";

import type { GoogleCalendar } from "@repo/google-calendar";

import { ProviderError } from "../../../lib/provider-error";

const DEFAULT_EXPIRATION_HOURS = 30 * 24;

export class GoogleCalendarNotifications {
  constructor(private readonly client: GoogleCalendar) {}

  async subscribe(calendarId: string, webhookUrl: string) {
    return this.withErrorHandler("notifications.subscribe", async () => {
      const response = await this.client.calendars.events.watch(calendarId, {
        id: crypto.randomUUID(),
        type: "web_hook",
        address: webhookUrl,
        token: crypto.randomUUID(),
        expiration: Temporal.Now.instant()
          .add({ hours: DEFAULT_EXPIRATION_HOURS })
          .epochMilliseconds.toString(),
      });

      return {
        id: response.id!,
        resourceId: response.resourceId!,
        token: response.token!,
        expiresAt: Temporal.Instant.fromEpochMilliseconds(
          Number(response.expiration!),
        ),
      };
    });
  }

  async unsubscribe(subscriptionId: string, resourceId?: string) {
    return this.withErrorHandler("notifications.unsubscribe", async () => {
      await this.client.stopWatching.stopWatching({
        id: subscriptionId,
        resourceId,
      });
    });
  }

  private async withErrorHandler<T>(
    operation: string,
    fn: () => Promise<T> | T,
    context?: Record<string, unknown>,
  ): Promise<T> {
    try {
      return await Promise.resolve(fn());
    } catch (error: unknown) {
      console.error(`Failed to ${operation}:`, error);

      throw new ProviderError(error as Error, operation, context);
    }
  }
}
