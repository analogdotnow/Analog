import { Temporal } from "temporal-polyfill";
import { z } from "zod";

// It took me, Sanzhar, an hour to figure out. It's 4am.
// Important lesson I've learned:
// You have to use .meta() on the z.instanceof() inside the z.preprocess()

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
