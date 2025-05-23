import "server-only";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from "./trpc";
import { userRouter } from "./routers/user";
import { earlyAccessRouter } from "./routers/early-access";

export const appRouter = createTRPCRouter({
  user: userRouter,
  earlyAccess: earlyAccessRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
export const createContext = createTRPCContext;
