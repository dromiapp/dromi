"use client"

import { useUser } from "~/hooks/use-user";

export default function Workspace() {
  const { user, isLoading: isLoadingUser } = useUser();
  return (
    <>
      <h1 className="text-2xl font-semibold">
        Welcome back, {user?.displayName}.
      </h1>
    </>
  )
}