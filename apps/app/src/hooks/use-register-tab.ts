import * as React from "react";

import { addTab, type TabType } from "../lib/tab-store";

interface RegisterTabProps {
  type: TabType;
  title: string | undefined;
  url: string;
  tabId?: string;
}

export function useRegisterTab(tab: RegisterTabProps | null) {
  React.useEffect(() => {
    if (!tab?.title) {
      return;
    }

    addTab({
      id: tab.tabId ?? tab.url,
      type: tab.type,
      title: tab.title,
      url: tab.url,
    });
  }, [tab?.type, tab?.title, tab?.url, tab?.tabId]);
}
