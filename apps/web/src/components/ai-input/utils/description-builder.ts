import type { Mention } from "./content-parser";

export function createEventDescription(
  title: string,
  mentions: Mention[],
): string {
  const date = mentions.find((mention) => mention.attrs.id === "mention-date");
  const time = mentions.find((mention) => mention.attrs.id === "mention-time");
  // skip duration for now
  const duration = mentions.find(
    (mention) => mention.attrs.id === "mention-duration",
  );

  const prefix = date?.attrs.label === "tomorrow" ? "" : "on ";
  const description = `${title} at ${time?.attrs.label} ${prefix}${date?.attrs.label}`;

  if (description.length < 20) {
    return `${title} at ${time?.attrs.label} ${prefix}${date?.attrs.label.split(" ")[0]}`;
  }

  return description;
}
