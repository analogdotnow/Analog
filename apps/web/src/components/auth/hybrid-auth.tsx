"use client";

import { useEffect, useState } from "react";
import { useTauri } from "@/providers/tauri-provider";
import { DesktopAuth } from "./desktop-auth";
import { SignInForm } from "@/app/(auth)/login/sign-in-form";

interface HybridAuthProps {
  redirectUrl?: string;
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

export function HybridAuth({ 
  redirectUrl = "/calendar", 
  onAuthSuccess, 
  onAuthError 
}: HybridAuthProps) {
  const { isDesktop, isLoading } = useTauri();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until we know if we're in Tauri or not
  if (!mounted || isLoading) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Use desktop auth if in Tauri, otherwise use web auth
  if (isDesktop) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <DesktopAuth 
          onAuthSuccess={onAuthSuccess}
          onAuthError={onAuthError}
        />
      </div>
    );
  }

  // Web version
  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      <SignInForm redirectUrl={redirectUrl} />
    </div>
  );
}