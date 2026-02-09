import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
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
  Plus,
  Eye,
  EyeOff,
  Trash2,
  LayoutGrid,
  Columns2,
  Square,
  Search,
  Palette,
} from "lucide-react";
import type { RsvpFormField, RsvpFieldType } from "./types";
import { createRsvpFormField } from "./types";

type PaletteTab = "layout" | "fields";

/** Wraps a palette button so it can be dragged into the form or into containers. */
function DraggablePaletteButton({
  id,
  data,
  onClick,
  className,
  children,
}: {
  id: string;
  data: { from: "palette"; fieldType?: RsvpFieldType; layoutType?: "container" | "row" | "column" };
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id, data });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      className={className}
      {...attributes}
      {...listeners}
    >
      {children}
    </button>
  );
}

/** Create a layout field (Container, Row, or Column) for the RSVP form – exported for DnD in builder */
export function createRsvpLayoutField(
  containerType: "container" | "row" | "column"
): RsvpFormField {
  const id = `${containerType}-${Date.now()}`;
  const label =
    containerType === "container"
      ? "Container"
      : containerType === "row"
        ? "Row"
        : "Column";
  const isRow = containerType === "row";
  return {
    id,
    type: "paragraph",
    name: id,
    label,
    required: false,
    visible: true,
    content: "",
    containerType,
    children: [],
    layoutProps: {
      gap: "16px",
      padding: isRow ? "12px" : "16px",
      justifyContent: "flex-start",
      alignItems: isRow ? "center" : "stretch",
      flexDirection: isRow ? "row" : "column",
      flexWrap: isRow ? "wrap" : "nowrap",
    },
  };
}

interface RsvpFieldPaletteProps {
  formFields: RsvpFormField[];
  selectedFieldId: string | null;
  onSelectField: (field: RsvpFormField) => void;
  onAddField: (field: RsvpFormField) => void;
  /** Step 1: toggle show/hide for a field (both visible and hidden have edit/delete) */
  onToggleVisible?: (field: RsvpFormField) => void;
  /** Delete a field – available for both visible and hidden fields */
  onDeleteField?: (id: string) => void;
}

const FIELD_ICONS: Record<RsvpFieldType, React.ReactNode> = {
  text: <User size={18} className="text-slate-600" />,
  phone: <Phone size={18} className="text-slate-600" />,
  number: <Hash size={18} className="text-slate-600" />,
  date: <Calendar size={18} className="text-slate-600" />,
  textarea: <AlignLeft size={18} className="text-slate-600" />,
  select: <List size={18} className="text-slate-600" />,
  radio: <CircleDot size={18} className="text-slate-600" />,
  checkbox: <CheckSquare size={18} className="text-slate-600" />,
  paragraph: <Type size={18} className="text-slate-600" />,
  divider: <Minus size={18} className="text-slate-600" />,
  heading: <Heading size={18} className="text-slate-600" />,
};

/** Step 1: all field types available with show/hide options */
const ADD_FIELD_OPTIONS: { type: RsvpFieldType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "phone", label: "Phone" },
  { type: "number", label: "Number" },
  { type: "date", label: "Date" },
  { type: "textarea", label: "Textarea" },
  { type: "select", label: "Dropdown" },
  { type: "radio", label: "Radio" },
  { type: "checkbox", label: "Checkbox" },
  { type: "paragraph", label: "Paragraph" },
  { type: "divider", label: "Divider" },
  { type: "heading", label: "Heading" },
];

const STRUCTURE_ITEMS: {
  containerType: "container" | "row" | "column";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  searchTerms: string;
}[] = [
  {
    containerType: "container",
    title: "Container",
    subtitle: "Stack vertically",
    icon: <Square size={20} className="text-purple-600" />,
    searchTerms: "container stack vertically layout",
  },
  {
    containerType: "row",
    title: "Row",
    subtitle: "Side by side",
    icon: <LayoutGrid size={20} className="text-indigo-600" />,
    searchTerms: "row side by side layout",
  },
  {
    containerType: "column",
    title: "Column",
    subtitle: "Grid columns (drop fields inside)",
    icon: <Columns2 size={20} className="text-sky-600" />,
    searchTerms: "column grid layout",
  },
];

export const RsvpFieldPalette: React.FC<RsvpFieldPaletteProps> = ({
  formFields,
  selectedFieldId,
  onSelectField,
  onAddField,
  onToggleVisible,
  onDeleteField,
}) => {
  const [activeTab, setActiveTab] = useState<PaletteTab>("layout");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStructureItems = useMemo(() => {
    if (!searchQuery.trim()) return STRUCTURE_ITEMS;
    const q = searchQuery.toLowerCase();
    return STRUCTURE_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) || item.searchTerms.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredFieldOptions = useMemo(() => {
    if (!searchQuery.trim()) return ADD_FIELD_OPTIONS;
    const q = searchQuery.toLowerCase();
    return ADD_FIELD_OPTIONS.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredFormFields = useMemo(() => {
    if (!searchQuery.trim()) return formFields;
    const q = searchQuery.toLowerCase();
    return formFields.filter((f) => {
      const label = (f.label ?? "").toLowerCase();
      const type = (f.type ?? "").toLowerCase();
      const layoutLabel = f.containerType ? (f.containerType === "container" ? "container" : f.containerType === "row" ? "row" : "column") : "";
      return label.includes(q) || type.includes(q) || layoutLabel.includes(q);
    });
  }, [formFields, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Title: Form Elements with palette icon (like screenshot) */}
      <div className="flex items-center gap-2">
        <Palette size={18} className="text-slate-600 shrink-0" />
        <h3 className="text-sm font-semibold text-slate-800">Form Elements</h3>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />
      </div>

      {/* Tabs: Layout | Fields only (no Personal) */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("layout")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "layout"
              ? "border-purple-500 text-purple-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Layout
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("fields")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "fields"
              ? "border-purple-500 text-purple-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Fields
        </button>
      </div>

      {/* Layout tab: STRUCTURE section */}
      {activeTab === "layout" && (
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Structure
          </p>
          <p className="text-[11px] text-slate-500 mb-3">
            Add containers to group and arrange fields in rows or columns.
          </p>
          <div className="space-y-2">
            {filteredStructureItems.map((item) => (
              <DraggablePaletteButton
                key={item.containerType}
                id={`palette:layout:${item.containerType}`}
                data={{ from: "palette", layoutType: item.containerType }}
                onClick={() => onAddField(createRsvpLayoutField(item.containerType))}
                className="w-full flex items-start gap-3 p-3 rounded-lg border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-left transition-all cursor-grab active:cursor-grabbing"
              >
                <span className="shrink-0 mt-0.5">{item.icon}</span>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.subtitle} — or drag to form</div>
                </div>
              </DraggablePaletteButton>
            ))}
          </div>
          {filteredStructureItems.length === 0 && (
            <p className="text-xs text-slate-500 py-2">No structure elements match your search.</p>
          )}
        </div>
      )}

      {/* Fields tab: current fields + Add field */}
      {activeTab === "fields" && (
        <div className="space-y-4">
          {/* Current fields – click to edit; show/hide + delete */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current fields
            </p>
            {filteredFormFields.map((field) => {
              const isVisible = field.visible !== false;
              const layoutIcon =
                field.containerType === "container"
                  ? <Square size={16} className="text-purple-600 shrink-0" />
                  : field.containerType === "row"
                    ? <LayoutGrid size={16} className="text-indigo-600 shrink-0" />
                    : field.containerType === "column"
                      ? <Columns2 size={16} className="text-sky-600 shrink-0" />
                      : null;
              return (
                <div
                  key={field.id}
                  className={`flex items-center gap-0 rounded-lg border-2 transition-all overflow-hidden ${
                    selectedFieldId === field.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectField(field)}
                    className="flex-1 min-w-0 text-left px-3 py-2.5 flex items-center gap-2"
                  >
                    {layoutIcon ?? FIELD_ICONS[field.type]}
                    <span className="font-medium text-sm truncate">
                      {field.containerType
                        ? (field.containerType === "container"
                            ? "Container"
                            : field.containerType === "row"
                              ? "Row"
                              : "Column")
                        : field.type === "paragraph" || field.type === "heading" || field.type === "divider"
                          ? field.type.charAt(0).toUpperCase() + field.type.slice(1)
                          : field.label}
                    </span>
                  </button>
                  {onToggleVisible && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisible(field);
                      }}
                      className={`p-2 shrink-0 transition-colors ${
                        isVisible ? "text-indigo-600 hover:bg-indigo-100" : "text-slate-400 hover:bg-slate-200"
                      }`}
                      title={isVisible ? "Hide in final form" : "Show in final form"}
                      aria-label={isVisible ? "Hide in final form" : "Show in final form"}
                    >
                      {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  )}
                  {onDeleteField && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteField(field.id);
                      }}
                      className="p-2 shrink-0 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete field"
                      aria-label="Delete field"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add field – all types */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Plus size={14} />
              Add field
            </p>
            <div className="flex flex-wrap gap-2">
              {filteredFieldOptions.map(({ type, label }) => (
                <DraggablePaletteButton
                  key={type}
                  id={`palette:${type}`}
                  data={{ from: "palette", fieldType: type }}
                  onClick={() => onAddField(createRsvpFormField(type))}
                  className="px-3 py-2 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-medium transition-all flex items-center gap-1.5 cursor-grab active:cursor-grabbing"
                >
                  {FIELD_ICONS[type]}
                  {label}
                </DraggablePaletteButton>
              ))}
            </div>
            {filteredFieldOptions.length === 0 && (
              <p className="text-xs text-slate-500 py-2">No field types match your search.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
