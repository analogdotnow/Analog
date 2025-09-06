import { auth, type Session } from "@repo/auth/server";
import { db } from "@repo/db";

export async function getMcpSession(headers: Headers): Promise<Session | null> {
  const oAuthSession = await auth.api.getMcpSession({
    headers,
  });

  if (!oAuthSession) {
    return null;
  }

  const result = await db.query.session.findFirst({
    where: (table, { eq }) => eq(table.userId, oAuthSession.userId),
    with: {
      user: true,
    },
  });

  if (!result) {
    return null;
  }

  const { user, ...session } = result;

  return { session, user };
}
