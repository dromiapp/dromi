import type { Session, User } from "better-auth/types";
import { type Context, StatusMap } from "elysia";
import { validateSessionToken } from "~/src/lib/auth";

export const userMiddleware = async (c: Context) => {
	const sessionId = c.cookie.session;

	if (!sessionId || !sessionId.value) {
		// c.set.status = StatusMap.Unauthorized;
		// return {
		//   success: false,
		//   message: "Unauthorized Access: Token is missing",
		// };
		return;
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
