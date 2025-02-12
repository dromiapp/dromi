"use client"

import { Loader2 } from "lucide-react";
import { useUser } from "~/hooks/use-user";

export default function WelcomePage() {
  const { user, isLoading, isError } = useUser();

  if (isLoading) return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    </>
  )

  return (
    <>
      hello, {user?.displayName}!
    </>
  )
}