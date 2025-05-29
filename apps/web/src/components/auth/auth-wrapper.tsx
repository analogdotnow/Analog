"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTauri } from "@/providers/tauri-provider";
import { authClient } from "@repo/auth/client";

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDesktop, auth } = useTauri();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isDesktop) {
          // Desktop auth check
          const authStatus = await auth.getAuthStatus();
          setIsAuthenticated(authStatus);
        } else {
          // Web auth check
          const session = await authClient.getSession();
          setIsAuthenticated(!!session.data);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isDesktop, auth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex h-dvh w-dvw items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}