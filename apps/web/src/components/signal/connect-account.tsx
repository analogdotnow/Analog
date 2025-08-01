"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@repo/auth/client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface ConnectAccountProps {
  className?: string;
}

export function ConnectAccount({ className }: ConnectAccountProps) {
  const trpc = useTRPC();
  const { data: zeroAccountData, refetch } = useQuery(
    trpc.accounts.hasZeroAccount.queryOptions(),
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await authClient.signIn.oauth2({
        providerId: "zero",
        callbackURL: "/calendar",
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Successfully connected to Zero account!");
      refetch();
    },
    onError: (error) => {
      console.error("Zero connection error:", error);
      toast.error("Failed to connect Zero account. Please try again.");
    },
  });

  const handleConnect = () => {
    mutation.mutate();
  };

  if (zeroAccountData?.hasZeroAccount) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="size-2 rounded-full bg-green-500" />
          Connected to {zeroAccountData.zeroAccount?.email || "Zero"}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button onClick={handleConnect} disabled={mutation.isPending}>
        {mutation.isPending ? "Connecting..." : "Connect Zero Account"}
      </Button>
    </div>
  );
}
