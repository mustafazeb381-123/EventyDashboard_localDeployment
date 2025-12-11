import React, { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Edit,
  Eye,
  Plus,
  X,
  Save,
  Type,
  Mail,
  Hash,
  Calendar,
  Image as ImageIcon,
  Radio,
  CheckSquare,
  FileText,
  List,
  MousePointerClick,
  Palette,
  Layout,
  Columns,
  Square,
} from "lucide-react";
// Removed toast import to avoid stuck notifications

// -------------------- TYPES --------------------
export type FieldType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "image"
  | "button";

export interface CustomFormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  unique: boolean;
  defaultValue?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  options?: Array<{ label: string; value: string }>; // For select, radio, checkbox
  accept?: string; // For file/image
  buttonText?: string; // For button
  buttonType?: "button" | "submit" | "reset";
  conditions?: Array<{
    field: string;
    operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
    value: string;
    action: "show" | "hide" | "enable" | "disable";
  }>;
  // Individual field styling
  fieldStyle?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    padding?: string;
    margin?: string;
    textColor?: string;
    labelColor?: string;
    width?: string;
  };
  // Layout properties
  containerType?: "row" | "column" | "container";
  columnSpan?: number; // For grid layouts
  rowSpan?: number;
}

// Export FormField as an alias for compatibility
export interface FormField extends CustomFormField {}

export interface FormTheme {
  // Form Container
  formBackgroundColor?: string;
  formBackgroundImage?: File | string | null;
  formPadding?: string;
  formBorderRadius?: string;
  formBorderColor?: string;
  formBorderWidth?: string;
  formBoxShadow?: string;

  // Typography
  headingColor?: string;
  headingFontSize?: string;
  headingFontWeight?: string;
  labelColor?: string;
  labelFontSize?: string;
  labelFontWeight?: string;
  textColor?: string;
  textFontSize?: string;
  descriptionColor?: string;
  descriptionFontSize?: string;

  // Input Fields
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputBorderWidth?: string;
  inputBorderRadius?: string;
  inputTextColor?: string;
  inputPlaceholderColor?: string;
  inputFocusBorderColor?: string;
  inputFocusBackgroundColor?: string;
  inputPadding?: string;

  // Buttons
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderRadius?: string;
  buttonPadding?: string;
  buttonHoverBackgroundColor?: string;
  buttonHoverTextColor?: string;

  // Footer
  footerEnabled?: boolean;
  footerText?: string;
  footerTextColor?: string;
  footerBackgroundColor?: string;
  footerPadding?: string;
  footerFontSize?: string;
  footerAlignment?: "left" | "center" | "right";

  // Required/Error Indicators
  requiredIndicatorColor?: string;
  errorTextColor?: string;
  errorBorderColor?: string;
}

interface FieldConfigProps {
  field: CustomFormField | null;
  onUpdate: (field: CustomFormField) => void;
  onClose: () => void;
}

// -------------------- FIELD CONFIGURATION PANEL --------------------
const FieldConfigPanel: React.FC<FieldConfigProps> = ({
  field,
  onUpdate,
  onClose,
}) => {
  if (!field) return null;

  const [config, setConfig] = useState<CustomFormField>(field);

  const getFieldIcon = (type: FieldType) => {
    const icons = {
      text: <Type size={18} />,
      email: <Mail size={18} />,
      number: <Hash size={18} />,
      date: <Calendar size={18} />,
      textarea: <FileText size={18} />,
      select: <List size={18} />,
      radio: <Radio size={18} />,
      checkbox: <CheckSquare size={18} />,
      file: <FileText size={18} />,
      image: <ImageIcon size={18} />,
      button: <MousePointerClick size={18} />,
    };
    return icons[type] || <Type size={18} />;
  };

  const handleUpdate = () => {
    onUpdate(config);
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
      <div className="p-5 border-b sticky top-0 bg-gradient-to-r from-gray-50 to-white z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Field Configuration
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize field settings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close configuration"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Field Type Badge */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          {getFieldIcon(config.type)}
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Field
            </p>
            <p className="text-xs text-gray-600">
              Configure this field's properties
            </p>
          </div>
        </div>

        {/* Basic Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Basic Settings
          </h4>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Field Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.label}
              onChange={(e) => setConfig({ ...config, label: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter field label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Field Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) =>
                setConfig({
                  ...config,
                  name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
              placeholder="field_name"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Used for form submission (auto-generated from label)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Placeholder
            </label>
            <input
              type="text"
              value={config.placeholder || ""}
              onChange={(e) =>
                setConfig({ ...config, placeholder: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter placeholder text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Description
            </label>
            <textarea
              value={config.description || ""}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              rows={3}
              placeholder="Help text for users"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Default Value
            </label>
            <input
              type="text"
              value={config.defaultValue || ""}
              onChange={(e) =>
                setConfig({ ...config, defaultValue: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Default value"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Field Options
          </h4>
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={config.required}
              onChange={(e) =>
                setConfig({ ...config, required: e.target.checked })
              }
              className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-800 block">
                Required Field
              </span>
              <span className="text-xs text-gray-500">
                User must fill this field
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={config.unique}
              onChange={(e) =>
                setConfig({ ...config, unique: e.target.checked })
              }
              className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-800 block">
                Unique Value
              </span>
              <span className="text-xs text-gray-500">
                No duplicate values allowed
              </span>
            </div>
          </label>
        </div>

        {/* Type-specific configurations */}
        {(config.type === "select" ||
          config.type === "radio" ||
          config.type === "checkbox") && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Options
            </h4>
            <div className="space-y-2">
              {(config.options || []).map((option, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-xs text-gray-500 font-mono w-6 text-center">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(config.options || [])];
                      newOptions[index] = {
                        ...option,
                        label: e.target.value,
                        value: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "_"),
                      };
                      setConfig({ ...config, options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="Option label"
                  />
                  <button
                    onClick={() => {
                      const newOptions = config.options?.filter(
                        (_, i) => i !== index
                      );
                      setConfig({ ...config, options: newOptions || [] });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove option"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [
                    ...(config.options || []),
                    {
                      label: `Option ${(config.options?.length || 0) + 1}`,
                      value: `option_${(config.options?.length || 0) + 1}`,
                    },
                  ];
                  setConfig({ ...config, options: newOptions });
                }}
                className="w-full px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Add Option
              </button>
            </div>
          </div>
        )}

        {(config.type === "file" || config.type === "image") && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Accepted File Types
            </label>
            <input
              type="text"
              value={config.accept || ""}
              onChange={(e) => setConfig({ ...config, accept: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="image/*, .pdf, .doc"
            />
            <p className="text-xs text-gray-500 mt-1">
              e.g., image/*, .pdf, .doc, .docx
            </p>
          </div>
        )}

        {config.type === "button" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={config.buttonText || ""}
                onChange={(e) =>
                  setConfig({ ...config, buttonText: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Click Me"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Button Type
              </label>
              <select
                value={config.buttonType || "button"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    buttonType: e.target.value as "button" | "submit" | "reset",
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="button">Button</option>
                <option value="submit">Submit</option>
                <option value="reset">Reset</option>
              </select>
            </div>
          </>
        )}

        {/* Validation */}
        {(config.type === "text" ||
          config.type === "email" ||
          config.type === "number" ||
          config.type === "textarea") && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Validation Rules</h4>
            <div className="space-y-3">
              {config.type === "number" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Minimum Value
                    </label>
                    <input
                      type="number"
                      value={config.validation?.min || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          validation: {
                            ...config.validation,
                            min: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Maximum Value
                    </label>
                    <input
                      type="number"
                      value={config.validation?.max || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          validation: {
                            ...config.validation,
                            max: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}
              {(config.type === "text" ||
                config.type === "email" ||
                config.type === "textarea") && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Minimum Length
                    </label>
                    <input
                      type="number"
                      value={config.validation?.minLength || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          validation: {
                            ...config.validation,
                            minLength: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Maximum Length
                    </label>
                    <input
                      type="number"
                      value={config.validation?.maxLength || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          validation: {
                            ...config.validation,
                            maxLength: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  {config.type === "text" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Pattern (Regex)
                      </label>
                      <input
                        type="text"
                        value={config.validation?.pattern || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            validation: {
                              ...config.validation,
                              pattern: e.target.value || undefined,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="^[A-Za-z]+$"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t sticky bottom-0 bg-white pb-2">
          <button
            onClick={handleUpdate}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- SORTABLE FIELD ITEM --------------------
interface SortableFieldItemProps {
  field: CustomFormField;
  onEdit: (field: CustomFormField) => void;
  onDelete: (id: string) => void;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
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
    };
    return icons[type] || <Type size={16} />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-lg hover:border-blue-300 transition-all group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-600 transition-colors p-1"
        title="Drag to reorder"
      >
        <GripVertical size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-blue-600">{getFieldIcon(field.type)}</div>
          <span className="font-semibold text-gray-800">{field.label}</span>
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
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {field.type}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500 font-mono truncate">
            {field.name}
          </span>
          {field.placeholder && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 italic truncate">
                "{field.placeholder}"
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(field)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit field configuration"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(field.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete field"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// -------------------- FIELD PALETTE --------------------
interface FieldPaletteProps {
  onAddField: (field: CustomFormField) => void;
}

const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField }) => {
  const layoutTypes: Array<{
    type: "row" | "column" | "container";
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
  }> = [
    {
      type: "container",
      label: "Container",
      icon: <Square size={18} />,
      description: "Group fields in a container",
      color: "slate",
    },
    {
      type: "row",
      label: "Row",
      icon: <Layout size={18} />,
      description: "Horizontal layout",
      color: "blue",
    },
    {
      type: "column",
      label: "Column",
      icon: <Columns size={18} />,
      description: "Vertical layout",
      color: "green",
    },
  ];

  const handleAddLayout = (layoutType: "row" | "column" | "container") => {
    const newField: CustomFormField = {
      id: `layout-${Date.now()}`,
      type: "text", // Placeholder type
      label: layoutType.charAt(0).toUpperCase() + layoutType.slice(1),
      name: `layout_${Date.now()}`,
      required: false,
      unique: false,
      containerType: layoutType,
    };
    onAddField(newField);
  };
  const fieldTypes: Array<{
    type: FieldType;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
  }> = [
    {
      type: "text",
      label: "Text Input",
      icon: <Type size={18} />,
      description: "Single line text",
      color: "blue",
    },
    {
      type: "email",
      label: "Email",
      icon: <Mail size={18} />,
      description: "Email address",
      color: "green",
    },
    {
      type: "number",
      label: "Number",
      icon: <Hash size={18} />,
      description: "Numeric input",
      color: "purple",
    },
    {
      type: "date",
      label: "Date",
      icon: <Calendar size={18} />,
      description: "Date picker",
      color: "orange",
    },
    {
      type: "textarea",
      label: "Textarea",
      icon: <FileText size={18} />,
      description: "Multi-line text",
      color: "indigo",
    },
    {
      type: "select",
      label: "Dropdown",
      icon: <List size={18} />,
      description: "Select option",
      color: "pink",
    },
    {
      type: "radio",
      label: "Radio",
      icon: <Radio size={18} />,
      description: "Single choice",
      color: "teal",
    },
    {
      type: "checkbox",
      label: "Checkbox",
      icon: <CheckSquare size={18} />,
      description: "Multiple choice",
      color: "cyan",
    },
    {
      type: "file",
      label: "File Upload",
      icon: <FileText size={18} />,
      description: "Upload files",
      color: "amber",
    },
    {
      type: "image",
      label: "Image Upload",
      icon: <ImageIcon size={18} />,
      description: "Upload images",
      color: "rose",
    },
    {
      type: "button",
      label: "Button",
      icon: <MousePointerClick size={18} />,
      description: "Action button",
      color: "gray",
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700",
    green: "hover:bg-green-50 hover:border-green-400 hover:text-green-700",
    purple: "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700",
    orange: "hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700",
    indigo: "hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700",
    pink: "hover:bg-pink-50 hover:border-pink-400 hover:text-pink-700",
    teal: "hover:bg-teal-50 hover:border-teal-400 hover:text-teal-700",
    cyan: "hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-700",
    amber: "hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700",
    rose: "hover:bg-rose-50 hover:border-rose-400 hover:text-rose-700",
    gray: "hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700",
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="text-blue-600" size={20} />
        <h3 className="font-semibold text-gray-800">Add Field to Form</h3>
      </div>

      {/* Layout Types */}
      <div className="mb-4 pb-4 border-b">
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Layout Elements
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {layoutTypes.map((layout) => (
            <button
              key={layout.type}
              onClick={() => handleAddLayout(layout.type)}
              className={`p-3 border-2 border-dashed rounded-lg hover:border-solid hover:shadow-md transition-all text-center ${
                layout.color === "slate"
                  ? "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                  : layout.color === "blue"
                  ? "border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                  : "border-green-300 hover:border-green-400 hover:bg-green-50"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`text-${layout.color}-600`}>{layout.icon}</div>
                <span className="text-xs font-medium text-gray-700">
                  {layout.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Form Fields</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {fieldTypes.map(({ type, label, icon, description, color }) => (
            <button
              key={type}
              onClick={() => {
                const newField: CustomFormField = {
                  id: `${type}-${Date.now()}`,
                  type,
                  label: label,
                  name: `${type}_${Date.now()}`,
                  required: false,
                  unique: false,
                  placeholder:
                    type === "email"
                      ? "example@email.com"
                      : type === "number"
                      ? "Enter a number"
                      : `Enter ${label.toLowerCase()}`,
                  ...(type === "select" ||
                  type === "radio" ||
                  type === "checkbox"
                    ? {
                        options: [
                          { label: "Option 1", value: "option_1" },
                          { label: "Option 2", value: "option_2" },
                        ],
                      }
                    : {}),
                  ...(type === "button"
                    ? { buttonText: "Submit", buttonType: "submit" }
                    : {}),
                  ...(type === "image" ? { accept: "image/*" } : {}),
                  ...(type === "file" ? { accept: ".pdf,.doc,.docx" } : {}),
                };
                onAddField(newField);
              }}
              className={`flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-lg transition-all text-left group ${colorClasses[color]}`}
            >
              <div className="text-gray-600 group-hover:scale-110 transition-transform">
                {icon}
              </div>
              <div className="text-center w-full">
                <span className="text-sm font-medium text-gray-800 block">
                  {label}
                </span>
                <span className="text-xs text-gray-500 mt-1 block">
                  {description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------- MAIN CUSTOM FORM BUILDER --------------------
interface CustomFormBuilderProps {
  initialFields?: CustomFormField[];
  initialBannerImage?: File | string | null;
  initialTheme?: FormTheme;
  onSave: (
    fields: CustomFormField[],
    bannerImage?: File | string,
    theme?: FormTheme
  ) => void;
  onClose: () => void;
}

const CustomFormBuilder: React.FC<CustomFormBuilderProps> = ({
  initialFields = [],
  initialBannerImage = null,
  initialTheme,
  onSave,
  onClose,
}) => {
  const [fields, setFields] = useState<CustomFormField[]>(initialFields);
  const [editingField, setEditingField] = useState<CustomFormField | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [bannerImage, setBannerImage] = useState<File | string | null>(
    initialBannerImage
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    typeof initialBannerImage === "string" ? initialBannerImage : null
  );
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<FormTheme>({
    formBackgroundColor: "#ffffff",
    formPadding: "24px",
    formBorderRadius: "8px",
    formBorderColor: "#e5e7eb",
    formBorderWidth: "1px",
    headingColor: "#111827",
    headingFontSize: "24px",
    headingFontWeight: "bold",
    labelColor: "#374151",
    labelFontSize: "14px",
    labelFontWeight: "600",
    textColor: "#111827",
    textFontSize: "16px",
    descriptionColor: "#6b7280",
    descriptionFontSize: "12px",
    inputBackgroundColor: "#ffffff",
    inputBorderColor: "#d1d5db",
    inputBorderWidth: "1px",
    inputBorderRadius: "6px",
    inputTextColor: "#111827",
    inputPlaceholderColor: "#9ca3af",
    inputFocusBorderColor: "#3b82f6",
    inputFocusBackgroundColor: "#ffffff",
    inputPadding: "10px 16px",
    buttonBackgroundColor: "#3b82f6",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#3b82f6",
    buttonBorderRadius: "6px",
    buttonPadding: "12px 24px",
    buttonHoverBackgroundColor: "#2563eb",
    buttonHoverTextColor: "#ffffff",
    footerEnabled: false,
    footerText: "",
    footerTextColor: "#6b7280",
    footerBackgroundColor: "#f9fafb",
    footerPadding: "16px",
    footerFontSize: "14px",
    footerAlignment: "center",
    requiredIndicatorColor: "#ef4444",
    errorTextColor: "#ef4444",
    errorBorderColor: "#ef4444",
    ...initialTheme,
  });

  // Load banner preview if initial banner is a file
  React.useEffect(() => {
    if (initialBannerImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(initialBannerImage);
    }
  }, [initialBannerImage]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: { active: any; over: any }) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddField = (field: CustomFormField) => {
    const fieldLabels: Record<FieldType, string> = {
      text: "Text Input",
      email: "Email Address",
      number: "Number",
      date: "Date",
      textarea: "Text Area",
      select: "Dropdown",
      radio: "Radio Buttons",
      checkbox: "Checkboxes",
      file: "File Upload",
      image: "Image Upload",
      button: "Button",
    };

    const newField: CustomFormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: fieldLabels[type] || "Field",
      name: `${type}_${Date.now()}`.toLowerCase().replace(/\s+/g, "_"),
      required: false,
      unique: false,
      placeholder:
        type === "email"
          ? "example@email.com"
          : type === "number"
          ? "Enter a number"
          : `Enter ${fieldLabels[type]?.toLowerCase() || "value"}`,
      ...(type === "select" || type === "radio" || type === "checkbox"
        ? {
            options: [
              { label: "Option 1", value: "option_1" },
              { label: "Option 2", value: "option_2" },
            ],
          }
        : {}),
      ...(type === "button"
        ? { buttonText: "Submit", buttonType: "submit" }
        : {}),
      ...(type === "image" ? { accept: "image/*" } : {}),
      ...(type === "file" ? { accept: ".pdf,.doc,.docx" } : {}),
    };
    setFields([...fields, newField]);
    // Auto-open configuration panel for new fields
    setTimeout(() => {
      const addedField = fields.find((f) => f.id === newField.id) || newField;
      // This will be handled by parent component
    }, 100);
  };

  const handleUpdateField = (updatedField: CustomFormField) => {
    setFields((prev) =>
      prev.map((field) => (field.id === updatedField.id ? updatedField : field))
    );
    setEditingField(null);
  };

  const handleDeleteField = (id: string) => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      setFields((prev) => prev.filter((field) => field.id !== id));
    }
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    setBannerImage(null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (fields.length === 0) {
      alert("Please add at least one field before saving.");
      return;
    }
    onSave(fields, bannerImage || undefined, theme);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Builder Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Custom Form Builder
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag & drop fields, configure settings, and preview your form
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`px-4 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2 ${
                showThemePanel
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
              title="Theme & Styling"
            >
              <Palette size={16} />
              Theme
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center gap-2 bg-white"
            >
              <Eye size={16} />
              {showPreview ? "Edit Mode" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Save size={16} />
              Save Form
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Builder Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {showPreview ? (
            <FormPreview
              fields={fields}
              bannerImage={bannerPreview}
              theme={theme}
            />
          ) : (
            <>
              {/* Banner Image Upload Section */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Form Banner Image
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload a banner image to display at the top of your form
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {bannerPreview ? (
                    <div className="relative">
                      <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={handleRemoveBanner}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                        title="Remove banner"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-10 h-10 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Click to upload banner
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  {!bannerPreview && (
                    <button
                      onClick={() => bannerInputRef.current?.click()}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <ImageIcon size={18} />
                      Upload Banner Image
                    </button>
                  )}
                </div>
              </div>

              <FieldPalette onAddField={handleAddField} />
              <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Form Fields
                    <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {fields.length} {fields.length === 1 ? "field" : "fields"}
                    </span>
                  </h3>
                  {fields.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm("Clear all fields?")) {
                          setFields([]);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {fields.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="text-blue-600" size={32} />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">
                        No fields added yet
                      </p>
                      <p className="text-sm text-gray-500">
                        Click on a field type above to add it to your form
                      </p>
                    </div>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={fields.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {fields.map((field) => (
                          <SortableFieldItem
                            key={field.id}
                            field={field}
                            onEdit={setEditingField}
                            onDelete={handleDeleteField}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Theme Configuration Panel */}
      {showThemePanel && (
        <ThemeConfigPanel
          theme={theme}
          onUpdate={setTheme}
          onClose={() => setShowThemePanel(false)}
        />
      )}

      {/* Configuration Panel */}
      {editingField && (
        <FieldConfigPanel
          field={editingField}
          onUpdate={handleUpdateField}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
};

// -------------------- THEME CONFIGURATION PANEL --------------------
interface ThemeConfigPanelProps {
  theme: FormTheme;
  onUpdate: (theme: FormTheme) => void;
  onClose: () => void;
}

const ThemeConfigPanel: React.FC<ThemeConfigPanelProps> = ({
  theme,
  onUpdate,
  onClose,
}) => {
  const [localTheme, setLocalTheme] = useState<FormTheme>(theme);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(
    typeof theme.formBackgroundImage === "string"
      ? theme.formBackgroundImage
      : null
  );

  React.useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    if (theme.formBackgroundImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImagePreview(reader.result as string);
      };
      reader.readAsDataURL(theme.formBackgroundImage);
    }
  }, [theme.formBackgroundImage]);

  const handleUpdate = (updates: Partial<FormTheme>) => {
    const newTheme = { ...localTheme, ...updates };
    setLocalTheme(newTheme);
    onUpdate(newTheme);
  };

  const handleBackgroundImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      handleUpdate({ formBackgroundImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackgroundImage = () => {
    handleUpdate({ formBackgroundImage: null });
    setBackgroundImagePreview(null);
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Theme & Styling
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize form appearance
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close theme panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Form Container */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Form Container
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.formBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ formBackgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.formBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ formBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Background Image
            </label>
            {backgroundImagePreview ? (
              <div className="relative">
                <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img
                    src={backgroundImagePreview}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleRemoveBackgroundImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  title="Remove background image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-3 pb-2">
                  <ImageIcon className="w-8 h-8 mb-1 text-gray-400" />
                  <p className="text-xs text-gray-500">Click to upload</p>
                </div>
                <input
                  ref={backgroundImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Padding
              </label>
              <input
                type="text"
                value={localTheme.formPadding || "24px"}
                onChange={(e) => handleUpdate({ formPadding: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="24px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Border Radius
              </label>
              <input
                type="text"
                value={localTheme.formBorderRadius || "8px"}
                onChange={(e) =>
                  handleUpdate({ formBorderRadius: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="8px"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Border Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.formBorderColor || "#e5e7eb"}
                onChange={(e) =>
                  handleUpdate({ formBorderColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.formBorderColor || "#e5e7eb"}
                onChange={(e) =>
                  handleUpdate({ formBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Typography
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Heading Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.headingColor || "#111827"}
                onChange={(e) => handleUpdate({ headingColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.headingColor || "#111827"}
                onChange={(e) => handleUpdate({ headingColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Label Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.labelColor || "#374151"}
                onChange={(e) => handleUpdate({ labelColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.labelColor || "#374151"}
                onChange={(e) => handleUpdate({ labelColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.textColor || "#111827"}
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.textColor || "#111827"}
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Input Fields
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Border Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputBorderColor || "#d1d5db"}
                onChange={(e) =>
                  handleUpdate({ inputBorderColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputBorderColor || "#d1d5db"}
                onChange={(e) =>
                  handleUpdate({ inputBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Focus Border Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputFocusBorderColor || "#3b82f6"}
                onChange={(e) =>
                  handleUpdate({ inputFocusBorderColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputFocusBorderColor || "#3b82f6"}
                onChange={(e) =>
                  handleUpdate({ inputFocusBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ inputBackgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ inputBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Border Radius
              </label>
              <input
                type="text"
                value={localTheme.inputBorderRadius || "6px"}
                onChange={(e) =>
                  handleUpdate({ inputBorderRadius: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="6px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Padding
              </label>
              <input
                type="text"
                value={localTheme.inputPadding || "10px 16px"}
                onChange={(e) => handleUpdate({ inputPadding: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="10px 16px"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Buttons
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.buttonBackgroundColor || "#3b82f6"}
                onChange={(e) =>
                  handleUpdate({ buttonBackgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.buttonBackgroundColor || "#3b82f6"}
                onChange={(e) =>
                  handleUpdate({ buttonBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.buttonTextColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ buttonTextColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.buttonTextColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ buttonTextColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Hover Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.buttonHoverBackgroundColor || "#2563eb"}
                onChange={(e) =>
                  handleUpdate({ buttonHoverBackgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.buttonHoverBackgroundColor || "#2563eb"}
                onChange={(e) =>
                  handleUpdate({ buttonHoverBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Footer
            </h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localTheme.footerEnabled || false}
                onChange={(e) =>
                  handleUpdate({ footerEnabled: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enable Footer</span>
            </label>
          </div>

          {localTheme.footerEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Footer Text
                </label>
                <textarea
                  value={localTheme.footerText || ""}
                  onChange={(e) => handleUpdate({ footerText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter footer text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localTheme.footerTextColor || "#6b7280"}
                    onChange={(e) =>
                      handleUpdate({ footerTextColor: e.target.value })
                    }
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localTheme.footerTextColor || "#6b7280"}
                    onChange={(e) =>
                      handleUpdate({ footerTextColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localTheme.footerBackgroundColor || "#f9fafb"}
                    onChange={(e) =>
                      handleUpdate({ footerBackgroundColor: e.target.value })
                    }
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localTheme.footerBackgroundColor || "#f9fafb"}
                    onChange={(e) =>
                      handleUpdate({ footerBackgroundColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Alignment
                </label>
                <select
                  value={localTheme.footerAlignment || "center"}
                  onChange={(e) =>
                    handleUpdate({
                      footerAlignment: e.target.value as
                        | "left"
                        | "center"
                        | "right",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------- FORM PREVIEW --------------------
interface FormPreviewProps {
  fields: CustomFormField[];
  bannerImage?: string | null;
  theme?: FormTheme;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  fields,
  bannerImage,
  theme,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Form submitted! Check console for data.");
  };

  const renderField = (
    field: CustomFormField,
    inputStyle?: React.CSSProperties,
    theme?: FormTheme
  ) => {
    // Merge field-specific styles with theme styles
    const fieldInputStyle: React.CSSProperties = {
      ...inputStyle,
      backgroundColor:
        field.fieldStyle?.backgroundColor ||
        theme?.inputBackgroundColor ||
        "#ffffff",
      borderColor:
        field.fieldStyle?.borderColor || theme?.inputBorderColor || "#d1d5db",
      borderWidth:
        field.fieldStyle?.borderWidth || theme?.inputBorderWidth || "1px",
      borderRadius:
        field.fieldStyle?.borderRadius || theme?.inputBorderRadius || "6px",
      color: field.fieldStyle?.textColor || theme?.inputTextColor || "#111827",
      padding: field.fieldStyle?.padding || theme?.inputPadding || "10px 16px",
      width: field.fieldStyle?.width || "100%",
    };
    const commonProps = {
      id: field.id,
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      defaultValue: field.defaultValue,
    };

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <input
            type={field.type}
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.name]: e.target.value })
            }
            style={{
              ...inputStyle,
              width: "100%",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputFocusBorderColor || "#3b82f6";
              e.currentTarget.style.backgroundColor =
                theme?.inputFocusBackgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputBorderColor || "#d1d5db";
              e.currentTarget.style.backgroundColor =
                theme?.inputBackgroundColor || "#ffffff";
            }}
            className="w-full transition-all"
          />
        );
      case "textarea":
        return (
          <textarea
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.name]: e.target.value })
            }
            style={{
              ...fieldInputStyle,
              width: field.fieldStyle?.width || "100%",
              outline: "none",
              resize: "vertical" as const,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputFocusBorderColor || "#3b82f6";
              e.currentTarget.style.backgroundColor =
                theme?.inputFocusBackgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputBorderColor || "#d1d5db";
              e.currentTarget.style.backgroundColor =
                theme?.inputBackgroundColor || "#ffffff";
            }}
            className="w-full transition-all resize-y"
            rows={4}
          />
        );
      case "select":
        return (
          <select
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.name]: e.target.value })
            }
            style={{
              ...fieldInputStyle,
              width: field.fieldStyle?.width || "100%",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputFocusBorderColor || "#3b82f6";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                field.fieldStyle?.borderColor ||
                theme?.inputBorderColor ||
                "#d1d5db";
            }}
            className="w-full transition-all bg-white"
          >
            <option value="">Select an option...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-3">
            {field.options?.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={formData[field.name] === opt.value}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.name]: e.target.value })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={formData[field.name]?.includes(opt.value) || false}
                  onChange={(e) => {
                    const current = formData[field.name] || [];
                    const updated = e.target.checked
                      ? [...current, opt.value]
                      : current.filter((v: string) => v !== opt.value);
                    setFormData({ ...formData, [field.name]: updated });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      case "file":
      case "image":
        const fileValue = formData[field.name];
        const filePreview =
          typeof fileValue === "string" && fileValue.startsWith("data:")
            ? fileValue
            : fileValue instanceof File
            ? URL.createObjectURL(fileValue)
            : null;

        return (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {field.type === "image" ? (
                  <ImageIcon className="w-12 h-12 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                ) : (
                  <FileText className="w-12 h-12 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                )}
                <p className="mb-1 text-sm text-gray-600 font-medium">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                {field.accept ? (
                  <p className="text-xs text-gray-500">{field.accept}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {field.type === "image"
                      ? "PNG, JPG, GIF up to 10MB"
                      : "Any file type"}
                  </p>
                )}
              </div>
              <input
                type="file"
                {...commonProps}
                accept={
                  field.accept ||
                  (field.type === "image" ? "image/*" : undefined)
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file type for images
                    if (
                      field.type === "image" &&
                      !file.type.startsWith("image/")
                    ) {
                      alert("Please select an image file");
                      e.target.value = "";
                      return;
                    }
                    // Validate file size (10MB for images)
                    if (
                      field.type === "image" &&
                      file.size > 10 * 1024 * 1024
                    ) {
                      alert("Image size should be less than 10MB");
                      e.target.value = "";
                      return;
                    }
                    // Store file object and create preview for images
                    if (field.type === "image") {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({
                          ...formData,
                          [field.name]: reader.result,
                        });
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setFormData({ ...formData, [field.name]: file });
                    }
                  }
                }}
                className="hidden"
              />
            </label>
            {filePreview && field.type === "image" && (
              <div className="relative">
                <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img
                    src={filePreview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => {
                      const newData = { ...prev };
                      delete newData[field.name];
                      return newData;
                    });
                    // Reset file input
                    const input = document.querySelector(
                      `input[name="${field.name}"]`
                    ) as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {fileValue && !filePreview && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {typeof fileValue === "string"
                        ? fileValue
                        : fileValue.name}
                    </p>
                    {fileValue instanceof File && (
                      <p className="text-xs text-gray-500">
                        {(fileValue.size / 1024).toFixed(2)} KB
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => {
                      const newData = { ...prev };
                      delete newData[field.name];
                      return newData;
                    });
                    const input = document.querySelector(
                      `input[name="${field.name}"]`
                    ) as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        );
      case "button":
        return (
          <button
            type={field.buttonType || "button"}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            {field.buttonText || "Button"}
          </button>
        );
      default:
        return null;
    }
  };

  const formStyle: React.CSSProperties = {
    backgroundColor: theme?.formBackgroundColor || "#ffffff",
    backgroundImage: theme?.formBackgroundImage
      ? typeof theme.formBackgroundImage === "string"
        ? `url(${theme.formBackgroundImage})`
        : backgroundImagePreview
        ? `url(${backgroundImagePreview})`
        : undefined
      : undefined,
    backgroundSize: theme?.formBackgroundImage ? "cover" : undefined,
    backgroundPosition: theme?.formBackgroundImage ? "center" : undefined,
    backgroundRepeat: theme?.formBackgroundImage ? "no-repeat" : undefined,
    padding: theme?.formPadding || "24px",
    borderRadius: theme?.formBorderRadius || "8px",
    borderColor: theme?.formBorderColor || "#e5e7eb",
    borderWidth: theme?.formBorderWidth || "1px",
    borderStyle: "solid",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: theme?.inputBackgroundColor || "#ffffff",
    borderColor: theme?.inputBorderColor || "#d1d5db",
    borderWidth: theme?.inputBorderWidth || "1px",
    borderRadius: theme?.inputBorderRadius || "6px",
    color: theme?.inputTextColor || "#111827",
    padding: theme?.inputPadding || "10px 16px",
  };

  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (theme?.formBackgroundImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImagePreview(reader.result as string);
      };
      reader.readAsDataURL(theme.formBackgroundImage);
    } else if (typeof theme?.formBackgroundImage === "string") {
      setBackgroundImagePreview(theme.formBackgroundImage);
    }
  }, [theme?.formBackgroundImage]);

  return (
    <div
      className="max-w-3xl mx-auto rounded-xl shadow-lg overflow-hidden"
      style={formStyle}
    >
      {/* Banner Image */}
      {bannerImage && (
        <div className="w-full h-64 bg-gray-100 overflow-hidden">
          <img
            src={bannerImage}
            alt="Form banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div>
        <div
          className="mb-6 pb-4 border-b"
          style={{ borderColor: theme?.formBorderColor || "#e5e7eb" }}
        >
          <h3
            className="text-2xl font-bold mb-2"
            style={{
              color: theme?.headingColor || "#111827",
              fontSize: theme?.headingFontSize || "24px",
              fontWeight: theme?.headingFontWeight || "bold",
            }}
          >
            Form Preview
          </h3>
          <p
            className="text-sm"
            style={{ color: theme?.descriptionColor || "#6b7280" }}
          >
            See how your form will look to users
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => {
            // Check if this is a layout container
            if (field.containerType) {
              return (
                <div
                  key={field.id}
                  className={`border-2 border-dashed rounded-lg p-4 ${
                    field.containerType === "row"
                      ? "flex flex-row gap-4"
                      : field.containerType === "column"
                      ? "flex flex-col gap-4"
                      : "block"
                  }`}
                  style={{
                    backgroundColor:
                      field.fieldStyle?.backgroundColor || "#f9fafb",
                    borderColor: field.fieldStyle?.borderColor || "#d1d5db",
                    padding: field.fieldStyle?.padding || "16px",
                    margin: field.fieldStyle?.margin || "0",
                    borderRadius: field.fieldStyle?.borderRadius || "8px",
                  }}
                >
                  <div className="text-xs text-gray-500 mb-2 font-medium">
                    {field.containerType.charAt(0).toUpperCase() +
                      field.containerType.slice(1)}{" "}
                    Container
                  </div>
                  <div className="text-sm text-gray-400 italic">
                    Drop fields here
                  </div>
                </div>
              );
            }

            return (
              <div
                key={field.id}
                className="space-y-2"
                style={{
                  margin: field.fieldStyle?.margin || "0",
                  padding: field.fieldStyle?.padding || "0",
                  width: field.fieldStyle?.width || "100%",
                }}
              >
                <label
                  className="block font-semibold"
                  style={{
                    color:
                      field.fieldStyle?.labelColor ||
                      theme?.labelColor ||
                      "#374151",
                    fontSize: theme?.labelFontSize || "14px",
                    fontWeight: theme?.labelFontWeight || "600",
                  }}
                >
                  {field.label}
                  {field.required && (
                    <span
                      style={{
                        color: theme?.requiredIndicatorColor || "#ef4444",
                        marginLeft: "4px",
                      }}
                    >
                      *
                    </span>
                  )}
                  {field.unique && (
                    <span
                      className="ml-2 text-xs bg-blue-50 px-2 py-0.5 rounded"
                      style={{ color: "#2563eb" }}
                    >
                      Unique
                    </span>
                  )}
                </label>
                {field.description && (
                  <p
                    className="text-xs mb-2 italic"
                    style={{
                      color: theme?.descriptionColor || "#6b7280",
                      fontSize: theme?.descriptionFontSize || "12px",
                    }}
                  >
                    {field.description}
                  </p>
                )}
                {renderField(field, inputStyle, theme)}
              </div>
            );
          })}
          <div
            className="pt-4 border-t"
            style={{ borderColor: theme?.formBorderColor || "#e5e7eb" }}
          >
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundColor: theme?.buttonBackgroundColor || "#3b82f6",
                color: theme?.buttonTextColor || "#ffffff",
                borderColor:
                  theme?.buttonBorderColor ||
                  theme?.buttonBackgroundColor ||
                  "#3b82f6",
                borderRadius: theme?.buttonBorderRadius || "6px",
                padding: theme?.buttonPadding || "12px 24px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme?.buttonHoverBackgroundColor ||
                  theme?.buttonBackgroundColor ||
                  "#2563eb";
                e.currentTarget.style.color =
                  theme?.buttonHoverTextColor ||
                  theme?.buttonTextColor ||
                  "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme?.buttonBackgroundColor || "#3b82f6";
                e.currentTarget.style.color =
                  theme?.buttonTextColor || "#ffffff";
              }}
            >
              Submit Form
            </button>
          </div>
        </form>

        {/* Footer */}
        {theme?.footerEnabled && theme?.footerText && (
          <div
            className="mt-6 pt-4 border-t"
            style={{
              backgroundColor: theme.footerBackgroundColor || "#f9fafb",
              color: theme.footerTextColor || "#6b7280",
              padding: theme.footerPadding || "16px",
              fontSize: theme.footerFontSize || "14px",
              textAlign: theme.footerAlignment || "center",
              borderTopColor: theme.formBorderColor || "#e5e7eb",
            }}
          >
            {theme.footerText}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomFormBuilder;
export type { CustomFormField, FieldType };
