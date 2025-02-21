import api from "~/lib/api";

export function useBoards({
  workspace,
}: {
  workspace: string;
}) {
  const { data, isError, isLoading } = api.useQuery("get", "/workspace/{id}/todo", {
    params: {
      path: {
        id: workspace,
      }
    }
  }, {
    staleTime: 60 * 60 * 1000,
  });

  return {
    boards: data?.todoLists,
    isLoading,
    isError,
  };
} 