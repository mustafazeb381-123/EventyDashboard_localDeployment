import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

interface RsvpDraggableFieldProps {
  fieldId: string;
  children: React.ReactNode;
  disabled?: boolean;
}

/** Wraps a form field so it can be dragged to another container or reordered. Uses a handle so the rest stays clickable. */
export const RsvpDraggableField: React.FC<RsvpDraggableFieldProps> = ({
  fieldId,
  children,
  disabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: fieldId,
    data: { from: "field", fieldId },
    disabled,
  });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : { opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rsvp-draggable-field relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 w-7 h-7 flex items-center justify-center rounded-md cursor-grab active:cursor-grabbing bg-white/90 shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors z-10"
        title="Drag to move"
      >
        <GripVertical size={16} />
      </div>
      {children}
    </div>
  );
};
