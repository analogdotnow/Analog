// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { streamText, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { todoTool, type TodoItem } from "./tasks";
import { auth } from "@repo/auth/server";

// Stub – replace with your DB/Drizzle logic
async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  // Example shape; include completed + incomplete
  // return await db.todo.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return [
    { id: "1", text: "Buy milk", done: false },
    { id: "2", text: "Finish report", done: true },
  ];
}

function formatTodoItem(item: TodoItem): string {
  return `${item.id}. [${item.done ? "x" : " "}] ${item.text}`;
}

function formatTodoList(todos: TodoItem[]) {
  if (!todos || todos.length === 0) {
    return "No tasks in the list.";
  }

  const lines: string[] = [];

  for (const item of todos) {
    lines.push(formatTodoItem(item));
  }

  return lines.join("\n\n");
}

function isTaskListCompleted(todos: TodoItem[]) {
  return todos.every((todo) => todo.done);
}

interface RequestBody {
  messages: ModelMessage[];
}

export async function POST(req: NextRequest) {
  const body = await req.json() as RequestBody;

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const todos = await getTodosForUser(session.user.id);

  const result = await streamText({
    model: openai("gpt-4.1"),
    messages: body.messages,
    tools: {
      todo: todoTool,
    },
    prepareStep: async ({ messages }) => {
      const systemMessage: ModelMessage = {
        role: "system",
        content:
          `You are managing a todo list for the user.\n\n` +
          `Here is the current todo list, including completed items, as JSON:\n\n` +
          formatTodoList(todos) +
          `\n\nWhen the user asks to add or complete items, always call the "todo" tool,` +
          ` never ask them to update the list manually.`,
      };

      return {
        messages: [systemMessage, ...messages],
        experimental_context: {
          userId: session.user.id,
          todos,
        },
      };
    },
  });

  return result.toUIMessageStreamResponse();
}
