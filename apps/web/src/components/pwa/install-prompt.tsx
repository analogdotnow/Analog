"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if running on iOS
    const userAgent = window.navigator.userAgent;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed (running in standalone mode)
    const isInStandaloneMode = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    setIsStandalone(isInStandaloneMode);

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();

      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        toast.success("App installed successfully");
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error installing app:", error);
      toast.error("Failed to install app");
    }
  }

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Install App</CardTitle>
        <CardDescription>
          Install Analog Calendar on your device for a native app experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isIOS ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To install this app on your iOS device:
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                Tap the share button{" "}
                <span className="inline-flex h-6 w-6 items-center justify-center rounded border text-xs">
                  ⎋
                </span>{" "}
                in your browser
              </li>
              <li>
                Scroll down and tap &quot;Add to Home Screen&quot;{" "}
                <span className="inline-flex h-6 w-6 items-center justify-center rounded border text-xs">
                  ➕
                </span>
              </li>
              <li>Confirm by tapping &quot;Add&quot;</li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstallClick} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Add to Home Screen
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To install this app, open the browser menu and look for
              &quot;Install App&quot; or &quot;Add to Home Screen&quot; option.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Available on Chrome, Edge, and other modern browsers</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
