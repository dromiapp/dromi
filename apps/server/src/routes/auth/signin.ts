import { prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import {
	createSession,
	generateSessionToken,
	verifyPassword,
} from "~/src/lib/auth";
import type { ElysiaApp } from "~/src/server.ts";

export default (app: ElysiaApp) =>
	app.post(
		"",
		async (context) => {
			const user_exists = await prisma.user.findFirst({
				where: {
					email: context.body.identifier,
				},
			});

			if (!user_exists) {
				return error(StatusMap["Bad Request"], {
					success: false,
					message: "Bad Request: Invalid credentials",
				});
			}

			const verify_password = await verifyPassword(
				context.body.password,
				user_exists.password,
			);

			if (!verify_password) {
				return error(StatusMap["Bad Request"], {
					success: false,
					message: "Bad Request: Invalid credentials",
				});
			}

			const token = generateSessionToken();

			const session = await createSession(token, user_exists.id);

			context.cookie.session?.set({
				value: token,
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			});

			return {
				success: true,
				message: "Successfully logged in",
			};
		},
		{
			detail: {
				tags: ["auth"],
				summary: "Sign in",
				description: "Sign in to the application",
			},
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.String(),
				}),
				400: t.Object({
					success: t.Boolean(),
					message: t.String(),
				}),
			},
			body: t.Object({
				identifier: t.String({
					minLength: 3,
					maxLength: 255,
				}),
				password: t.String({
					minLength: 8,
					maxLength: 256,
				}),
			}),
		},
	);
