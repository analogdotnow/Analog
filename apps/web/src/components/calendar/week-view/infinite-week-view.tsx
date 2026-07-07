"use client";

// Required to ensure the scroll position is reset on fast refresh
// @refresh reset
import * as React from "react";

import { ContainerProvider } from "@/components/calendar/context/container-provider";
import { TimeIndicatorBackground } from "@/components/calendar/timeline/time-indicator";
import { Timeline } from "@/components/calendar/timeline/timeline";
import { TimelineHeader } from "@/components/calendar/timeline/timeline-header";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { InfiniteWeekViewAllDaySection } from "./infinite-week-view-all-day";
import { InfiniteWeekViewAllDayEventProvider } from "./infinite-week-view-all-day-event-provider";
import { InfiniteWeekViewColumn } from "./infinite-week-view-column";
import { useInfiniteWeekViewDays } from "./infinite-week-view-day-provider";
import { InfiniteWeekViewHeader } from "./infinite-week-view-header";
import { WeekViewItem } from "./week-view-item";
import { WeekViewSideItem } from "./week-view-side-item";
import { WeekViewSnapColumns, WeekStartSnapGuideline } from "./week-view-snap-columns";

type InfiniteWeekViewProps = React.ComponentProps<"div">;
const DAYS_IN_WEEK = 7;

export function InfiniteWeekView({
  className,
  ...props
}: InfiniteWeekViewProps) {
  "use memo";

  const timeZoneCount = useCalendarStore((s) => s.timeZones.length);

  const { days, columns, scrollRef, trackBase } = useInfiniteWeekViewDays();

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <ContainerProvider
      containerRef={containerRef}
      view={{ columns: columns.count }}
    >
      <div
        ref={scrollRef}
        data-slot="infinite-week-view"
        className={cn(
          "isolate flex scrollbar-hidden h-full snap-x snap-mandatory scroll-ps-(--timeline-container-width) flex-col overflow-x-scroll overflow-y-auto [--time-column-width:3rem] [--timeline-container-width:calc(var(--time-columns)*2.5rem+0.5rem)] [--week-view-bottom-padding:16rem] sm:[--time-column-width:5rem] sm:[--timeline-container-width:calc(var(--time-columns)*3rem+1rem)]",
          className,
        )}
        style={{
          "--time-columns": timeZoneCount,
          "--columns": columns.count,
          "--track-base": trackBase,
          "--week-view-width": `calc(5000% - (var(--timeline-container-width) * 50))`,
          "--column-width": `${columns.fraction}%`,
          "--padding-left": `var(--timeline-container-width)`,
          "--all-day-row-height": `28px`,
        }}
        {...props}
      >
        <div className="sticky top-0 z-30 flex w-(--week-view-width) flex-col">
          <div className="flex border-b border-border/70 bg-background">
            <div className="sticky left-0 z-40 h-0 w-0">
              <div className="sticky left-0 w-(--timeline-container-width) flex-none bg-background pe-px">
                <TimelineHeader />
              </div>
            </div>
            <InfiniteWeekViewHeader items={days} />
          </div>

          <InfiniteWeekViewAllDayEventProvider>
            <div
              data-slot="week-view-all-day-drop-zone"
              className="relative flex min-h-7 border-b border-border/70 bg-background"
            >
              <div className="sticky left-0 z-30 h-full w-0">
                <div className="left-0 flex h-full min-h-7 w-(--timeline-container-width) flex-none flex-col justify-center border-r border-border/70 bg-background">
                  <div className="flex items-center justify-end">
                    <span className="pe-3 text-right text-3xs text-muted-foreground/70 select-none sm:pe-4 sm:text-xs">
                      All day
                    </span>
                  </div>
                </div>
              </div>
              <InfiniteWeekViewAllDaySection />
            </div>
          </InfiniteWeekViewAllDayEventProvider>
        </div>

        <div className="flex w-(--week-view-width) flex-1">
          <div className="sticky left-0 z-20 h-0 w-0">
            <div className="sticky left-0 w-(--timeline-container-width) flex-none border-r border-border/70 bg-background">
              <Timeline />
            </div>
          </div>
          <div
            ref={containerRef}
            data-slot="week-view-timed-drop-zone"
            className="relative w-(--week-view-width) flex-1"
          >
            <WeekViewSnapColumns columnCount={columns.total} />
            {columns.count === DAYS_IN_WEEK ? (
              <WeekStartSnapGuideline
                columnCount={columns.total}
                columnCenter={columns.center}
                columnFraction={columns.fraction}
              />
            ) : null}

            {days.map(({ date, index, items, sideItems }) => (
              <InfiniteWeekViewColumn
                key={date.toString()}
                className="absolute top-0 left-(--column-offset) isolate w-(--column-width) [--column-offset:calc((var(--day-offset)-var(--track-base))*var(--column-width))]"
                day={date}
                style={{ "--day-offset": index }}
              >
                {sideItems.map(({ item, position }) => (
                  <WeekViewSideItem
                    key={item.id}
                    item={item}
                    position={position}
                  />
                ))}

                {items.map(({ item, position }) => (
                  <WeekViewItem key={item.id} item={item} position={position} />
                ))}
              </InfiniteWeekViewColumn>
            ))}
            <TimeIndicatorBackground />
          </div>
        </div>
      </div>
    </ContainerProvider>
  );
}
