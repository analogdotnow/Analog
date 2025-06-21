"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { env } from "@repo/env/client";

import { isIOSWithNotificationSupport, toUint8Array } from "@/lib/utils";
import { useCreatePushSubscription } from "./hooks/use-create-push-subscription";
import { IOSNotificationRequest } from "./ios-notification-request";

export function PushNotificationEffect() {
  const { subscribeAsync } = useCreatePushSubscription();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const isIOS = isIOSWithNotificationSupport();
  const [isIOSWithPermission, setIsIOSWithPermission] = useState(false);

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
      applicationServerKey: toUint8Array(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      userVisibleOnly: true,
    });
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeAsync(serializedSub);
  }, [subscribeAsync]);

  // subscribe to push notifications
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      isSubscribed
    ) {
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
              setIsSubscribed(true);
            })
            .catch((err) => {
              console.error(
                "[PushNotificationEffect] Error subscribing to push notifications:",
                err,
              );
            });
        }

        return;
      };

      subcribe().finally(() => console.groupEnd());
    } else {
      console.warn("Push notifications are not supported in this browser.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubscribed]);

  // Request permission for everytimes the component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!("Notification" in window)) {
        return;
      }
      Notification.requestPermission().then((newPermission) => {
        if (newPermission === "granted") {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Register service worker for iOS
  useEffect(() => {
    if (
      isIOS &&
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
      setIsIOSWithPermission(true);
    }
  }, [isIOS]);

  return (
    <IOSNotificationRequest
      isOpen={isIOSWithPermission}
      onOpenChange={setIsIOSWithPermission}
      onSuccess={() => {
        setIsIOSWithPermission(false);
        setIsSubscribed(true);
        toast.success("Push notifications enabled successfully!");
      }}
    />
  );
}
