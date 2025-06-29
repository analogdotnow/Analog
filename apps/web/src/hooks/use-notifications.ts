import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc/client";
import { env } from "@repo/env/client";

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const trpc = useTRPC();

  const { data: subscriptions } = useQuery(trpc.push.list.queryOptions());

  const subscribeMutation = useMutation(trpc.push.subscribe.mutationOptions());
  const unsubscribeMutation = useMutation(trpc.push.unsubscribe.mutationOptions());

  useEffect(() => {
    setIsSupported(
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }, []);

  useEffect(() => {
    setIsSubscribed(Boolean(subscriptions && subscriptions.length > 0));
  }, [subscriptions]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    try {
      setIsLoading(true);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Send subscription to server
      await subscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
        p256dh: btoa(
          String.fromCharCode.apply(
            null,
            Array.from(new Uint8Array(subscription.getKey("p256dh")!))
          )
        ),
        auth: btoa(
          String.fromCharCode.apply(
            null,
            Array.from(new Uint8Array(subscription.getKey("auth")!))
          )
        ),
      });

      toast.success("Push notifications enabled");
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to enable push notifications");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !subscriptions?.length) return;

    try {
      setIsLoading(true);

      // Get current subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe();

        // Remove from server
        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        });
      }

      toast.success("Push notifications disabled");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      toast.error("Failed to disable push notifications");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, subscriptions, unsubscribeMutation]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
} 