import { prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import {
	createSession,
	generateSessionToken,
	hashPassword,
	nanoid,
} from "~/src/lib/auth";
import type { ElysiaApp } from "~/src/server.ts";

export default (app: ElysiaApp) =>
	app.post(
		"",
		async (context) => {
			const user_exists = await prisma.user.findFirst({
				where: {
					email: context.body.email,
				},
			});

			if (user_exists) {
				return error(StatusMap.Conflict, {
					success: false,
					message: "Conflict: Email already in use",
				});
			}

			const hashed_password = await hashPassword(context.body.password);

			const new_user = await prisma.user.create({
				data: {
					id: nanoid(),
					email: context.body.email,
					password: hashed_password,
					displayName: context.body.displayName,
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
				displayName: t.String({
					minLength: 1,
					maxLength: 16,
				}),
				password: t.String({
					minLength: 8,
					maxLength: 256,
				}),
			}),
		},
	);
