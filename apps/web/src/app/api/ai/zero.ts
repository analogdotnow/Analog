import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { experimental_createMCPClient as createMCPClient } from "ai";

interface ZeroOptions {
  accessToken: string;
}

const url = new URL("https://api.0.email/sse");

export async function zero(options: ZeroOptions) {
  const transport = new SSEClientTransport(url, {});

  try {
    const response = await transport.start();
  } catch (e) {
    console.error(JSON.stringify(e, null, 2));
  }
  // const mcpClient = await createMCPClient({
  //   transport:
  // });
  //
  // await mcpClient.init();
  //
  // console.log(mcpClient.tools());
}
