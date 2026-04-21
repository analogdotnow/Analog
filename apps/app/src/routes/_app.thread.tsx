import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { ThreadChatbot } from "@/components/ai";
import { CircularLoader } from "@/components/prompt-kit/loader";
import { useRegisterTab } from "@/hooks/use-register-tab";

export const Route = createFileRoute("/_app/thread")({
  component: ThreadPage,
});

function ThreadPage() {
  useRegisterTab({
    type: "thread",
    title: "Thread",
    url: "/thread",
    tabId: "chat:thread",
  });

  return (
    <ClientOnly
      fallback={
        <div className="flex h-full items-center justify-center">
          <CircularLoader className="border-muted border-t-transparent" />
        </div>
      }
    >
      <ThreadChatbot />
    </ClientOnly>
  );
}
