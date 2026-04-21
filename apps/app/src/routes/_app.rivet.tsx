import * as React from "react";
import { createRivetKit } from "@rivetkit/react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import type { Registry } from "@repo/actors/registry";

import { Button } from "@/components/ui/button";
import { useRegisterTab } from "@/hooks/use-register-tab";

export const Route = createFileRoute("/_app/rivet")({
  component: RivetPage,
});

function RivetPage() {
  useRegisterTab({ type: "rivet", title: "Rivet", url: "/rivet" });

  return (
    <div className="flex h-full p-6">
      <ClientOnly
        fallback={
          <div className="text-sm text-muted-foreground">
            Loading Rivet test page...
          </div>
        }
      >
        <CounterTester />
      </ClientOnly>
    </div>
  );
}

const { useActor } = createRivetKit<Registry>(
  `${window.location.origin}/api/rivet`,
);

function CounterTester() {
  const [count, setCount] = React.useState(0);
  const counter = useActor({
    name: "counter",
    key: ["my-counter"],
  });

  counter.useEvent("newCount", setCount);

  React.useEffect(() => {
    if (!counter.connection) {
      return;
    }

    void counter.connection.increment(0).then(setCount);
  }, [counter.connection]);

  const increment = async () => {
    if (!counter.connection) {
      return;
    }

    setCount(await counter.connection.increment(1));
  };

  return (
    <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm">
      <div className="space-y-1">
        <h1 className="font-medium">Rivet test page</h1>
        <p className="text-muted-foreground">
          This uses the quickstart counter actor through <code>/api/rivet</code>
          .
        </p>
        <p className="text-muted-foreground">
          Open this page in two tabs to verify realtime updates.
        </p>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-muted-foreground">Connection</div>
        <div className="font-medium">{counter.connStatus}</div>
        <div className="mt-4 text-muted-foreground">Count</div>
        <div className="text-3xl font-medium">{count}</div>
        <Button
          className="mt-4"
          disabled={!counter.connection}
          onClick={increment}
        >
          Increment
        </Button>
      </div>
    </div>
  );
}
