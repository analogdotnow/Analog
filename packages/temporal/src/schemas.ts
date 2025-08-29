import { Temporal } from "temporal-polyfill";
import { z } from "zod";

// For compatibility with OpenAPI / MCP / tRPC with TanStack Query
export const zTemporalZonedDateTime = z.preprocess(
  (value) => {
    if (value instanceof Temporal.ZonedDateTime) {
      return value;
    }

    if (typeof value === "string") {
      try {
        return Temporal.ZonedDateTime.from(value);
      } catch {
        return value;
      }
    }

    return value;
  },
  z.instanceof(Temporal.ZonedDateTime).meta({
    description:
      "date-time-ext (RFC 9557) (example: 2020-08-05T20:06:13+05:00[Asia/Almaty])",
    type: "string",
    format: "date-time-ext",
    examples: ["2020-08-05T20:06:13+05:00[Asia/Almaty]"],
  }),
);
