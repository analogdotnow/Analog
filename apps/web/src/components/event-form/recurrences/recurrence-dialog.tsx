"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { Temporal } from "temporal-polyfill";
import * as z from "zod";

import { Frequency, Recurrence, Weekday } from "@repo/providers/interfaces";
import { toDate } from "@repo/temporal";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const daysOfWeek = [
  { short: "Mon", full: "Monday", value: "mo" },
  { short: "Tue", full: "Tuesday", value: "tu" },
  { short: "Wed", full: "Wednesday", value: "we" },
  { short: "Thu", full: "Thursday", value: "th" },
  { short: "Fri", full: "Friday", value: "fr" },
  { short: "Sat", full: "Saturday", value: "sa" },
  { short: "Sun", full: "Sunday", value: "su" },
];

interface RecurrenceDialogProps {
  children: React.ReactNode;
  start: Temporal.ZonedDateTime;
  recurrence?: Recurrence;
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
    .transform((d) => {
      return Temporal.PlainDate.from(d.toISOString().split("T")[0]!);
    })
    .optional(),
  byDay: z.array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"])).optional(),
  byMonth: z.array(z.number().int().min(1).max(12)).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
  byYearDay: z.array(z.number().int().min(1).max(366)).optional(),
  byWeekNo: z.array(z.number().int().min(1).max(53)).optional(),
});

export function RecurrenceDialog({
  children,
  start,
  recurrence,
  onChange,
}: RecurrenceDialogProps) {
  const [open, setOpen] = React.useState(false);

  const defaultValues = React.useMemo(() => {
    return {
      freq: recurrence?.freq ?? "WEEKLY",
      interval: recurrence?.interval,
      endType: recurrence?.until ? "on" : recurrence?.count ? "after" : "never",
      byDay: recurrence?.byDay,
      // Keep Date in the form. We'll transform to Temporal on submit via schema.parse
      until: recurrence?.until
        ? toDate(recurrence.until, { timeZone: "UTC" })
        : (toDate(start.add({ years: 1 }), { timeZone: "UTC" }) as
            | Date
            | undefined),
      count: recurrence?.count ?? (7 as number | undefined),
      byMonth: recurrence?.byMonth,
      byMonthDay: recurrence?.byMonthDay,
      byYearDay: recurrence?.byYearDay,
      byWeekNo: recurrence?.byWeekNo,
    };
  }, [recurrence, start]);

  const form = useForm({
    defaultValues,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isDefaultValue) {
        setOpen(false);
        return;
      }

      // Validate/transform using the schema, then bubble up
      const parsed = formRecurrenceSchema.parse(value);
      // Remove endType and filter fields based on the selected end type
      const { endType, ...baseData } = parsed;

      const recurrenceData = {
        ...baseData,
        // Only include the field that matches the selected end type
        until: endType === "on" ? baseData.until : undefined,
        count: endType === "after" ? baseData.count : undefined,
      };

      onChange(recurrenceData);
      setOpen(false);
    },
  });

  const minUntil = React.useMemo(() => {
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
                  <Input
                    id="interval"
                    value={field.state.value ?? 1}
                    onChange={(e) =>
                      field.handleChange(e.target.valueAsNumber || 1)
                    }
                    className="w-16"
                    type="number"
                    min={1}
                  />
                )}
              </form.Field>
              <form.Field name="freq">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as Frequency)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Day</SelectItem>
                      <SelectItem value="WEEKLY">Week</SelectItem>
                      <SelectItem value="MONTHLY">Month</SelectItem>
                      <SelectItem value="YEARLY">Year</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <ToggleGroup
                          variant="outline"
                          type="multiple"
                          value={field.state.value ?? []}
                          onValueChange={(v) =>
                            field.handleChange(v as Weekday[])
                          }
                          className="w-full"
                        >
                          {daysOfWeek.map((day) => (
                            <ToggleGroupItem
                              key={day.value}
                              value={day.value}
                              aria-label={`Toggle ${day.full}`}
                            >
                              {day.short}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "ml-2 justify-start text-left font-normal",
                                !field.state.value && "text-muted-foreground",
                              )}
                              disabled={endTypeField.state.value !== "on"}
                            >
                              {field.state.value
                                ? format(
                                    field.state.value,
                                    field.state.value.getFullYear() !==
                                      new Date().getFullYear()
                                      ? "EEE MMM dd, yyyy"
                                      : "EEE MMM dd",
                                  )
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.state.value}
                              onSelect={(d) => field.handleChange(d)}
                              modifiers={{
                                min: minUntil,
                              }}
                            />
                          </PopoverContent>
                        </Popover>
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
                        <Input
                          value={field.state.value ?? ""}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.valueAsNumber || 1,
                            )
                          }
                          className="ml-2 w-16"
                          type="number"
                          min={1}
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
