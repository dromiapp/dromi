import { Card, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { DragHandle } from "./drag-handle";
import { FC } from "react";

interface BoardItemCardProps {
  onDragStart: Function;
  onMouseDown: () => void;
  onMouseUp: () => void;
  item: any;
  ref?: React.Ref<HTMLDivElement>;
}

export const BoardItemCard: FC<BoardItemCardProps> = ({
  onDragStart,
  onMouseDown,
  onMouseUp,
  item,
  ref,
}) => {
  return (
    <div
      ref={ref}
      draggable={false}
      onMouseDown={onMouseDown}
      onDragStart={(event) => onDragStart(event, item)}
      onDragEnd={onMouseUp}
      onClick={() => console.log("clicked")}
    >
      <Card className="group cursor-pointer">
        <div className="flex justify-between w-full">
          <CardHeader>
            <CardTitle className="group-hover:underline">{item.title}</CardTitle>
          </CardHeader>
          <DragHandle className="mr-4" onMouseDown={onMouseDown} onMouseUp={onMouseUp} />
        </div>
      </Card>
    </div>
  );
};
