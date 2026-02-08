import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Edit, GripVertical } from "lucide-react";

interface RsvpMainDropZoneProps {
  children?: React.ReactNode;
  isEmpty?: boolean;
}

export const RsvpMainDropZone: React.FC<RsvpMainDropZoneProps> = ({
  children,
  isEmpty = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "rsvp-main-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      data-drop-zone="rsvp-main-drop-zone"
      className={`min-h-[200px] transition-all rounded-lg ${
        isOver ? "ring-2 ring-indigo-400 bg-indigo-50" : ""
      }`}
    >
      {children}
      {isEmpty && (
        <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-slate-50 rounded-lg border-2 border-dashed border-indigo-300 relative overflow-hidden">
          <div className="relative flex flex-col items-center">
            <p className="text-gray-700 font-semibold text-lg mb-2">
              Your RSVP form
            </p>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              This form includes First name, Last name, Email, and Phone number.
              Select a field on the left to customize label and placeholder.
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
