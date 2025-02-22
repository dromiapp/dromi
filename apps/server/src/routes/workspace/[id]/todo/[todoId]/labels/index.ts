import { LabelType, Resource, Typebox, permissionFlag, prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import { generateId } from "~/src/lib/db";
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
					message: "You do not have permission to view todo lists",
				});
			}

			const labels = await prisma.todoLabel.findMany({
				where: {
					listId: todoList.id,
				},
				select: {
					id: true,
					listId: true,
					description: true,
					name: true,
					type: true,
					values: true,
				},
			});

			return {
				success: true,
				labels: labels,
			};
		},
		{
			params: t.Object({
				id: t.String(),
				todoId: t.String()
			}),
			detail: {
				tags: ["todo/[todoId]"],
				summary: "Get todo labels",
				description: "Get all labels in a todo list",
			},
			response: {
				200: t.Object({
					success: t.Boolean(),
					labels: t.Array(t.Intersect([
						Typebox.TodoLabelPlain,
						t.Omit(Typebox.TodoLabelRelations, ["list"])
					])),
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

				const { name, description, type = LabelType.SELECT, values } = context.body;

				// Validate values are provided for SELECT types
				if ((type === LabelType.SELECT || type === LabelType.MULTI_SELECT) && (!values || values.length === 0)) {
					return error(StatusMap["Bad Request"], {
						success: false,
						message: "SELECT type labels must have at least one value",
					});
				}

				const label = await prisma.todoLabel.create({
					data: {
						id: generateId(),
						name,
						description,
						type,
						list: {
							connect: { id: todoList.id },
						},
						...(values && {
							values: {
								create: values.map((value, index) => ({
									id: generateId(),
									name: value.name,
									color: value.color,
									description: value.description,
									position: index,
								})),
							},
						}),
					},
					include: {
						values: true,
					},
				});

				if (!label) {
					return error(StatusMap["Internal Server Error"], {
						success: false,
						message: "Failed to create todo label",
					});
				}

				return {
					success: true,
					label: label,
				};
			},
			{
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
				}),
				body: t.Object({
					name: t.String(),
					description: t.Optional(t.String()),
					type: t.Optional(Typebox.LabelType),
					values: t.Optional(t.Array(t.Object({
						name: t.String(),
						color: t.String(),
						description: t.Optional(t.String()),
					}))),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Create todo label",
					description: "Create a label in a todo list",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						label: Typebox.TodoLabelPlain,
					}),
					400: t.Object({
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
					500: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
				},
			},
		)
		.put(
			"/:labelId",
			async (context) => {
				if (!context.user || !context.session) {
					return error(StatusMap.Unauthorized, {
						success: false,
						message: "Unauthorized Access: User or Session is missing",
						user: context.user,
						session: context.session,
					});
				}

				const { id: workspaceId, todoId, labelId } = context.params;

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
						workspaceId: true,
					},
				});

				if (!todoList) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Todo list not found",
					});
				}

				const label = await prisma.todoLabel.findFirst({
					where: {
						id: labelId,
						listId: todoList.id,
					},
				});

				if (!label) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Todo label not found",
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

				const { name, description } = context.body;

				const updatedLabel = await prisma.todoLabel.update({
					where: { id: labelId },
					data: { name, description },
				});

				if (!updatedLabel) {
					return error(StatusMap["Internal Server Error"], {
						success: false,
						message: "Failed to update todo label",
					});
				}

				return {
					success: true,
					label: updatedLabel,
				};
			},
			{
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
					labelId: t.String(),
				}),
				body: t.Object({
					name: t.String(),
					description: t.Optional(t.String()),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Update todo label",
					description: "Update a label in a todo list",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						label: Typebox.TodoLabelPlain,
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
					500: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
				},
			},
		)
		.delete(
			"/:labelId",
			async (context) => {
				if (!context.user || !context.session) {
					return error(StatusMap.Unauthorized, {
						success: false,
						message: "Unauthorized Access: User or Session is missing",
						user: context.user,
						session: context.session,
					});
				}

				const { id: workspaceId, todoId, labelId } = context.params;

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
						workspaceId: true,
					},
				});

				if (!todoList) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Todo list not found",
					});
				}

				const label = await prisma.todoLabel.findFirst({
					where: {
						id: labelId,
						listId: todoList.id,
					},
				});

				if (!label) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Todo label not found",
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

				const deletedLabel = await prisma.todoLabel.delete({
					where: { id: labelId },
				});

				if (!deletedLabel) {
					return error(StatusMap["Internal Server Error"], {
						success: false,
						message: "Failed to delete todo label",
					});
				}

				return {
					success: true,
					message: "Todo label deleted successfully",
				};
			},
			{
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
					labelId: t.String(),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Delete todo label",
					description: "Delete a label in a todo list",
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
					500: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
				},
			},
		)