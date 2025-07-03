import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { newId } from "../lib/id";

export const resource = pgTable("resource", {
  id: text().primaryKey().$default(() => newId("resource")),
  providerId: text({ enum: ["google"] }).notNull(),


  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});