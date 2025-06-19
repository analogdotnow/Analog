"use client";

import * as React from "react";
import { Plus } from "lucide-react";
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

interface AddAccountDialogProps {
  children: React.ReactNode;
}

export function ConnectAccountDialog({ children }: AddAccountDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  const handleLinkAccount = async (provider: string) => {
    try {
      setIsLoading(provider);
      await authClient.linkSocial({
        provider: provider as "zoom",
        callbackURL: "/calendar",
      });
      setOpen(false);
    } catch {
      toast.error("Failed to link account");
    } finally {
      setIsLoading(null);
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
        <div className="flex gap-4 space-y-2">
          {connections.map((connection) => (
            <Button
              key={connection.connectionId}
              variant="outline"
              className="h-16 w-16 justify-center"
              onClick={() => handleLinkAccount(connection.connectionId)}
              disabled={isLoading === connection.connectionId}
            >
              {isLoading === connection.connectionId ? (
                "Connecting..."
              ) : (
                <>
                  <div>
                    <connection.icon className="scale-200" />
                  </div>
                </>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
