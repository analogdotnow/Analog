"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Loader } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@repo/auth/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { connections } from "@/lib/constants";
import { useTRPC } from "@/lib/trpc/client";

interface ConnectAccountDialogProps {
  children: React.ReactNode;
}

function useConnectedAccounts() {
  const trpc = useTRPC();
  return useQuery(trpc.connectedAccounts.list.queryOptions());
}

export function ConnectAccountDialog({ children }: ConnectAccountDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState<string | null>(null);

  const { data: connected } = useConnectedAccounts();

  console.log("connections", connected);

  const handleLinkAccount = async (provider: string) => {
    try {
      setIsAdding(provider);
      await authClient.linkSocial({
        provider: provider as "zoom",
        callbackURL: "/calendar",
      });
      setOpen(false);
    } catch {
      toast.error("Failed to link account");
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Account</DialogTitle>
          <DialogDescription>
            Link another account to enable integrations. Choose a provider
            below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-6 space-y-2">
          {connections.map((connection) => {
            const isConnected = connected?.accounts.some(
              (acc) => acc.providerId === connection.connectionId,
            );

            return (
              <Button
                key={connection.connectionId}
                variant="outline"
                className="relative h-18 w-20"
                onClick={() => handleLinkAccount(connection.connectionId)}
                disabled={isAdding === connection.connectionId || isConnected}
              >
                {isAdding === connection.connectionId ? (
                  <Loader className="animate-spin" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    {isConnected && (
                      <div className="absolute top-1 right-1">
                        <BadgeCheck fill="green" />
                      </div>
                    )}
                    <connection.icon className="scale-200" />
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
