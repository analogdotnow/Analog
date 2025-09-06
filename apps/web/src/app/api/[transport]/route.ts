import { trpcToMcpHandler } from "trpc-to-mcp/adapters/vercel-mcp-adapter";

import { appRouter, createContext } from "@repo/api";
import { getMcpSession } from "@repo/auth/server/mcp";

const handler = async (req: Request) => {
  const session = await getMcpSession(req.headers);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ctx = await createContext({
    headers: req.headers,
    session,
  });

  const mcpHandler = trpcToMcpHandler(appRouter, ctx, {
    config: {
      basePath: "/api",
      verboseLogs: process.env.NODE_ENV !== "production",
      maxDuration: 60,
      disableSse: true,
    },
  });

  return await mcpHandler(req);
};

export { handler as DELETE, handler as GET, handler as POST };
