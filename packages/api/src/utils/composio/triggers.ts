import { composio } from "@repo/ai/lib/composio";

interface ListTriggersOptions {
  userId: string;
  connectedAccountId: string;
}

export async function listTriggers(options: ListTriggersOptions) {
  return composio.triggers.listActive({
    connectedAccountIds: [options.connectedAccountId],
    showDisabled: true,
  })
}

interface EnableTriggerOptions {
  userId: string;
  connectedAccountId: string;
  triggerName: string;
}

export async function enableTrigger(options: EnableTriggerOptions) {
  const triggers = await composio.triggers.listActive({
    connectedAccountIds: [options.connectedAccountId],
    showDisabled: true,
  });

  const existing = triggers.items.find(
    (trigger) => trigger.triggerName === options.triggerName,
  );

  if (existing) {
    if (existing.disabledAt) {
      await composio.triggers.enable(existing.id);
    }

    return;
  }

  await composio.triggers.create(options.userId, options.triggerName, {
    connectedAccountId: options.connectedAccountId,
  });
}

interface DisableTriggerOptions {
  userId: string;
  connectedAccountId: string;
  triggerName: string;
}

export async function disableTrigger(options: DisableTriggerOptions) {
  const triggers = await composio.triggers.listActive({
    connectedAccountIds: [options.connectedAccountId],
    showDisabled: true,
  });

  const existing = triggers.items.find(
    (trigger) => trigger.triggerName === options.triggerName,
  );

  if (existing) {
    await composio.triggers.disable(existing.id);
  }
}

interface DeleteTriggerOptions {
  userId: string;
  connectedAccountId: string;
  triggerName: string;
}

export async function deleteTrigger(options: DeleteTriggerOptions) {
  const triggers = await composio.triggers.listActive({
    connectedAccountIds: [options.connectedAccountId],
    showDisabled: true,
  });

  const existing = triggers.items.find(
    (trigger) => trigger.triggerName === options.triggerName,
  );

  if (existing) {
    await composio.triggers.delete(existing.id);
  }
}
