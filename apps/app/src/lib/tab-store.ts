import { createStore, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import * as z from "zod";

const tabSchema = z.object({
  id: z.string().trim(),
  type: z.enum(["thread", "rivet", "input", "inbox", "overview"]),
  title: z.string().trim(),
  url: z.string().trim(),
});

export type Tab = z.infer<typeof tabSchema>;
export type TabType = z.infer<typeof tabSchema>["type"];

const tabsAtom = atomWithStorage<Tab[]>(
  "analog:tabs",
  [],
  {
    getItem: (key: string, initialValue: Tab[]) => {
      if (typeof window === "undefined") {
        return initialValue;
      }

      try {
        const data = localStorage.getItem(key);

        if (!data) {
          return initialValue;
        }

        return z.array(tabSchema).parse(JSON.parse(data));
      } catch {
        localStorage.removeItem(key);

        return initialValue;
      }
    },
    setItem: (key: string, value: Tab[]) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key);
    },
  },
  {
    getOnInit: true,
  },
);

const store = createStore();

export function addTab(tab: Tab) {
  const tabs = store.get(tabsAtom);

  const existing = tabs.find((t) => t.id === tab.id);

  if (!existing) {
    store.set(tabsAtom, [...tabs, tab]);
    return;
  }

  if (existing.url === tab.url && existing.title === tab.title) {
    return;
  }

  store.set(
    tabsAtom,
    tabs.map((t) => (t.id === tab.id ? tab : t)),
  );
}

export function removeTab(id: string) {
  store.set(
    tabsAtom,
    store.get(tabsAtom).filter((t) => t.id !== id),
  );
}

export function removeOtherTabs(id: string) {
  store.set(
    tabsAtom,
    store.get(tabsAtom).filter((t) => t.id === id),
  );
}

export function removeTabsToRight(id: string) {
  const tabs = store.get(tabsAtom);

  const index = tabs.findIndex((t) => t.id === id);
  if (index === -1) {
    return;
  }

  store.set(tabsAtom, tabs.slice(0, index + 1));
}

export function reorderTabs(newOrder: Tab[]) {
  store.set(tabsAtom, newOrder);
}

export function useTabs() {
  return useAtomValue(tabsAtom, { store });
}
