import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus, GripVertical, Edit } from "lucide-react";

interface MainDropZoneProps {
  children?: React.ReactNode;
  isEmpty?: boolean;
}

export const MainDropZone: React.FC<MainDropZoneProps> = ({
  children,
  isEmpty = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "main-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      data-drop-zone="main-drop-zone"
      className={`min-h-[200px] transition-all rounded-lg ${
        isOver ? "ring-2 ring-blue-400 bg-blue-50" : ""
      }`}
    >
      {children}
      {isEmpty && (
        <div className="text-center py-16 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative flex flex-col items-center">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Plus className="text-white" size={40} />
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-2">
              Drop Zone
            </p>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              Drag fields from the component panel above and drop them here to
              build your form
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <GripVertical size={16} />
              <span>Drag to reorder</span>
              <span>•</span>
              <Edit size={16} />
              <span>Click to edit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
