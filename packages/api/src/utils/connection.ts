import "server-only";
import { auth } from "@repo/auth/server";
import { db } from "@repo/db";

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
