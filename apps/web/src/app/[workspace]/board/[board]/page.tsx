"use client"

import { Loader2, Settings } from "lucide-react";
import { useParams } from "next/navigation";
import api, { fetchClient } from "~/lib/api";
import { Button } from "@repo/ui/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import BoardGroup from "~/components/ui/boards/group";
import { useMemo } from "react";

interface BoardProps {
  params: Promise<{ workspace: string, board: string }>
}

export default function Board({
  params
}: BoardProps) {
  const { workspace, board: boardName } = useParams();
  const queryClient = useQueryClient();

  const boardParams = {
    params: {
      path: {
        id: workspace as string,
        todoId: boardName as string,
      }
    }
  }

  const { data: board, isError, isLoading } = api.useQuery("get", "/workspace/{id}/todo/{todoId}", boardParams, {
    staleTime: 60 * 60 * 1000,
    select: (data) => data.todoList
  });

  const { data: boardItems, isError: isErrorItems, isLoading: isLoadingItems } = api.useQuery("get", "/workspace/{id}/todo/{todoId}/items", {
    params: {
      path: {
        id: workspace as string,
        todoId: boardName as string
      }
    }
  }, {
    staleTime: 60 * 60 * 1000,
    select: (data) => data.items
  });

  const { data: boardLabels, isError: isErrorLabels, isLoading: isLoadingLabels } = api.useQuery("get", "/workspace/{id}/todo/{todoId}/labels", {
    params: {
      path: {
        id: workspace as string,
        todoId: boardName as string
      }
    }
  }, {
    staleTime: 60 * 60 * 1000,
    select: (data) => data.labels
  });

  // TODO: add group by setting
  const groupBy = useMemo(() => {
    if (!board) return null;
    return boardLabels?.find((label) => label.id);
  }, [boardLabels]);

  if (isLoading) return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    </>
  )

  // TODO: more graceful error handling
  if (!board) return <>Board not found</>;

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl font-semibold focus-visible:ring-offset-0 focus-visible:ring-0">
            {board?.displayName}
          </h1>
          <Button size="icon" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {boardItems && (
          <div className="flex-auto flex gap-4 items-center h-full">
            <BoardGroup
              title="Uncategorized"
              items={boardItems?.filter((item) => item.labelValues.length === 0) as any[]}
              group={{
                id: "",
                title: "Uncategorized",
                description: "Uncategorized",
              }}
              boardParams={boardParams}
            />
            {groupBy?.values?.map((value) => {
              return (
                <BoardGroup
                  key={value.id}
                  group={value}
                  title={value.name}
                  description={value.description ?? ""}
                  items={boardItems?.filter((item) => item.labelValues.find((labelValue) => labelValue.id === value.id)) as any[]}
                  boardParams={boardParams}
                />
              )
            })}
            {/* <Button variant="ghost" size="icon">
              <PlusIcon className="h-4 w-4 text-muted-foreground" />
            </Button> */}
          </div>
        )}
      </div>
    </>
  )
}