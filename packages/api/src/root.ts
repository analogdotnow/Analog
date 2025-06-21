import "server-only";
import { accountsRouter } from "./routers/accounts";
import { calendarsRouter } from "./routers/calendars";
import { earlyAccessRouter } from "./routers/early-access";
import { eventsRouter } from "./routers/events";
import { notificationRouter } from "./routers/notification";
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
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
export const createContext = createTRPCContext;
