import type { JSONContent } from "@tiptap/react";

export interface Mention {
  type: "mention";
  attrs: {
    id: "mention-date" | "mention-time" | "mention-duration";
    label: string;
  };
}

export interface ParsedEventContent {
  title: string | null;
  mentions: Mention[];
}

export function parseEventContent(json: JSONContent): ParsedEventContent {
  const paragraph = json?.content?.find((node) => node.type === "paragraph");

  if (!paragraph?.content) {
    return { title: null, mentions: [] };
  }

  const content = paragraph.content.map((node) => node.text).join("");
  const sanitizedContent = content.replace(/\s+$/, "");

  const mentions = paragraph.content.filter(
    (node) => node.type === "mention",
  ) as Mention[];

  return {
    title: sanitizedContent,
    mentions,
  };
}
