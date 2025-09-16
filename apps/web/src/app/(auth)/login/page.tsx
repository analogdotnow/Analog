import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { auth } from "@repo/auth/server";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign In - Analog",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/calendar");
  }

  const errorParam = (await searchParams)?.error;
  const showReauthAlert = errorParam === "required_scopes_missing";

  return (
    <div className="flex h-dvh w-dvw items-center justify-center titlebar-draggable-except-children">
      <div className="w-full max-w-sm px-4">
        {showReauthAlert ? (
          <div className="mb-6">
            <Alert>
              <AlertTriangle />
              {/* <AlertTitle>Heads up!</AlertTitle> */}
              <AlertDescription>
                To ensure your Google calendars are accessible, please sign in
                again and grant the requested permissions.
              </AlertDescription>
            </Alert>
          </div>
        ) : null}
        <SignInForm />
      </div>
    </div>
  );
}
