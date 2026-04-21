import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/inbox")({
  component: InboxPage,
});

function InboxPage() {
  return (
    <div className="flex h-full p-6">
      <p className="text-sm text-muted-foreground">Inbox</p>
    </div>
  );
}
