import { z } from "zod";

import { channel } from "@repo/db/schema";

export type ChannelHeaders = z.infer<typeof headersSchema>;
export type Channel = typeof channel.$inferSelect;

interface ParseHeadersOptions {
  headers: Headers;
}

const headersSchema = z.object({
  id: z.string(),
  resourceId: z.string(),
  resourceUri: z.string(),
  resourceState: z.string(),
  messageNumber: z.string(),
  expiration: z.string().optional(),
  token: z.string().optional(),
});

export async function parseHeaders({
  headers,
}: ParseHeadersOptions): Promise<ChannelHeaders | null> {
  const channelHeaders = headersSchema.safeParse({
    id: headers.get("X-Goog-Channel-ID"),
    messageNumber: headers.get("X-Goog-Message-Number"),
    resourceId: headers.get("X-Goog-Resource-ID"),
    resourceState: headers.get("X-Goog-Resource-State"),
    resourceUri: headers.get("X-Goog-Resource-URI"),
    expiration: headers.get("X-Goog-Channel-Expiration"),
    token: headers.get("X-Goog-Channel-Token"),
  });

  if (!channelHeaders.success) {
    return null;
  }

  return channelHeaders.data;
}
