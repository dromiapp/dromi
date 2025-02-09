"use client"

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
    redirect("/app")
  }, [isLoading, error, user])

  // TODO: Make a loader here
}
