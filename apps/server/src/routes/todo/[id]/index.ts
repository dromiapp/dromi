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

			const { id } = context.params;

			const todoList = await prisma.todoList.findFirst({
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
			}),
			detail: {
				tags: ["todo/[id]"],
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
	);
