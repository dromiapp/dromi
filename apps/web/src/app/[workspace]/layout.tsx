"use client"

import { SidebarProvider } from "@repo/ui/components/ui/sidebar"
import { useParams } from "next/navigation"
import { AppSidebar } from "~/components/app-sidebar"
import { useWorkspace } from "~/hooks/workspace/use-workspace"
import SigninPage from "../auth/signin/page"
import { useUser } from "~/hooks/use-user"
import { Loader2 } from "lucide-react"

export interface WorkspaceProps {
  params: Promise<{ workspace: string }>
}

interface WorkspaceLayoutProps {
  children: React.ReactNode
  params: WorkspaceProps["params"]
}

export default function WorkspaceLayout({
  children,
  params
}: WorkspaceLayoutProps) {
  const { user, isLoading } = useUser();
  const { workspace: workspaceName } = useParams();
  const { workspace: data } = useWorkspace({ workspace: workspaceName as string });

  if (isLoading) return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    </>
  )

  // TODO: make a custom 404 page for workspaces
  if (!data) return <>Workspace not found</>;
  if (!user) return <SigninPage />;

  return (
    <SidebarProvider>
      <AppSidebar workspaceId={data.slug} />
      <div className="flex flex-col w-full h-screen p-5">
        {children}
      </div>
    </SidebarProvider>
  )
}