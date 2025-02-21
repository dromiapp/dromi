import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { BoardItemCard } from "./board-item-card";
import { BoardItemDialog } from "./board-item-dialog";
import { useBoardItemMutations } from "~/hooks/boards/use-board-item-mutations";

interface BoardItemProps {
  item: any;
  onDragStart: Function
}

const BoardItem = ({ item, onDragStart }: BoardItemProps) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const { workspace } = useParams();
  const { deleteItem } = useBoardItemMutations(workspace as string);

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

  return (
    <>
      <BoardItemDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        item={item}
        onDelete={() => {
          deleteItem(item);
          setEditOpen(false);
        }}
        trigger={
          <div>
            <BoardItemCard
              ref={itemRef}
              item={item}
              onDragStart={onDragStart}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            />
          </div>
        }
      />
    </>
  );
}

export default BoardItem;