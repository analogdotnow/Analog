import "server-only";
import { createCallerFactory, createTRPCContext, createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
	user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
export const createContext = createTRPCContext;
