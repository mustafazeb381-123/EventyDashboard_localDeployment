import React from "react";
import { useDroppable } from "@dnd-kit/core";
import type { CustomFormField } from "../types";

interface DroppableContainerProps {
  containerId: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  containerType?: CustomFormField["containerType"];
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  containerId,
  children,
  isEmpty = false,
  containerType,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
  });

  const isColumn = containerType === "column";
  const dropZoneText = isColumn
    ? "Column Drop Zone"
    : isEmpty
    ? "Drop Zone"
    : "";

  return (
    <div
      ref={setNodeRef}
      data-container-id={containerId}
      className={`min-h-[60px] transition-all relative ${
        isOver ? "ring-2 ring-purple-400 bg-purple-100 border-purple-400" : ""
      } ${
        isEmpty || (isColumn && isEmpty)
          ? "border-2 border-dashed border-gray-300 rounded-lg"
          : ""
      }`}
    >
      {children}
      {(isEmpty || (isColumn && isEmpty)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-500 mb-1">
              {dropZoneText}
            </div>
            {isColumn && (
              <div className="text-xs text-gray-400">
                Fields will auto-resize to equal width
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
