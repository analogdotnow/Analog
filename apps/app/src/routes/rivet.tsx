import { useEffect, useState } from "react";
import { createRivetKit } from "@rivetkit/react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type { AppRegistry } from "@/lib/rivet";

export const Route = createFileRoute("/rivet")({
  component: RivetPage,
});

function RivetPage() {
  return (
    <div className="flex min-h-svh p-6">
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

function CounterTester() {
  const [rivet] = useState(() =>
    createRivetKit<AppRegistry>(`${window.location.origin}/api/rivet`),
  );
  const [count, setCount] = useState(0);
  const counter = rivet.useActor({
    name: "counter",
    key: ["my-counter"],
  });

  counter.useEvent("newCount", setCount);

  useEffect(() => {
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
