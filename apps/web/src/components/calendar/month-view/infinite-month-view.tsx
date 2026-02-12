"use client";

import * as React from "react";

import { ContainerProvider } from "@/components/calendar/context/container-provider";
import { useMonthViewGridLayout } from "@/hooks/calendar/use-grid-layout";
import { cn } from "@/lib/utils";
import { useInfiniteMonthView } from "./infinite-month-view-provider";
import { MemoizedInfiniteMonthViewWeek } from "./infinite-month-view-week";
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

  const { weeks, rows, scrollRef } = useInfiniteMonthViewWeeks();
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
          "--month-view-height":
            "calc(5000% - (var(--month-view-header-height) * 50))",
          "--month-view-header-height": "calc(2.25rem)",
          "--row-height": `${rows.fraction}%`,
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
          <SnapRows rowCount={rows.total} />
          <SnapMonths
            rowCount={rows.total}
            rowCenter={rows.center}
            rowFraction={rows.fraction}
          />

          {weeks.map((week) => (
            <MemoizedInfiniteMonthViewWeek
              key={week.start.toString()}
              data-date={week.start.toString()}
              week={week}
              className="absolute inset-x-0 h-(--row-height)"
              style={{
                top: `${50 + rows.fraction * (week.index - rows.center)}%`,
              }}
            />
          ))}
        </div>
      </div>
    </ContainerProvider>
  );
}
