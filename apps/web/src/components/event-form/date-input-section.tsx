import * as React from "react";
import { useField } from "@tanstack/react-form";
import { ArrowRight, Clock } from "lucide-react";
import { Temporal } from "temporal-polyfill";

import { DateInput } from "@/components/date-input";
import { TimeInput } from "@/components/time-input";
import { TimezoneSelect } from "@/components/timezone-select";
import { cn } from "@/lib/utils";
import { defaultValues, withForm } from "./utils/form";

export const DateInputSection = withForm({
  defaultValues,
  render: function Render({ form }) {
    const startField = useField({ name: "start", form });
    const endField = useField({ name: "end", form });
    const isAllDayField = useField({ name: "isAllDay", form });
    const isSameTimezone =
      startField.state.value.timeZoneId === endField.state.value.timeZoneId;

    const onTimezoneChange = React.useCallback(
      (value: string) => {
        startField.handleChange(startField.state.value.withTimeZone(value));
        startField.handleBlur();
        endField.handleChange(endField.state.value.withTimeZone(value));
        endField.handleBlur();
      },
      [startField, endField],
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

    const isAllDay = isAllDayField.state.value;
    // if (isAllDay) {
    //   return (
    //     <section className="flex flex-col gap-y-2.5">
    //       <div className="relative grid grid-cols-(--grid-event-form) items-center gap-1">
    //         <DateInput
    //           className="col-span-2 col-start-1 h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent"
    //           value={startField.state.value}
    //           onChange={onStartChange}
    //         />
    //         <DateInput
    //           className="col-span-2 col-start-3 h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent"
    //           value={endField.state.value}
    //           minValue={startField.state.value}
    //           onChange={onEndChange}
    //         />
    //         <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
    //           <div className="col-start-1 ps-1.5">
    //             <Clock className="size-4 text-muted-foreground peer-hover:text-foreground" />
    //           </div>
    //           <div className="col-start-3 ps-1.5">
    //             <ArrowRight className="size-4 text-muted-foreground hover:text-foreground" />
    //           </div>
    //         </div>
    //       </div>
    //     </section>
    //   );
    // }

    return (
      <section className="flex flex-col gap-y-2.5">
        <div
          className={cn(
            "relative grid grid-cols-(--grid-event-form) items-center gap-1",
            isAllDay && "hidden",
          )}
        >
          <TimeInput
            className="col-span-2 col-start-1 h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent"
            value={startField.state.value}
            onChange={onStartChange}
          />
          <TimeInput
            className="col-span-2 col-start-3 h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent"
            value={endField.state.value}
            onChange={onEndChange}
          />
          <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
            <div className="col-start-1 ps-1.5">
              <Clock className="size-4 text-muted-foreground peer-hover:text-foreground" />
            </div>
            <div className="col-start-3 ps-1.5">
              <ArrowRight className="size-4 text-muted-foreground hover:text-foreground" />
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-(--grid-event-form) items-center gap-1">
          <DateInput
            className={cn(
              "col-span-1 col-start-2 h-8 border-none bg-transparent ps-3 shadow-none dark:bg-transparent",
              isAllDay && "col-span-2 col-start-1 ps-8",
            )}
            value={startField.state.value}
            onChange={onStartChange}
          />
          <DateInput
            className={cn(
              "col-span-1 col-start-4 h-8 border-none bg-transparent ps-3 shadow-none dark:bg-transparent",
              isAllDay && "col-span-2 col-start-3 ps-8",
            )}
            value={endField.state.value}
            minValue={startField.state.value}
            onChange={onEndChange}
          />
          {isAllDay ? (
            <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
              <div className="col-start-1 ps-1.5">
                <Clock className="size-4 text-muted-foreground peer-hover:text-foreground" />
              </div>
              <div className="col-start-3 ps-1.5">
                <ArrowRight className="size-4 text-muted-foreground hover:text-foreground" />
              </div>
            </div>
          ) : null}
        </div>
        <TimezoneSelect
          className="w-full"
          value={startField.state.value.timeZoneId}
          onChange={onTimezoneChange}
        />
      </section>
    );
  },
});
