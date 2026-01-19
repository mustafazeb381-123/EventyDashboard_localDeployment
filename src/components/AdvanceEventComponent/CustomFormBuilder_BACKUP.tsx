import React, { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragOverlay,
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
  User,
  Briefcase,
  Building2,
  Phone,
  Badge,
  Zap,
  Code,
  Copy,
  Download,
  Upload,
  Layers,
  Search,
  Square,
  LayoutGrid,
  Columns2,
  Table,
  Minus,
  Heading,
  AlignLeft,
  Space,
  AlertCircle,
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
  | "button"
  | "table"
  | "divider"
  | "heading"
  | "paragraph"
  | "spacer"
  | "container";

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
  // For table field
  tableData?: {
    columns: Array<{ header: string; key: string }>;
    rows: Array<Record<string, any>>;
  };
  // For text/heading/paragraph fields
  content?: string; // HTML or plain text content
  // For spacer
  height?: string; // Height of spacer (e.g., "20px", "2rem")
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
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    margin?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    textColor?: string;
    labelColor?: string;
    width?: string;
    fontSize?: string;
    fontWeight?: string;
  };
  // Layout properties
  containerType?: "row" | "column" | "container";
  columnSpan?: number; // For grid layouts
  rowSpan?: number;
  // Bootstrap CSS class for column sizing (e.g., "col-6", "col-md-4", "col-lg-3")
  bootstrapClass?: string;
  // Container layout properties (FormEngine-like)
  children?: string[]; // IDs of child fields
  layoutProps?: {
    justifyContent?:
      | "flex-start"
      | "flex-end"
      | "center"
      | "space-between"
      | "space-around"
      | "space-evenly";
    alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
    gap?: string; // e.g., "8px", "16px", "1rem"
    padding?: string;
    margin?: string;
    flexDirection?: "row" | "column";
    flexWrap?: "nowrap" | "wrap";
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    minHeight?: string;
    marginBottom?: string;
  };
  // Event handlers (FormEngine-like)
  events?: {
    onClick?: string; // JavaScript code or function name
    onChange?: string;
    onFocus?: string;
    onBlur?: string;
    onSubmit?: string;
  };
  // Inline parameters/variables (FormEngine-like)
  inlineParams?: Record<string, string>; // e.g., {Name: "John", Email: "john@example.com"}
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

  // Logo
  logo?: File | string | null;
  logoPosition?: "left" | "center" | "right";
  logoWidth?: string;
  logoHeight?: string;

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
  allFields: CustomFormField[];
  onUpdate: (field: CustomFormField) => void;
  onClose: () => void;
}

// -------------------- FIELD CONFIGURATION PANEL --------------------
const FieldConfigPanel: React.FC<FieldConfigProps> = ({
  field,
  allFields,
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
      table: <Table size={18} />,
      divider: <Minus size={18} />,
      heading: <Heading size={18} />,
      paragraph: <AlignLeft size={18} />,
      spacer: <Space size={18} />,
      container: <LayoutGrid size={18} />,
    };
    return icons[type] || <Type size={18} />;
  };

  const handleUpdate = () => {
    onUpdate(config);
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
      <div className="p-5 border-b sticky top-0 bg-linear-to-r from-gray-50 to-white z-10 shadow-sm">
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

        {/* HEADING: Simple text content */}
        {config.type === "heading" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Content
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Heading Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.label}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter heading text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Font Size
              </label>
              <select
                value={config.fieldStyle?.fontSize || "24px"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    fieldStyle: {
                      ...config.fieldStyle,
                      fontSize: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="16px">Small (16px)</option>
                <option value="20px">Medium (20px)</option>
                <option value="24px">Large (24px)</option>
                <option value="28px">Extra Large (28px)</option>
                <option value="32px">Huge (32px)</option>
              </select>
            </div>
          </div>
        )}

        {/* PARAGRAPH: Simple text content */}
        {config.type === "paragraph" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Content
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Paragraph Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={config.label}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                rows={4}
                placeholder="Enter paragraph text"
              />
            </div>
          </div>
        )}

        {/* SPACER: Just height */}
        {config.type === "spacer" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Spacing
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Height
              </label>
              <input
                type="text"
                value={config.fieldStyle?.height || "20px"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    fieldStyle: {
                      ...config.fieldStyle,
                      height: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="20px, 2rem, etc."
              />
            </div>
          </div>
        )}

        {/* DIVIDER: Just styling */}
        {config.type === "divider" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Styling
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Color
              </label>
              <input
                type="color"
                value={config.fieldStyle?.borderColor || "#e5e7eb"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    fieldStyle: {
                      ...config.fieldStyle,
                      borderColor: e.target.value,
                    },
                  })
                }
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* REGULAR INPUT FIELDS: Full configuration */}
        {(config.type === "text" ||
          config.type === "email" ||
          config.type === "number" ||
          config.type === "date" ||
          config.type === "textarea") && (
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
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
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
        )}

        {/* OPTIONS FIELDS (select, radio, checkbox): Full configuration */}
        {(config.type === "select" ||
          config.type === "radio" ||
          config.type === "checkbox") && (
          <>
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
                  onChange={(e) =>
                    setConfig({ ...config, label: e.target.value })
                  }
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
                  rows={2}
                  placeholder="Help text for users"
                />
              </div>
            </div>

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
          </>
        )}

        {/* FILE/IMAGE: Minimal configuration */}
        {(config.type === "file" || config.type === "image") && (
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
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Accepted File Types
              </label>
              <input
                type="text"
                value={config.accept || ""}
                onChange={(e) =>
                  setConfig({ ...config, accept: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="image/*, .pdf, .doc"
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., image/*, .pdf, .doc, .docx
              </p>
            </div>
          </div>
        )}

        {/* BUTTON: Button-specific settings */}
        {config.type === "button" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Button Settings
            </h4>
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
          </div>
        )}

        {/* Field Options (for input fields) */}
        {(config.type === "text" ||
          config.type === "email" ||
          config.type === "number" ||
          config.type === "date" ||
          config.type === "textarea" ||
          config.type === "select" ||
          config.type === "radio" ||
          config.type === "checkbox" ||
          config.type === "file" ||
          config.type === "image") && (
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

        {/* Conditional Logic */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="text-orange-600" size={18} />
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Conditional Logic
            </h4>
          </div>

          <div className="space-y-3">
            {(config.conditions || []).map((condition, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-3 relative"
              >
                <button
                  onClick={() => {
                    const newConditions = config.conditions?.filter(
                      (_, i) => i !== index
                    );
                    setConfig({ ...config, conditions: newConditions });
                  }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Remove condition"
                >
                  <X size={16} />
                </button>

                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-600 w-12">If</span>
                  <select
                    value={condition.field}
                    onChange={(e) => {
                      const newConditions = [...(config.conditions || [])];
                      newConditions[index] = {
                        ...condition,
                        field: e.target.value,
                      };
                      setConfig({ ...config, conditions: newConditions });
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select Field</option>
                    {allFields
                      .filter((f) => f.id !== config.id)
                      .map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.label || f.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-2 items-center">
                  <select
                    value={condition.operator}
                    onChange={(e) => {
                      const newConditions = [...(config.conditions || [])];
                      newConditions[index] = {
                        ...condition,
                        operator: e.target.value as any,
                      };
                      setConfig({ ...config, conditions: newConditions });
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="equals">Equals</option>
                    <option value="notEquals">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greaterThan">Greater Than</option>
                    <option value="lessThan">Less Than</option>
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => {
                      const newConditions = [...(config.conditions || [])];
                      newConditions[index] = {
                        ...condition,
                        value: e.target.value,
                      };
                      setConfig({ ...config, conditions: newConditions });
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Value"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-600 w-12">Then</span>
                  <select
                    value={condition.action}
                    onChange={(e) => {
                      const newConditions = [...(config.conditions || [])];
                      newConditions[index] = {
                        ...condition,
                        action: e.target.value as any,
                      };
                      setConfig({ ...config, conditions: newConditions });
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="show">Show Field</option>
                    <option value="hide">Hide Field</option>
                  </select>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                const newConditions = [
                  ...(config.conditions || []),
                  {
                    field: "",
                    operator: "equals",
                    value: "",
                    action: "show",
                  },
                ];
                setConfig({ ...config, conditions: newConditions as any });
              }}
              className="w-full py-2 bg-white border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus size={16} />
              Add Condition
            </button>
          </div>
        </div>

        {/* Bootstrap Column Class (for fields inside column containers) */}
        {!config.containerType && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center gap-2">
              <Columns2 className="text-indigo-600" size={18} />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Column Sizing (Bootstrap)
              </h4>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Bootstrap CSS Class
              </label>
              <select
                value={config.bootstrapClass || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    bootstrapClass: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Auto (Equal Width)</option>
                <option value="col-12">Full Width (col-12)</option>
                <option value="col-6">Half Width (col-6)</option>
                <option value="col-4">One Third (col-4)</option>
                <option value="col-3">One Fourth (col-3)</option>
                <option value="col-2">One Sixth (col-2)</option>
                <option value="col-1">One Twelfth (col-1)</option>
                <option value="col-md-6">Medium Half (col-md-6)</option>
                <option value="col-md-4">Medium Third (col-md-4)</option>
                <option value="col-lg-4">Large Third (col-lg-4)</option>
                <option value="col-lg-3">Large Fourth (col-lg-3)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Set custom Bootstrap grid class. Leave empty for auto equal
                width.
              </p>
              {config.bootstrapClass && (
                <div className="mt-2 p-2 bg-indigo-50 rounded border border-indigo-200">
                  <p className="text-xs font-mono text-indigo-700">
                    Class: {config.bootstrapClass}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layout Properties (for containers) */}
        {config.containerType && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="text-purple-600" size={18} />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Layout Properties
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Gap (spacing between items)
              </label>
              <input
                type="text"
                value={config.layoutProps?.gap || "16px"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    layoutProps: {
                      ...config.layoutProps,
                      gap: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="16px"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Justify Content
              </label>
              <select
                value={config.layoutProps?.justifyContent || "flex-start"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    layoutProps: {
                      ...config.layoutProps,
                      justifyContent: e.target.value as any,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="flex-start">Flex Start</option>
                <option value="flex-end">Flex End</option>
                <option value="center">Center</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
                <option value="space-evenly">Space Evenly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Align Items
              </label>
              <select
                value={config.layoutProps?.alignItems || "stretch"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    layoutProps: {
                      ...config.layoutProps,
                      alignItems: e.target.value as any,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="flex-start">Flex Start</option>
                <option value="flex-end">Flex End</option>
                <option value="center">Center</option>
                <option value="stretch">Stretch</option>
                <option value="baseline">Baseline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Padding
              </label>
              <input
                type="text"
                value={config.layoutProps?.padding || "16px"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    layoutProps: {
                      ...config.layoutProps,
                      padding: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="16px"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.layoutProps?.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        layoutProps: {
                          ...config.layoutProps,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.layoutProps?.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        layoutProps: {
                          ...config.layoutProps,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Border Radius
                </label>
                <input
                  type="text"
                  value={config.layoutProps?.borderRadius || "8px"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      layoutProps: {
                        ...config.layoutProps,
                        borderRadius: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="8px"
                />
              </div>
            </div>
          </div>
        )}

        {/* Field Styling */}
        <div className="pt-2 border-t">
          <button
            onClick={() => {
              const el = document.getElementById("styling-options");
              if (el) el.classList.toggle("hidden");
            }}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3"
          >
            <span>Custom Styling (CSS)</span>
            <Palette size={16} />
          </button>
          <div id="styling-options" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Width
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.width || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        width: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="100% or 300px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Padding
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.padding || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        padding: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Text Color
                </label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={config.fieldStyle?.textColor || "#000000"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: {
                          ...config.fieldStyle,
                          textColor: e.target.value,
                        },
                      })
                    }
                    className="w-6 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.fieldStyle?.textColor || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: {
                          ...config.fieldStyle,
                          textColor: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 border rounded text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Label Color
                </label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={config.fieldStyle?.labelColor || "#000000"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: {
                          ...config.fieldStyle,
                          labelColor: e.target.value,
                        },
                      })
                    }
                    className="w-6 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.fieldStyle?.labelColor || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: {
                          ...config.fieldStyle,
                          labelColor: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 border rounded text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Bg Color
                </label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={config.fieldStyle?.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: {
                          ...config.fieldStyle,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                    className="w-6 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.fieldStyle?.backgroundColor || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: {
                          ...config.fieldStyle,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 border rounded text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Border Color
                </label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={config.fieldStyle?.borderColor || "#cccccc"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: {
                          ...config.fieldStyle,
                          borderColor: e.target.value,
                        },
                      })
                    }
                    className="w-6 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.fieldStyle?.borderColor || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: {
                          ...config.fieldStyle,
                          borderColor: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 border rounded text-sm"
                    placeholder="#cccccc"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Border Width
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.borderWidth || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        borderWidth: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="1px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Border Radius
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.borderRadius || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        borderRadius: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="4px"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                Margin
              </label>
              <input
                type="text"
                value={config.fieldStyle?.margin || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    fieldStyle: {
                      ...config.fieldStyle,
                      margin: e.target.value,
                    },
                  })
                }
                className="w-full px-2 py-1.5 border rounded text-sm"
                placeholder="0px or 10px 0px"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Margin Top
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.marginTop || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        marginTop: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Margin Bottom
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.marginBottom || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        marginBottom: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Margin Left
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.marginLeft || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        marginLeft: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Margin Right
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.marginRight || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        marginRight: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Padding Top
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.paddingTop || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        paddingTop: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Padding Bottom
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.paddingBottom || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        paddingBottom: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Padding Left
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.paddingLeft || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        paddingLeft: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Padding Right
                </label>
                <input
                  type="text"
                  value={config.fieldStyle?.paddingRight || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: {
                        ...config.fieldStyle,
                        paddingRight: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="10px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Event Handlers (FormEngine-like) */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-600" size={18} />
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Event Handlers
            </h4>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              onClick Handler
            </label>
            <input
              type="text"
              value={config.events?.onClick || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  events: { ...config.events, onClick: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              placeholder="handleClick() or function name"
            />
            <p className="text-xs text-gray-500 mt-1">
              JavaScript function name or code to execute on click
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              onChange Handler
            </label>
            <input
              type="text"
              value={config.events?.onChange || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  events: { ...config.events, onChange: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              placeholder="handleChange(value)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Function to call when field value changes
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              onFocus Handler
            </label>
            <input
              type="text"
              value={config.events?.onFocus || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  events: { ...config.events, onFocus: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              placeholder="handleFocus()"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              onBlur Handler
            </label>
            <input
              type="text"
              value={config.events?.onBlur || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  events: { ...config.events, onBlur: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              placeholder="handleBlur()"
            />
          </div>
        </div>

        {/* Inline Parameters (FormEngine-like) */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center gap-2">
            <Code className="text-purple-600" size={18} />
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Inline Parameters
            </h4>
          </div>
          <p className="text-xs text-gray-600">
            Use variables like {"{Name}"} or {"{Email}"} in labels/placeholders.
            They will be replaced with actual values.
          </p>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Available Variables
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(config.inlineParams || {}).map((key) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-mono"
                >
                  {"{" + key + "}"}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Add Variable
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Variable name (e.g., Name)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const input = e.currentTarget;
                    const varName = input.value.trim();
                    if (varName) {
                      setConfig({
                        ...config,
                        inlineParams: {
                          ...config.inlineParams,
                          [varName]: "",
                        },
                      });
                      input.value = "";
                    }
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to add. Use {"{" + "VariableName" + "}"} in
              labels/placeholders
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t sticky bottom-0 bg-white pb-2">
          <button
            onClick={handleUpdate}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- MAIN DROP ZONE --------------------
const MainDropZone: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "main-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      data-drop-zone="main"
      className={`min-h-[200px] transition-all rounded-lg ${
        isOver ? "ring-2 ring-blue-400 bg-blue-50" : ""
      }`}
    >
      <div className="text-center py-16 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Plus className="text-white" size={40} />
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">Drop Zone</p>
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
    </div>
  );
};

// -------------------- DROPPABLE CONTAINER --------------------
interface DroppableContainerProps {
  containerId: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  containerType?: "row" | "column" | "container";
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({
  containerId,
  children,
  isEmpty = false,
  containerType,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
  });

  const isColumn = containerType === "column";
  const dropZoneText = isColumn
    ? "Column Drop Zone"
    : isEmpty
    ? "Drop Zone"
    : "";

  return (
    <div
      ref={setNodeRef}
      data-container-id={containerId}
      className={`min-h-[60px] transition-all relative ${
        isOver ? "ring-2 ring-purple-400 bg-purple-100 border-purple-400" : ""
      } ${
        isEmpty || (isColumn && isEmpty)
          ? "border-2 border-dashed border-gray-300 rounded-lg"
          : ""
      }`}
    >
      {children}
      {(isEmpty || (isColumn && isEmpty)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-500 mb-1">
              {dropZoneText}
            </div>
            {isColumn && (
              <div className="text-xs text-gray-400">
                Fields will auto-resize to equal width
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------- SORTABLE FIELD ITEM --------------------
interface SortableFieldItemProps {
  field: CustomFormField;
  onEdit: (field: CustomFormField) => void;
  onDelete: (id: string) => void;
  isInsideContainer?: boolean;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
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
  const isCompact = false; // Will be controlled by selection state

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
        {/* Drag handle removed visually but entire item is draggable */}
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
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking button
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
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking button
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
  const [activeCategory, setActiveCategory] = useState<
    "basic" | "personal" | "professional" | "all" | "layout"
  >("layout");
  const [searchQuery, setSearchQuery] = useState("");

  const fieldPresets: Array<{
    id: string;
    type: FieldType;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
    category?: "basic" | "personal" | "professional";
    defaultLabel?: string;
    defaultName?: string;
    defaultPlaceholder?: string;
  }> = [
    // --- BASIC FIELDS ---
    {
      id: "text",
      type: "text",
      label: "Text Input",
      icon: <Type size={18} />,
      description: "Single line text",
      color: "blue",
      category: "basic",
    },
    {
      id: "email",
      type: "email",
      label: "Email",
      icon: <Mail size={18} />,
      description: "Email address",
      color: "green",
      category: "basic",
    },
    {
      id: "number",
      type: "number",
      label: "Number",
      icon: <Hash size={18} />,
      description: "Numeric input",
      color: "purple",
      category: "basic",
    },
    {
      id: "date",
      type: "date",
      label: "Date",
      icon: <Calendar size={18} />,
      description: "Date picker",
      color: "orange",
      category: "basic",
    },
    {
      id: "textarea",
      type: "textarea",
      label: "Textarea",
      icon: <FileText size={18} />,
      description: "Multi-line text",
      color: "indigo",
      category: "basic",
    },
    {
      id: "select",
      type: "select",
      label: "Dropdown",
      icon: <List size={18} />,
      description: "Select option",
      color: "pink",
      category: "basic",
    },
    {
      id: "radio",
      type: "radio",
      label: "Radio",
      icon: <Radio size={18} />,
      description: "Single choice",
      color: "teal",
      category: "basic",
    },
    {
      id: "checkbox",
      type: "checkbox",
      label: "Checkbox",
      icon: <CheckSquare size={18} />,
      description: "Multiple choice",
      color: "cyan",
      category: "basic",
    },
    {
      id: "file",
      type: "file",
      label: "File Upload",
      icon: <FileText size={18} />,
      description: "Upload files",
      color: "amber",
      category: "basic",
    },
    {
      id: "image",
      type: "image",
      label: "Image Upload",
      icon: <ImageIcon size={18} />,
      description: "Upload images",
      color: "rose",
      category: "basic",
    },
    {
      id: "button",
      type: "button",
      label: "Button",
      icon: <MousePointerClick size={18} />,
      description: "Action button",
      color: "gray",
      category: "basic",
    },

    // --- PERSONAL INFORMATION ---
    {
      id: "firstname",
      type: "text",
      label: "First Name",
      icon: <User size={18} />,
      description: "User's first name",
      color: "blue",
      category: "personal",
      defaultLabel: "First Name",
      defaultName: "first_name",
      defaultPlaceholder: "Enter first name",
    },
    {
      id: "lastname",
      type: "text",
      label: "Last Name",
      icon: <User size={18} />,
      description: "User's last name",
      color: "blue",
      category: "personal",
      defaultLabel: "Last Name",
      defaultName: "last_name",
      defaultPlaceholder: "Enter last name",
    },
    {
      id: "fullname",
      type: "text",
      label: "Full Name",
      icon: <User size={18} />,
      description: "User's full name",
      color: "blue",
      category: "personal",
      defaultLabel: "Full Name",
      defaultName: "full_name",
      defaultPlaceholder: "Enter full name",
    },
    {
      id: "username",
      type: "text",
      label: "Username",
      icon: <User size={18} />,
      description: "User's username",
      color: "purple",
      category: "personal",
      defaultLabel: "Username",
      defaultName: "username",
      defaultPlaceholder: "Enter username",
    },
    {
      id: "phone",
      type: "text", // Using text for phone to allow formatting
      label: "Phone Number",
      icon: <Phone size={18} />,
      description: "Contact phone",
      color: "green",
      category: "personal",
      defaultLabel: "Phone Number",
      defaultName: "phone_number",
      defaultPlaceholder: "+1 (555) 000-0000",
    },
    {
      id: "id_number",
      type: "text",
      label: "ID Number",
      icon: <Badge size={18} />,
      description: "Identification number",
      color: "indigo",
      category: "personal",
      defaultLabel: "ID Number",
      defaultName: "id_number",
      defaultPlaceholder: "Enter ID number",
    },

    // --- PROFESSIONAL ---
    {
      id: "company",
      type: "text",
      label: "Company",
      icon: <Building2 size={18} />,
      description: "Company name",
      color: "cyan",
      category: "professional",
      defaultLabel: "Company",
      defaultName: "company",
      defaultPlaceholder: "Enter company name",
    },
    {
      id: "job_title",
      type: "text",
      label: "Job Title",
      icon: <Briefcase size={18} />,
      description: "Job role/title",
      color: "amber",
      category: "professional",
      defaultLabel: "Job Title",
      defaultName: "job_title",
      defaultPlaceholder: "Enter job title",
    },
    {
      id: "positions",
      type: "text",
      label: "Positions",
      icon: <Briefcase size={18} />,
      description: "Current positions",
      color: "amber",
      category: "professional",
      defaultLabel: "Positions",
      defaultName: "positions",
      defaultPlaceholder: "Enter positions",
    },

    // --- STATIC ELEMENTS ---
    {
      id: "table",
      type: "table",
      label: "Table",
      icon: <Table size={18} />,
      description: "Data table",
      color: "indigo",
      category: "basic",
      defaultLabel: "Table",
      defaultName: "table",
    },
    {
      id: "divider",
      type: "divider",
      label: "Divider",
      icon: <Minus size={18} />,
      description: "Horizontal divider line",
      color: "gray",
      category: "basic",
      defaultLabel: "Divider",
      defaultName: "divider",
    },
    {
      id: "heading",
      type: "heading",
      label: "Heading",
      icon: <Heading size={18} />,
      description: "Text heading",
      color: "blue",
      category: "basic",
      defaultLabel: "Heading",
      defaultName: "heading",
      defaultPlaceholder: "Enter heading text",
    },
    {
      id: "paragraph",
      type: "paragraph",
      label: "Paragraph",
      icon: <AlignLeft size={18} />,
      description: "Text paragraph",
      color: "gray",
      category: "basic",
      defaultLabel: "Paragraph",
      defaultName: "paragraph",
      defaultPlaceholder: "Enter paragraph text",
    },
    {
      id: "spacer",
      type: "spacer",
      label: "Spacer",
      icon: <Space size={18} />,
      description: "Vertical spacing",
      color: "gray",
      category: "basic",
      defaultLabel: "Spacer",
      defaultName: "spacer",
    },
  ];

  interface FieldButtonProps {
    preset: (typeof fieldPresets)[0];
    onAdd: (field: CustomFormField) => void;
    colorClasses: Record<string, string>;
  }

  const FieldButton: React.FC<FieldButtonProps> = ({
    preset,
    onAdd,
    colorClasses,
  }) => {
    const {
      type,
      label,
      icon,
      description,
      color,
      defaultLabel,
      defaultName,
      defaultPlaceholder,
    } = preset;

    const createField = (): CustomFormField => ({
      id: `${type}-${Date.now()}`,
      type,
      label: defaultLabel || label,
      name: defaultName || `${type}_${Date.now()}`,
      required: false,
      unique: false,
      placeholder:
        defaultPlaceholder ||
        (type === "email"
          ? "example@email.com"
          : type === "number"
          ? "Enter a number"
          : `Enter ${label.toLowerCase()}`),
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
      ...(type === "table"
        ? {
            tableData: {
              columns: [
                { header: "Column 1", key: "col1" },
                { header: "Column 2", key: "col2" },
              ],
              rows: [
                { col1: "Row 1, Col 1", col2: "Row 1, Col 2" },
                { col1: "Row 2, Col 1", col2: "Row 2, Col 2" },
              ],
            },
          }
        : {}),
      ...(type === "heading" || type === "paragraph"
        ? { content: defaultPlaceholder || "Enter text here" }
        : {}),
      ...(type === "spacer" ? { height: "20px" } : {}),
    });

    const dragId = `palette-${preset.id}`;
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: dragId,
        data: {
          type: "palette-item",
          preset,
          createField,
        },
      });

    const style = transform
      ? {
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.5 : 1,
        }
      : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <button
          onClick={() => {
            onAdd(createField());
          }}
          className={`flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-400 transition-all text-center group ${colorClasses[color]} w-full`}
        >
          <div className="text-gray-600 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span className="text-xs font-medium text-gray-700 block">
            {label}
          </span>
        </button>
      </div>
    );
  };

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

  // Filter presets based on category and search
  const filteredPresets = fieldPresets.filter((preset) => {
    const matchesCategory =
      activeCategory === "all" ||
      activeCategory === "layout" ||
      preset.category === activeCategory ||
      (!preset.category && activeCategory === "basic");
    const matchesSearch =
      searchQuery === "" ||
      preset.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={14}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveCategory("layout")}
          className={`px-2 py-1 text-xs font-medium transition-colors border-b-2 ${
            activeCategory === "layout"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Layout
        </button>
        <button
          onClick={() => setActiveCategory("basic")}
          className={`px-2 py-1 text-xs font-medium transition-colors border-b-2 ${
            activeCategory === "basic"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Fields
        </button>
        <button
          onClick={() => setActiveCategory("personal")}
          className={`px-2 py-1 text-xs font-medium transition-colors border-b-2 ${
            activeCategory === "personal"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Personal
        </button>
        <button
          onClick={() => setActiveCategory("professional")}
          className={`px-2 py-1 text-xs font-medium transition-colors border-b-2 ${
            activeCategory === "professional"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Professional
        </button>
      </div>

      {/* Layout Elements Section */}
      {activeCategory === "layout" && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Structure
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const newContainer: CustomFormField = {
                  id: `container-${Date.now()}`,
                  type: "text",
                  label: "Container",
                  name: `container_${Date.now()}`,
                  required: false,
                  unique: false,
                  containerType: "container",
                  children: [],
                  layoutProps: {
                    gap: "16px",
                    padding: "16px",
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                    flexDirection: "column",
                  },
                };
                onAddField(newContainer);
              }}
              className="flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-purple-400 transition-all text-center group"
            >
              <Square className="text-purple-600" size={16} />
              <span className="text-xs font-medium text-gray-700">
                Container
              </span>
            </button>
            <button
              onClick={() => {
                const newRow: CustomFormField = {
                  id: `row-${Date.now()}`,
                  type: "text",
                  label: "Row",
                  name: `row_${Date.now()}`,
                  required: false,
                  unique: false,
                  containerType: "row",
                  children: [],
                  layoutProps: {
                    gap: "16px",
                    padding: "12px",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  },
                };
                onAddField(newRow);
              }}
              className="flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-400 transition-all text-center group"
            >
              <LayoutGrid className="text-blue-600" size={16} />
              <span className="text-xs font-medium text-gray-700">Row</span>
            </button>
            <button
              onClick={() => {
                const newColumn: CustomFormField = {
                  id: `column-${Date.now()}`,
                  type: "text",
                  label: "Column",
                  name: `column_${Date.now()}`,
                  required: false,
                  unique: false,
                  containerType: "column",
                  children: [],
                  layoutProps: {
                    gap: "12px",
                    padding: "12px",
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                    flexDirection: "column",
                  },
                };
                onAddField(newColumn);
              }}
              className="flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-indigo-400 transition-all text-center group"
            >
              <Columns2 className="text-indigo-600" size={16} />
              <span className="text-xs font-medium text-gray-700">Column</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Fields Section */}
      {activeCategory !== "layout" && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {activeCategory === "basic"
              ? "Fields"
              : activeCategory === "personal"
              ? "Personal Information"
              : "Professional Options"}
          </h4>
          {filteredPresets.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-xs">
              <p>No fields found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {filteredPresets.map((preset) => (
                <FieldButton
                  key={preset.id}
                  preset={preset}
                  onAdd={onAddField}
                  colorClasses={colorClasses}
                />
              ))}
            </div>
          )}
        </div>
      )}
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

// -------------------- DEFAULT FIELDS (Complex Master Form) --------------------
const DEFAULT_FORM_FIELDS: CustomFormField[] = [
  {
    id: "heading-main",
    type: "heading",
    label: "Complex Master Form",
    name: "form_title",
    required: false,
    unique: false,
    content: "Complex Master Form",
    fieldStyle: { fontSize: "24px", fontWeight: "bold", marginBottom: "10px" },
  },
  {
    id: "desc-main",
    type: "paragraph",
    label: "Description",
    name: "form_desc",
    required: false,
    unique: false,
    content: "Use a permanent address where you can receive mail.",
    fieldStyle: { textColor: "#6b7280", marginBottom: "20px" },
  },
  {
    id: "container-name",
    type: "container",
    containerType: "row",
    label: "Name Container",
    name: "name_container",
    required: false,
    unique: false,
    children: ["first_name", "last_name"],
    layoutProps: { gap: "16px", flexWrap: "wrap", marginBottom: "16px" },
  },
  {
    id: "first_name",
    type: "text",
    label: "First name",
    name: "first_name",
    required: true,
    unique: false,
    placeholder: "",
    bootstrapClass: "col-md-6",
  },
  {
    id: "last_name",
    type: "text",
    label: "Last name",
    name: "last_name",
    required: true,
    unique: false,
    placeholder: "",
    bootstrapClass: "col-md-6",
  },
  {
    id: "email",
    type: "email",
    label: "Email address",
    name: "email",
    required: true,
    unique: true,
    placeholder: "",
    fieldStyle: { marginBottom: "16px" },
  },
  {
    id: "country_region_1",
    type: "select",
    label: "Country / Region",
    name: "country_region_1",
    required: false,
    unique: false,
    placeholder: "Enter country name",
    options: [
      { label: "United States", value: "us" },
      { label: "Canada", value: "ca" },
      { label: "Mexico", value: "mx" },
    ],
    fieldStyle: { marginBottom: "24px" },
  },
  {
    id: "heading-sub",
    type: "heading",
    label: "Subheader",
    name: "subheader",
    required: false,
    unique: false,
    content: "Subheader inside the form",
    fieldStyle: { fontSize: "20px", fontWeight: "bold", marginBottom: "10px" },
  },
  {
    id: "desc-sub",
    type: "paragraph",
    label: "Sub Description",
    name: "sub_desc",
    required: false,
    unique: false,
    content: "Use a permanent address where you can receive mail.",
    fieldStyle: { textColor: "#6b7280", marginBottom: "20px" },
  },
  {
    id: "street_address",
    type: "text",
    label: "Street address",
    name: "street_address",
    required: false,
    unique: false,
    placeholder: "",
    fieldStyle: { marginBottom: "16px" },
  },
  {
    id: "container-location",
    type: "container",
    containerType: "row",
    label: "Location Container",
    name: "location_container",
    required: false,
    unique: false,
    children: ["city", "state", "zip"],
    layoutProps: { gap: "16px", flexWrap: "wrap", marginBottom: "16px" },
  },
  {
    id: "city",
    type: "text",
    label: "City",
    name: "city",
    required: false,
    unique: false,
    placeholder: "",
    bootstrapClass: "col-md-4",
  },
  {
    id: "state",
    type: "text",
    label: "State / Province",
    name: "state",
    required: false,
    unique: false,
    placeholder: "",
    bootstrapClass: "col-md-4",
  },
  {
    id: "zip",
    type: "text",
    label: "ZIP / Postal",
    name: "zip",
    required: false,
    unique: false,
    placeholder: "",
    bootstrapClass: "col-md-4",
  },
  {
    id: "container-countries",
    type: "container",
    containerType: "row",
    label: "Countries Container",
    name: "countries_container",
    required: false,
    unique: false,
    children: ["country_2", "country_3", "country_4"],
    layoutProps: { gap: "16px", flexWrap: "wrap", marginBottom: "16px" },
  },
  {
    id: "country_2",
    type: "select",
    label: "Country / Region",
    name: "country_2",
    required: false,
    unique: false,
    placeholder: "Enter country name",
    bootstrapClass: "col-md-4",
  },
  {
    id: "country_3",
    type: "select",
    label: "Country / Region",
    name: "country_3",
    required: false,
    unique: false,
    placeholder: "Enter country name",
    bootstrapClass: "col-md-4",
  },
  {
    id: "country_4",
    type: "select",
    label: "Country / Region",
    name: "country_4",
    required: false,
    unique: false,
    placeholder: "Enter country name",
    bootstrapClass: "col-md-4",
  },
  {
    id: "website",
    type: "text",
    label: "Website",
    name: "website",
    required: false,
    unique: false,
    placeholder: "https://www.example.com",
    fieldStyle: { marginBottom: "16px" },
  },
  {
    id: "about",
    type: "textarea",
    label: "About",
    name: "about",
    required: false,
    unique: false,
    placeholder: "you@example.com",
    description: "",
    fieldStyle: { marginBottom: "16px" },
  },
  {
    id: "photo",
    type: "image",
    label: "Photo",
    name: "photo",
    required: false,
    unique: false,
    buttonText: "Upload",
    fieldStyle: { marginBottom: "24px" },
  },
  {
    id: "heading-notifications",
    type: "heading",
    label: "Notifications",
    name: "notifications_heading",
    required: false,
    unique: false,
    content: "Notifications",
    fieldStyle: { fontSize: "20px", fontWeight: "bold", marginBottom: "10px" },
  },
  {
    id: "desc-notifications",
    type: "paragraph",
    label: "Notifications Desc",
    name: "notifications_desc",
    required: false,
    unique: false,
    content: "Use a permanent address where you can receive mail.",
    fieldStyle: { textColor: "#6b7280", marginBottom: "20px" },
  },
  {
    id: "email_notifs_label",
    type: "heading",
    label: "By Email",
    name: "by_email",
    required: false,
    unique: false,
    content: "By Email",
    fieldStyle: {
      fontSize: "16px",
      fontWeight: "bold",
      marginBottom: "10px",
      marginTop: "10px",
    },
  },
  {
    id: "comments",
    type: "checkbox",
    label: "",
    name: "comments",
    required: false,
    unique: false,
    options: [{ label: "Comments", value: "comments" }],
    description: "Get notified when someones posts a comment on a posting.",
    fieldStyle: { marginBottom: "12px" },
  },
  {
    id: "candidates",
    type: "checkbox",
    label: "",
    name: "candidates",
    required: false,
    unique: false,
    options: [{ label: "Candidates", value: "candidates" }],
    description: "Get notified when a candidate applies for a job.",
    fieldStyle: { marginBottom: "12px" },
  },
  {
    id: "offers",
    type: "checkbox",
    label: "",
    name: "offers",
    required: false,
    unique: false,
    options: [{ label: "Offers", value: "offers" }],
    description: "Get notified when a candidate accepts or rejects an offer.",
    fieldStyle: { marginBottom: "24px" },
  },
  {
    id: "push_notifs_label",
    type: "heading",
    label: "Push Notifications",
    name: "push_notifications",
    required: false,
    unique: false,
    content: "Push Notifications",
    fieldStyle: { fontSize: "16px", fontWeight: "bold", marginBottom: "10px" },
  },
  {
    id: "push_desc",
    type: "paragraph",
    label: "Push Desc",
    name: "push_desc",
    required: false,
    unique: false,
    content: "These are delivered via SMS to your mobile phone.",
    fieldStyle: { textColor: "#6b7280", marginBottom: "10px" },
  },
  {
    id: "push_settings",
    type: "radio",
    label: "", // Hide label as options are self-explanatory
    name: "push_settings",
    required: false,
    unique: false,
    options: [
      { label: "Everything", value: "everything" },
      { label: "Same as email", value: "same_as_email" },
      { label: "No push notifications", value: "no_push" },
    ],
    fieldStyle: { marginBottom: "24px" },
  },
  {
    id: "save_button",
    type: "button",
    label: "Save Button",
    name: "save",
    required: false,
    unique: false,
    buttonText: "Save",
    buttonType: "submit",
    fieldStyle: { width: "100%", marginTop: "10px" },
  },
];

const CustomFormBuilder: React.FC<CustomFormBuilderProps> = ({
  initialFields = [],
  initialBannerImage = null,
  initialTheme,
  onSave,
  onClose,
}) => {
  const [fields, setFields] = useState<CustomFormField[]>(
    initialFields.length > 0 ? initialFields : DEFAULT_FORM_FIELDS
  );
  const [editingField, setEditingField] = useState<CustomFormField | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isDeleteFieldModalOpen, setIsDeleteFieldModalOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonEditorContent, setJsonEditorContent] = useState("");
  const [showJsonMenu, setShowJsonMenu] = useState(false);
  const [bannerImage, setBannerImage] = useState<File | string | null>(
    initialBannerImage
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    typeof initialBannerImage === "string" ? initialBannerImage : null
  );
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Logo states
  const [logoImage, setLogoImage] = useState<File | string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedPreset, setDraggedPreset] = useState<any>(null);

  const handleDragStart = (event: { active: any }) => {
    setActiveId(event.active.id);
    if (event.active.data?.current?.type === "palette-item") {
      setDraggedPreset(event.active.data.current.preset);
    }
    document.body.style.cursor = "grabbing";
  };

  const handleDragEnd = (event: { active: any; over: any }) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedPreset(null);

    // Reset cursor and remove highlights
    document.body.style.cursor = "";
    document.querySelectorAll("[data-field-id]").forEach((el) => {
      el.classList.remove("ring-2", "ring-blue-400");
    });
    document.querySelectorAll("[data-container-id]").forEach((el) => {
      el.classList.remove("ring-2", "ring-purple-400", "bg-purple-100");
    });
    document.querySelectorAll("[data-drop-zone]").forEach((el) => {
      el.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
    });

    if (!over) {
      // If dropped outside, check if it's from palette - add to end of fields
      if (active.data?.current?.type === "palette-item") {
        const newField = active.data.current.createField();
        setFields([...fields, newField]);
      }
      return;
    }

    // Handle drag from palette
    if (active.data?.current?.type === "palette-item") {
      const newField = active.data.current.createField();

      // Check if dropped into a container
      const containerField = fields.find(
        (f) => f.id === over.id && f.containerType
      );

      if (containerField) {
        // Add to container
        setFields((items) => {
          const updatedItems = items.map((item) => {
            if (item.id === containerField.id) {
              const newChildren = [...(item.children || []), newField.id];

              // If it's a column container, auto-calculate Bootstrap classes for equal width
              if (
                containerField.containerType === "column" &&
                newChildren.length > 0
              ) {
                // Calculate Bootstrap class based on number of children
                // For 2 fields: col-6, for 3: col-4, for 4: col-3, etc.
                const childCount = newChildren.length;
                let bootstrapClass = "";
                if (childCount === 1) {
                  bootstrapClass = "col-12";
                } else if (childCount === 2) {
                  bootstrapClass = "col-6";
                } else if (childCount === 3) {
                  bootstrapClass = "col-4";
                } else if (childCount === 4) {
                  bootstrapClass = "col-3";
                } else if (childCount <= 6) {
                  bootstrapClass = "col-2";
                } else {
                  bootstrapClass = "col-1";
                }

                // Update all children in this container with the calculated class
                return {
                  ...item,
                  children: newChildren,
                };
              }

              return {
                ...item,
                children: newChildren,
              };
            }
            return item;
          });

          // If column container, update all children with equal width Bootstrap classes
          if (containerField.containerType === "column") {
            const containerItem = updatedItems.find(
              (item) => item.id === containerField.id
            );
            if (containerItem && containerItem.children) {
              const childCount = containerItem.children.length;
              let bootstrapClass = "";
              if (childCount === 1) {
                bootstrapClass = "col-12";
              } else if (childCount === 2) {
                bootstrapClass = "col-6";
              } else if (childCount === 3) {
                bootstrapClass = "col-4";
              } else if (childCount === 4) {
                bootstrapClass = "col-3";
              } else if (childCount <= 6) {
                bootstrapClass = "col-2";
              } else {
                bootstrapClass = "col-1";
              }

              // Update all children with the calculated Bootstrap class
              return updatedItems.map((item) => {
                if (containerItem.children?.includes(item.id)) {
                  return {
                    ...item,
                    bootstrapClass: item.bootstrapClass || bootstrapClass, // Keep existing if set
                  };
                }
                return item;
              });
            }
          }

          return updatedItems;
        });
        // Add the new field to fields array
        setFields((prev) => [...prev, newField]);
        return;
      }

      // Check if dropped on a field that's inside a container
      const parentContainer = fields.find(
        (f) => f.containerType && f.children?.includes(over.id)
      );

      if (parentContainer) {
        const targetIndex = parentContainer.children?.indexOf(over.id) ?? -1;
        setFields((items) =>
          items.map((item) => {
            if (item.id === parentContainer.id) {
              const newChildren = [...(item.children || [])];
              if (targetIndex >= 0) {
                newChildren.splice(targetIndex, 0, newField.id);
              } else {
                newChildren.push(newField.id);
              }
              return { ...item, children: newChildren };
            }
            return item;
          })
        );
        setFields((prev) => [...prev, newField]);
        return;
      }

      // Drop on main canvas - add after the target field or at end
      const targetIndex = fields.findIndex((f) => f.id === over.id);
      if (targetIndex >= 0) {
        setFields((prev) => {
          const newFields = [...prev];
          newFields.splice(targetIndex + 1, 0, newField);
          return newFields;
        });
      } else {
        setFields([...fields, newField]);
      }
      return;
    }

    // Handle existing field drag
    const draggedField = fields.find((f) => f.id === active.id);
    if (!draggedField) return;

    // Check if dropped into a container
    const containerField = fields.find(
      (f) => f.id === over.id && f.containerType
    );

    if (containerField) {
      // Add field to container's children
      setFields((items) => {
        // Remove from any existing container
        const updatedItems = items.map((item) => {
          if (item.containerType && item.children?.includes(active.id)) {
            return {
              ...item,
              children: item.children?.filter((id) => id !== active.id) || [],
            };
          }
          return item;
        });

        // Add to new container and auto-resize if column
        const withNewChild = updatedItems.map((item) => {
          if (item.id === containerField.id) {
            return {
              ...item,
              children: [...(item.children || []), active.id],
            };
          }
          return item;
        });

        // If column container, auto-calculate Bootstrap classes for equal width
        if (containerField.containerType === "column") {
          const containerItem = withNewChild.find(
            (item) => item.id === containerField.id
          );
          if (containerItem && containerItem.children) {
            const childCount = containerItem.children.length;
            let bootstrapClass = "";
            if (childCount === 1) {
              bootstrapClass = "col-12";
            } else if (childCount === 2) {
              bootstrapClass = "col-6";
            } else if (childCount === 3) {
              bootstrapClass = "col-4";
            } else if (childCount === 4) {
              bootstrapClass = "col-3";
            } else if (childCount <= 6) {
              bootstrapClass = "col-2";
            } else {
              bootstrapClass = "col-1";
            }

            // Update all children with the calculated Bootstrap class (keep existing if set)
            return withNewChild.map((item) => {
              if (containerItem.children?.includes(item.id)) {
                return {
                  ...item,
                  bootstrapClass: item.bootstrapClass || bootstrapClass,
                };
              }
              return item;
            });
          }
        }

        return withNewChild;
      });
      return;
    }

    // Check if dropped on another field (reordering)
    if (over.id !== active.id) {
      const targetField = fields.find((f) => f.id === over.id);

      // If target is inside a container, add dragged field to same container
      const parentContainer = fields.find(
        (f) => f.containerType && f.children?.includes(over.id)
      );

      if (parentContainer) {
        setFields((items) => {
          // Remove from any existing container
          const updatedItems = items.map((item) => {
            if (item.containerType && item.children?.includes(active.id)) {
              return {
                ...item,
                children: item.children?.filter((id) => id !== active.id) || [],
              };
            }
            return item;
          });

          // Add to parent container
          return updatedItems.map((item) => {
            if (item.id === parentContainer.id) {
              const currentChildren = item.children || [];
              const targetIndex = currentChildren.indexOf(over.id);
              const newChildren = [...currentChildren];
              if (targetIndex >= 0) {
                newChildren.splice(targetIndex, 0, active.id);
              } else {
                newChildren.push(active.id);
              }
              return {
                ...item,
                children: newChildren,
              };
            }
            return item;
          });
        });
        return;
      }

      // Regular reordering at top level
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddField = (field: CustomFormField) => {
    // Simply add the field that was passed in (it's already configured from FieldPalette)
    setFields([...fields, field]);
  };

  const handleUpdateField = (updatedField: CustomFormField) => {
    setFields((prev) =>
      prev.map((field) => (field.id === updatedField.id ? updatedField : field))
    );
    setEditingField(null);
  };

  const handleDeleteField = (id: string) => {
    setFieldToDelete(id);
    setIsDeleteFieldModalOpen(true);
  };

  const confirmDeleteField = () => {
    if (!fieldToDelete) return;

    setFields((prev) => {
      // Remove the field and also remove it from any container's children
      return prev
        .filter((field) => field.id !== fieldToDelete)
        .map((field) => {
          if (field.containerType && field.children?.includes(fieldToDelete)) {
            return {
              ...field,
              children: field.children.filter((childId) => childId !== fieldToDelete),
            };
          }
          return field;
        });
    });

    setIsDeleteFieldModalOpen(false);
    setFieldToDelete(null);
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

  const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setLogoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setTheme((prev) => ({
          ...prev,
          logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoImage(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
    setTheme((prev) => ({
      ...prev,
      logo: null,
    }));
  };

  const handleSave = () => {
    if (fields.length === 0) {
      alert("Please add at least one field before saving.");
      return;
    }
    onSave(fields, bannerImage || undefined, theme);
  };

  // Close JSON menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showJsonMenu &&
        !(event.target as HTMLElement).closest(".json-menu-container")
      ) {
        setShowJsonMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showJsonMenu]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(event) => {
        const overId = event.over?.id;
        if (overId) {
          document.querySelectorAll("[data-drop-zone]").forEach((el) => {
            el.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
          });
          document.querySelectorAll("[data-container-id]").forEach((el) => {
            el.classList.remove("ring-2", "ring-purple-400", "bg-purple-100");
          });

          const dropZone = document.querySelector(
            `[data-drop-zone="${overId}"]`
          );
          const container = document.querySelector(
            `[data-container-id="${overId}"]`
          );

          if (dropZone) {
            (dropZone as HTMLElement).classList.add(
              "ring-2",
              "ring-blue-400",
              "bg-blue-50"
            );
          }
          if (container) {
            (container as HTMLElement).classList.add(
              "ring-2",
              "ring-purple-400",
              "bg-purple-100"
            );
          }
        }
      }}
    >
      <div className="flex h-full bg-gray-50">
        {/* Left Sidebar - Components Panel (FormEngine-like) */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b bg-gray-50 shrink-0">
            <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Components
            </h3>
            <FieldPalette onAddField={handleAddField} />
          </div>
        </div>

        {/* Main Builder Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Custom Form Builder
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Drag & drop fields, configure settings, and preview your form
              </p>
            </div>
            <div className="flex gap-2">
              {/* JSON Menu Button */}
              <div className="relative json-menu-container">
                <button
                  onClick={() => setShowJsonMenu(!showJsonMenu)}
                  className="px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors flex items-center gap-2 bg-white"
                  title="JSON Operations"
                >
                  <Code size={16} />
                  JSON
                </button>
                {showJsonMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        const formData = {
                          version: "1.0",
                          fields: fields,
                          theme: theme,
                          bannerImage:
                            bannerImage instanceof File ? null : bannerImage, // Can't serialize File
                          exportedAt: new Date().toISOString(),
                        };
                        const jsonStr = JSON.stringify(formData, null, 2);
                        const blob = new Blob([jsonStr], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `form-template-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        setShowJsonMenu(false);
                        alert("Form exported as JSON!");
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Download size={16} />
                      Download JSON
                    </button>
                    <button
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "application/json";
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const jsonData = JSON.parse(
                                  event.target?.result as string
                                );
                                if (jsonData.fields) {
                                  setFields(jsonData.fields);
                                }
                                if (jsonData.theme) {
                                  setTheme(jsonData.theme);
                                }
                                if (jsonData.bannerImage) {
                                  setBannerImage(jsonData.bannerImage);
                                  setBannerPreview(jsonData.bannerImage);
                                }
                                if (jsonData.theme?.logo) {
                                  setLogoPreview(jsonData.theme.logo);
                                }
                                setShowJsonMenu(false);
                                alert("Form imported successfully!");
                              } catch (error) {
                                alert(
                                  "Error importing form: Invalid JSON file"
                                );
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        input.click();
                        setShowJsonMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Upload size={16} />
                      Upload JSON
                    </button>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        const formData = {
                          version: "1.0",
                          fields: fields,
                          theme: theme,
                          bannerImage:
                            bannerImage instanceof File ? null : bannerImage,
                          exportedAt: new Date().toISOString(),
                        };
                        setJsonEditorContent(JSON.stringify(formData, null, 2));
                        setShowJsonEditor(true);
                        setShowJsonMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Code size={16} />
                      Edit JSON
                    </button>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        const formData = {
                          version: "1.0",
                          fields: fields,
                          theme: theme,
                          bannerImage:
                            bannerImage instanceof File ? null : bannerImage,
                          exportedAt: new Date().toISOString(),
                        };
                        const jsonStr = JSON.stringify(formData, null, 2);
                        navigator.clipboard
                          .writeText(jsonStr)
                          .then(() => {
                            setShowJsonMenu(false);
                            alert("JSON copied to clipboard!");
                          })
                          .catch(() => {
                            alert("Failed to copy JSON to clipboard");
                          });
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Copy size={16} />
                      Copy JSON
                    </button>
                  </div>
                )}
              </div>
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
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
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
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                        Form Banner Image
                      </h3>
                      <p className="text-xs text-gray-500">
                        Upload a banner image to display at the top of your form
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {bannerPreview ? (
                      <div className="relative">
                        <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                          <img
                            src={bannerPreview}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={handleRemoveBanner}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                          title="Remove banner"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <ImageIcon className="w-8 h-8 mb-1 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>
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
                  </div>
                </div>

                {/* Logo Upload Section */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                        Form Logo
                      </h3>
                      <p className="text-xs text-gray-500">
                        Upload a logo to display in your form
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {logoPreview ? (
                      <div className="relative">
                        <div className="w-full h-20 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-full object-contain max-w-full"
                          />
                        </div>
                        <button
                          onClick={handleRemoveLogo}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                          title="Remove logo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>
                          </p>
                        </div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoImageChange}
                          className="hidden"
                        />
                      </label>
                    )}

                    {logoPreview && (
                      <div className="space-y-2">
                        {/* Logo Position */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Position
                          </label>
                          <select
                            value={theme.logoPosition || "center"}
                            onChange={(e) =>
                              setTheme((prev) => ({
                                ...prev,
                                logoPosition: e.target.value as
                                  | "left"
                                  | "center"
                                  | "right",
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>

                        {/* Logo Width */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Width
                          </label>
                          <input
                            type="text"
                            value={theme.logoWidth || "100px"}
                            onChange={(e) =>
                              setTheme((prev) => ({
                                ...prev,
                                logoWidth: e.target.value,
                              }))
                            }
                            placeholder="e.g., 100px, 50%, auto"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Logo Height */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Height
                          </label>
                          <input
                            type="text"
                            value={theme.logoHeight || "auto"}
                            onChange={(e) =>
                              setTheme((prev) => ({
                                ...prev,
                                logoHeight: e.target.value,
                              }))
                            }
                            placeholder="e.g., auto, 60px, 100%"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Canvas */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Form Canvas
                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {fields.length}{" "}
                        {fields.length === 1 ? "field" : "fields"}
                      </span>
                    </h3>
                    {fields.length > 0 && (
                      <button
                        onClick={() => setIsClearAllModalOpen(true)}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {fields.length === 0 ? (
                    <MainDropZone />
                  ) : (
                    <SortableContext
                      items={fields.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {fields.map((field, index) => {
                          // Get all child field IDs from all containers
                          const allChildIds = fields
                            .filter((f) => f.containerType && f.children)
                            .flatMap((f) => f.children || []);

                          // Skip rendering if this field is a child of a container
                          if (allChildIds.includes(field.id)) {
                            return null;
                          }

                          // If it's a container, render with droppable zone
                          if (field.containerType) {
                            const childFields = field.children
                              ? fields.filter((f) =>
                                  field.children?.includes(f.id)
                                )
                              : [];

                            return (
                              <div
                                key={field.id}
                                data-field-id={field.id}
                                className="relative group"
                              >
                                <div className="bg-white border-2 border-purple-300 rounded-lg p-3">
                                  <SortableFieldItem
                                    field={field}
                                    onEdit={setEditingField}
                                    onDelete={handleDeleteField}
                                  />
                                  <DroppableContainer
                                    containerId={field.id}
                                    isEmpty={childFields.length === 0}
                                    containerType={field.containerType}
                                  >
                                    <div
                                      className={`mt-3 ${
                                        field.containerType === "row"
                                          ? "flex flex-row gap-3"
                                          : "flex flex-col gap-3"
                                      }`}
                                      style={{
                                        gap: field.layoutProps?.gap || "16px",
                                        padding:
                                          field.layoutProps?.padding || "12px",
                                        backgroundColor:
                                          field.layoutProps?.backgroundColor ||
                                          "transparent",
                                        borderRadius:
                                          field.layoutProps?.borderRadius ||
                                          "8px",
                                        minHeight:
                                          childFields.length === 0
                                            ? "60px"
                                            : "auto",
                                      }}
                                    >
                                      {childFields.length > 0 ? (
                                        <SortableContext
                                          items={childFields.map((f) => f.id)}
                                          strategy={verticalListSortingStrategy}
                                        >
                                          {childFields.map((childField) => (
                                            <div
                                              key={childField.id}
                                              className="flex-1 min-w-0"
                                            >
                                              <SortableFieldItem
                                                field={childField}
                                                onEdit={setEditingField}
                                                onDelete={handleDeleteField}
                                                isInsideContainer={true}
                                              />
                                            </div>
                                          ))}
                                        </SortableContext>
                                      ) : (
                                        <div className="text-center py-4 text-gray-400 text-sm italic w-full">
                                          Drop fields here
                                        </div>
                                      )}
                                    </div>
                                  </DroppableContainer>
                                </div>
                              </div>
                            );
                          }

                          // Regular field
                          return (
                            <div
                              key={field.id}
                              data-field-id={field.id}
                              className="relative group"
                            >
                              {/* Drop indicator above */}
                              {index === 0 && (
                                <div className="h-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="h-full border-2 border-dashed border-blue-400 rounded bg-blue-50"></div>
                                </div>
                              )}
                              <SortableFieldItem
                                field={field}
                                onEdit={setEditingField}
                                onDelete={handleDeleteField}
                              />
                              {/* Drop indicator below */}
                              <div className="h-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="h-full border-2 border-dashed border-blue-400 rounded bg-blue-50"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </SortableContext>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeId && draggedPreset ? (
            <div className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-lg opacity-90 flex items-center gap-2">
              {draggedPreset.icon}
              <span className="text-sm font-medium text-gray-800">
                {draggedPreset.label}
              </span>
            </div>
          ) : activeId ? (
            <div className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-lg opacity-90">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-blue-600" />
                <span className="text-sm font-medium">Moving field...</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>

      {/* Theme Configuration Panel  */}

      {showThemePanel && (
        <ThemeConfigPanel
          theme={theme}
          onUpdate={setTheme}
          onClose={() => setShowThemePanel(false)}
        />
      )}

      {/* Configuration Panel  */}

      {editingField && (
        <FieldConfigPanel
          field={editingField}
          allFields={fields}
          onUpdate={handleUpdateField}
          onClose={() => setEditingField(null)}
        />
      )}

      {/* JSON Editor Modal */}
      {showJsonEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit Form JSON
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Edit the form data in JSON format. Changes will be applied
                  when you close this editor.
                </p>
              </div>
              <button
                onClick={() => setShowJsonEditor(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close JSON editor"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                value={jsonEditorContent}
                onChange={(e) => setJsonEditorContent(e.target.value)}
                className="w-full h-full font-mono text-sm border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Paste or edit JSON here..."
                spellCheck={false}
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowJsonEditor(false);
                  setJsonEditorContent("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  try {
                    const jsonData = JSON.parse(jsonEditorContent);
                    if (jsonData.fields) {
                      setFields(jsonData.fields);
                    }
                    if (jsonData.theme) {
                      setTheme(jsonData.theme);
                    }
                    if (jsonData.bannerImage) {
                      setBannerImage(jsonData.bannerImage);
                      setBannerPreview(jsonData.bannerImage);
                    }
                    if (jsonData.theme?.logo) {
                      setLogoPreview(jsonData.theme.logo);
                    }
                    setShowJsonEditor(false);
                    setJsonEditorContent("");
                    alert("Form updated from JSON successfully!");
                  } catch (error) {
                    alert(
                      `Error parsing JSON: ${
                        error instanceof Error
                          ? error.message
                          : "Invalid JSON format"
                      }`
                    );
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Field Confirmation Modal */}
      {isDeleteFieldModalOpen && fieldToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
          onClick={() => {
            setIsDeleteFieldModalOpen(false);
            setFieldToDelete(null);
          }}
        >
          <div
            className="bg-white p-6 rounded-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-gray-900">
              Delete field?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this field? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteFieldModalOpen(false);
                  setFieldToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteField}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Fields Confirmation Modal */}
      {isClearAllModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
          onClick={() => setIsClearAllModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-gray-900">
              Clear all fields?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to clear all fields? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setFields([]);
                  setIsClearAllModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
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
      <div className="sticky top-0 bg-linear-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200 flex justify-between items-center">
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
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(null);
  const [inlineParams, setInlineParams] = useState<Record<string, string>>({
    Name: "John Doe",
    Email: "john@example.com",
    Company: "Acme Corp",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // -------------------- VALIDATION & LOGIC --------------------

  const checkCondition = (condition: any, data: any) => {
    const fieldValue = data[condition.field];
    const targetValue = condition.value;
    if (fieldValue === undefined || fieldValue === null) return false;

    switch (condition.operator) {
      case "equals":
        return String(fieldValue) == targetValue;
      case "notEquals":
        return String(fieldValue) != targetValue;
      case "contains":
        return String(fieldValue).includes(targetValue);
      case "greaterThan":
        return Number(fieldValue) > Number(targetValue);
      case "lessThan":
        return Number(fieldValue) < Number(targetValue);
      default:
        return false;
    }
  };

  const isFieldVisible = (field: CustomFormField, data: any) => {
    if (!field.conditions || field.conditions.length === 0) return true;
    const hasShowAction = field.conditions.some((c) => c.action === "show");
    if (hasShowAction) {
      return field.conditions.some(
        (c) => c.action === "show" && checkCondition(c, data)
      );
    }
    const shouldHide = field.conditions.some(
      (c) => c.action === "hide" && checkCondition(c, data)
    );
    return !shouldHide;
  };

  const validateField = (field: CustomFormField, value: any): string | null => {
    if (!isFieldVisible(field, formData)) return null;
    if (
      field.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      return "This field is required";
    }
    if (value) {
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Invalid email address";
      if (
        field.validation?.min !== undefined &&
        Number(value) < field.validation.min
      )
        return `Min value: ${field.validation.min}`;
      if (
        field.validation?.max !== undefined &&
        Number(value) > field.validation.max
      )
        return `Max value: ${field.validation.max}`;
      if (
        field.validation?.minLength !== undefined &&
        String(value).length < field.validation.minLength
      )
        return `Min length: ${field.validation.minLength}`;
      if (
        field.validation?.maxLength !== undefined &&
        String(value).length > field.validation.maxLength
      )
        return `Max length: ${field.validation.maxLength}`;
      if (field.validation?.pattern) {
        try {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(String(value))) return "Invalid format";
        } catch (e) {}
      }
    }
    return null;
  };

  // Replace inline parameters in text (FormEngine-like)
  const replaceInlineParams = (text: string | undefined): string => {
    if (!text) return "";
    let result = text;
    Object.keys(inlineParams).forEach((key) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      result = result.replace(regex, inlineParams[key]);
    });
    return result;
  };

  // Execute event handlers (FormEngine-like)
  const executeEventHandler = (
    handler: string | undefined,
    fieldName: string,
    value?: any
  ) => {
    if (!handler) return;
    try {
      // Simple handler execution - in production, you'd want a more secure approach
      if (handler.includes("(")) {
        // Function call like "handleChange(value)"
        const funcName = handler.split("(")[0].trim();
        if (typeof (window as any)[funcName] === "function") {
          (window as any)[funcName](value, fieldName);
        } else {
          console.log(
            `Event handler "${handler}" called for field "${fieldName}" with value:`,
            value
          );
        }
      } else {
        // Simple function name
        if (typeof (window as any)[handler] === "function") {
          (window as any)[handler](value, fieldName);
        } else {
          console.log(
            `Event handler "${handler}" called for field "${fieldName}"`
          );
        }
      }
    } catch (error) {
      console.error("Error executing event handler:", error);
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      console.log("Form submitted:", formData);
      alert(
        "Form submitted successfully!\n" + JSON.stringify(formData, null, 2)
      );
    } else {
      alert("Please fix the errors in the form.");
    }
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
      ...(field.fieldStyle?.paddingTop
        ? { paddingTop: field.fieldStyle.paddingTop }
        : {}),
      ...(field.fieldStyle?.paddingRight
        ? { paddingRight: field.fieldStyle.paddingRight }
        : {}),
      ...(field.fieldStyle?.paddingBottom
        ? { paddingBottom: field.fieldStyle.paddingBottom }
        : {}),
      ...(field.fieldStyle?.paddingLeft
        ? { paddingLeft: field.fieldStyle.paddingLeft }
        : {}),
    };
    // Replace inline parameters
    const displayPlaceholder = replaceInlineParams(field.placeholder);

    const handleChange = (name: string, value: any) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      executeEventHandler(field.events?.onChange, name, value);
    };

    const commonProps = {
      id: field.id,
      name: field.name,
      placeholder: displayPlaceholder,
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
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={{
              ...fieldInputStyle,
              width: field.fieldStyle?.width || "100%",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputFocusBorderColor || "#3b82f6";
              e.currentTarget.style.backgroundColor =
                theme?.inputFocusBackgroundColor ||
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onFocus, field.name);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                field.fieldStyle?.borderColor ||
                theme?.inputBorderColor ||
                "#d1d5db";
              e.currentTarget.style.backgroundColor =
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onBlur, field.name);
            }}
            onClick={() =>
              executeEventHandler(field.events?.onClick, field.name)
            }
            className="w-full transition-all"
          />
        );
      case "textarea":
        return (
          <textarea
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
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
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onFocus, field.name);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                field.fieldStyle?.borderColor ||
                theme?.inputBorderColor ||
                "#d1d5db";
              e.currentTarget.style.backgroundColor =
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onBlur, field.name);
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
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={{
              ...fieldInputStyle,
              width: field.fieldStyle?.width || "100%",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputFocusBorderColor || "#3b82f6";
              e.currentTarget.style.backgroundColor =
                theme?.inputFocusBackgroundColor ||
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onFocus, field.name);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                field.fieldStyle?.borderColor ||
                theme?.inputBorderColor ||
                "#d1d5db";
              e.currentTarget.style.backgroundColor =
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onBlur, field.name);
            }}
            onClick={() =>
              executeEventHandler(field.events?.onClick, field.name)
            }
            className="w-full transition-all bg-white"
          >
            <option value="">
              {displayPlaceholder || "Select an option..."}
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {replaceInlineParams(opt.label)}
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
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onFocus={() =>
                    executeEventHandler(field.events?.onFocus, field.name)
                  }
                  onBlur={() =>
                    executeEventHandler(field.events?.onBlur, field.name)
                  }
                  onClick={() =>
                    executeEventHandler(field.events?.onClick, field.name)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {replaceInlineParams(opt.label)}
                </span>
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
                    handleChange(field.name, updated);
                  }}
                  onFocus={() =>
                    executeEventHandler(field.events?.onFocus, field.name)
                  }
                  onBlur={() =>
                    executeEventHandler(field.events?.onBlur, field.name)
                  }
                  onClick={() =>
                    executeEventHandler(field.events?.onClick, field.name)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {replaceInlineParams(opt.label)}
                </span>
              </label>
            ))}
          </div>
        );
      case "file":
      case "image":
        const fileValue = formData[field.name];
        const fileName =
          fileValue instanceof File
            ? fileValue.name
            : typeof fileValue === "string"
            ? fileValue.split("/").pop() || fileValue
            : "";

        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  ...fieldInputStyle,
                  cursor: "default",
                }}
              >
                {fileName || `No ${field.type} selected`}
              </div>
              <label
                className="px-4 py-2 border rounded-lg cursor-pointer text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                style={{
                  backgroundColor: theme?.buttonBackgroundColor || "#3b82f6",
                  color: theme?.buttonTextColor || "#ffffff",
                  borderColor: theme?.buttonBorderColor || "#3b82f6",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme?.buttonHoverBackgroundColor || "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme?.buttonBackgroundColor || "#3b82f6";
                }}
              >
                {field.type === "image" ? (
                  <ImageIcon size={16} />
                ) : (
                  <FileText size={16} />
                )}
                Choose {field.type === "image" ? "Image" : "File"}
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
                      // Store file object
                      handleChange(field.name, file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {fileName && (
                <button
                  type="button"
                  onClick={() => {
                    handleChange(field.name, null);
                    const input = document.querySelector(
                      `input[name="${field.name}"]`
                    ) as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                  className="px-3 py-2 border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {fileName && (
              <p className="text-xs text-gray-500 pl-1">
                {fileValue instanceof File && (
                  <>
                    {field.type === "image" ? "Image" : "File"}: {fileName} (
                    {(fileValue.size / 1024).toFixed(2)} KB)
                  </>
                )}
                {typeof fileValue === "string" && <>Selected: {fileName}</>}
              </p>
            )}
          </div>
        );
      case "button":
        return (
          <button
            type={field.buttonType || "button"}
            className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            {field.buttonText || "Button"}
          </button>
        );
      case "table":
        if (!field.tableData) {
          return <div className="text-gray-400 text-sm">No table data</div>;
        }
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  {field.tableData.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2 text-left border-b border-gray-300 font-semibold"
                      style={{ color: theme?.labelColor || "#374151" }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {field.tableData.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-200">
                    {field.tableData!.columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-4 py-2"
                        style={{ color: theme?.textColor || "#111827" }}
                      >
                        {row[col.key] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "divider":
        return (
          <hr
            className="my-4"
            style={{
              borderColor: theme?.formBorderColor || "#e5e7eb",
              borderWidth: "1px",
            }}
          />
        );
      case "heading":
        return (
          <h3
            className="font-bold"
            style={{
              color: theme?.headingColor || "#111827",
              fontSize: theme?.headingFontSize || "24px",
              fontWeight: theme?.headingFontWeight || "bold",
            }}
          >
            {replaceInlineParams(field.content || field.label || "Heading")}
          </h3>
        );
      case "paragraph":
        return (
          <p
            className="text-sm"
            style={{
              color: theme?.textColor || "#111827",
              fontSize: theme?.textFontSize || "16px",
            }}
          >
            {replaceInlineParams(
              field.content || field.label || "Paragraph text"
            )}
          </p>
        );
      case "spacer":
        return (
          <div
            style={{
              height: field.height || "20px",
              width: "100%",
            }}
          />
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

      {/* Logo */}
      {theme?.logo && (
        <div
          className="w-full py-4 flex"
          style={{
            justifyContent:
              theme.logoPosition === "left"
                ? "flex-start"
                : theme.logoPosition === "right"
                ? "flex-end"
                : "center",
            paddingLeft: theme.logoPosition === "left" ? "16px" : "0",
            paddingRight: theme.logoPosition === "right" ? "16px" : "0",
          }}
        >
          <img
            src={typeof theme.logo === "string" ? theme.logo : ""}
            alt="Form logo"
            style={{
              width: theme.logoWidth || "100px",
              height: theme.logoHeight || "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
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
          {(() => {
            // Calculate all child field IDs once to avoid duplicate rendering
            const allChildIds = new Set(
              fields
                .filter((f) => f.containerType && f.children)
                .flatMap((f) => f.children || [])
            );

            return fields.map((field) => {
              // Skip rendering if this field is a child of a container (it will be rendered inside its parent)
              if (allChildIds.has(field.id)) {
                return null;
              }

              // Check visibility
              if (!isFieldVisible(field, formData)) {
                return null;
              }

              // Render containers with their children
              if (field.containerType) {
                const isRowLayout = field.containerType === "row";
                const containerStyle: React.CSSProperties = {
                  display: "flex",
                  flexDirection: isRowLayout ? "row" : "column",
                  justifyContent:
                    field.layoutProps?.justifyContent || "flex-start",
                  alignItems:
                    field.layoutProps?.alignItems ||
                    (isRowLayout ? "flex-start" : "stretch"),
                  gap: field.layoutProps?.gap || "16px",
                  padding:
                    field.layoutProps?.padding || (isRowLayout ? "0" : "16px"),
                  margin: field.layoutProps?.margin || "0",
                  backgroundColor:
                    field.layoutProps?.backgroundColor || "transparent",
                  borderRadius: field.layoutProps?.borderRadius || "0px",
                  flexWrap:
                    field.layoutProps?.flexWrap ||
                    (isRowLayout ? "wrap" : "nowrap"),
                  width: "100%",
                };

                const childFields = field.children
                  ? fields.filter((f) => field.children?.includes(f.id))
                  : [];

                // For column containers, use Bootstrap grid if Bootstrap classes are set
                const isColumnContainer = field.containerType === "column";
                const hasBootstrapClasses = childFields.some(
                  (f) => f.bootstrapClass
                );

                // If column container with Bootstrap classes, use row wrapper
                const containerClassName =
                  isColumnContainer && hasBootstrapClasses ? "row" : "";

                // Always apply containerStyle for row containers, or if no Bootstrap classes
                const shouldApplyContainerStyle =
                  isRowLayout || !hasBootstrapClasses;

                return (
                  <div
                    key={field.id}
                    className={`w-full ${containerClassName}`}
                    style={
                      shouldApplyContainerStyle ? containerStyle : undefined
                    }
                  >
                    {childFields.length > 0 ? (
                      childFields.map((childField) => {
                        // Determine wrapper style/class based on container type and Bootstrap class
                        let fieldWrapperClassName = "";
                        let fieldWrapperStyle: React.CSSProperties = {};

                        // Apply per-field spacing so custom margins/paddings are respected
                        const fieldSpacing: React.CSSProperties = {
                          margin: childField.fieldStyle?.margin || undefined,
                          padding: childField.fieldStyle?.padding || undefined,
                          width: childField.fieldStyle?.width || "100%",
                          ...(childField.fieldStyle?.marginTop
                            ? { marginTop: childField.fieldStyle.marginTop }
                            : {}),
                          ...(childField.fieldStyle?.marginRight
                            ? { marginRight: childField.fieldStyle.marginRight }
                            : {}),
                          ...(childField.fieldStyle?.marginBottom
                            ? {
                                marginBottom:
                                  childField.fieldStyle.marginBottom,
                              }
                            : {}),
                          ...(childField.fieldStyle?.marginLeft
                            ? { marginLeft: childField.fieldStyle.marginLeft }
                            : {}),
                          ...(childField.fieldStyle?.paddingTop
                            ? { paddingTop: childField.fieldStyle.paddingTop }
                            : {}),
                          ...(childField.fieldStyle?.paddingRight
                            ? {
                                paddingRight:
                                  childField.fieldStyle.paddingRight,
                              }
                            : {}),
                          ...(childField.fieldStyle?.paddingBottom
                            ? {
                                paddingBottom:
                                  childField.fieldStyle.paddingBottom,
                              }
                            : {}),
                          ...(childField.fieldStyle?.paddingLeft
                            ? { paddingLeft: childField.fieldStyle.paddingLeft }
                            : {}),
                        };

                        if (isColumnContainer && childField.bootstrapClass) {
                          // Use Bootstrap class
                          fieldWrapperClassName = childField.bootstrapClass;
                          fieldWrapperStyle = {
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            ...fieldSpacing,
                          };
                        } else if (isRowLayout) {
                          // For row layouts without Bootstrap, use flex equal width
                          fieldWrapperStyle = {
                            flex: "1 1 0%",
                            minWidth: "0",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            ...fieldSpacing,
                          };
                        } else {
                          // Default column layout
                          fieldWrapperStyle = {
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            ...fieldSpacing,
                          };
                        }

                        return (
                          <div
                            key={childField.id}
                            className={fieldWrapperClassName}
                            style={fieldWrapperStyle}
                          >
                            <label
                              className="block font-semibold text-sm mb-1"
                              style={{
                                color:
                                  childField.fieldStyle?.labelColor ||
                                  theme?.labelColor ||
                                  "#374151",
                                fontSize: theme?.labelFontSize || "14px",
                                fontWeight: theme?.labelFontWeight || "600",
                              }}
                            >
                              {replaceInlineParams(childField.label)}
                              {childField.required && (
                                <span
                                  style={{
                                    color:
                                      theme?.requiredIndicatorColor ||
                                      "#ef4444",
                                    marginLeft: "4px",
                                  }}
                                >
                                  *
                                </span>
                              )}
                            </label>
                            <div style={{ width: "100%" }}>
                              {renderField(
                                childField,
                                {
                                  ...inputStyle,
                                  width: "100%",
                                },
                                theme
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm italic w-full">
                        Drop fields here
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={field.id}
                  className="space-y-2"
                  style={{
                    margin: field.fieldStyle?.margin || undefined,
                    padding: field.fieldStyle?.padding || undefined,
                    width: field.fieldStyle?.width || "100%",
                    ...(field.fieldStyle?.marginTop
                      ? { marginTop: field.fieldStyle.marginTop }
                      : {}),
                    ...(field.fieldStyle?.marginRight
                      ? { marginRight: field.fieldStyle.marginRight }
                      : {}),
                    ...(field.fieldStyle?.marginBottom
                      ? { marginBottom: field.fieldStyle.marginBottom }
                      : {}),
                    ...(field.fieldStyle?.marginLeft
                      ? { marginLeft: field.fieldStyle.marginLeft }
                      : {}),
                    ...(field.fieldStyle?.paddingTop
                      ? { paddingTop: field.fieldStyle.paddingTop }
                      : {}),
                    ...(field.fieldStyle?.paddingRight
                      ? { paddingRight: field.fieldStyle.paddingRight }
                      : {}),
                    ...(field.fieldStyle?.paddingBottom
                      ? { paddingBottom: field.fieldStyle.paddingBottom }
                      : {}),
                    ...(field.fieldStyle?.paddingLeft
                      ? { paddingLeft: field.fieldStyle.paddingLeft }
                      : {}),
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
                    {replaceInlineParams(field.label)}
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
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              );
            });
          })()}
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

      {/* Delete Field Confirmation Modal */}
      {isDeleteFieldModalOpen && fieldToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
          onClick={() => {
            setIsDeleteFieldModalOpen(false);
            setFieldToDelete(null);
          }}
        >
          <div
            className="bg-white p-6 rounded-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-gray-900">
              Delete field?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this field? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteFieldModalOpen(false);
                  setFieldToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteField}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFormBuilder;
