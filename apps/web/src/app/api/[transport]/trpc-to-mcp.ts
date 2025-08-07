// Credits to https://github.com/Jacse/trpc-mcp for the helpful code

import type {
  // AnyProcedure,
  AnyRootTypes,
  Router,
  RouterRecord,
} from "@trpc/server/unstable-core-do-not-import";
import { z } from "zod";

type Tool = {
  name: string;
  description: string;
  pathInRouter: string[];
  inputSchema?: z.core.JSONSchema.JSONSchema;
};

type McpMeta = {
  openapi?: {
    description?: string;
  };
  mcp?: {
    enabled?: boolean;
    description?: string;
  };
};

export function mergeInputs(inputs: z.ZodObject[]) {
  return inputs.reduce((acc, input) => {
    return acc.extend(input);
  }, z.object());
}

export function extractToolsFromProcedures<
  TRoot extends AnyRootTypes,
  TRecord extends RouterRecord,
>(appRouter: Router<TRoot, TRecord>, currentPath: string[] = []) {
  const tools: Tool[] = [];
  const procedures = Object.entries(appRouter._def.procedures);

  for (const [name, procedure] of procedures) {
    if (procedure._def && "inputs" in procedure._def) {
      const inputs = procedure._def.inputs as z.ZodObject[];
      const schema = inputs.length > 1 ? mergeInputs(inputs) : inputs[0];

      const meta = procedure._def.meta as McpMeta;
      if (!meta || !meta.mcp?.enabled) {
        continue;
      }

      const pathInRouter = [...currentPath, ...name.split(".")];
      const tool: Tool = {
        name: name.replace(/\./g, "_"),
        description: meta.mcp?.description ?? meta.openapi?.description ?? "",
        pathInRouter,
      };

      if (schema) {
        const jsonSchema = z.toJSONSchema(schema, {
          unrepresentable: "any",
        });

        if (jsonSchema.type === "object") {
          const { type, properties = {}, required = [] } = jsonSchema;
          tool.inputSchema = { type, properties, required };
        } else {
          console.error(
            "[TRPC-TO-MCP] Procedure has no object schema",
            pathInRouter,
          );
        }
      } else {
        const jsonSchema = z.toJSONSchema(z.object());
        tool.inputSchema = jsonSchema;
      }

      tools.push(tool);
    }
  }

  return tools;
}

export function trpcToMcpAdapter<
  TRoot extends AnyRootTypes,
  TRecord extends RouterRecord,
>(appRouter: Router<TRoot, TRecord>) {
  const tools = extractToolsFromProcedures(appRouter);
  return tools;
}
