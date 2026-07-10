"use client";

import { AgendaViewList } from "./agenda-view-list";
import { AgendaViewProvider } from "./agenda-view-provider";

export function AgendaView() {
  "use memo";

  return (
    <AgendaViewProvider>
      <AgendaViewList />
    </AgendaViewProvider>
  );
}
