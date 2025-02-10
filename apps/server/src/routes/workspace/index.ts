import { Resource, Typebox, permissionFlag, prisma } from "@repo/db";
import { Context, StatusMap, error, t } from "elysia";
import { nanoid } from "~/src/lib/auth";
import { generatePassphrase } from "~/src/lib/passphrase";
import { checkWorkspacePermission } from "~/src/lib/permissions";
import { userMiddleware } from "~/src/middlewares/auth-middleware";
import type { ElysiaApp } from "~/src/server.ts";

export default (app: ElysiaApp) =>
	app
		.get(
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

				const workspaces = await prisma.workspace.findMany({
					where: {
						members: {
							some: {
								userId: context.user.id,
							},
						},
					},
					select: {
						id: true,
						displayName: true,
						slug: true,
						_count: {
							select: {
								members: true,
							},
						},
						createdAt: true,
						updatedAt: true,
						deletedAt: true,
					},
				});

				return {
					success: true,
					workspaces: workspaces,
				};
			},
			{
				detail: {
					tags: ["workspace"],
					summary: "Get all workspaces",
					description: "Get all workspaces for the current user",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						workspaces: t.Array(
							t.Intersect([
								Typebox.WorkspacePlain,
								t.Object({
									_count: t.Object({
										members: t.Number(),
									}),
								}),
							]),
						),
					}),
					401: t.Object({
						success: t.Boolean(),
						message: t.String(),
						user: t.Optional(
							t.Nullable(t.Omit(Typebox.UserPlain, ["password"])),
						),
						session: t.Optional(t.Nullable(Typebox.SessionPlain)),
					}),
				},
			},
		)
		.post(
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

				const { displayName, slug } = context.body;

				const slugOrPassphrase = slug || generatePassphrase();

				const workspace = await prisma.workspace.create({
					data: {
						id: nanoid(),
						displayName: displayName || "Untitled Workspace",
						slug: slugOrPassphrase,
					},
				});

				const member = await prisma.workspaceMember.create({
					data: {
						id: nanoid(),
						workspaceId: workspace.id,
						userId: context.user.id,
						isOwner: true,
					},
				});

				const allResources = Object.values(Resource);
				const allFlags = Object.values(permissionFlag);

				await prisma.permission.createMany({
					data: allResources.map((resource) => ({
						id: nanoid(),
						resource,
						flags: allFlags.reduce((acc, flag) => acc | Number(flag), 0),
						memberId: member.id,
					})),
				});

				return {
					success: true,
					workspace: workspace,
				};
			},
			{
				detail: {
					summary: "Create a new workspace",
					description: "Create a new workspace with a display name and slug",
					tags: ["workspace"],
				},
				body: t.Object({
					displayName: t.String(),
					slug: t.String(),
				}),
				response: {
					200: t.Object({
						success: t.Boolean(),
						workspace: Typebox.WorkspacePlain,
					}),
					401: t.Object({
						success: t.Boolean(),
						message: t.String(),
						user: t.Optional(
							t.Nullable(t.Omit(Typebox.UserPlain, ["password"])),
						),
						session: t.Optional(t.Nullable(Typebox.SessionPlain)),
					}),
				},
			},
		);
