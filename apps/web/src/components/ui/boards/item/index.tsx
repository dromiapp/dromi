import { Card, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { DragHandle } from "./drag-handle";
import { useRef } from "react";

interface BoardItemProps {
  item: any;
  onDragStart: Function
}

export default function BoardItem({ item, onDragStart }: BoardItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);

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
    <div
      ref={itemRef}
      onDragStart={(event) => onDragStart(event, item)}
      onDragEnd={handleMouseUp}
    >
      <Card>
        <div className="flex justify-between w-full">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <DragHandle className="mr-4" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} />
        </div>
      </Card>
    </div>
  );
}
