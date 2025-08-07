import { NextResponse } from "next/server";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AnyProcedure } from "@trpc/server";
import { Redis } from "@upstash/redis";
import { createMcpHandler } from "@vercel/mcp-adapter";
import { withMcpAuth } from "better-auth/plugins";

import { appRouter, createCaller } from "@repo/api";
import { auth, type McpSession, type Session } from "@repo/auth/server";
import { db } from "@repo/db";
import { env } from "@repo/env/server";

import { trpcToMcpAdapter } from "./trpc-to-mcp";

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

const handler = withMcpAuth(auth, async (_req, mcpSession) => {
  const tools = trpcToMcpAdapter(appRouter);
  const session = await getSession(mcpSession);

  if (!session) {
    return NextResponse.json(
      { error: "Create a session within app" },
      { status: 401 },
    );
  }

  const trpcCaller = createCaller({
    headers: _req.headers,
    db,
    session: session.session,
    user: session.user,
  });

  return createMcpHandler(
    (server) => {
      server.server.setRequestHandler(ListToolsRequestSchema, () => ({
        tools,
      }));

      server.server.setRequestHandler(
        CallToolRequestSchema,
        async (request) => {
          const { name, arguments: args } = request.params;

          const tool = tools.find((t) => t.name === name);

          if (!tool) {
            return { content: [{ type: "text", text: "Could not find tool" }] };
          }

          // @ts-expect-error path in router
          const procedure: AnyProcedure = tool.pathInRouter.reduce(
            // @ts-expect-error path in router
            (acc, part) => acc?.[part],
            trpcCaller,
          );

          // @ts-expect-error path in router
          return await procedure(args);
        },
      );
    },
    {
      // Leave empty so it'll be handled with custom requ
      capabilities: {
        tools: {},
      },
    },
    {
      basePath: "/api",
      verboseLogs: true,
      maxDuration: 60,
    },
  )(_req);
});

export { handler as GET, handler as POST, handler as DELETE };
