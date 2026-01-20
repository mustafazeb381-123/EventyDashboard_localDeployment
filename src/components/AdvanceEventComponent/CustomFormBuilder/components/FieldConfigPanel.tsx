import React, { useState } from "react";
import {
  X,
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
  Info,
  LayoutGrid,
  Columns2,
  Trash2,
  Plus,
  Layers,
  Palette,
  Zap,
  Code,
} from "lucide-react";
import type { CustomFormField, FieldType } from "../types";
import {
  makeFieldNameFromLabel,
  updateFieldLabelWithAutoProps,
} from "../utils/fieldAuto";

interface FieldConfigProps {
  field: CustomFormField | null;
  allFields: CustomFormField[];
  onUpdate: (field: CustomFormField) => void;
  onClose: () => void;
}

export const FieldConfigPanel: React.FC<FieldConfigProps> = ({
  field,
  allFields,
  onUpdate,
  onClose,
}) => {
  if (!field) return null;

  const [config, setConfig] = useState<CustomFormField>(field);

  const handleLabelChange = (nextLabel: string) => {
    setConfig((prev) => updateFieldLabelWithAutoProps(prev, nextLabel, allFields));
  };

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
      helperText: <Info size={18} />,
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

        {/* HELPER TEXT: Static text block */}
        {config.type === "helperText" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Content
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Helper Text
              </label>
              <textarea
                value={config.content || ""}
                onChange={(e) =>
                  setConfig({ ...config, content: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                rows={3}
                placeholder="Enter helper text"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Static text shown in the form (not an input).
              </p>
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
                onChange={(e) => handleLabelChange(e.target.value)}
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
                    name: makeFieldNameFromLabel(e.target.value),
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
                  onChange={(e) => handleLabelChange(e.target.value)}
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
                      name: makeFieldNameFromLabel(e.target.value),
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
                onChange={(e) => handleLabelChange(e.target.value)}
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
                    name: makeFieldNameFromLabel(e.target.value),
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

            <div>
              <label className="block text-sm font-medium mb-2">
                Alignment
              </label>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    onClick={() =>
                      setConfig({
                        ...config,
                        buttonAlignment: align as "left" | "center" | "right",
                      })
                    }
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                      (config.buttonAlignment || "left") === align
                        ? "bg-white shadow text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Width</label>
              <select
                value={config.buttonWidth || "auto"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    buttonWidth: e.target.value as "auto" | "full" | "custom",
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="auto">Auto (Content Width)</option>
                <option value="full">Full Width (100%)</option>
                <option value="custom">Custom Width</option>
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

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Margin
              </label>
              <input
                type="text"
                value={config.layoutProps?.margin || "0"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    layoutProps: {
                      ...config.layoutProps,
                      margin: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Flex Wrap
              </label>
              <select
                value={
                  config.layoutProps?.flexWrap ||
                  (config.containerType === "row" ? "wrap" : "nowrap")
                }
                onChange={(e) =>
                  setConfig({
                    ...config,
                    layoutProps: {
                      ...config.layoutProps,
                      flexWrap: e.target.value as "nowrap" | "wrap",
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="nowrap">No Wrap</option>
                <option value="wrap">Wrap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Min Height
              </label>
              <input
                type="text"
                value={config.layoutProps?.minHeight || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    layoutProps: {
                      ...config.layoutProps,
                      minHeight: e.target.value || undefined,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 80px"
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

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                Text Align
              </label>
              <select
                value={config.fieldStyle?.textAlign || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    fieldStyle: {
                      ...config.fieldStyle,
                      textAlign:
                        (e.target.value as any) || undefined,
                    },
                  })
                }
                className="w-full px-2 py-1.5 border rounded text-sm bg-white"
              >
                <option value="">Default</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Border Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.layoutProps?.borderColor || "#e5e7eb"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        layoutProps: {
                          ...config.layoutProps,
                          borderColor: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.layoutProps?.borderColor || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        layoutProps: {
                          ...config.layoutProps,
                          borderColor: e.target.value || undefined,
                        },
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="#e5e7eb"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Border Width
                </label>
                <input
                  type="text"
                  value={config.layoutProps?.borderWidth || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      layoutProps: {
                        ...config.layoutProps,
                        borderWidth: e.target.value || undefined,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1px"
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
