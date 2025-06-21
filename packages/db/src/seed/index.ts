import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@repo/env/server";

import * as schema from "../schema";
import { notificationSeed, notificationSourceSeed } from "./notification.seed";

const conn = postgres(env.DATABASE_URL, { prepare: false });
export const seedDb = drizzle(conn, { schema, casing: "snake_case" });

export async function main() {
  console.time("Seeding notification sources");
  const notificationSources = await notificationSourceSeed();
  console.log("Notification sources seeded:", notificationSources.length);
  console.time("Seeding notifications");

  const notifications = await notificationSeed(
    "XzSlZwvdC1B73wCBhXLaRQ8hNRMEb5KG",
    notificationSources.map((source) => source.id),
    20,
  );
  console.log("Notifications seeded:", notifications?.length);
  console.timeEnd("Seeding notifications");
}

if (require.main === module) {
  main()
    .then(() => {
      console.log("Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error during seeding:", error);
      process.exit(1);
    });
}
