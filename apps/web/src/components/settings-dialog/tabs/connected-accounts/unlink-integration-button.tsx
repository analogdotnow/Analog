"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTRPC } from "@/lib/trpc/client";

interface UnlinkIntegrationButtonProps {
  accountId: string;
}

export function UnlinkIntegrationButton({ accountId }: UnlinkIntegrationButtonProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation(
    trpc.integrations.unlink.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.integrations.pathKey() });
      },
      onError: (error) => {
        toast.error(`Failed to disconnect account: ${error.message}`);
      },
    }),
  );

  const onDisconnect = React.useCallback(() => {
    mutate({ accountId });
  }, [mutate, accountId]);

  if (isPending) {
    return <LoaderCircle className="size-4 animate-spin text-muted-foreground" />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onDisconnect}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      Disconnect
    </Button>
  );
}