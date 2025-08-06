import { createMcpHandler } from "@vercel/mcp-adapter";
import { withMcpAuth } from "better-auth/plugins";

import { auth } from "@repo/auth/server";

const handler = withMcpAuth(auth, (req, session) => {
  // session contains the access token record with scopes and user ID
  return createMcpHandler(
    (server) => {
      server.tool("analog-signal", "Send an analog signal", {}, async () => {
        return {
          content: [{ type: "text", text: "Tool analog-signal" }],
        };
      });
    },
    {
      capabilities: {
        tools: {
          "analog-signal": {
            description: "Send an analog signal",
          },
        },
      },
    },
    {
      basePath: "/api",
      verboseLogs: true,
      maxDuration: 60,
    },
  )(req);
});

export { handler as GET, handler as POST, handler as DELETE };
