import { createFileRoute } from "@tanstack/react-router";

import { registry } from "@/lib/rivet";

export const Route = createFileRoute("/api/rivet/$")({
  server: {
    handlers: {
      GET: ({ request }) => registry.handler(request),
      POST: ({ request }) => registry.handler(request),
    },
  },
});
