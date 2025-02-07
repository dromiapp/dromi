import type { Session, User } from "better-auth/types";
import { validateSessionToken } from "~/src/lib/auth";
import { StatusMap, type Context } from "elysia";

export const userMiddleware = async (c: Context) => {
  const sessionId = c.cookie.session;

  if (!sessionId || !sessionId.value) {
    c.set.status = StatusMap.Unauthorized;
    return {
      success: "error",
      message: "Unauthorized Access: Token is missing",
    };
  }

  const { session, user } = await validateSessionToken(sessionId.value);

  return {
    user,
    session,
  };
};

export const userInfo = (user: User | null, session: Session | null) => {
  return {
    user: user,
    session: session,
  };
};
