import { TRPCError } from "@trpc/server";

import { composio } from "@repo/ai/lib/composio";
import { connectIntegration } from "@sentry/node";

export async function ensureGmailEmailTrigger(params: {
  userId: string;
  accountId: string;
}) {
  const { userId, accountId } = params;

  const accounts = await composio.connectedAccounts.list({
    userIds: [userId],
  });

  const account = accounts.items.find(
    (item) => item.id === accountId && item.toolkit.slug === "gmail",
  );

  if (!account) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Gmail account not found",
    });
  }

  const triggers = await composio.triggers.listActive({
    connectedAccountIds: [accountId],
    showDisabled: true,
  });

  const existing = triggers.items.find(
    (trigger) => trigger.triggerName === "GMAIL_NEW_GMAIL_MESSAGE",
  );

  if (existing) {
    if (existing.disabledAt) {
      await composio.triggers.enable(existing.id);
    }

    return { created: false, triggerId: existing.id };
  }

  const created = await composio.triggers.create(userId, "GMAIL_NEW_GMAIL_MESSAGE", {
    connectedAccountId: accountId,
  });

  return { created: true, triggerId: created.triggerId };
}
