import "server-only";
import { auth } from "@repo/auth/server";
import { db } from "@repo/db";

export async function getActiveConnection(headers: Headers) {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw new Error("Session not found");
  }

  const user = await db.query.user.findFirst({
    where: (table, { eq }) => eq(table.id, session.user.id),
  });

  if (user?.defaultConnectionId) {
    const activeConnection = await db.query.connection.findFirst({
      where: (table, { eq, and }) =>
        and(
          eq(table.userId, session.user.id),
          eq(table.id, user.defaultConnectionId as string),
        ),
    });

    if (activeConnection) return activeConnection;
  }

  const firstConnection = await db.query.connection.findFirst({
    where: (table, { eq }) => eq(table.userId, session.user.id),
  });

  if (!firstConnection) {
    throw new Error("No connection found");
  }

  return firstConnection;
}

export async function getAllConnections(headers: Headers) {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw new Error("Session not found");
  }

  const connections = await db.query.connection.findMany({
    where: (table, { eq }) => eq(table.userId, session.user.id),
  });

  return connections.filter(
    (connection) => connection.accessToken && connection.refreshToken,
  );
}
