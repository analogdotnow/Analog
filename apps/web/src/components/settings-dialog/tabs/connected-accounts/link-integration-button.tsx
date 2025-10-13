"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RouterInputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";

type ProviderId = RouterInputs["integrations"]["link"]["providerId"];

interface LinkIntegrationButtonProps {
  name: string;
  providerId: ProviderId;
}

export function LinkIntegrationButton({
  providerId,
}: LinkIntegrationButtonProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation(
    trpc.integrations.link.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.integrations.pathKey(),
        });

        if (!data.redirectUrl) {
          return;
        }

        window.location.assign(data.redirectUrl);
      },
      onError: (error) => {
        toast.error(
          `Failed to start the connection for ${name}: ${error.message}`,
        );
      },
    }),
  );

  const onConnect = React.useCallback(() => {
    mutate({ providerId });
  }, [mutate, providerId]);

  if (isPending) {
    return (
      <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
    );
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
