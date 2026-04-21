import { HomeIcon, InboxIcon } from "@heroicons/react/16/solid";

import {
  LayoutTab,
  LayoutTabList,
  LayoutTabTitle,
} from "@/components/layouts/layout-tab";
import { LayoutTabShortcuts } from "@/components/layouts/layout-tab-shortcuts";
import { Separator } from "@/components/ui/separator";
import type { Tab } from "@/lib/tab-store";

const overviewTab = {
  id: "pinned-overview",
  type: "overview",
  title: "Overview",
  url: "/",
} satisfies Tab;

const inboxTab = {
  id: "pinned-inbox",
  type: "inbox",
  title: "Inbox",
  url: "/inbox",
} satisfies Tab;

interface LayoutTabBarProps {
  disabled: boolean;
}

export function LayoutTabBar({ disabled }: LayoutTabBarProps) {
  return (
    <nav className="flex min-w-0 items-center justify-center overflow-hidden px-3 py-2">
      <div className="flex w-full max-w-5xl items-center gap-3">
        <LayoutTabShortcuts disabled={disabled} />
        <div className="flex shrink-0 items-center gap-1">
          <LayoutTab tab={overviewTab}>
            <HomeIcon className="size-4" />
            <LayoutTabTitle>{overviewTab.title}</LayoutTabTitle>
          </LayoutTab>
          <LayoutTab tab={inboxTab}>
            <InboxIcon className="size-4" />
            <LayoutTabTitle>{inboxTab.title}</LayoutTabTitle>
            <div className="text-xs text-muted-foreground">10</div>
          </LayoutTab>
        </div>
        <Separator
          orientation="vertical"
          className="hidden h-5 shrink-0 self-auto! md:block"
        />

        <div
          className="min-w-0 flex-1 overflow-hidden"
          data-disabled={disabled ? true : undefined}
        >
          <LayoutTabList disabled={disabled} />
        </div>
      </div>
    </nav>
  );
}
