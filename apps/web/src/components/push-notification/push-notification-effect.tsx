"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { toUint8Array } from "@/lib/utils";
import { Button } from "../ui/button";
import { useCreatePushSubscription } from "./hooks/use-create-push-subscription";

export function PushNotificationEffect() {
  const { subscribeAsync } = useCreatePushSubscription();
  const [isSubscribed, setIsSubscribed] = useState(false);

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
      applicationServerKey: toUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
      userVisibleOnly: true,
    });
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeAsync(serializedSub).then(() => {
      toast.success("Subscribed to push notifications");
    });
  }, [subscribeAsync]);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      console.group("Subcribe push notification");
      const subcribe = async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const register = await registerServiceWorker();
          console.debug("Service Worker registered:", register);

          const sub = await register.pushManager.getSubscription();
          console.debug("Current Push Subscription:", sub);
          if (sub === null) {
            console.debug("No existing subscription found, subscribing new...");
            await subscribeToPush()
              .then((res) => {
                console.debug("Subscribed to push notifications:", res);
                setIsSubscribed(true);
              })
              .catch((err) => {
                console.error(
                  "[PushNotificationEffect] Error subscribing to push notifications:",
                  err,
                );
              });
          }
        } else if (permission === "denied") {
          console.warn(
            "Push notifications permission denied. User will not receive notifications.",
          );
          setIsSubscribed(false);
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
  if (!isSubscribed) {
    return (
      <Button
        onClick={async () => {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            await subscribeToPush();
          } else {
            toast.error("Permission denied for push notifications");
          }
        }}
      >
        Request Permission
      </Button>
    );
  }
  return null;
}
