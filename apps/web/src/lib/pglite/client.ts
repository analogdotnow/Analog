"use client";

import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";

import * as schema from "../drizzle/schema";
import { runMigrations } from "./migrations";

type Schema = typeof schema;

type ClientContext = {
  client: PGlite;
  db: PgliteDatabase<Schema>;
  ready: Promise<void>;
};

declare global {
  var __ANALOG_PGLITE_CONTEXT__: ClientContext | undefined;
}

const DATA_DIR = "idb://analog-local2";

function createContext(): ClientContext {
  const client = new PGlite(DATA_DIR);
  const db = drizzle(client, { schema });
  const ready = (async () => {
    await client.waitReady;
    await runMigrations(client);
  })();

  return { client, db, ready };
}

function getContext(): ClientContext {
  if (typeof window === "undefined") {
    throw new Error("PGlite is only available in the browser.");
  }

  if (!globalThis.__ANALOG_PGLITE_CONTEXT__) {
    globalThis.__ANALOG_PGLITE_CONTEXT__ = createContext();
  }

  return globalThis.__ANALOG_PGLITE_CONTEXT__!;
}

export function getPgliteClient(): PGlite {
  return getContext().client;
}

export function getDrizzleDb(): PgliteDatabase<Schema> {
  return getContext().db;
}

export function ensurePgliteReady(): Promise<void> {
  return getContext().ready;
}
