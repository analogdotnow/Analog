import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);

const prefixes = {
  calendar: "cal",
  event: "event",
  connection: "conn",
  resource: "res",
  channel: "chan",
} as const;

export function newId(prefix: keyof typeof prefixes): string {
  return [prefixes[prefix], nanoid(16)].join("_");
}
