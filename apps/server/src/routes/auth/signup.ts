import { Algorithm, hash } from "@node-rs/argon2";
import { prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import {
	createSession,
	generateSessionToken,
	hashPassword,
	nanoid,
} from "~/src/lib/auth";
import { userMiddleware } from "~/src/middlewares/auth-middleware";
import type { ElysiaApp } from "~/src/server.ts";

export default (app: ElysiaApp) =>
	app.post(
		"",
		async (context) => {
			const user_exists = await prisma.user.findFirst({
				where: {
					OR: [
						{
							email: context.body.email,
						},
						{
							username: context.body.username,
						},
					],
				},
			});

			if (user_exists) {
				const message =
					user_exists.email === context.body.email
						? "Conflict: Email already in use"
						: "Conflict: Username already in use";

				return error(StatusMap.Conflict, {
					success: false,
					message,
				});
			}

			const hashed_password = await hashPassword(context.body.password);

			const new_user = await prisma.user.create({
				data: {
					id: nanoid(),
					email: context.body.email,
					password: hashed_password,
					username:
						context.body.username ||
						(context.body.email.split("@")[0] as string),
				},
			});

			const token = generateSessionToken();

			const session = await createSession(token, new_user.id);

			context.cookie.session?.set({
				value: token,
			});

			return {
				success: true,
				message: "Successfully created account",
			};
		},
		{
			body: t.Object({
				email: t.String({
					format: "email",
					minLength: 3,
					maxLength: 255,
				}),
				username: t.Optional(
					t.String({
						minLength: 3,
						maxLength: 16,
					}),
				),
				password: t.String({
					minLength: 8,
					maxLength: 256,
				}),
			}),
		},
	);
