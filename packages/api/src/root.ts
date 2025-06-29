import "server-only";
import { accountsRouter } from "./routers/accounts";
import { calendarsRouter } from "./routers/calendars";
import { earlyAccessRouter } from "./routers/early-access";
import { eventsRouter } from "./routers/events";
import { pushRouter } from "./routers/push";
import { remindersRouter } from "./routers/reminders";
import { userRouter } from "./routers/user";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  accounts: accountsRouter,
  calendars: calendarsRouter,
  events: eventsRouter,
  earlyAccess: earlyAccessRouter,
  push: pushRouter,
  reminders: remindersRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
export const createContext = createTRPCContext;
