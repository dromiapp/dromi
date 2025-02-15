import { Resource, Typebox, permissionFlag, prisma } from "@repo/db";
import { StatusMap, error, t } from "elysia";
import { generateId } from "~/src/lib/db";
import { checkWorkspacePermission } from "~/src/lib/permissions";
import type { ElysiaApp } from "~/src/server";

export default (app: ElysiaApp) =>
  app.post(
    "",
    async (context) => {
      if (!context.user || !context.session) {
        return error(StatusMap.Unauthorized, {
          success: false,
          message: "Unauthorized Access",
          user: context.user,
          session: context.session,
        });
      }

      const { id: workspaceId, todoId, itemId } = context.params;
      const { labelValueId } = context.body;

      const todoItem = await prisma.todoItem.findFirst({
        where: { id: itemId },
        include: { list: true },
      });

      if (!todoItem || todoItem.list.workspaceId !== workspaceId) {
        return error(StatusMap["Not Found"], {
          success: false,
          message: "Todo item not found",
        });
      }

      const { hasPermission } = await checkWorkspacePermission({
        userId: context.user.id,
        workspaceId,
        required: [
          {
            flag: permissionFlag.EDIT,
            resource: Resource.TODO,
            resourceId: todoId,
          },
        ],
      });

      if (!hasPermission) {
        return error(StatusMap.Forbidden, {
          success: false,
          message: "You don't have permission to edit this todo",
        });
      }

      const labelValue = await prisma.todoItemLabelValue.create({
        data: {
          id: generateId(),
          todoId: itemId,
          labelValueId,
        },
        include: {
          labelValue: {
            include: {
              label: true,
            },
          },
        },
      });

      return {
        success: true,
        labelValue,
      };
    },
    {
      params: t.Object({
        id: t.String(),
        todoId: t.String(),
        itemId: t.String(),
      }),
      body: t.Object({
        labelValueId: t.String(),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          labelValue: Typebox.TodoItemLabelValuePlain,
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
      detail: {
        tags: ["todo/[todoId]/items/[itemId]/labels"],
        summary: "Add a label to a todo item",
        description: "Add a label to a todo item",
      },
    },
  );