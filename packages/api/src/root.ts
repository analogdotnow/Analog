import "server-only";
import { calendarsRouter } from "./routers/calendars";
import { earlyAccessRouter } from "./routers/early-access";
import { eventsRouter } from "./routers/events";
import { userRouter } from "./routers/user";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  calendars: calendarsRouter,
  events: eventsRouter,
  earlyAccess: earlyAccessRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
export const createContext = createTRPCContext;
