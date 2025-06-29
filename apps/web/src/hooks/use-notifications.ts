import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc/client";
import { env } from "@repo/env/client";

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: subscriptions } = useQuery(trpc.push.list.queryOptions());

  const subscribeMutation = useMutation({
    ...trpc.push.subscribe.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.push.list.queryOptions());
    },
  });

  const unsubscribeMutation = useMutation({
    ...trpc.push.unsubscribe.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.push.list.queryOptions());
    },
  });

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

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

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
    } catch {
      toast.error("Failed to enable push notifications");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !subscriptions?.length) return;

    try {
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        });
      }

      toast.success("Push notifications disabled");
    } catch {
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