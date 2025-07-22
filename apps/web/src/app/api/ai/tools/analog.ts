import { generateText, tool } from "ai";
import { parseDate } from "chrono-node";
import { Temporal } from "temporal-polyfill";
import { z } from "zod";

import { toDate } from "@repo/temporal";

import { openRouter } from "../provider";

interface CreateParseZonedDateTimeToolOptions {
  context: {
    timeZone: string;
    now: Temporal.ZonedDateTime;
  };
}

function createParseZonedDateTimeTool({
  context,
}: CreateParseZonedDateTimeToolOptions) {
  return tool({
    description: `Parse a date and time string into a Temporal.ZonedDateTime object.`,
    inputSchema: z.object({
      text: z
        .string()
        .describe(
          "The time and date to be parsed, use ISO 8601 format '2025-07-21T15:30:39', or use natural language (chrono-node), e.g. today, 'tomorrow at 10:00'",
        ),
      timeZone: z
        .string()
        .default(context.timeZone)
        .describe(
          "Use a custom IANA timezone to parse the date and time in: Europe/London",
        ),
    }),
    execute: async ({ text, timeZone }) => {
      const today = toDate({ value: context.now, timeZone: context.timeZone });
      const result = parseDate(text, today);

      if (!result) {
        return "Failed to parse date and time.";
      }

      const dateTime = Temporal.ZonedDateTime.from({
        year: result.getFullYear(),
        month: result.getMonth() + 1,
        day: result.getDate(),
        hour: result.getHours(),
        minute: result.getMinutes(),
        second: result.getSeconds(),
        millisecond: result.getMilliseconds(),
        timeZone,
      });

      console.log(dateTime.toString());
      return dateTime;
    },
  });
}

function createParsePlainDateTool({
  context,
}: CreateParseZonedDateTimeToolOptions) {
  return tool({
    description: `Parse a date string into a Temporal.PlainDate object (date only, no time).`,
    inputSchema: z.object({
      text: z
        .string()
        .describe(
          "The date to be parsed, use ISO 8601 format '2025-07-21', or use natural language (chrono-node), e.g. today, tomorrow, 'next monday'",
        ),
      timeZone: z
        .string()
        .default(context.timeZone)
        .describe(
          "Use a custom IANA timezone to parse the date in: Europe/London",
        ),
    }),
    execute: async ({ text, timeZone }) => {
      const today = toDate({ value: context.now, timeZone: context.timeZone });
      const result = parseDate(text, today);

      if (!result) {
        return "Failed to parse date.";
      }

      const plainDate = Temporal.PlainDate.from({
        year: result.getFullYear(),
        month: result.getMonth() + 1,
        day: result.getDate(),
      });

      console.log(plainDate.toString());
      return plainDate;
    },
  });
}

function createParseDurationTool() {
  return tool({
    description: `Create a Temporal.Duration object from individual time components.`,
    inputSchema: z.object({
      years: z.number().optional().describe("Number of years"),
      months: z.number().optional().describe("Number of months"),
      weeks: z.number().optional().describe("Number of weeks"),
      days: z.number().optional().describe("Number of days"),
      hours: z.number().optional().describe("Number of hours"),
      minutes: z.number().optional().describe("Number of minutes"),
      seconds: z.number().optional().describe("Number of seconds"),
    }),
    execute: async (durationParts) => {
      try {
        const duration = Temporal.Duration.from(durationParts);

        return duration;
      } catch (error) {
        return "Failed to create duration from provided components.";
      }
    },
  });
}

const createTools = () => {
  const metadata: string[] = [];

  const tools = [
    tool({
      description: "Create a new calendar event",
      inputSchema: z.object({
        text: z.string(),
        start: z.string(),
        end: z.string(),
      }),
      execute: async ({ text, start, end }) => {
        const result = await generateText({
          model: openRouter("mistralai/mistral-small-3.2-24b-instruct:free"),
          system: "You are a helpful assistant.",
          prompt: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: `Create a new calendar event with the following details: ${text}`,
            },
          ],
        });

        return text;
      },
    }),
  ];

  return tools;
};
