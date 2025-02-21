import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@repo/ui/components/ui/card";
import BoardItem from "~/components/boards/item/board-item";
import { useState } from "react";
import { cn } from "@repo/ui/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import api, { fetchClient } from "~/lib/api";
import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";

interface GroupProps {
  group: any,
  items: any[],
  title: string,
  description?: string,
  boardParams: {
    params: {
      path: {
        id: string,
        todoId: string,
      }
    }
  }
}

export default function BoardGroup({
  group,
  items,
  title,
  description,
  boardParams,
}: GroupProps) {
  const queryClient = useQueryClient();
  const [active, setActive] = useState(false);

  const { mutate: moveItem } = api.useMutation("put", "/workspace/{id}/todo/{todoId}/items/{itemId}", {
    // it'd probably be a good idea to optimistically update UI here
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["get", "/workspace/{id}/todo/{todoId}/items", boardParams],
      });
    },
  });

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, item: any) => {
    event.dataTransfer?.setData("text/plain", JSON.stringify({ itemId: item.id, fromGroup: group.id }));
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setActive(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setActive(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setActive(false);

    const data = event.dataTransfer?.getData("text/plain");
    if (!data) return;

    const { itemId, fromGroup } = JSON.parse(data);


    if (itemId && fromGroup !== group.id) {
      moveItem({
        params: {
          path: {
            id: boardParams.params.path.id,
            todoId: boardParams.params.path.todoId,
            itemId: itemId,
          },
        },
        body: {
          labelValues: group.id ? [group.id] : [],
        }
      });
    }
  };

  const newItem = (groupId?: string) => {
    fetchClient.POST("/workspace/{id}/todo/{todoId}/items", {
      params: {
        path: {
          id: boardParams.params.path.id,
          todoId: boardParams.params.path.todoId,
        }
      },
      body: {
        title: "New Item",
        description: "",
        dueDate: "",
        assigneeId: "",
        labelValues: groupId ? [groupId] : [],
      }
    }).then((res) => {
      queryClient.invalidateQueries({
        queryKey: ["get", "/workspace/{id}/todo/{todoId}/items"],
      }).then(() => setActive(false))
    })
  }

  return (
    <>
      <div
        className="h-full min-w-[325px]"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {items && (
          <Card className="min-h-full flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                {items.map((item) => (
                  <BoardItem key={item.id} item={item} onDragStart={onDragStart} />
                ))}
              </div>
              <div>
                <Button variant="ghost" className="w-full justify-start" onClick={() => newItem(group.id)}>
                  <Plus className="h-4 w-4" />
                  Add item
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}