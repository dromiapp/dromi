import api from "~/lib/api";

export function useWorkspaces({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const { data, isError, isLoading } = api.useQuery("get", `/workspace`, undefined, {
    staleTime: Infinity,
    enabled,
  });

  return {
    workspaces: data?.workspaces,
    isLoading,
    isError,
  };
}