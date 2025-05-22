import "server-only";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from "./trpc";
import { userRouter } from "./routers/user";
import { waitlistRouter } from "./routers/waitlist";

export const appRouter = createTRPCRouter({
  user: userRouter,
  waitlist: waitlistRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
export const createContext = createTRPCContext;
