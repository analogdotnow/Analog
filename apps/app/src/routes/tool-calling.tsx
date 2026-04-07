import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { ToolCallingChatbot } from "@/components/ai";

export const Route = createFileRoute("/tool-calling")({
  component: ToolCallingPage,
});

function ToolCallingPage() {
  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
          Loading tool-calling chat...
        </div>
      }
    >
      <ToolCallingChatbot />
    </ClientOnly>
  );
}
