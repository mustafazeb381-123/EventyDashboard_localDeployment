import React from "react";
import {
  User,
  Mail,
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
} from "lucide-react";
import type { RsvpFormField, RsvpFieldType } from "./types";
import { createRsvpFormField } from "./types";

interface RsvpFieldPaletteProps {
  formFields: RsvpFormField[];
  selectedFieldId: string | null;
  onSelectField: (field: RsvpFormField) => void;
  onAddField: (field: RsvpFormField) => void;
}

const FIELD_ICONS: Record<RsvpFieldType, React.ReactNode> = {
  text: <User size={18} className="text-slate-600" />,
  email: <Mail size={18} className="text-slate-600" />,
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

const ADD_FIELD_OPTIONS: { type: RsvpFieldType; label: string }[] = [
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

export const RsvpFieldPalette: React.FC<RsvpFieldPaletteProps> = ({
  formFields,
  selectedFieldId,
  onSelectField,
  onAddField,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Form fields
      </p>

      {/* Current fields – click to edit */}
      <div className="space-y-2">
        {formFields.map((field) => (
          <button
            key={field.id}
            type="button"
            onClick={() => onSelectField(field)}
            className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all flex items-center gap-2 ${
              selectedFieldId === field.id
                ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            {FIELD_ICONS[field.type]}
            <span className="font-medium text-sm truncate">
              {field.type === "paragraph" || field.type === "heading" || field.type === "divider"
                ? field.type.charAt(0).toUpperCase() + field.type.slice(1)
                : field.label}
            </span>
          </button>
        ))}
      </div>

      {/* Add field – like Advance Registration */}
      <div className="pt-4 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Plus size={14} />
          Add field
        </p>
        <div className="flex flex-wrap gap-2">
          {ADD_FIELD_OPTIONS.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => onAddField(createRsvpFormField(type))}
              className="px-3 py-2 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              {FIELD_ICONS[type]}
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
