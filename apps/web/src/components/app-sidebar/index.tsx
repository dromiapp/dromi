import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton
} from "@repo/ui/components/ui/sidebar";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useBoards } from "~/hooks/boards/use-boards";
import { ClipboardList, Home, Plus, PlusIcon } from "lucide-react";
import { fetchClient } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { useWorkspace } from "~/hooks/use-workspace";
import { redirect, usePathname } from "next/navigation";

export function AppSidebar({
  workspaceId
}: {
  workspaceId: string;
}) {
  const queryClient = useQueryClient();
  const { boards, isLoading: isLoadingBoards, isError: isErrorBoards } = useBoards({ workspace: workspaceId });
  const { workspace } = useWorkspace({ workspace: workspaceId })
  const pathname = usePathname();

  const newBoard = async () => {
    fetchClient.POST("/workspace/{id}/todo", {
      params: {
        path: {
          id: workspaceId,
        }
      },
      body: {
        displayName: "New Board",
        slug: "",
      }
    }).then((res) => {
      queryClient.invalidateQueries({
        queryKey: ["get", "/workspace/{id}/todo"],
      }).then(() => redirect(`/${workspace?.slug}/board/${res.data?.todoList?.slug}`))
    })
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <WorkspaceSwitcher workspaceId={workspaceId} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Link href={`/${workspace?.slug}`}>
            <SidebarMenuButton isActive={pathname === `/${workspace?.slug}`}>
              <Home className="h-4 w-4" />
              Home
            </SidebarMenuButton>
          </Link>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="flex gap-1 items-center">
            Boards
            {boards && boards.length > 0 && (
              <PlusIcon className="h-4 w-4 ml-auto cursor-pointer" onClick={newBoard} />
            )}
          </SidebarGroupLabel>

          <SidebarGroupContent className="space-y-0.5 flex flex-col">
            {!boards || boards.length === 0 && (
              <SidebarMenuButton onClick={newBoard}>
                <Plus className="h-4 w-4" />
                Add a board
              </SidebarMenuButton>
            )}

            {boards?.map((board) => {
              return (
                // might change the board routing later idk
                <Link href={`/${workspace?.slug}/board/${board.slug}`} key={board.id} >
                  <SidebarMenuButton isActive={pathname === `/${workspace?.slug}/board/${board.slug}`}>
                    <ClipboardList className="h-4 w-4" />
                    <p className="max-w-[300px] truncate">
                      {board.displayName}
                    </p>
                  </SidebarMenuButton>
                </Link>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
