import api from "~/lib/api";


export function useWorkspace({
  workspace,
}: {
  workspace: string;
}) {
  const { data, isError, isLoading } = api.useQuery("get", `/workspace/{id}`, {
    params: {
      path: {
        id: workspace,
      }
    },
  }, {
    staleTime: Infinity,
  });

  const workspaceId = data?.workspace.id ?? "";

  const lastWorkspace = localStorage.getItem("lastSelectedWorkspace");
  if (workspaceId !== lastWorkspace) localStorage.setItem("lastSelectedWorkspace", workspaceId);

  return {
    workspace: data?.workspace,
    isLoading,
    isError,
  };
}