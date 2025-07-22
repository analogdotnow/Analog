import { experimental_createMCPClient as createMCPClient } from "ai";
import { schemas } from "./schemas";
import z from "zod";

type MCPClient = Awaited<ReturnType<typeof createMCPClient>>;

interface CreateZeroMCPClientOptions {
  accessToken: string;
}

export async function createZeroMCPClient({
  accessToken,
}: CreateZeroMCPClientOptions) {
  const client: MCPClient = await createMCPClient({
    transport: {
      type: "sse",
      url: "https://api.0.email/sse",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const toolds = await client.tools({
    schemas: {
      'get-data': {
        inputSchema: z.object({
          query: z.string().describe('The data query'),
          format: z.enum(['json', 'text']).optional(),
        }),
        outputSchema: z.object({
          data: z.string(),
        })
      },
      // For tools with zero arguments, you should use an empty object:
      'tool-with-no-args': {
        inputSchema: z.object({}),
      },
    },
  });
  await client.init();

  const tools = await client.tools({
    schemas,
  });

  // Explicitly type, because the type is not portable
  return {
    client: client as MCPClient,
    tools,
  }
}