import { Outlet, createFileRoute } from "@tanstack/react-router";

import { LayoutTabBar } from "@/components/layouts/layout-tab-bar";
import { useIsMounted } from "@/hooks/use-is-mounted";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const isMounted = useIsMounted();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <LayoutTabBar disabled={!isMounted} />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
