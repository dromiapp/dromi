import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@repo/ui/components/ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@repo/ui/components/ui/dropdown-menu";
import { ChevronsUpDown, Check, Loader2 } from "lucide-react";
import { useWorkspace } from "~/hooks/workspace/use-workspace";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { useState } from "react";
import { useWorkspaces } from "~/hooks/workspace/use-workspaces";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

export function WorkspaceSwitcher({
  workspaceId
}: {
  workspaceId: string;
}) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { workspace } = useWorkspace({ workspace: workspaceId });
  const { workspaces, isLoading } = useWorkspaces({
    enabled: switcherOpen
  })
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={switcherOpen} onOpenChange={setSwitcherOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-md"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">
                  {workspace?.displayName}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] flex flex-col space-y-1"
            align="start"
          >
            {isLoading && (
              <Loader2 className="animate-spin h-5 w-5 mx-auto" />
            )}
            {workspaces?.map((workspace) => {
              const isActive = workspace.slug === workspaceId || workspace.id === workspaceId;
              return (
                <>
                  <Link href={`/${workspace.slug}`} key={workspace.id}>
                    <DropdownMenuItem className={cn(
                      "flex items-center gap-2",
                      isActive && "bg-sidebar-accent"
                    )}>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{workspace.slug[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">
                        {workspace?.displayName}
                      </span>

                      {isActive && (
                        <div className="ml-auto">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </DropdownMenuItem>
                  </Link>
                </>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}