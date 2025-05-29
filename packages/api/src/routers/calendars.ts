import { connectionToProvider } from "../providers";
import {
  activeProviderProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

export const calendarsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const connections = await ctx.db.query.connection.findMany({
      where: (table, { eq }) => eq(table.userId, ctx.user.id),
    });

    const activeConnections = connections.filter(
      (connection) => connection.accessToken && connection.refreshToken,
    );

    const accounts = await Promise.all(
      activeConnections.map(async (connection) => {
        try {
          const calendarClient = connectionToProvider(connection);
          const calendars = await calendarClient.calendars();

          return {
            id: connection.id,
            provider: connection.providerId,
            name: connection.email,
            calendars,
          };
        } catch {
          return {
            id: connection.id,
            provider: connection.providerId,
            name: connection.email,
            calendars: [],
          };
        }
      }),
    );

    console.log({ accounts });

    return {
      accounts,
    };
  }),
});
