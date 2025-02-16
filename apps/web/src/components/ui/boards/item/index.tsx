import { Card, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { DragHandle } from "./drag-handle";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar, Trash, Users } from "lucide-react";
import { Separator } from "@repo/ui/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import api, { fetchClient } from "~/lib/api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface BoardItemProps {
  item: any;
  onDragStart: Function
}

export default function BoardItem({ item, onDragStart }: BoardItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const { workspace } = useParams();

  const [editOpen, setEditOpen] = useState(false);

  const handleMouseDown = () => {
    if (itemRef.current) {
      itemRef.current.draggable = true;
    }
  };

  const handleMouseUp = () => {
    if (itemRef.current) {
      itemRef.current.draggable = false;
    }
  };

  const deleteItem = () => {
    fetchClient.DELETE("/workspace/{id}/todo/{todoId}/items/{itemId}", {
      params: {
        path: {
          id: workspace as string,
          todoId: item.listId,
          itemId: item.id,
        }
      },
    }).then((res) => {
      queryClient.invalidateQueries({
        queryKey: ["get", "/workspace/{id}/todo/{todoId}/items"],
      })
      setEditOpen(false)
      toast("Item deleted successfully")
    })
  }

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogTrigger asChild>
        <div
          ref={itemRef}
          onDragStart={(event) => onDragStart(event, item)}
          onDragEnd={handleMouseUp}
        >
          <Card className="group cursor-pointer">
            <div className="flex justify-between w-full">
              <CardHeader>
                <CardTitle className="group-hover:underline">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <DragHandle className="mr-4" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} />
            </div>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="!max-w-2xl">
        <DialogTitle className="text-xl">
          {item.title}
        </DialogTitle>

        <div className="grid grid-cols-[450px_minmax(0,1fr)]">
          <div>
            {/* TODO: description editing */}
          </div>
          <div>
            <div className="justify-end flex w-full flex-col space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4" />
                Assignees
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4" />
                Dates
              </Button>
            </div>
            <Separator className="w-full my-4" />
            <div className="justify-end flex w-full flex-col space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={deleteItem}>
                <Trash className="h-4 w-4" />
                Delete item
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
