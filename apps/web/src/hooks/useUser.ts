import api from "~/lib/api";

export function useUser() {
  const { data, isError, isLoading } = api.useQuery("get", "/auth/me");

  return {
    user: data?.user,
    isLoading,
    isError,
  };
} 