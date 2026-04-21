import { useRouter, useRouterState } from "@tanstack/react-router";
import { useHotkeys } from "react-hotkeys-hook";

import { getNextTab } from "@/components/layouts/utils";
import { removeTab, useTabs } from "@/lib/tab-store";

const MAX_TAB_SHORTCUTS = 9;

interface LayoutTabShortcutsProps {
  disabled: boolean;
}

export function LayoutTabShortcuts({ disabled }: LayoutTabShortcutsProps) {
  const openTabs = useTabs();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useHotkeys(
    "shift+w",
    () => {
      const currentTab = openTabs.find((tab) => tab.url === pathname);

      if (!currentTab) {
        return;
      }

      const nextTab = getNextTab({
        tabs: openTabs,
        pathname,
        direction: "close",
      });

      removeTab(currentTab.id);

      void router.navigate({ to: nextTab?.url ?? "/" });
    },
    { enabled: !disabled && openTabs.length > 0 },
    [disabled, openTabs, router, pathname],
  );

  useHotkeys(
    "shift+left",
    () => {
      const nextTab = getNextTab({
        tabs: openTabs,
        pathname,
        direction: "left",
      });

      void router.navigate({ to: nextTab!.url });
    },
    { enabled: !disabled && openTabs.length > 1 },
    [disabled, openTabs, router, pathname],
  );

  useHotkeys(
    "shift+right",
    () => {
      const nextTab = getNextTab({
        tabs: openTabs,
        pathname,
        direction: "right",
      });

      void router.navigate({ to: nextTab!.url });
    },
    { enabled: !disabled && openTabs.length > 1 },
    [disabled, openTabs, router, pathname],
  );

  useHotkeys(
    Array.from({ length: MAX_TAB_SHORTCUTS }, (_, i) => `shift+${i + 1}`),
    (_, hotkey) => {
      const index = Number(hotkey.keys?.[0]) - 1;
      const tab = openTabs[index];

      if (!tab) {
        return;
      }

      void router.navigate({ to: tab.url });
    },
    { enabled: !disabled && openTabs.length > 0 },
    [disabled, openTabs, router],
  );

  return null;
}
