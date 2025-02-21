import { useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "~/lib/api";
import { toast } from "sonner";

export const useBoardItemMutations = (workspace: string) => {
  const queryClient = useQueryClient();

  const updateItem = (item: any, description: string) => {
    return fetchClient.PUT("/workspace/{id}/todo/{todoId}/items/{itemId}", {
      params: {
        path: {
          id: workspace,
          todoId: item.listId,
          itemId: item.id,
        },
      },
      body: { description },
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["get", "/workspace/{id}/todo/{todoId}/items"] });
      toast("Item updated successfully");
    });
  };

  const deleteItem = (item: any) => {
    return fetchClient.DELETE("/workspace/{id}/todo/{todoId}/items/{itemId}", {
      params: {
        path: {
          id: workspace,
          todoId: item.listId,
          itemId: item.id,
        },
      },
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["get", "/workspace/{id}/todo/{todoId}/items"] });
      toast("Item deleted successfully");
    });
  };

  return { updateItem, deleteItem };
};
