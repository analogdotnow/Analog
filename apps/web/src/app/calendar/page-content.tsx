"use client";

import type React from "react";
import dynamic from "next/dynamic";

const CalendarLayout: React.ComponentType = dynamic(
  () =>
    import("@/components/calendar/calendar-layout").then(
      (mod) => mod.CalendarLayout,
    ),
  { ssr: false },
);

export function PageContent() {
  return <CalendarLayout />;
}
