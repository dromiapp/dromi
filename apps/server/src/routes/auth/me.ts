import { prisma } from "@repo/db";
import { Context, StatusMap, error, t } from "elysia";
import { userMiddleware } from "~/src/middlewares/auth-middleware";
import type { ElysiaApp } from "~/src/server.ts";

export default (app: ElysiaApp) =>
	app.get(
		"",
		async (context) => {
			if (!context.user || !context.session) {
				return error(StatusMap.Unauthorized, {
					success: false,
					message: "Unauthorized Access: User or Session is missing",
					user: context.user,
					session: context.session,
				});
			}

			return {
				success: true,
				user: context.user,
				session: context.session,
			};
		},
		{
			beforeHandle: userMiddleware,
		},
	);
