import * as React from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Reorder, useInView } from "motion/react";

import { getNextTab } from "@/components/layouts/utils";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  removeOtherTabs,
  removeTab,
  reorderTabs,
  useTabs,
  type Tab,
} from "@/lib/tab-store";
import { cn } from "@/lib/utils";

interface LayoutTabReorderListProps {
  tabs: Tab[];
  ref: React.RefObject<HTMLUListElement | null>;
  children?: React.ReactNode;
}

function LayoutTabReorderList({
  tabs,
  ref,
  children,
}: LayoutTabReorderListProps) {
  const prevTabCountRef = React.useRef(tabs.length);

  // Scroll to the right when a new tab is added
  React.useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (tabs.length > prevTabCountRef.current) {
      element.scrollTo({ left: element.scrollWidth });
    }

    prevTabCountRef.current = tabs.length;
  }, [tabs.length, ref]);

  return (
    <Reorder.Group
      axis="x"
      values={tabs}
      onReorder={reorderTabs}
      ref={ref}
      className="no-scrollbar flex items-center gap-1 overflow-x-auto"
    >
      {children}
    </Reorder.Group>
  );
}

interface TabContextMenuTarget {
  tab: Tab;
  index: number;
}

interface LayoutTabContextMenuProps {
  openTabs: Tab[];
  onCloseTab: (id: string) => void;
  children: (
    registerContextMenuTarget: (target: TabContextMenuTarget) => void,
  ) => React.ReactNode;
}

function LayoutTabContextMenu({
  openTabs,
  onCloseTab,
  children,
}: LayoutTabContextMenuProps) {
  const router = useRouter();
  const contextMenuTabRef = React.useRef<TabContextMenuTarget | null>(null);

  function registerContextMenuTarget(target: TabContextMenuTarget) {
    contextMenuTabRef.current = target;
  }

  function onClose() {
    if (!contextMenuTabRef.current) {
      return;
    }

    onCloseTab(contextMenuTabRef.current.tab.id);
  }

  function onCloseOthers() {
    if (!contextMenuTabRef.current) {
      return;
    }

    if (router.state.location.pathname !== contextMenuTabRef.current.tab.url) {
      void router.navigate({ to: contextMenuTabRef.current.tab.url });
    }

    removeOtherTabs(contextMenuTabRef.current.tab.id);
  }

  // eslint-disable-next-line react-hooks/refs
  const strip = children(registerContextMenuTarget);

  if (openTabs.length === 0) {
    return strip;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onContextMenuCapture={() => {
          contextMenuTabRef.current = null;
        }}
        onContextMenu={(event) => {
          // TODO: improve this when detached triggers are added to context menus https://github.com/mui/base-ui/issues/3746
          if (!contextMenuTabRef.current) {
            event.preventBaseUIHandler();
          }
        }}
      >
        {strip}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onClose}>
          Close
          <ContextMenuShortcut>⇧W</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onCloseOthers}
          disabled={openTabs.length <= 1}
        >
          Close other tabs
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface LayoutTabListProps {
  disabled: boolean;
}

export function LayoutTabList({ disabled }: LayoutTabListProps) {
  const openTabs = useTabs();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeTabRef = React.useRef<HTMLAnchorElement>(null);
  const scrollRef = React.useRef<HTMLUListElement>(null);
  const isInView = useInView(activeTabRef, { root: scrollRef });

  const scrollActiveTabIntoViewIfNeeded = React.useEffectEvent(() => {
    if (!activeTabRef.current || isInView) {
      return;
    }

    activeTabRef.current.scrollIntoView({
      inline: "nearest",
      block: "nearest",
    });
  });

  React.useEffect(() => {
    scrollActiveTabIntoViewIfNeeded();
  }, [pathname]);

  function onCloseTab(id: string) {
    const currentTab = openTabs.find((tab) => tab.id === id);
    const nextTab = getNextTab({
      tabs: openTabs,
      pathname: currentTab?.url,
      direction: "close",
    });

    removeTab(id);

    if (currentTab?.url !== pathname) {
      return;
    }

    void router.navigate({ to: nextTab?.url ?? "/" });
  }

  return (
    <div
      aria-hidden={disabled}
      className={cn(
        "min-w-0 overflow-hidden transition-opacity duration-200 ease-out in-data-[disabled=true]:pointer-events-none in-data-[disabled=true]:opacity-0",
      )}
    >
      <LayoutTabContextMenu openTabs={openTabs} onCloseTab={onCloseTab}>
        {(registerContextTarget) => (
          <LayoutTabReorderList tabs={openTabs} ref={scrollRef}>
            {openTabs.map((tab, index) => (
              <Reorder.Item key={tab.id} value={tab}>
                <LayoutTab
                  key={tab.id}
                  tab={tab}
                  onContextMenu={() => {
                    registerContextTarget({ tab, index });
                  }}
                  tabRef={tab.url === pathname ? activeTabRef : undefined}
                >
                  <LayoutTabTitle>{tab.title}</LayoutTabTitle>
                  <LayoutTabCloseButton
                    title={tab.title}
                    onClose={() => onCloseTab(tab.id)}
                  />
                </LayoutTab>
              </Reorder.Item>
            ))}
          </LayoutTabReorderList>
        )}
      </LayoutTabContextMenu>
    </div>
  );
}

interface LayoutTabTitleProps {
  children: React.ReactNode;
}

export function LayoutTabTitle({ children }: LayoutTabTitleProps) {
  return <span className="max-w-32 truncate">{children}</span>;
}

interface LayoutTabCloseButtonProps {
  title: string;
  onClose: () => void;
}

function LayoutTabCloseButton({ title, onClose }: LayoutTabCloseButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
      className="-ms-1 text-muted-foreground hover:text-foreground"
      aria-label={`Close ${title}`}
    >
      <X strokeWidth={2} />
    </Button>
  );
}

interface LayoutTabProps {
  tab: Tab;
  children?: React.ReactNode;
  onContextMenu?: () => void;
  tabRef?: React.Ref<HTMLAnchorElement>;
}

export function LayoutTab({
  tab,
  children,
  onContextMenu,
  tabRef,
}: LayoutTabProps) {
  return (
    <Link
      ref={tabRef}
      to={tab.url}
      draggable={false}
      onContextMenu={onContextMenu}
      activeOptions={{ exact: true }}
      activeProps={{ className: "active" }}
      className="relative flex h-8 shrink-0 items-center gap-1.5 rounded-md ps-3 pe-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground has-[button]:pe-1 [&.active]:bg-muted [&.active]:text-foreground"
    >
      {children}
    </Link>
  );
}
