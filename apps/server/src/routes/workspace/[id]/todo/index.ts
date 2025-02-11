import { Resource, Typebox, permissionFlag, prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import { generateId } from "~/src/lib/db";
import { generatePassphrase } from "~/src/lib/passphrase";
import { checkWorkspacePermission } from "~/src/lib/permissions";
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

				const { id: workspaceId } = context.params;

				const workspace = await prisma.workspace.findFirst({
					where: {
						OR: [{ id: workspaceId }, { slug: workspaceId }],
					},
				});

				if (!workspace) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Workspace not found",
					});
				}

				// Check workspace-level TODO permission first
				const { hasPermission, flags } = await checkWorkspacePermission({
					userId: context.user.id,
					workspaceId: workspace.id,
					required: [
						{
							flag: permissionFlag.VIEW,
							resource: Resource.TODO,
						},
					],
				});

				if (!hasPermission) {
					return error(StatusMap.Forbidden, {
						success: false,
						message:
							"You do not have permission to view todo lists in this workspace",
					});
				}

				// Check if the user has a workspace-wide TODO permission (resourceId === null)
				const hasWorkspacePermission = flags.some(
					(p) =>
						p.resource === Resource.TODO &&
						p.resourceId === null &&
						(p.flags & Number(permissionFlag.VIEW)) !== 0,
				);

				let todoLists: {
					id: string;
					displayName: string;
					slug: string;
					deletedAt: Date | null;
					updatedAt: Date;
					createdAt: Date;
					_count: { items: number };
					workspaceId: string;
				}[] = [];
				if (hasWorkspacePermission) {
					// User can access all todo lists in the workspace
					todoLists = await prisma.todoList.findMany({
						where: { workspaceId },
						select: {
							id: true,
							displayName: true,
							slug: true,
							createdAt: true,
							updatedAt: true,
							deletedAt: true,
							_count: { select: { items: true } },
							workspaceId: true,
						},
					});
				} else {
					// Get specific todo list IDs from the user's permissions
					const permittedListIds =
						(flags
							.filter(
								(p) =>
									p.resource === Resource.TODO &&
									p.resourceId !== null &&
									(p.flags & Number(permissionFlag.VIEW)) !== 0,
							)
							.map((p) => p.resourceId) as string[]) || [];

					todoLists = await prisma.todoList.findMany({
						where: {
							workspaceId,
							id: { in: permittedListIds },
						},
						select: {
							id: true,
							displayName: true,
							slug: true,
							createdAt: true,
							updatedAt: true,
							deletedAt: true,
							_count: { select: { items: true } },
							workspaceId: true,
						},
					});
				}

				return {
					success: true,
					todoLists,
				};
			},
			{
				params: t.Object({
					id: t.String(),
				}),
				detail: {
					tags: ["workspace/[id]"],
					summary: "Get all todo lists",
					description: "Get all todo lists in a workspace",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						todoLists: t.Nullable(
							t.Array(
								t.Intersect([
									Typebox.TodoListPlain,
									t.Object({
										_count: t.Object({
											items: t.Number(),
										}),
									}),
								]),
							),
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

				const { id: workspaceId } = context.params;

				const workspace = await prisma.workspace.findFirst({
					where: {
						OR: [{ id: workspaceId }, { slug: workspaceId }],
					},
				});

				if (!workspace) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Workspace not found",
					});
				}

				const { displayName, slug } = context.body;

				const { hasPermission, flags } = await checkWorkspacePermission({
					userId: context.user.id,
					workspaceId: workspace.id,
					required: [{ flag: permissionFlag.CREATE, resource: Resource.TODO }],
				});

				if (!hasPermission) {
					return error(StatusMap.Forbidden, {
						success: false,
						message:
							"You do not have permission to create todo lists in this workspace",
					});
				}

				const slugOrPassphrase = slug || generatePassphrase();

				const todoList = await prisma.todoList.create({
					data: {
						id: generateId(),
						displayName: displayName || "Untitled List",
						slug: slugOrPassphrase,
						workspaceId,
					},
				});

				return {
					success: true,
					todoList,
				};
			},
			{
				params: t.Object({
					id: t.String(),
				}),
				body: t.Object({
					displayName: t.String(),
					slug: t.Optional(t.String()),
				}),
				detail: {
					tags: ["workspace/[id]"],
					summary: "Create a todo list",
					description: "Create a todo list in a workspace",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						todoList: t.Any(),
					}),
					401: t.Object({
						success: t.Boolean(),
						message: t.String(),
						user: t.Nullable(t.Any()),
						session: t.Nullable(t.Any()),
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
		);
