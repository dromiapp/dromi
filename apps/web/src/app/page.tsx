"use client"

import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import api from "~/lib/api"

export default function HomePage() {
  const { data: user, error, isLoading } = api.useQuery(
    "get",
    "/auth/me",

  )

  useEffect(() => {
    if (isLoading) return
    if (error) return redirect("/auth/signup")
    if (!user) return redirect("/auth/signup")
    // TODO: Determine the user's primary workspace and redirect to it
    redirect("/app")
  }, [isLoading, error, user])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="animate-spin" />
    </div>
  )
}
