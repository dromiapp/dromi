import { LabelType, Resource, Typebox, permissionFlag, prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import { generateId } from "~/src/lib/db";
import { checkWorkspacePermission } from "~/src/lib/permissions";
import type { ElysiaApp } from "~/src/server.ts";

export default (app: ElysiaApp) =>
	app.put(
    "/values",
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
        include: {
          values: true,
        },
      });

      if (!label) {
        return error(StatusMap["Not Found"], {
          success: false,
          message: "Todo label not found",
        });
      }

      if (label.type !== "SELECT" && label.type !== "MULTI_SELECT") {
        return error(StatusMap["Bad Request"], {
          success: false,
          message: "Can only add values to SELECT or MULTI_SELECT labels",
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

      const { values } = context.body;

      // Delete existing values
      await prisma.todoLabelValue.deleteMany({
        where: { labelId },
      });

      // Create new values
      const updatedLabel = await prisma.todoLabel.update({
        where: { id: labelId },
        data: {
          values: {
            create: values.map((value, index) => ({
              id: generateId(),
              name: value.name,
              color: value.color,
              description: value.description,
              position: index,
            })),
          },
        },
        include: {
          values: true,
        },
      });

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
        values: t.Array(t.Object({
          name: t.String(),
          color: t.String(),
          description: t.Optional(t.String()),
        })),
      }),
      detail: {
        tags: ["todo/[todoId]/labels"],
        summary: "Update todo label values",
        description: "Update the values for a SELECT or MULTI_SELECT label",
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
