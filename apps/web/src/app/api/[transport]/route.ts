import { Redis } from "@upstash/redis";
import { withMcpAuth } from "better-auth/plugins";
import { trpcToMcpHandler } from "trpc-to-mcp/adapters/vercel-mcp-adapter";

import { appRouter } from "@repo/api";
import { auth, type McpSession, type Session } from "@repo/auth/server";
import { db } from "@repo/db";
import { env } from "@repo/env/server";

async function getSession(mcpSession: McpSession): Promise<Session | null> {
  if (!mcpSession) {
    return null;
  }

  const kv = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  const activeSession = (
    await kv.get<{ token: string; expiresAt: number }[]>(
      `active-sessions-${mcpSession.userId}`,
    )
  )?.sort((a, b) => b.expiresAt - a.expiresAt);

  const sessionToken = activeSession?.[0]?.token;
  const session = sessionToken
    ? await kv.get<{ session: Session["session"]; user: Session["user"] }>(
        sessionToken,
      )
    : null;

  return session;
}

const handler = withMcpAuth(auth, async (request, mcpSession) => {
  const session = await getSession(mcpSession);

  const handler = trpcToMcpHandler(
    appRouter,
    {
      db,
      headers: request.headers,
      session: session?.session,
      user: session?.user,
    },
    {
      config: {
        basePath: "/api",
        verboseLogs: true,
        maxDuration: 60,
        disableSse: true,
      },
    },
  );

  return await handler(request);
});

export { handler as DELETE, handler as GET, handler as POST };
