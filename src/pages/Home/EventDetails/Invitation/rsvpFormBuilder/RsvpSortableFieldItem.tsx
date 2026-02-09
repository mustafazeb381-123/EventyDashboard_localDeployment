import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  User,
  Phone,
  Hash,
  Calendar,
  AlignLeft,
  List,
  CircleDot,
  CheckSquare,
  Type,
  Minus,
  Heading,
  Edit,
  GripVertical,
  Trash2,
  EyeOff,
  Square,
  LayoutGrid,
  Columns2,
} from "lucide-react";
import type { RsvpFormField, RsvpFieldType } from "./types";

interface RsvpSortableFieldItemProps {
  field: RsvpFormField;
  onEdit: (field: RsvpFormField) => void;
  onUpdate?: (field: RsvpFormField) => void;
  onDelete?: (id: string) => void;
}

const FIELD_ICONS: Record<RsvpFieldType, React.ReactNode> = {
  text: <User size={16} className="text-slate-600" />,
  phone: <Phone size={16} className="text-slate-600" />,
  number: <Hash size={16} className="text-slate-600" />,
  date: <Calendar size={16} className="text-slate-600" />,
  textarea: <AlignLeft size={16} className="text-slate-600" />,
  select: <List size={16} className="text-slate-600" />,
  radio: <CircleDot size={16} className="text-slate-600" />,
  checkbox: <CheckSquare size={16} className="text-slate-600" />,
  paragraph: <Type size={16} className="text-slate-600" />,
  divider: <Minus size={16} className="text-slate-600" />,
  heading: <Heading size={16} className="text-slate-600" />,
};

const FIELD_TYPE_LABELS: Record<RsvpFieldType, string> = {
  text: "Text",
  phone: "Phone",
  number: "Number",
  date: "Date",
  textarea: "Textarea",
  select: "Dropdown",
  radio: "Radio",
  checkbox: "Checkbox",
  paragraph: "Paragraph",
  divider: "Divider",
  heading: "Heading",
};

export const RsvpSortableFieldItem: React.FC<RsvpSortableFieldItemProps> = ({
  field,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isLayout = !!field.containerType;
  const typeLabel = isLayout
    ? (field.containerType === "container"
        ? "Container"
        : field.containerType === "row"
          ? "Row"
          : "Column")
    : (FIELD_TYPE_LABELS[field.type] ?? field.type);
  const layoutIcon =
    field.containerType === "container"
      ? <Square size={16} className="text-purple-600" />
      : field.containerType === "row"
        ? <LayoutGrid size={16} className="text-indigo-600" />
        : field.containerType === "column"
          ? <Columns2 size={16} className="text-sky-600" />
          : null;
  const displayLabel = isLayout
    ? (field.label || typeLabel)
    : field.type === "paragraph" || field.type === "heading" || field.type === "divider"
      ? (field.content || field.label || typeLabel)
      : field.label;
  const snippet = isLayout
    ? ((field.children?.length ?? 0) > 0 ? `${field.children!.length} item(s)` : "Empty")
    : field.type === "paragraph" || field.type === "heading"
      ? (field.content?.slice(0, 40) || "—")
      : field.placeholder || "—";
  const isVisible = field.visible !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-lg pt-5 p-3 hover:shadow-lg transition-all group relative ${
        isVisible ? "border-slate-200 hover:border-indigo-300" : "border-slate-200 border-dashed opacity-75"
      }`}
    >
      <div className="absolute -top-3 left-4 bg-white px-2 flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {typeLabel}
        </span>
        {!isVisible && (
          <span className="text-xs text-slate-500 flex items-center gap-0.5" title="Hidden">
            <EyeOff size={12} />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
        <div className="flex items-center gap-2 text-slate-600">
          {layoutIcon ?? FIELD_ICONS[field.type]}
          <span className="font-semibold text-gray-800 text-sm truncate">
            {displayLabel}
          </span>
          {field.required && field.type !== "divider" && field.type !== "paragraph" && field.type !== "heading" && (
            <span className="text-xs text-red-500 font-medium">Required</span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-1 truncate pl-7">
        {snippet}
      </p>

      <div className="flex gap-1 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-md shadow-sm">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(field);
          }}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit field"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Edit size={18} />
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove field"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
