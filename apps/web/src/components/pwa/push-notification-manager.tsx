"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

import { env } from "@repo/env/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const subscribeMutation = trpc.pushNotifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.pushNotifications.unsubscribe.useMutation();
  const sendMutation = trpc.pushNotifications.send.useMutation();

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service worker registration failed:", error);
      toast.error("Failed to register service worker");
    }
  }

  async function subscribeToPush() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        ),
      });

      setSubscription(sub);

      // Serialize the subscription for sending to server
      const serializedSub = JSON.parse(JSON.stringify(sub));

      await subscribeMutation.mutateAsync(serializedSub);

      toast.success("Successfully subscribed to push notifications");
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      toast.error("Failed to subscribe to push notifications");
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    try {
      await subscription?.unsubscribe();
      setSubscription(null);

      await unsubscribeMutation.mutateAsync();

      toast.success("Successfully unsubscribed from push notifications");
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      toast.error("Failed to unsubscribe from push notifications");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendTestNotification() {
    if (!subscription) {
      toast.error("No active subscription");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);
    try {
      await sendMutation.mutateAsync({
        title: "Test Notification",
        body: message,
        icon: "/icon-192x192.png",
      });

      setMessage("");
      toast.success("Test notification sent");
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Manage your push notification preferences and send test notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Bell className="h-4 w-4" />
              <span>You are subscribed to push notifications</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-message">Test Message</Label>
              <div className="flex gap-2">
                <Input
                  id="test-message"
                  type="text"
                  placeholder="Enter notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendTestNotification();
                    }
                  }}
                />
                <Button
                  onClick={sendTestNotification}
                  disabled={isLoading || !message.trim()}
                >
                  Send Test
                </Button>
              </div>
            </div>

            <Button
              onClick={unsubscribeFromPush}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <BellOff className="mr-2 h-4 w-4" />
              Unsubscribe
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              You are not subscribed to push notifications.
            </p>
            <Button
              onClick={subscribeToPush}
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
