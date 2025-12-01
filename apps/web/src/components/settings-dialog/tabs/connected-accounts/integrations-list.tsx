"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { RouterInputs, RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";
import { LinkIntegrationButton } from "./link-integration-button";
import { UnlinkIntegrationButton } from "./unlink-integration-button";

type ConnectedAccount =
  RouterOutputs["integrations"]["list"]["connectedAccounts"][number];

type ProviderId = RouterInputs["integrations"]["link"]["providerId"];

export interface Provider {
  id: ProviderId;
  name: string;
  description: string;
  account?: ConnectedAccount;
}

const PROVIDERS = [
  // {
  //   id: "mail0",
  //   name: "Mail0",
  //   description: "Connect Mail0 to allow Analog to draft and send emails",
  // },
  {
    id: "github",
    name: "GitHub",
    description:
      "Connect GitHub to allow Analog to search or manage issues and pull requests",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Connect Linear to allow Analog to search or manage issues",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Connect Notion to allow Analog to search pages and databases",
  },
] as const satisfies Provider[];

export function IntegrationsList() {
  const trpc = useTRPC();
  const { data, isPending, isError } = useQuery(
    trpc.integrations.list.queryOptions(),
  );

  const providers = React.useMemo(() => {
    if (!data) {
      return [];
    }

    return PROVIDERS.map((provider) => ({
      ...provider,
      account: data.connectedAccounts.find(
        (account) => account.slug === provider.id,
      ),
    }));
  }, [data]);

  if (isPending) {
    return <IntegrationsListSkeleton />;
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>We couldn&apos;t load your connected accounts.</p>
        <p className="mt-1 text-sm">Please try again in a few moments.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-y-2">
      {providers.map((provider) => (
        <React.Fragment key={provider.id}>
          <IntegrationsListItem provider={provider} />
          <Separator className="last:hidden" />
        </React.Fragment>
      ))}
    </ul>
  );
}

interface IntegrationsListItemProps {
  provider: Provider;
}

function IntegrationsListItem({ provider }: IntegrationsListItemProps) {
  return (
    <li className="group flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground">
        {/* <Icon className="size-4" /> */}
      </span>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-tight font-medium">{provider.name}</p>
            <p className="text-sm text-muted-foreground">
              {provider.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge> */}
            {provider.account ? (
              <UnlinkIntegrationButton accountId={provider.account.id} />
            ) : (
              <LinkIntegrationButton
                providerId={provider.id}
                name={provider.name}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function IntegrationsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          <Skeleton className="size-8 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
