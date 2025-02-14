import { Resource, Typebox, permissionFlag, prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import { generateId } from "~/src/lib/db";
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

				const items = await prisma.todoItem.findMany({
					where: {
						listId: todoList.id,
					},
					select: {
						assigneeId: true,
						createdAt: true,
						createdById: true,
						deletedAt: true,
						description: true,
						dueDate: true,
						id: true,
						title: true,
						updatedAt: true,
						listId: true,
						priority: true,
						labelValues: {
							select: {
								labelValue: {
									select: {
										id: true,
										name: true,
										color: true,
										description: true,
										position: true,
										labelId: true,
										label: {
											select: {
												id: true,
												name: true,
												type: true
											}
										}
									}
								}
							}
						}
					},
				});

				return {
					success: true,
					items: items,
				};
			},
			{
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Get todo items",
					description: "Get all todo items in a todo list",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						items: t.Array(
							t.Intersect([
								Typebox.TodoItemPlain,
								t.Object({
									labelValues: t.Array(
										t.Object({
											labelValue: Typebox.TodoLabelValuePlain
										})
									)
								})
							])
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
							flag: permissionFlag.CREATE,
							resourceId: todoList.id,
							resource: Resource.TODO,
						},
					],
				});

				if (!hasPermission) {
					return error(StatusMap.Forbidden, {
						success: false,
						message: "You do not have permission to create todo items",
					});
				}

				const { title, description, dueDate, assigneeId, labelValues } =
					context.body;

				if (labelValues?.length) {
					const validLabelValues = await prisma.todoLabelValue.findMany({
						where: {
							id: {
								in: labelValues
							},
							label: {
								listId: todoList.id
							}
						},
						select: {
							id: true
						}
					});

					if (validLabelValues.length !== labelValues.length) {
						return error(StatusMap["Bad Request"], {
							success: false,
							message: "One or more label values are invalid or do not belong to this todo list"
						});
					}
				}

				const item = await prisma.todoItem.create({
					data: {
						id: generateId(),
						list: {
							connect: {
								id: todoList.id,
							},
						},
						creator: {
							connect: { id: context.user.id },
						},
						title,
						description,
						...(assigneeId ? { assignee: { connect: { id: assigneeId } } } : {}),
						...(dueDate ? { dueDate } : {}),
						...(labelValues ? {
							labelValues: {
								create: labelValues.map(labelValueId => ({
									id: generateId(),
									labelValue: {
										connect: { id: labelValueId }
									}
								}))
							}
						} : {}),
					},
					include: {
						labelValues: {
							include: {
								labelValue: {
									include: {
										label: true
									}
								}
							}
						}
					}
				});

				if (!item) {
					return error(StatusMap["Internal Server Error"], {
						success: false,
						message: "Failed to create todo item",
					});
				}

				return {
					success: true,
					item: item,
				};
			},
			{
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
				}),
				body: t.Object({
					title: t.String(),
					description: t.Optional(t.String()),
					dueDate: t.Optional(t.String()),
					assigneeId: t.Optional(t.String()),
					labelValues: t.Optional(t.Array(t.String())),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Create todo item",
					description: "Create an item in a todo list",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						item: Typebox.TodoItemPlain,
					}),
					400: t.Object({
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
			"/:itemId",
			async (context) => {
				if (!context.user || !context.session) {
					return error(StatusMap.Unauthorized, {
						success: false,
						message: "Unauthorized Access: User or Session is missing",
						user: context.user,
						session: context.session,
					});
				}

				const { id: workspaceId, todoId, itemId } = context.params;

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

				const item = await prisma.todoItem.findFirst({
					where: {
						id: itemId,
					},
				});

				if (!item) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Todo item not found",
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
						message: "You do not have permission to edit todo items",
					});
				}

				const { title, description, dueDate, assigneeId, labelValues } =
					context.body;

				if (labelValues?.length) {
					const validLabelValues = await prisma.todoLabelValue.findMany({
						where: {
							id: {
								in: labelValues
							},
							label: {
								listId: todoList.id
							}
						},
						select: {
							id: true
						}
					});

					if (validLabelValues.length !== labelValues.length) {
						return error(StatusMap["Bad Request"], {
							success: false,
							message: "One or more label values are invalid or do not belong to this todo list"
						});
					}
				}

				const updatedItem = await prisma.todoItem.update({
					where: {
						id: itemId,
						listId: todoList.id,
					},
					data: {
						...(title ? { title } : {}),
						...(description ? { description } : {}),
						...(dueDate ? { dueDate } : {}),
						...(assigneeId ? { assignee: { connect: { id: assigneeId } } } : {}),
						...(labelValues ? {
							labelValues: {
								deleteMany: {},
								create: labelValues.map(labelValueId => ({
									id: generateId(),
									labelValue: {
										connect: { id: labelValueId }
									}
								}))
							}
						} : {}),
					},
					include: {
						labelValues: {
							include: {
								labelValue: {
									include: {
										label: true
									}
								}
							}
						}
					}
				});

				if (!updatedItem) {
					return error(StatusMap["Internal Server Error"], {
						success: false,
						message: "Failed to update todo item",
					});
				}

				return {
					success: true,
					item: item,
				};
			},
			{
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
					itemId: t.String(),
				}),
				body: t.Object({
					title: t.String(),
					description: t.Optional(t.String()),
					dueDate: t.Optional(t.String()),
					assigneeId: t.Optional(t.String()),
					labelValues: t.Optional(t.Array(t.String())),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Edit todo item",
					description: "Edit an item in a todo list",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						item: Typebox.TodoItemPlain,
					}),
					400: t.Object({
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
			"/:itemId",
			async (context) => {
				if (!context.user || !context.session) {
					return error(StatusMap.Unauthorized, {
						success: false,
						message: "Unauthorized Access: User or Session is missing",
						user: context.user,
						session: context.session,
					});
				}

				const { id: workspaceId, todoId, itemId } = context.params;

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

				const item = await prisma.todoItem.findFirst({
					where: {
						id: itemId,
					},
				});

				if (!item) {
					return error(StatusMap["Not Found"], {
						success: false,
						message: "Todo item not found",
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
						message: "You do not have permission to edit todo items",
					});
				}

				const deletedItem = await prisma.todoItem.delete({
					where: {
						id: itemId,
						listId: todoList.id,
					},
				});

				if (!deletedItem) {
					return error(StatusMap["Internal Server Error"], {
						success: false,
						message: "Failed to delete todo item",
					});
				}

				return {
					success: true,
					message: "Todo item deleted successfully",
				};
			},
			{
				params: t.Object({
					id: t.String(),
					todoId: t.String(),
					itemId: t.String(),
				}),
				detail: {
					tags: ["todo/[todoId]"],
					summary: "Delete todo item",
					description: "Delete an item in a todo list",
				},
				response: {
					200: t.Object({
						success: t.Boolean(),
						item: t.String(),
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
					500: t.Object({
						success: t.Boolean(),
						message: t.String(),
					}),
				},
			},
		)

