import { boolean, index, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const calendars = pgTable(
  "calendar",
  {
    id: text("calendar_id").notNull(),
    providerId: text("provider_id", {
      enum: ["google", "microsoft"],
    }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    etag: text("etag"),
    timeZone: text("time_zone"),
    primary: boolean("primary"),
    accountId: text("account_id").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    color: text("color"),
    readOnly: boolean("read_only").default(false).notNull(),
    syncToken: text("sync_token"),
  },
  (table) => [
    primaryKey({
      name: "calendar_pk",
      columns: [table.accountId, table.id],
    }),
    index("calendar_account_idx").on(table.accountId),
    index("calendar_provider_account_idx").on(
      table.providerId,
      table.accountId,
    ),
  ],
);
