"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTRPC } from "@/lib/trpc/client";
import { Provider } from "./integrations-list";

interface LinkIntegrationButtonProps {
  provider: Provider;
}

export function LinkIntegrationButton({ provider }: LinkIntegrationButtonProps) {
  const trpc = useTRPC();  
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation(
    trpc.integrations.link.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.integrations.pathKey() });

        if (!data.redirectUrl) {
          return;
        }

        window.location.assign(data.redirectUrl);
      },
      onError: (error) => {
        toast.error(`Failed to start the connection for ${name}: ${error.message}`);
      },
    }),
  );

  const onConnect = React.useCallback(() => {
    mutate({ providerId: provider.id });
  }, [mutate, provider.id]);
  
  if (isPending) {
    return <LoaderCircle className="size-4 animate-spin text-muted-foreground" />;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onConnect}
      className="text-primary hover:bg-primary/10 hover:text-primary"
    >
      Connect
    </Button>
  );
}