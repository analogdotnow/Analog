"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { Temporal } from "temporal-polyfill";
import * as z from "zod";

import { Recurrence } from "@repo/providers/interfaces";
import { toDate } from "@repo/temporal";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DayOfWeekField } from "./fields/day-of-week-field";
import { EndAfterField } from "./fields/end-after-field";
import { EndIntervalField } from "./fields/end-interval-field";
import { EndUntilField } from "./fields/end-until-field";
import { FrequencyField } from "./fields/frequency-field";

interface RecurrenceDialogProps {
  children: React.ReactNode;
  start: Temporal.ZonedDateTime;
  recurrence?: Recurrence | null;
  onChange: (recurrence: Recurrence) => void;
}

export const formRecurrenceSchema = z.object({
  freq: z.enum([
    "SECONDLY",
    "MINUTELY",
    "HOURLY",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "YEARLY",
  ]),
  interval: z.number().int().min(1).optional(),
  endType: z.enum(["never", "on", "after"]).optional(),
  count: z.number().int().min(1).optional(),
  until: z
    .date()
    .optional()
    .transform((date) => {
      if (!date) {
        return undefined;
      }

      return Temporal.PlainDate.from(date.toISOString().split("T")[0]!);
    }),
  byDay: z.array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"])).optional(),
  byMonth: z.array(z.number().int().min(1).max(12)).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
  byYearDay: z.array(z.number().int().min(1).max(366)).optional(),
  byWeekNo: z.array(z.number().int().min(1).max(53)).optional(),
});

function getDefaultValues(
  recurrence: Recurrence | null | undefined,
  start: Temporal.ZonedDateTime,
) {
  return {
    freq: recurrence?.freq ?? "WEEKLY",
    interval: recurrence?.interval,
    endType: recurrence?.until ? "on" : recurrence?.count ? "after" : "never",
    byDay: recurrence?.byDay,
    until: recurrence?.until
      ? toDate(recurrence.until, { timeZone: "UTC" })
      : toDate(start.add({ years: 1 }), { timeZone: "UTC" }),
    count: recurrence?.count ?? (7 as number | undefined),
    byMonth: recurrence?.byMonth,
    byMonthDay: recurrence?.byMonthDay,
    byYearDay: recurrence?.byYearDay,
    byWeekNo: recurrence?.byWeekNo,
  };
}

export function RecurrenceDialog({
  children,
  start,
  recurrence,
  onChange,
}: RecurrenceDialogProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    defaultValues: getDefaultValues(recurrence, start),
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isDefaultValue) {
        setOpen(false);

        return;
      }

      const { endType, ...data } = formRecurrenceSchema.parse(value);

      onChange({
        ...data,
        // Only include the field that matches the selected end type
        until: endType === "on" ? data.until : undefined,
        count: endType === "after" ? data.count : undefined,
      });
      setOpen(false);
    },
  });

  const min = React.useMemo(() => {
    return toDate(start);
  }, [start]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Repeat</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();

            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-6">
            {/* Frequency Selection */}
            <Label
              htmlFor="interval"
              className="self-center text-sm font-medium"
            >
              Every
            </Label>
            <div className="flex items-center gap-2">
              <form.Field name="interval">
                {(field) => (
                  <EndIntervalField
                    value={field.state.value ?? 1}
                    onValueChange={field.handleChange}
                  />
                )}
              </form.Field>
              <form.Field name="freq">
                {(field) => (
                  <FrequencyField
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  />
                )}
              </form.Field>
            </div>

            {/* Days of Week Selection (only show for weekly) */}
            <form.Subscribe selector={(s) => s.values.freq}>
              {(freq) =>
                freq === "WEEKLY" ? (
                  <>
                    <Label className="self-center text-sm font-medium">
                      On
                    </Label>
                    <form.Field name="byDay">
                      {(field) => (
                        <DayOfWeekField
                          value={field.state.value ?? []}
                          onValueChange={field.handleChange}
                        />
                      )}
                    </form.Field>
                  </>
                ) : null
              }
            </form.Subscribe>

            {/* End Conditions */}
            <Label className="text-sm font-medium">Ends</Label>
            <form.Field name="endType">
              {(endTypeField) => (
                <RadioGroup
                  value={endTypeField.state.value}
                  onValueChange={(v) => {
                    endTypeField.handleChange(v as "never" | "on" | "after");
                  }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2 pt-0.5">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never" className="font-normal">
                      Never
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="on" id="on" />
                    <Label htmlFor="on" className="font-normal">
                      On
                    </Label>
                    <form.Field name="until">
                      {(field) => (
                        <EndUntilField
                          value={field.state.value}
                          // @ts-expect-error - TODO: fix this
                          onValueChange={field.handleChange}
                          min={min}
                          disabled={endTypeField.state.value !== "on"}
                        />
                      )}
                    </form.Field>
                  </div>

                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="after" id="after" />
                    <Label htmlFor="after" className="font-normal">
                      After
                    </Label>
                    <form.Field name="count">
                      {(field) => (
                        <EndAfterField
                          value={field.state.value ?? 1}
                          onValueChange={field.handleChange}
                          disabled={endTypeField.state.value !== "after"}
                        />
                      )}
                    </form.Field>
                    <span className="text-sm text-muted-foreground">times</span>
                  </div>
                </RadioGroup>
              )}
            </form.Field>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
