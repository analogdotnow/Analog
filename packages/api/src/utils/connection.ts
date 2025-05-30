import "server-only";
import type { Session } from "@repo/auth/server";
import { db } from "@repo/db";

export async function getActiveConnection(user: Session["user"]) {
  if (user?.defaultConnectionId) {
    const activeConnection = await db.query.connection.findFirst({
      where: (table, { eq, and }) =>
        and(
          eq(table.userId, user.id),
          eq(table.id, user.defaultConnectionId as string),
        ),
    });

    if (activeConnection) return activeConnection;
  }

  const firstConnection = await db.query.connection.findFirst({
    where: (table, { eq }) => eq(table.userId, user.id),
  });

  if (!firstConnection) {
    throw new Error("No connection found");
  }

  return firstConnection;
}

export async function getAllConnections(user: Session["user"]) {
  const connections = await db.query.connection.findMany({
    where: (table, { eq }) => eq(table.userId, user.id),
  });

  return connections.filter(
    (connection) => connection.accessToken && connection.refreshToken,
  );
}
