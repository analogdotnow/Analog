import { openai } from "@ai-sdk/openai";
import { Arcade } from "@arcadeai/arcadejs";
import {
  createZodTool,
  executeOrAuthorizeZodTool,
  toZod,
  toZodToolSet,
} from "@arcadeai/arcadejs/lib";
import { generateText } from "ai";

const arcade = new Arcade();

const googleToolkit = await arcade.tools.list({ toolkit: "gmail", limit: 30 });
const googleTools = toZodToolSet({
  tools: googleToolkit.items,
  client: arcade,
  userId: "<YOUR_USER_ID>", // Your app's internal ID for the user (an email, UUID, etc). It's used internally to identify your user in Arcade
  executeFactory: executeOrAuthorizeZodTool, // Checks if tool is authorized and executes it, or returns authorization URL if needed
});

const tools = toZod({
  tools: googleToolkit.items,
  client: arcade,
  userId: "<YOUR_USER_ID>",
});

const listEmails = await arcade.tools.get("Gmail_ListEmails");

const listEmailsTool = createZodTool({
  tool: listEmails,
  client: arcade,
  userId: "<YOUR_USER_ID>",
});

const emails = await listEmailsTool.execute({
  limit: 10,
});

emails.output?.value;
