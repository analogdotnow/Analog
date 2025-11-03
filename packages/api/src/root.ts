import "server-only";

import { accountsRouter } from "./routers/accounts";
import { apiKeysRouter } from "./routers/api-keys";
import { calendarsRouter } from "./routers/calendars";
import { conferencingRouter } from "./routers/conferencing";
import { eventsRouter } from "./routers/events";
import { freeBusyRouter } from "./routers/free-busy";
import { integrationsRouter } from "./routers/integrations";
import { mapsRouter } from "./routers/maps";
import { placesRouter } from "./routers/places";
import { pushNotificationsRouter } from "./routers/push-notifications";
import { tasksRouter } from "./routers/tasks";
import { userRouter } from "./routers/user";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from "./trpc";

export const appRouter = createTRPCRouter({
  integrations: integrationsRouter,
  user: userRouter,
  accounts: accountsRouter,
  apiKeys: apiKeysRouter,
  calendars: calendarsRouter,
  tasks: tasksRouter,
  events: eventsRouter,
  freeBusy: freeBusyRouter,
  conferencing: conferencingRouter,
  places: placesRouter,
  maps: mapsRouter,
  pushNotifications: pushNotificationsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
export const createContext = createTRPCContext;
