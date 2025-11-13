import { SQL, SQLWrapper, sql } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";

export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return "tsvector";
  },
});

// PostgreSQL 17.5 languages
type Language =
  | "arabic"
  | "armenian"
  | "basque"
  | "catalan"
  | "danish"
  | "dutch"
  | "english"
  | "finnish"
  | "french"
  | "german"
  | "greek"
  | "hindi"
  | "hungarian"
  | "indonesian"
  | "irish"
  | "italian"
  | "lithuanian"
  | "nepali"
  | "norwegian"
  | "portuguese"
  | "romanian"
  | "russian"
  | "serbian"
  | "simple"
  | "spanish"
  | "swedish"
  | "tamil"
  | "turkish"
  | "yiddish";

export function toTsvector(
  text: SQLWrapper | string,
  language?: Language,
): SQL<string> {
  const normalizedText = text instanceof SQL ? text : sql`${text}`;

  if (language) {
    return sql`to_tsvector(${sql`${language}`},${normalizedText})`;
  }

  return sql`to_tsvector(${normalizedText})`;
}

export function toTsquery(
  vector: SQLWrapper | string,
  language?: Language,
): SQL<string> {
  const normalizedVector = typeof vector === "string" ? sql`${vector}` : vector;

  if (language) {
    return sql`to_tsquery(${sql`${language}`}::regconfig,${normalizedVector})`;
  }
  return sql`to_tsquery(${normalizedVector})`;
}
