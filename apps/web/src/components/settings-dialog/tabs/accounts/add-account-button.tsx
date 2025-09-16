"use client";

import * as React from "react";

import { authClient } from "@repo/auth/client";
import { env } from "@repo/env/client";

import { AddAccountDialog } from "@/components/add-account-dialog";
import { Button } from "@/components/ui/button";

export function AddAccountButton() {
  const linkAccount = React.useCallback(async () => {
    await authClient.linkSocial({
      provider: "google",
      callbackURL: "/calendar",
    });
  }, []);

  if (env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    return (
      <Button variant="outline" onClick={linkAccount}>
        Add Account
      </Button>
    );
  }

  return (
    <AddAccountDialog>
      <Button variant="outline">Add Account</Button>
    </AddAccountDialog>
  );
}
