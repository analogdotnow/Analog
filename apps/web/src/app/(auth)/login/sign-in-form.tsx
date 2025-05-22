"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@repo/auth/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Google } from "@/components/icons/google";
import { cn } from "@/lib/utils";

interface SignInFormProps {
  redirectUrl?: string;
}

export function SignInForm({ redirectUrl = "/" }: SignInFormProps) {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirectUrl,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
      },
    );
  };

  return (
    <Card className="max-w-md shadow-none border-none">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl text-center">
          Analog
        </CardTitle>
        <CardDescription className="text-md md:text-lg text-center text-balance">
          The calendar that changes everything
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8">
          <div
            className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col",
            )}
          >
            <Button
              variant="outline"
              className={cn("w-full gap-2")}
              disabled={loading}
              onClick={signInWithGoogle}
            >
              <Google />
              Continue with Google
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full py-4">
          <p className="text-center text-sm text-muted-foreground text-balance">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-primary hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
