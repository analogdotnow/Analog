// app/api/chat/tools.ts
import { tool } from "ai";
import { z } from "zod";

export const TodoItemSchema = z.object({
  id: z.string().describe("Unique identifier for the todo item."),
  text: z.string().describe("The text/description of the todo item."),
  done: z
    .boolean()
    .describe("Whether this todo item has been completed (true) or not (false)."),
});

export type TodoItem = z.infer<typeof TodoItemSchema>;

type ToolContext = {
  userId: string;
  todos?: TodoItem[];
};

export const todoToolSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    text: z
      .string()
      .min(1)
      .describe("Text for the todo item the user wants to add."),
    done: z
      .boolean()
      .default(false)
      .describe("Whether the item starts as completed."),
  }),
  z.object({
    action: z.literal("update_status"),
    id: z
      .string()
      .describe(
        "ID of the todo item to update.",
      ),
    done: z
      .boolean()
      .describe(
        "If the task is completed or not.",
      ),
  }),
]);

export const todoTool = tool({
  description:
    "Manage a simple task list. Use this to add tasks or update their done status.",
  inputSchema: todoToolSchema,

  async execute(input, { experimental_context }) {
    const ctx = (experimental_context ?? {}) as Partial<ToolContext>;
    const userId = ctx.userId ?? "anonymous";

    switch (input.action) {
      case "add": {
        const item: TodoItem = {
          id: crypto.randomUUID(),
          text: input.text,
          done: input.done,
        };

        // TODO: persist item, e.g.:
        // await db.todo.insert({ id, text: input.text, done: input.done ?? false, userId });

        return {
          type: "add",
          item,
        };
      }

      case "update_status": {
        const { id, done } = input;

        // TODO: load existing item for this user & id
        // const existing = await db.todo.findUnique({ where: { id, userId } });
        // if (!existing) throw new Error("Todo not found");
        //
        // const newDone = done ?? !existing.done;

        // TODO: persist:
        // await db.todo.update({ where: { id, userId }, data: { done: newDone } });

        return {
          type: "update_status",
          id,
          done,
          message: `Updated task ${id} to done=${done}.`,
        };
      }
    }
  },
});
