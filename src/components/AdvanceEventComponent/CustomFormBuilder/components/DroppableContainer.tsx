import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, Trash2, LayoutGrid, Columns2, Square } from "lucide-react";
import type { CustomFormField } from "../types";
import { SortableFieldItem } from "./SortableFieldItem";

interface DroppableContainerProps {
  field: CustomFormField;
  childFields: CustomFormField[];
  allFields: CustomFormField[];
  onEdit: (field: CustomFormField) => void;
  onDelete: (id: string) => void;
  onEditChild: (field: CustomFormField) => void;
  onDeleteChild: (id: string) => void;
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  field,
  childFields,
  allFields,
  onEdit,
  onDelete,
  onEditChild,
  onDeleteChild,
}) => {
  const droppableId = `container:${field.id}`;
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: droppableId,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isEmpty = childFields.length === 0;
  const containerType = field.containerType;

  return (
    <div
      ref={setSortableRef}
      style={style}
      data-container-id={field.id}
      className={`bg-white border-2 rounded-lg transition-all group relative pt-5 p-3 ${
        containerType === "container"
          ? "border-purple-300 bg-purple-50/30"
          : containerType === "row"
          ? "border-blue-300 bg-blue-50/30"
          : "border-indigo-300 bg-indigo-50/30"
      } ${isOver ? "ring-2 ring-purple-400 bg-purple-100" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="absolute -top-3 left-4 bg-white px-2">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {field.label || field.name || "Container"}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {containerType === "row" && (
          <LayoutGrid size={16} className="text-blue-600" />
        )}
        {containerType === "column" && (
          <Columns2 size={16} className="text-indigo-600" />
        )}
        {containerType === "container" && (
          <Square size={16} className="text-purple-600" />
        )}
        <span className="font-semibold text-gray-800 capitalize">
          {containerType}
        </span>
        {childFields.length > 0 && (
          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
            {childFields.length} {childFields.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      <div className="flex gap-1 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-md shadow-sm">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(field);
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit container"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Edit size={18} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete container"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div
        ref={setDroppableRef}
        className={`min-h-[60px] space-y-2 ${
          isEmpty ? "border-2 border-dashed border-gray-300 rounded-lg p-4" : ""
        }`}
      >
        <SortableContext
          items={childFields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {isEmpty ? (
            <div className="text-center py-8 text-gray-400 text-sm italic">
              Drop fields here
            </div>
          ) : (
            childFields.map((childField) => {
              if (childField.containerType) {
                const nestedChildFields = childField.children
                  ? (childField.children
                      .map((id) => allFields.find((f) => f.id === id))
                      .filter(Boolean) as CustomFormField[])
                  : [];

                return (
                  <DroppableContainer
                    key={childField.id}
                    field={childField}
                    childFields={nestedChildFields}
                    allFields={allFields}
                    onEdit={onEditChild}
                    onDelete={onDeleteChild}
                    onEditChild={onEditChild}
                    onDeleteChild={onDeleteChild}
                  />
                );
              }

              return (
                <SortableFieldItem
                  key={childField.id}
                  field={childField}
                  onEdit={onEditChild}
                  onDelete={onDeleteChild}
                  isInsideContainer
                />
              );
            })
          )}
        </SortableContext>
      </div>
    </div>
  );
};
