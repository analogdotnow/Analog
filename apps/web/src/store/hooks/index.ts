import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { eachDayOfInterval, startOfWeek } from "@repo/temporal";

import type { CalendarView } from "@/components/calendar/interfaces";
import { timeZoneAbbreviation } from "@/components/calendar/timeline/header/use-timezone-info";
import { calendarTitle } from "@/components/calendar/utils/title";
import type { StackWindowEntry } from "@/components/command-bar/interfaces";
import { useLiveEventById } from "@/lib/db";
import type { Calendar, CalendarEvent } from "@/lib/interfaces";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import type { TimeZone } from "@/store/calendar-store";

export interface InfiniteScrollRange {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
  center: Temporal.PlainDate;
}

export function useDefaultTimeZone(): string {
  return useCalendarStore((s) => s.timeZones[0]!.id);
}

export function useDefaultEventDuration(): number {
  return useCalendarStore((s) => s.calendarSettings.defaultEventDuration);
}

export function useTimeZoneList(): TimeZone[] {
  "use memo";

  const timeZones = useCalendarStore((s) => s.timeZones);
  const now = Temporal.Now.plainDateISO();

  return timeZones.map((timeZone) => ({
    id: timeZone.id,
    label: timeZone.label ?? timeZoneAbbreviation(timeZone.id, now),
  }));
}

function displayedDays(
  view: CalendarView,
  weekViewNumberOfDays: number,
): number {
  switch (view) {
    case "day":
      return 1;
    case "week":
      return weekViewNumberOfDays;
    default:
      return 7;
  }
}

export function useDisplayedDays() {
  "use memo";

  const calendarView = useCalendarStore((s) => s.calendarView);
  const weekViewNumberOfDays = useCalendarStore(
    (s) => s.viewPreferences.weekViewNumberOfDays,
  );

  return displayedDays(calendarView, weekViewNumberOfDays);
}

export function useAnchor(): Temporal.PlainDate {
  return useCalendarStore((s) => s.anchor);
}

export function useSelectedEventList(): string[] {
  "use memo";

  const selectedDisplayItemIds = useCalendarStore(
    (s) => s.selectedDisplayItemIds,
  );

  return React.useMemo(
    () =>
      selectedDisplayItemIds
        .filter((id) => id.startsWith("event_"))
        .map((id) => id.slice(6)),
    [selectedDisplayItemIds],
  );
}

export function useSelectedEvent(): CalendarEvent | undefined {
  "use memo";

  const selectedEventIds = useSelectedEventList();

  return useLiveEventById(selectedEventIds[0] ?? "");
}

export function useCommandMenuPage(): string | undefined {
  "use memo";

  const commandMenuPages = useCalendarStore((s) => s.commandMenuPages);

  return commandMenuPages.at(-1);
}

export function useIsDisplayItemSelected(displayItemId: string): boolean {
  "use memo";

  const selectedDisplayItemIds = useCalendarStore(
    (s) => s.selectedDisplayItemIds,
  );

  return selectedDisplayItemIds.includes(displayItemId);
}

export function useIsEventSelected(eventId: string): boolean {
  "use memo";

  const selectedDisplayItemIds = useCalendarStore(
    (s) => s.selectedDisplayItemIds,
  );

  return selectedDisplayItemIds.includes(`event_${eventId}`);
}

export function useCalendarTitleFull(): string {
  "use memo";

  const currentDate = useCalendarStore((s) => s.currentDate);
  const timeZones = useCalendarStore((s) => s.timeZones);
  const calendarView = useCalendarStore((s) => s.calendarView);
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  return calendarTitle(currentDate, {
    timeZone: timeZones[0]!.id,
    view: calendarView,
    weekStartsOn,
    variant: "full",
  });
}

export function useCalendarTitleShort(): string {
  const currentDate = useCalendarStore((s) => s.currentDate);
  const timeZones = useCalendarStore((s) => s.timeZones);
  const calendarView = useCalendarStore((s) => s.calendarView);
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  return React.useMemo(
    () =>
      calendarTitle(currentDate, {
        timeZone: timeZones[0]!.id,
        view: calendarView,
        weekStartsOn,
        variant: "short",
      }),
    [currentDate, timeZones, calendarView, weekStartsOn],
  );
}

export function useCurrentWeekNumber() {
  "use memo";

  const currentDate = useCalendarStore((s) => s.currentDate);

  return currentDate.weekOfYear;
}

export function useActiveWindowId(): string | null {
  "use memo";

  const windowStack = useCalendarStore((s) => s.windowStack);

  return windowStack.at(-1)?.id ?? null;
}

export function useArrangedWindows(): StackWindowEntry[] {
  "use memo";

  const windowStack = useCalendarStore((s) => s.windowStack);

  return React.useMemo(() => [...windowStack], [windowStack]);
}

export function useWindowState(): "xs" | "lg" {
  "use memo";

  const eventIds = useSelectedEventList();

  return eventIds.length > 0 ? "lg" : "xs";
}

export function useCalendarView(): CalendarView {
  return useCalendarStore((s) => s.calendarView);
}

export function useShowWeekends(): boolean {
  return useCalendarStore((s) => s.viewPreferences.showWeekends);
}

export function useShowWeekNumbers(): boolean {
  return useCalendarStore((s) => s.viewPreferences.showWeekNumbers);
}

export function useViewPreferences() {
  return useCalendarStore((s) => s.viewPreferences);
}

export function useCalendarSettings() {
  return useCalendarStore((s) => s.calendarSettings);
}

export function useCellHeight(): number {
  return useCalendarStore((s) => s.cellHeight);
}

export function useCurrentDate(): Temporal.PlainDate {
  return useCalendarStore((s) => s.currentDate);
}

export function useSetCurrentDate() {
  return useCalendarStore((s) => s.setCurrentDate);
}

export function useNavigateTo() {
  return useCalendarStore((s) => s.navigateTo);
}

export function useSetCalendarView() {
  return useCalendarStore((s) => s.setCalendarView);
}

export function useSetViewPreferences() {
  return useCalendarStore((s) => s.setViewPreferences);
}

export function useSetCalendarSettings() {
  return useCalendarStore((s) => s.setCalendarSettings);
}

export function useSetCommandMenuOpen() {
  return useCalendarStore((s) => s.setCommandMenuOpen);
}

export function usePushCommandMenuPage() {
  return useCalendarStore((s) => s.pushCommandMenuPage);
}

export function useSetSelectedEventIds() {
  return useCalendarStore((s) => s.setSelectedEventIds);
}

export function useSetResizing() {
  return useCalendarStore((s) => s.setResizing);
}

export function useDraggingEventId() {
  return useCalendarStore((s) => s.draggingEventId);
}

export function useIsDragging(eventId: string) {
  return useCalendarStore((s) => s.draggingEventId === eventId);
}

export function useSetDraggingEventId() {
  return useCalendarStore((s) => s.setDraggingEventId);
}

export function useVisibleRange() {
  return useCalendarStore((s) => s.visibleRange);
}

export function useSetVisibleRange() {
  return useCalendarStore((s) => s.setVisibleRange);
}

export function useDefaultCalendar(): Calendar | null {
  return useCalendarStore((s) => s.defaultCalendar);
}

export function useSetDefaultCalendar() {
  return useCalendarStore((s) => s.setDefaultCalendar);
}

export function useWindowsExpanded(): boolean {
  return useCalendarStore((s) => s.windowsExpanded);
}

export function useToggleWindowsExpanded() {
  return useCalendarStore((s) => s.toggleWindowsExpanded);
}
