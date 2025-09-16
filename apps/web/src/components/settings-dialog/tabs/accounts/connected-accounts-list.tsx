"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@repo/auth/client";

import { Google, Microsoft, Zoom } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";

export function ConnectedAccountsList() {
  const trpc = useTRPC();
  const query = useQuery(trpc.accounts.list.queryOptions());

  if (query.isPending) {
    return <AccountsListSkeleton />;
  }

  if (query.isError) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Error loading accounts.</p>
      </div>
    );
  }

  if (query.data.accounts.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No accounts connected yet.</p>
        <p className="mt-1 text-sm">Add an account to get started.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-y-2">
      {query.data.accounts.map((account) => (
        <React.Fragment key={account.id}>
          <AccountListItem account={account} />
          <Separator className="last:hidden" />
        </React.Fragment>
      ))}
    </ul>
  );
}

interface AccountIconProps {
  provider: "google" | "microsoft" | "zoom";
}

function AccountIcon({ provider }: AccountIconProps) {
  switch (provider) {
    case "google":
      return <Google className="size-4" />;
    case "microsoft":
      return <Microsoft className="size-4" />;
    case "zoom":
      return <Zoom className="size-4" />;
    default:
      return null;
  }
}

type Account = RouterOutputs["accounts"]["list"]["accounts"][number];

interface AccountListItemProps {
  account: Account;
}

function AccountListItem({ account }: AccountListItemProps) {
  return (
    <li className="group flex items-center gap-3">
      <AccountIcon provider={account.providerId} />

      <p className="pointer-events-none flex-1 text-sm font-medium">
        {account.email}
      </p>

      <DisconnectAccountButton
        accountId={account.id}
        providerId={account.providerId}
      />
    </li>
  );
}

interface DisconnectAccountButtonProps {
  accountId: string;
  providerId: "google" | "microsoft" | "zoom";
}

function DisconnectAccountButton({
  accountId,
  providerId,
}: DisconnectAccountButtonProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.unlinkAccount({
        providerId,
        accountId,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.accounts.pathKey() });
      queryClient.invalidateQueries({ queryKey: trpc.calendars.pathKey() });
      queryClient.invalidateQueries({ queryKey: trpc.events.pathKey() });
    },
    onError: (error) => {
      toast.error(`Failed to disconnect account: ${error.message}`);
    },
  });

  const onDisconnect = React.useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  if (mutation.isPending) {
    return (
      <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={onDisconnect}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      Disconnect
    </Button>
  );
}

function AccountsListSkeleton() {
  return (
    <div className="space-y-3">
      <AccountListItemSkeleton />
    </div>
  );
}

function AccountListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl">
      {/* Provider icon skeleton */}
      <Skeleton className="size-4" />

      {/* Email skeleton */}
      <Skeleton className="h-4 flex-1" />

      {/* Action button skeleton */}
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
