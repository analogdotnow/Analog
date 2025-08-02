"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface ConnectParams {
  serverUrl: string;
  callbackUrl: string;
}

interface FinishAuthParams {
  authCode: string;
  sessionId: string;
}

interface DisconnectParams {
  sessionId: string;
}

export function useMcpAuth() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const connectMutation = useMutation({
    mutationFn: async ({ serverUrl, callbackUrl }: ConnectParams) => {
      const response = await fetch("/api/ai/auth/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverUrl, callbackUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresAuth && data.authUrl && data.sessionId) {
          // Return data for OAuth flow handling
          return {
            requiresAuth: true,
            authUrl: data.authUrl,
            sessionId: data.sessionId,
          };
        } else {
          throw new Error(data.error || "Connection failed");
        }
      }

      return { requiresAuth: false, sessionId: data.sessionId };
    },
    onSuccess: async (data) => {
      if (data.requiresAuth) {
        // Handle OAuth flow
        setSessionId(data.sessionId);

        // Open authorization URL in a popup
        const popup = window.open(
          data.authUrl,
          "oauth-popup",
          "width=600,height=700,scrollbars=yes,resizable=yes",
        );

        // Listen for messages from the popup
        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "oauth-success") {
            popup?.close();

            try {
              await finishAuthMutation.mutateAsync({
                authCode: event.data.code,
                sessionId: data.sessionId,
              });
            } catch (err) {
              console.error("Failed to complete authentication:", err);
            }

            window.removeEventListener("message", messageHandler);
          } else if (event.data.type === "oauth-error") {
            popup?.close();
            window.removeEventListener("message", messageHandler);
            throw new Error(`OAuth failed: ${event.data.error}`);
          }
        };

        window.addEventListener("message", messageHandler);
      } else {
        // Direct connection success
        setSessionId(data.sessionId);
      }
    },
  });

  const finishAuthMutation = useMutation({
    mutationFn: async ({ authCode, sessionId }: FinishAuthParams) => {
      const response = await fetch("/api/ai/auth/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authCode, sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to complete authentication: ${errorData.error}`,
        );
      }

      return response.json();
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async ({ sessionId }: DisconnectParams) => {
      await fetch("/api/ai/auth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    },
    onSuccess: () => {
      setSessionId(null);
    },
    onError: () => {
      // Always reset state even if disconnect fails
      setSessionId(null);
    },
  });

  const isConnected = sessionId !== null;

  return {
    sessionId,
    isConnected,
    connectMutation,
    disconnectMutation,
  };
}
