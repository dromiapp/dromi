import React, { forwardRef } from "react";
import { cn } from "@repo/ui/lib/utils";

type DragHandleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  ref?: React.Ref<HTMLButtonElement>;
};

const DragHandleComponent = forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("drag-handle cursor-grab", className)}
        tabIndex={0}
        {...props}
      >
        <svg viewBox="0 0 20 20" width="12" fill="#fff">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
        </svg>
      </button>
    );
  }
);

DragHandleComponent.displayName = "DragHandle";
export const DragHandle = DragHandleComponent as (props: DragHandleProps) => JSX.Element;
