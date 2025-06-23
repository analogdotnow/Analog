import { CalendarEvent } from "@/components/event-calendar/types";
import { FormValues } from "./form";

export function saveEvent(input: FormValues): CalendarEvent {
  const data = {
    ...input,
    ...(input.isAllDay
      ? {
          start: input.start.toPlainDate(),
          end: input.end.toPlainDate(),
        }
      : {
          start: input.start,
          end: input.end,
        }),
    color: undefined,
    id: "",
    metadata: undefined,
  };

  return data;
}
