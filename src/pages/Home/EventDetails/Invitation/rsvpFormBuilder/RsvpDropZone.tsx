import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface RsvpDropZoneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  style?: React.CSSProperties;
}

/** Droppable zone for the form builder: root area or inside a container/row/column. */
export const RsvpDropZone: React.FC<RsvpDropZoneProps> = ({
  id,
  children,
  className = "",
  minHeight,
  style,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      data-drop-zone={id}
      className={`rsvp-drop-zone transition-all rounded-lg ${isOver ? "ring-2 ring-indigo-400 bg-indigo-50/80" : ""} ${className}`}
      style={{ ...(minHeight ? { minHeight } : {}), ...style }}
    >
      {children}
    </div>
  );
};
