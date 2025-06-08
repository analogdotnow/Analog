import push, { RequestOptions, type PushSubscription } from "web-push";

export function sendPushNotification(
  source: PushSubscription,
  payload: Record<string, any>,
  options?: RequestOptions,
) {
  return push.sendNotification(source, JSON.stringify(payload), options);
}
