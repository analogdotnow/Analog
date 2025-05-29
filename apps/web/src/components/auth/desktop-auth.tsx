"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTauri } from "@/providers/tauri-provider";
import { Google } from "@/components/icons";

interface DesktopAuthProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

export function DesktopAuth({ onAuthSuccess, onAuthError }: DesktopAuthProps) {
  const { isDesktop, auth, events } = useTauri();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isDesktop) return;

    // Check authentication status on mount
    checkAuthStatus();

    // Listen for auth events
    const setupAuthListeners = async () => {
      const unlistenAuthSuccess = await events.onAuthSuccess((event) => {
        console.log("Desktop auth success:", event.payload);
        setIsAuthenticated(true);
        setIsLoading(false);
        setError(null);
        onAuthSuccess?.();
      });

      const unlistenAuthLogout = await events.onAuthLogout(() => {
        console.log("Desktop auth logout");
        setIsAuthenticated(false);
        setIsLoading(false);
      });

      return [unlistenAuthSuccess, unlistenAuthLogout];
    };

    setupAuthListeners().then((unlisteners) => {
      return () => {
        unlisteners.forEach((unlisten) => unlisten());
      };
    });
  }, [isDesktop, events, onAuthSuccess]);

  const checkAuthStatus = async () => {
    if (!isDesktop) return;

    try {
      setIsLoading(true);
      const authStatus = await auth.getAuthStatus();
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setError("Failed to check authentication status");
      onAuthError?.(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isDesktop) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Start the OAuth server and get the port
      const port = await auth.startOAuthServer();
      
      // Set up OAuth callback listener
      const unlistenCallback = await events.onOAuthCallback(async (event) => {
        try {
          const { code, state } = event.payload;
          
          // Exchange code for tokens
          const authResponse = await auth.exchangeCodeForTokens(code, port);
          
          if (authResponse.success) {
            setIsAuthenticated(true);
            setError(null);
            onAuthSuccess?.();
            // Redirect to calendar after successful authentication
            router.push("/calendar");
          } else {
            setError(authResponse.message);
            onAuthError?.(authResponse.message);
          }
        } catch (error) {
          console.error("Failed to exchange code for tokens:", error);
          setError("Failed to complete authentication");
          onAuthError?.(error as string);
        } finally {
          setIsLoading(false);
          unlistenCallback();
        }
      });
      
      // Set up OAuth error listener
      const unlistenError = await events.onOAuthError((event) => {
        console.error("OAuth error:", event.payload);
        setError("Authentication failed");
        onAuthError?.(event.payload);
        setIsLoading(false);
        unlistenError();
      });
      
      // Open Google OAuth URL in system browser
      await auth.openAuthUrl(port);
      
    } catch (error) {
      console.error("Failed to start OAuth flow:", error);
      setError("Failed to start authentication");
      onAuthError?.(error as string);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!isDesktop) return;

    try {
      setIsLoading(true);
      await auth.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Failed to logout:", error);
      setError("Failed to logout");
      onAuthError?.(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDesktop) {
    return null; // Return null for web version, use regular auth
  }

  // If authenticated, user will be redirected by router.push("/calendar")
  // so this component won't be visible

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to Analog</CardTitle>
        <CardDescription>
          Connect your Google Calendar to get started with Analog.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}
        
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Connecting...
            </>
          ) : (
            <>
              <Google className="mr-2 h-4 w-4" />
              Continue with Google
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          This will open your browser to complete the sign-in process.
        </p>
      </CardContent>
    </Card>
  );
}