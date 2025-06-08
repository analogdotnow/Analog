import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { toUint8Array } from "@/lib/utils";
import { Button } from "../ui/button";
import { useCreatePushSubscription } from "./hooks/use-create-push-subscription";
import { useTestNotification } from "./hooks/use-test-notification";

export function PushNotificationEffect() {
  const [sub, setSub] = useState<PushSubscription | null>(null);
  const { subscribeAsync } = useCreatePushSubscription();
  const { sendTestNotification } = useTestNotification();

  const registerServiceWorker = useCallback(async () => {
    const registration = await navigator.serviceWorker.register("sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    return registration;
  }, []);

  const subscribeToPush = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeAsync(serializedSub).then(() => {
      toast.success("Subscribed to push notifications");
      setSub(sub);
    });
  }, [subscribeAsync]);

  const unSubscribeFromPush = useCallback(async () => {
    await sub?.unsubscribe();
    setSub(null);
  }, [sub]);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      console.group("Subcribe push notification");
      const subcribe = async () => {
        const register = await registerServiceWorker();
        console.debug("Service Worker registered:", register);

        const sub = await register.pushManager.getSubscription();
        console.debug("Current Push Subscription:", sub);
        if (sub === null) {
          console.debug("No existing subscription found, subscribing new...");
          await subscribeToPush()
            .then((res) => {
              console.debug("Subscribed to push notifications:", res);
            })
            .catch((err) => {
              console.error(
                "[PushNotificationEffect] Error subscribing to push notifications:",
                err,
              );
            });
        } else {
          setSub(sub);
        }
        return;
      };

      subcribe().finally(() => console.groupEnd());
    } else {
      console.warn("Push notifications are not supported in this browser.");
    }
    // run one time only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (sub) {
    return (
      <div className="fixed inset-0 z-[99999] m-4 max-h-[200px] overflow-auto rounded-lg bg-background p-4 shadow-lg">
        <p>Push Notification Subscription:</p>
        <pre>{JSON.stringify(sub, null, 2)}</pre>
        <Button
          onClick={() => {
            if (!sub) {
              toast.error("No active push subscription found.");
              return;
            }
            const serializedSub = JSON.parse(JSON.stringify(sub));
            sendTestNotification({
              title: "Test Notification",
              body: "This is a test notification from the UI.",
              ...serializedSub,
            })
              .then((response) => {
                // Assuming response is { success: boolean, data: any }
                // as per the notification.create tRPC endpoint
                if (response.success) {
                  toast.success("Test notification sent successfully!");
                  console.log(
                    "[PushNotificationEffect] Test notification API reported success:",
                    response.data,
                  );
                } else {
                  toast.error(
                    "Failed to send test notification. Server reported an issue.",
                  );
                  console.error(
                    "[PushNotificationEffect] Test notification API reported failure:",
                    response.data,
                  );
                }
              })
              .catch((err) => {
                toast.error("Error sending test notification.");
                console.error(
                  "[PushNotificationEffect] Error calling sendTestNotification:",
                  err,
                );
              });
          }}
        >
          Test
        </Button>
        <Button
          onClick={() => {
            unSubscribeFromPush().then(() => {
              setSub(null);
              toast.success("Unsubscribed from push notifications");
            });
          }}
        >
          Unsubscribe from Push Notifications
        </Button>
      </div>
    );
  }

  return (
    <>
      <p>Push Notification is not subscribed yet.</p>
      <Button onClick={subscribeToPush}>Subscribe to Push Notifications</Button>
    </>
  );
}
