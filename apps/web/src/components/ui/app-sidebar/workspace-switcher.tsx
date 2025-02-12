import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@repo/ui/components/ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@repo/ui/components/ui/dropdown-menu";
import { ChevronsUpDown, Check } from "lucide-react";
import { useWorkspace } from "~/hooks/use-workspace";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";

export function WorkspaceSwitcher({
  workspaceId
}: {
  workspaceId: string;
}) {
  const { workspace, isLoading, isError } = useWorkspace({ workspace: workspaceId });
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
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
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            <p className="text-sm">
              Something will eventually be here...
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}