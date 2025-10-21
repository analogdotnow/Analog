import { composio } from "@repo/ai/lib/composio";
import { enableTrigger } from "./triggers";

interface ConnectGmailAccountOptions {
  userId: string;
  accountId: string;
}

export async function connectGmailAccount(options: ConnectGmailAccountOptions) {
  enableTrigger({
    userId: options.userId,
    connectedAccountId: options.accountId,
    triggerName: "GMAIL_NEW_GMAIL_MESSAGE",
  });
}