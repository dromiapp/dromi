// BoardItemDialog.tsx
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar, ChevronRight, Trash, Users } from "lucide-react";
import { Separator } from "@repo/ui/components/ui/separator";
import { DescriptionEditor } from "./description-editor";
import { useBoardItemMutations } from "~/hooks/boards/use-board-item-mutations";

interface BoardItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  trigger: React.ReactNode;
  item: any;
}

export const BoardItemDialog = ({
  open,
  onOpenChange,
  onDelete,
  trigger,
  item,
}: BoardItemDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="!max-w-2xl">
        <DialogTitle className="text-xl">{item.title}</DialogTitle>
        <div className="grid grid-cols-[450px_minmax(0,1fr)] gap-4">
          <DescriptionEditor item={item} />
          <div className="flex flex-col">
            <div className="justify-end flex w-full flex-col space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="h-4 w-4" />
                Assignees
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="h-4 w-4" />
                Dates
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </div>
            <Separator className="w-full my-4" />
            <div className="justify-end flex w-full flex-col space-y-2 mt-auto">
              <Button variant="ghost" className="w-full justify-start" onClick={onDelete}>
                <Trash className="h-4 w-4" />
                Delete item
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
