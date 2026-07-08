"use client";

import * as React from "react";

import { SCROLL_MULTIPLIER } from "@/components/calendar/constants";
import { ContainerProvider } from "@/components/calendar/context/container-provider";
import { useMonthViewGridLayout } from "@/hooks/calendar/use-grid-layout";
import { cn } from "@/lib/utils";
import { useInfiniteMonthView } from "./infinite-month-view-provider";
import { InfiniteMonthViewWeek } from "./infinite-month-view-week";
import { useInfiniteMonthViewWeeks } from "./infinite-month-view-week-provider";
import { MonthViewHeader } from "./month-view-header";
import { SnapMonths, SnapRows } from "./month-view-snap-rows";

type InfiniteMonthViewProps = React.ComponentProps<"div">;

export function InfiniteMonthView({
  className,
  ...props
}: InfiniteMonthViewProps) {
  "use memo";

  const containerRef = React.useRef<HTMLDivElement>(null);

  const { weeks, rows, range, trackBase, snapTrackBase, scrollRef } =
    useInfiniteMonthViewWeeks();
  const { view } = useInfiniteMonthView();

  const grid = useMonthViewGridLayout();

  return (
    <ContainerProvider containerRef={containerRef} view={view}>
      <div
        ref={scrollRef}
        data-slot="infinite-month-view"
        className={cn(
          "isolate flex scrollbar-hidden h-full min-w-0 snap-y snap-mandatory scroll-pt-(--month-view-header-height) flex-col overflow-x-hidden overflow-y-scroll",
          className,
        )}
        style={{
          "--month-view-grid": grid,
          "--month-view-height": `calc(${SCROLL_MULTIPLIER * 100}% - (var(--month-view-header-height) * ${SCROLL_MULTIPLIER}))`,
          "--month-view-header-height": "calc(2.25rem)",
          "--row-height": `${rows.fraction}%`,
          "--track-base": trackBase,
        }}
        {...props}
      >
        <div className="sticky top-0 z-30 h-0 w-0">
          <div className="sticky top-0 w-screen bg-background">
            <MonthViewHeader />
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative h-(--month-view-height) min-w-0 flex-none"
        >
          <SnapRows rows={rows.total} />
          <SnapMonths range={range} trackBase={snapTrackBase} />

          {weeks.map((week) => (
            <InfiniteMonthViewWeek
              key={week.start.toString()}
              data-date={week.start.toString()}
              week={week}
              className="absolute inset-x-0 top-(--row-offset) h-(--row-height) [--row-offset:calc((var(--week-offset)-var(--track-base))*var(--row-height))]"
              style={{ "--week-offset": week.index }}
            />
          ))}
        </div>
      </div>
    </ContainerProvider>
  );
}
