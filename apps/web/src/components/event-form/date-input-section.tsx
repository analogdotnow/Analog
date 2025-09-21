"use client";

import * as React from "react";
import { ArrowRightIcon, ClockIcon } from "@heroicons/react/16/solid";
import { useField } from "@tanstack/react-form";
import { Temporal } from "temporal-polyfill";

import { MemoizedDateInput } from "@/components/event-form/date-input/date-input";
import { MemoizedTimeInput } from "@/components/event-form/time-input/time-input";
import { MemoizedTimezoneSelect } from "@/components/event-form/timezone-input/timezone-select";
import { cn } from "@/lib/utils";
import { initialValues } from "./utils/defaults";
import { withForm } from "./utils/form";

export const DateInputSection = withForm({
  defaultValues: initialValues,
  props: {
    disabled: false as boolean | undefined,
  },
  render: function Render({ form, disabled }) {
    const startField = useField({ name: "start", form });
    const endField = useField({ name: "end", form });
    const isAllDayField = useField({ name: "isAllDay", form });
    const isSameTimezone =
      startField.state.value.timeZoneId === endField.state.value.timeZoneId;
    const [openTimePicker, setOpenTimePicker] = React.useState<
      "start" | "end" | null
    >(null);

    const onTimezoneChange = React.useCallback(
      (value: string) => {
        startField.handleChange(startField.state.value.withTimeZone(value));
        startField.handleBlur();
        endField.handleChange(endField.state.value.withTimeZone(value));
        endField.handleBlur();
      },
      [startField, endField],
    );

    const onStartTimezoneChange = React.useCallback(
      (value: string) => {
        startField.handleChange(startField.state.value.withTimeZone(value));
        startField.handleBlur();
      },
      [startField],
    );

    const onEndTimezoneChange = React.useCallback(
      (value: string) => {
        endField.handleChange(endField.state.value.withTimeZone(value));
        endField.handleBlur();
      },
      [endField],
    );

    const onStartChange = React.useCallback(
      (value: Temporal.ZonedDateTime) => {
        const duration = startField.state.value.until(endField.state.value);

        startField.handleChange(value);

        if (!isSameTimezone) {
          const newEnd = value
            .add(duration)
            .withTimeZone(endField.state.value.timeZoneId);
          endField.handleChange(newEnd);
          endField.handleBlur();

          return;
        }

        endField.handleChange(value.add(duration));
        endField.handleBlur();
      },
      [startField, endField, isSameTimezone],
    );

    const onEndChange = React.useCallback(
      (value: Temporal.ZonedDateTime) => {
        endField.handleChange(value);
        endField.handleBlur();
      },
      [endField],
    );

    const onTimeStartOpenChange = React.useCallback(
      (open: boolean) => {
        setOpenTimePicker(
          open ? "start" : openTimePicker === "start" ? null : openTimePicker,
        );
      },
      [openTimePicker],
    );

    const onTimeEndOpenChange = React.useCallback(
      (open: boolean) => {
        setOpenTimePicker(
          open ? "end" : openTimePicker === "end" ? null : openTimePicker,
        );
      },
      [openTimePicker],
    );

    const isAllDay = isAllDayField.state.value;

    return (
      <section className="flex flex-col gap-y-1">
        <div className="flex flex-col gap-y-1">
          <div className="relative grid grid-cols-(--grid-event-form) items-center gap-1">
            <label htmlFor="start.time" className="sr-only">
              Start time
            </label>
            <MemoizedTimeInput
              id="start.time"
              className="col-span-2 col-start-1 h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent"
              value={startField.state.value}
              open={openTimePicker === "start"}
              onOpenChange={onTimeStartOpenChange}
              onChange={onStartChange}
              disabled={disabled || isAllDay}
            />
            <label htmlFor="end.time" className="sr-only">
              End time
            </label>
            <MemoizedTimeInput
              id="end.time"
              className="col-span-2 col-start-3 h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent"
              value={endField.state.value}
              open={openTimePicker === "end"}
              onOpenChange={onTimeEndOpenChange}
              onChange={onEndChange}
              disabled={disabled || isAllDay}
            />
            <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
              <div className="col-start-1 ps-2">
                <ClockIcon
                  className={cn(
                    "size-4 text-muted-foreground transition-colors peer-hover:text-foreground",
                    isAllDay && "text-muted-foreground/40",
                  )}
                />
              </div>
              <div className="col-start-3 ps-1.5">
                <ArrowRightIcon
                  className={cn(
                    "size-4 text-muted-foreground transition-colors hover:text-foreground",
                    isAllDay && "text-muted-foreground/40",
                  )}
                />
              </div>
            </div>
          </div>
          <div className="relative grid grid-cols-(--grid-event-form) items-center gap-1">
            <label htmlFor="start.date" className="sr-only">
              Start date
            </label>
            <MemoizedDateInput
              id="start.date"
              className={cn(
                "col-span-1 col-start-2 h-8 border-none bg-transparent ps-3 shadow-none dark:bg-transparent",
                isAllDay && "col-span-2 col-start-1 ps-8",
              )}
              value={startField.state.value}
              onChange={onStartChange}
              disabled={disabled}
            />
            <label htmlFor="end.date" className="sr-only">
              End date
            </label>
            <MemoizedDateInput
              id="end.date"
              className={cn(
                "col-span-1 col-start-4 h-8 border-none bg-transparent ps-3 shadow-none dark:bg-transparent",
                isAllDay && "col-span-2 col-start-3 ps-8",
              )}
              value={endField.state.value}
              start={startField.state.value}
              onChange={onEndChange}
              disabled={disabled}
            />
            {/* {isAllDay ? (
              <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
                <div className="col-start-1 ps-1.5">
                  <ClockIcon className="size-4 text-muted-foreground peer-hover:text-foreground" />
                </div>
                <div className="col-start-3 ps-1.5">
                  <ArrowRightIcon className="size-4 text-muted-foreground hover:text-foreground" />
                </div>
              </div>
            ) : null} */}
          </div>
        </div>
        {isSameTimezone ? (
          <>
            <label htmlFor="timezone" className="sr-only">
              Select a timezone
            </label>
            <MemoizedTimezoneSelect
              id="timezone"
              className="w-full"
              value={startField.state.value.timeZoneId}
              onChange={onTimezoneChange}
              disabled={disabled}
            />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="start-timezone" className="sr-only">
                Start timezone
              </label>
              <MemoizedTimezoneSelect
                id="start-timezone"
                className="w-full"
                value={startField.state.value.timeZoneId}
                onChange={onStartTimezoneChange}
                disabled={disabled}
              />
            </div>
            <div>
              <label htmlFor="end-timezone" className="sr-only">
                End timezone
              </label>
              <MemoizedTimezoneSelect
                id="end-timezone"
                className="w-full"
                value={endField.state.value.timeZoneId}
                onChange={onEndTimezoneChange}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </section>
    );
  },
});
