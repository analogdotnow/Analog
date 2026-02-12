"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/client";

function DefaultCalendarPickerSkeleton() {
  return (
    <div className="w-fit">
      <Skeleton className="h-10 w-64" />
    </div>
  );
}

export function DefaultCalendarPicker() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery(
    trpc.calendars.list.queryOptions(),
  );
  const mutation = useMutation(
    trpc.calendars.setDefault.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.calendars.pathKey() });
      },
    }),
  );

  const onValueChange = React.useCallback(
    (value: string) => {
      const accountId = data?.accounts.find((account) =>
        account.calendars.some((calendar) => calendar.id === value),
      )?.id;

      if (!accountId) {
        return;
      }

      mutation.mutate({ calendarId: value, accountId });
    },
    [data?.accounts, mutation],
  );

  if (isPending) {
    return <DefaultCalendarPickerSkeleton />;
  }

  if (isError) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        <p>No calendars available.</p>
        <p className="mt-1 text-sm">Add an account to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="default-calendar" className="sr-only">
        Default Calendar
      </Label>
      <Select value={data?.defaultCalendar.id} onValueChange={onValueChange}>
        <SelectTrigger
          id="default-calendar"
          className="w-fit max-w-full min-w-48"
        >
          <SelectValue placeholder="Select default calendar" />
        </SelectTrigger>
        <SelectContent>
          {data?.accounts.map((account) => (
            <SelectGroup key={account.id}>
              <SelectLabel className="py-1.5 text-xs">
                {account.name}
              </SelectLabel>
              {account.calendars.map((calendar) => (
                <DefaultCalendarPickerItem
                  key={`${account.id}-${calendar.id}`}
                  calendarId={calendar.id}
                  name={calendar.name}
                  color={calendar.color}
                  readOnly={calendar.readOnly}
                />
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface DefaultCalendarPickerItemProps {
  calendarId: string;
  name: string;
  color?: string;
  readOnly: boolean;
}

function DefaultCalendarPickerItem({
  calendarId,
  name,
  color,
  readOnly,
}: DefaultCalendarPickerItemProps) {
  const style = React.useMemo(() => {
    return {
      "--calendar-color": color ?? "#3B82F6",
    };
  }, [color]);

  return (
    <SelectItem
      value={calendarId}
      className="py-1.5 text-sm"
      disabled={readOnly}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-[4px] bg-(--calendar-color)"
          style={style}
        />
        {name}
        {readOnly ? (
          <span className="text-xs text-muted-foreground">(read-only)</span>
        ) : null}
      </div>
    </SelectItem>
  );
}
