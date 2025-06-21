import "server-only";
import push, { RequestOptions, type PushSubscription } from "web-push";

import { env as clientEnv } from "@repo/env/client";
import { env } from "@repo/env/server";

export async function sendPushNotification(
  endpoint: Pick<PushSubscription, "endpoint" | "keys">,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
  options?: RequestOptions,
) {
  push.setVapidDetails(
    "mailto:ngocnt.job@gmail.com",
    clientEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
    env.VAPID_PRIVATE_KEY || "",
  );
  return push.sendNotification(
    {
      endpoint: endpoint.endpoint,
      keys: {
        p256dh: endpoint.keys.p256dh,
        auth: endpoint.keys.auth,
      },
    },
    JSON.stringify(payload),
    options,
  );
}
