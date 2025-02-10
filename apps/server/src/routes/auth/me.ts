import { prisma } from "@repo/db";
import { Typebox } from "@repo/db";
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
			detail: {
				tags: ["auth"],
				summary: "Get the current user",
				description: "Get the current user",
			},
			response: {
				200: t.Object({
					success: t.Boolean(),
					user: t.Omit(Typebox.UserPlain, ["password"]),
					session: Typebox.SessionPlain,
				}),
				401: t.Object({
					success: t.Boolean(),
					message: t.String(),
					user: t.Optional(t.Nullable(t.Omit(Typebox.UserPlain, ["password"]))),
					session: t.Optional(t.Nullable(Typebox.SessionPlain)),
				}),
			},
		},
	);
