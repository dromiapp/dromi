import api from "~/lib/api";

export function useUser() {
  const { data, isError, isLoading } = api.useQuery("get", "/auth/me", {}, {
    staleTime: 60 * 60 * 1000,
  });

  return {
    user: data?.user,
    isLoading,
    isError,
  };
} 