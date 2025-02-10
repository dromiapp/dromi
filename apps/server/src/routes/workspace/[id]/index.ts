import { prisma, Resource, permissionFlag, Typebox } from "@repo/db";
import { Context, StatusMap, error, t } from "elysia";
import { nanoid } from "~/src/lib/auth";
import { userMiddleware } from "~/src/middlewares/auth-middleware";
import type { ElysiaApp } from "~/src/server.ts";
import { generatePassphrase } from "~/src/lib/passphrase";
import { checkWorkspacePermission } from "~/src/lib/permissions";

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

				const { id } = context.params;

				const workspace = await prisma.workspace.findFirst({
					where: {
						OR: [{ id: id }, { slug: id }],
					},
					select: {
						id: true,
						displayName: true,
						slug: true,
						createdAt: true,
						updatedAt: true,
						deletedAt: true,
						_count: {
							select: {
								members: true,
							},
						},
						members: {
							where: {
								userId: context.user.id,
							},
							select: {
								id: true,
								isOwner: true,
								createdAt: true,
								updatedAt: true,
								user: {
									omit: {
										password: true,
									},
								},
							},
						},
						todoLists: {
							select: {
								id: true,
								displayName: true,
								slug: true,
								createdAt: true,
								updatedAt: true,
								deletedAt: true,
							},
						},
					},
				});

				if (!workspace) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Workspace not found",
					});
				}

				const { hasPermission } = await checkWorkspacePermission({
					userId: context.user.id,
					workspaceId: workspace.id,
					required: [
						{
							flag: permissionFlag.VIEW,
							resource: Resource.WORKSPACE,
						},
					],
				});

				if (!hasPermission) {
					return error(StatusMap.Forbidden, {
						success: false,
						message: "You do not have permission to view this workspace",
					});
				}

				const { hasPermission: hasEditPermission } =
					await checkWorkspacePermission({
						userId: context.user.id,
						workspaceId: workspace.id,
						required: [
							{ flag: permissionFlag.EDIT, resource: Resource.WORKSPACE },
						],
					});

				const response = {
					success: true,
					workspace: workspace,
				};

				if (hasEditPermission) {
					const workspaceMembers = await prisma.workspaceMember.findMany({
						where: {
							workspaceId: workspace.id,
						},
						select: {
							id: true,
							isOwner: true,
							createdAt: true,
							updatedAt: true,
							user: {
								omit: {
									password: true,
								},
							},
						},
					});

					response.workspace.members = workspaceMembers;
				}

				return response;
			},
			{
				params: t.Object({
					id: t.String(),
				}),
				detail: {
					tags: ["workspace/[id]"],
					summary: "Get workspace",
					description: "Get a workspace by id",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						workspace: t.Intersect([
							Typebox.WorkspacePlain,
							t.Object({
								_count: t.Object({
									members: t.Number(),
								}),
								todoLists: t.Array(
									t.Omit(Typebox.TodoListPlain, ["workspaceId"]),
								),
							}),
						]),
					}),
					401: t.Object({
						success: t.Boolean(),
						message: t.String(),
						user: t.Optional(
							t.Nullable(t.Omit(Typebox.UserPlain, ["password"])),
						),
						session: t.Optional(t.Nullable(Typebox.SessionPlain)),
					}),
					403: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
					404: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
				},
			},
		)
		.delete(
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

				const { id } = context.params;

				const { hasPermission, flags } = await checkWorkspacePermission({
					workspaceId: id,
					userId: context.user.id,
					required: [
						{ resource: Resource.WORKSPACE, flag: permissionFlag.DELETE },
					],
					requireOwner: true,
				});

				if (!hasPermission) {
					return error(StatusMap.Forbidden, {
						success: false,
						message: "You don't have permission to perform this action",
					});
				}

				await prisma.workspace.delete({
					where: { id },
				});

				return {
					success: true,
					message: "Workspace deleted successfully",
				};
			},
			{
				detail: {
					summary: "Delete workspace",
					description: "Delete workspace by ID (owner only)",
					tags: ["workspace/[id]"],
				},
				params: t.Object({
					id: t.String(),
				}),
				response: {
					200: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
					401: t.Object({
						success: t.Boolean(),
						message: t.String(),
						user: t.Optional(
							t.Nullable(t.Omit(Typebox.UserPlain, ["password"])),
						),
						session: t.Optional(t.Nullable(Typebox.SessionPlain)),
					}),
					403: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
				},
			},
		);
