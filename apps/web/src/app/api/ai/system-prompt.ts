import { FormatOptions, format, tzDate } from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";

type FormatTemporalOptions = Omit<FormatOptions, "date"> & {
  value: Temporal.ZonedDateTime;
};

function formatTemporal({ value, ...options }: FormatTemporalOptions) {
  const date = tzDate(
    new Date(
      value.year,
      value.month - 1,
      value.day,
      value.hour,
      value.minute,
      value.second,
      value.millisecond,
    ),
    value.timeZoneId,
  );
  return format({
    ...options,
    date,
  });
}

interface GenerateSystemPromptOptions {
  timeZone: string;
}

function generateSystemPrompt({ timeZone }: GenerateSystemPromptOptions) {
  const now = Temporal.Now.zonedDateTimeISO(timeZone);

  const tokens = {
    "<current-datetime>": now,
    "<current-date>": now.toPlainDate(),
    "<current-timezone>": now.timeZoneId,
    "<current-offset>": now.offset,
  };

  const SYSTEM_PROMPT = `
You are a calendar assistant that can perform actions on behalf of the user.

Today is: ${now.toPlainDate().toString()} (${formatTemporal({ value: now, format: "dddd, MMMM D, YYYY", locale: "en-US" })})
The current time is: ${now.toPlainTime().toString()} (${formatTemporal({ value: now, format: "HH:mm", locale: "en-US" })})
The timezone is: ${now.timeZoneId} with offset ${now.offset}

You can use the following tokens in tool calls:

<current-datetime> - The current date and time in the user's timezone.
<current-date> - The current date in the user's timezone.
<current-timezone> - The user's timezone.

The user's input: <user-input>
`;

  console.log(SYSTEM_PROMPT);

  return {
    SYSTEM_PROMPT,
    tokens,
  };
}
