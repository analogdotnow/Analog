import { withMcpAuth } from "better-auth/plugins";
import { trpcToMcpHandler } from "trpc-to-mcp/adapters/vercel-mcp-adapter";

import { appRouter, createContext } from "@repo/api";
import { auth, type McpSession, type Session } from "@repo/auth/server";
import { db } from "@repo/db";

async function getSession(mcpSession: McpSession): Promise<Session | null> {
  if (!mcpSession) {
    return null;
  }

  const data = await db.query.session.findFirst({
    where: (table, { eq }) => eq(table.userId, mcpSession.userId),
    with: {
      user: true,
    },
  });

  if (!data) {
    return null;
  }

  const { user, ...session } = data;

  return { session, user };
}

const handler = withMcpAuth(auth, async (request, mcpSession) => {
  const session = await getSession(mcpSession);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ctx = await createContext({
    headers: request.headers,
    _session: session,
  });

  const handler = trpcToMcpHandler(appRouter, ctx, {
    config: {
      basePath: "/api",
      verboseLogs: process.env.NODE_ENV === "production" ? false : true,
      maxDuration: 60,
      disableSse: true,
    },
  });

  return await handler(request);
});

export { handler as DELETE, handler as GET, handler as POST };
