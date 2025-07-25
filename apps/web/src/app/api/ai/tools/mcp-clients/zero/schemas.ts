import { z } from "zod";

export const schemas = {
  getConnections: {
    inputSchema: z.object({}),
  },
  getActiveConnection: {
    inputSchema: z.object({}),
  },
  setActiveConnection: {
    inputSchema: z.object({
      email: z.string(),
    }),
  },
  listThreads: {
    inputSchema: z.object({
      folder: z.string().default("INBOX"),
      query: z.string().optional(),
      maxResults: z.number().optional().default(5),
      labelIds: z.array(z.string()).optional(),
      pageToken: z.string().optional(),
    }),
  },
  getThread: {
    inputSchema: z.object({
      threadId: z.string(),
    }),
  },
  markThreadsRead: {
    inputSchema: z.object({
      threadIds: z.array(z.string()),
    }),
  },
  markThreadsUnread: {
    inputSchema: z.object({
      threadIds: z.array(z.string()),
    }),
  },
  modifyLabels: {
    inputSchema: z.object({
      threadIds: z.array(z.string()),
      addLabelIds: z.array(z.string()),
      removeLabelIds: z.array(z.string()),
    }),
  },
  getCurrentDate: {
    inputSchema: z.object({}),
  },
  getUserLabels: {
    inputSchema: z.object({}),
  },
  getLabel: {
    inputSchema: z.object({
      id: z.string(),
    }),
  },
  createLabel: {
    inputSchema: z.object({
      name: z.string(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
    }),
  },
};
