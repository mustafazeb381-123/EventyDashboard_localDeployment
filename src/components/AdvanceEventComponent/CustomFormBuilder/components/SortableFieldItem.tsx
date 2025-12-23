import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Type,
  Mail,
  Hash,
  Calendar,
  FileText,
  List,
  Radio,
  CheckSquare,
  Image as ImageIcon,
  MousePointerClick,
  Table,
  Minus,
  Heading,
  AlignLeft,
  Space,
  LayoutGrid,
  Columns2,
  Square,
  Edit,
  Trash2,
} from "lucide-react";
import type { CustomFormField, FieldType } from "../types";

interface SortableFieldItemProps {
  field: CustomFormField;
  onEdit: (field: CustomFormField) => void;
  onDelete: (id: string) => void;
  isInsideContainer?: boolean;
}

export const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  onEdit,
  onDelete,
  isInsideContainer = false,
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

  const getFieldIcon = (type: FieldType) => {
    const icons = {
      text: <Type size={16} />,
      email: <Mail size={16} />,
      number: <Hash size={16} />,
      date: <Calendar size={16} />,
      textarea: <FileText size={16} />,
      select: <List size={16} />,
      radio: <Radio size={16} />,
      checkbox: <CheckSquare size={16} />,
      file: <FileText size={16} />,
      image: <ImageIcon size={16} />,
      button: <MousePointerClick size={16} />,
      table: <Table size={16} />,
      divider: <Minus size={16} />,
      heading: <Heading size={16} />,
      paragraph: <AlignLeft size={16} />,
      spacer: <Space size={16} />,
      container: <LayoutGrid size={16} />,
    };
    return icons[type] || <Type size={16} />;
  };

  const isContainer = field.containerType !== undefined;
  const isCompact = false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-lg transition-all group ${
        isContainer
          ? "border-purple-300 bg-purple-50/30 pt-5 p-3"
          : "border-gray-200 pt-5 p-3 hover:shadow-lg hover:border-blue-300"
      } ${isCompact ? "p-2" : "p-3"} relative`}
      {...attributes}
      {...listeners}
    >
      {/* Field Name Label on Border */}
      <div className="absolute -top-3 left-4 bg-white px-2">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {field.label || field.name || "Field"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isContainer ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {field.containerType === "row" && (
                <LayoutGrid size={16} className="text-purple-600" />
              )}
              {field.containerType === "column" && (
                <Columns2 size={16} className="text-purple-600" />
              )}
              {field.containerType === "container" && (
                <Square size={16} className="text-purple-600" />
              )}
              <span className="font-semibold text-gray-800 capitalize">
                {field.containerType}
              </span>
              {field.children && field.children.length > 0 && (
                <span className="text-xs text-gray-500 bg-purple-100 px-2 py-0.5 rounded">
                  {field.children.length}{" "}
                  {field.children.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            {field.layoutProps && (
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                {field.layoutProps.gap && (
                  <span>Gap: {field.layoutProps.gap}</span>
                )}
                {field.layoutProps.justifyContent && (
                  <span>• Justify: {field.layoutProps.justifyContent}</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-800 text-sm">
                {field.label}
              </span>
              {field.required && (
                <span className="text-red-500 text-xs font-bold bg-red-50 px-1.5 py-0.5 rounded">
                  Required
                </span>
              )}
              {field.unique && (
                <span className="text-blue-600 text-xs font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                  Unique
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-1 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-md shadow-sm">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(field);
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit field configuration"
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
          title="Delete field"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
