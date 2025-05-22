import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const waitlist = pgTable("waitlist", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  joinedAt: timestamp({
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});
