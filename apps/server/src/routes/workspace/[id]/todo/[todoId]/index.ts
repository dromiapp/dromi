import { Resource, Typebox, permissionFlag, prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import { checkWorkspacePermission } from "~/src/lib/permissions";
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

			const { id: workspaceId, todoId } = context.params;

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

			const todoList = await prisma.todoList.findFirst({
				where: {
					OR: [{ id: todoId }, { slug: todoId }],
					workspaceId: workspace.id,
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
							items: true,
						},
					},
					workspaceId: true,
				},
			});

			if (!todoList) {
				return error(StatusMap["Not Found"], {
					success: false,
					message: "Todo list not found",
				});
			}

			const { hasPermission } = await checkWorkspacePermission({
				userId: context.user.id,
				workspaceId: todoList.workspaceId,
				required: [
					{
						flag: permissionFlag.VIEW,
						resourceId: todoList.id,
						resource: Resource.TODO,
					},
				],
			});

			if (!hasPermission) {
				return error(StatusMap.Forbidden, {
					success: false,
					message: "You do not have permission to view todo list",
				});
			}

			return {
				success: true,
				todoList: todoList,
			};
		},
		{
			params: t.Object({
				id: t.String(),
				todoId: t.String(),
			}),
			detail: {
				tags: ["todo/[todoId]"],
				summary: "Get todo list",
				description: "Get a todo list by id",
			},
			response: {
				200: t.Object({
					success: t.Boolean(),
					todoList: t.Intersect([
						Typebox.TodoListPlain,
						t.Object({
							_count: t.Object({
								items: t.Number(),
							}),
						}),
					]),
				}),
				401: t.Object({
					success: t.Boolean(),
					message: t.String(),
					user: t.Optional(t.Nullable(t.Omit(Typebox.UserPlain, ["password"]))),
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

				const { id: workspaceId, todoId } = context.params;

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

				const todoList = await prisma.todoList.findFirst({
					where: {
						OR: [{ id: todoId }, { slug: todoId }],
						workspaceId: workspace.id,
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
								items: true,
							},
						},
						workspaceId: true,
					},
				});

				if (!todoList) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Todo list not found",
					});
				}

				const { hasPermission } = await checkWorkspacePermission({
					userId: context.user.id,
					workspaceId: todoList.workspaceId,
					required: [
						{
							flag: permissionFlag.DELETE,
							resourceId: todoList.id,
							resource: Resource.TODO,
						},
					],
				});

				if (!hasPermission) {
					return error(StatusMap.Forbidden, {
						success: false,
						message: "You do not have permission to delete todo lists",
					});
				}

				await prisma.todoList.delete({
					where: {
						id: todoList.id,
					},
				});

				return {
					success: true,
					message: "Todo list deleted successfully",
				};
			},
			{
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Delete todo list",
					description: "Delete a todo list by id",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
					401: t.Object({
						success: t.Boolean(),
						message: t.String(),
						user: t.Optional(t.Nullable(t.Omit(Typebox.UserPlain, ["password"]))),
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
		.put(
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

				const { id: workspaceId, todoId } = context.params;
				const { displayName, slug } = context.body;

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

				const todoList = await prisma.todoList.findFirst({
					where: {
						OR: [{ id: todoId }, { slug: todoId }],
						workspaceId: workspace.id,
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
								items: true,
							},
						},
						workspaceId: true,
					},
				});

				if (!todoList) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Todo list not found",
					});
				}

				const { hasPermission } = await checkWorkspacePermission({
					userId: context.user.id,
					workspaceId: todoList.workspaceId,
					required: [
						{
							flag: permissionFlag.EDIT,
							resourceId: todoList.id,
							resource: Resource.TODO,
						},
					],
				});

				if (!hasPermission) {
					return error(StatusMap.Forbidden, {
						success: false,
						message: "You do not have permission to edit todo lists",
					});
				}

				const list = await prisma.todoList.update({
					where: {
						id: todoList.id,
					},
					data: {
						...(displayName && { displayName: displayName }),
						...(slug && { slug: slug }),
					},
				});

				return {
					success: true,
					list: list,
				};
			},
			{
				body: t.Partial(t.Object({
					displayName: t.String(),
					slug: t.String(),
				})),
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Edit todo list",
					description: "Edit a todo list by id",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						list: Typebox.TodoListPlain,
					}),
					401: t.Object({
						success: t.Boolean(),
						message: t.String(),
						user: t.Optional(t.Nullable(t.Omit(Typebox.UserPlain, ["password"]))),
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


