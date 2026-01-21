import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("formBuilder");
  if (!field) return null;

  const [config, setConfig] = useState<CustomFormField>(field);

  const handleLabelChange = (nextLabel: string) => {
    setConfig((prev) =>
      updateFieldLabelWithAutoProps(prev, nextLabel, allFields)
    );
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
    <div className="fixed right-0 rtl:left-0 rtl:right-auto top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto border-l rtl:border-r rtl:border-l-0 border-gray-200 field-config-panel">
      <div className="p-5 border-b sticky top-0 bg-linear-to-r from-gray-50 to-white z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("fieldConfig.title")}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("fieldConfig.subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t("fieldConfig.close")}
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
              {t("fieldConfig.fieldType", { type: config.type.charAt(0).toUpperCase() + config.type.slice(1) })}
            </p>
            <p className="text-xs text-gray-600">
              {t("fieldConfig.configureProperties")}
            </p>
          </div>
        </div>

        {/* HEADING: Simple text content */}
        {config.type === "heading" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t("fieldConfig.content")}
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.headingText")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.label}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={t("fieldConfig.enterHeading")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.fontSize")}
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
                <option value="16px">{t("fieldConfig.small")} (16px)</option>
                <option value="20px">{t("fieldConfig.medium")} (20px)</option>
                <option value="24px">{t("fieldConfig.large")} (24px)</option>
                <option value="28px">{t("fieldConfig.extraLarge")} (28px)</option>
                <option value="32px">{t("fieldConfig.huge")} (32px)</option>
              </select>
            </div>
          </div>
        )}

        {/* PARAGRAPH: Simple text content */}
        {config.type === "paragraph" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t("fieldConfig.content")}
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.paragraphText")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={config.label}
                onChange={(e) =>
                  setConfig({ ...config, label: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                rows={4}
                placeholder={t("fieldConfig.enterParagraph")}
              />
            </div>
          </div>
        )}

        {/* HELPER TEXT: Static text block */}
        {config.type === "helperText" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t("fieldConfig.content")}
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.helperText")}
              </label>
              <textarea
                value={config.content || ""}
                onChange={(e) =>
                  setConfig({ ...config, content: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                rows={3}
                placeholder={t("fieldConfig.enterHelperTextPlaceholder")}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                {t("fieldConfig.staticTextShown")}
              </p>
            </div>
          </div>
        )}

        {/* SPACER: Just height */}
        {config.type === "spacer" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t("fieldConfig.spacing")}
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.height")}
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
              {t("fieldConfig.styling")}
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.color")}
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
              {t("fieldConfig.basicSettings")}
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.fieldLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={t("fieldConfig.enterFieldLabel")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.fieldName")} <span className="text-red-500">*</span>
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
                {t("fieldConfig.fieldNameHint")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.placeholder")}
              </label>
              <input
                type="text"
                value={config.placeholder || ""}
                onChange={(e) =>
                  setConfig({ ...config, placeholder: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={t("fieldConfig.enterPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.description")}
              </label>
              <textarea
                value={config.description || ""}
                onChange={(e) =>
                  setConfig({ ...config, description: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                rows={3}
                placeholder={t("fieldConfig.helpTextForUsers")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.defaultValue")}
              </label>
              <input
                type="text"
                value={config.defaultValue || ""}
                onChange={(e) =>
                  setConfig({ ...config, defaultValue: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={t("fieldConfig.defaultValuePlaceholder")}
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
                {t("fieldConfig.basicSettings")}
              </h4>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {t("fieldConfig.fieldLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={t("fieldConfig.enterFieldLabel")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {t("fieldConfig.fieldName")} <span className="text-red-500">*</span>
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
                  {t("fieldConfig.description")}
                </label>
                <textarea
                  value={config.description || ""}
                  onChange={(e) =>
                    setConfig({ ...config, description: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  rows={2}
                  placeholder={t("fieldConfig.helpTextForUsers")}
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                {t("fieldConfig.options")}
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
                      placeholder={t("fieldConfig.optionLabel")}
                    />
                    <button
                      onClick={() => {
                        const newOptions = config.options?.filter(
                          (_, i) => i !== index
                        );
                        setConfig({ ...config, options: newOptions || [] });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t("fieldConfig.removeOption")}
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
                  {t("fieldConfig.addOption")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* FILE/IMAGE: Minimal configuration */}
        {(config.type === "file" || config.type === "image") && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t("fieldConfig.basicSettings")}
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.fieldLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={t("fieldConfig.enterFieldLabel")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.fieldName")} <span className="text-red-500">*</span>
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
                {t("fieldConfig.acceptedFileTypes")}
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
                {t("fieldConfig.egImagePdfDoc")}
              </p>
            </div>
          </div>
        )}

        {/* BUTTON: Button-specific settings */}
        {config.type === "button" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t("fieldConfig.buttonSettings")}
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("fieldConfig.buttonText")}
              </label>
              <input
                type="text"
                value={config.buttonText || ""}
                onChange={(e) =>
                  setConfig({ ...config, buttonText: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder={t("fieldConfig.clickMe")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("fieldConfig.buttonType")}
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
                <option value="button">{t("fieldConfig.button")}</option>
                <option value="submit">{t("fieldConfig.submit")}</option>
                <option value="reset">{t("fieldConfig.reset")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("fieldConfig.alignment")}
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
                    {t(`fieldConfig.${align}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t("fieldConfig.width")}</label>
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
                <option value="auto">{t("fieldConfig.autoContentWidth")}</option>
                <option value="full">{t("fieldConfig.fullWidth")}</option>
                <option value="custom">{t("fieldConfig.customWidth")}</option>
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
              {t("fieldConfig.fieldOptions")}
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
                  {t("fieldConfig.required")}
                </span>
                <span className="text-xs text-gray-500">
                  {t("fieldConfig.requiredDescription")}
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
                  {t("fieldConfig.unique")}
                </span>
                <span className="text-xs text-gray-500">
                  {t("fieldConfig.uniqueDescription")}
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
            <h4 className="font-medium mb-3">{t("fieldConfig.validation")}</h4>
            <div className="space-y-3">
              {config.type === "number" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("fieldConfig.minValue")}
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
                      {t("fieldConfig.maxValue")}
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
                      {t("fieldConfig.minLength")}
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
                      {t("fieldConfig.maxLength")}
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
                        {t("fieldConfig.pattern")}
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
              {t("fieldConfig.conditionalLogic")}
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
                  title={t("fieldConfig.removeCondition")}
                >
                  <X size={16} />
                </button>

                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-600 w-12">{t("fieldConfig.if")}</span>
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
                    <option value="">{t("fieldConfig.selectField")}</option>
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
                    <option value="equals">{t("fieldConfig.operator.equals")}</option>
                    <option value="notEquals">{t("fieldConfig.operator.notEquals")}</option>
                    <option value="contains">{t("fieldConfig.operator.contains")}</option>
                    <option value="greaterThan">{t("fieldConfig.operator.greaterThan")}</option>
                    <option value="lessThan">{t("fieldConfig.operator.lessThan")}</option>
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
                  <span className="font-medium text-gray-600 w-12">{t("fieldConfig.then")}</span>
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
                    <option value="show">{t("fieldConfig.action.show")}</option>
                    <option value="hide">{t("fieldConfig.action.hide")}</option>
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
              {t("fieldConfig.addCondition")}
            </button>
          </div>
        </div>

        {/* Bootstrap Column Class (for fields inside column containers) */}
        {!config.containerType && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center gap-2">
              <Columns2 className="text-indigo-600" size={18} />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t("fieldConfig.columnSizing")}
              </h4>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.bootstrapClass")}
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
                <option value="">{t("fieldConfig.autoEqualWidth")}</option>
                <option value="col-12">{t("fieldConfig.fullWidthCol12")}</option>
                <option value="col-6">{t("fieldConfig.halfWidthCol6")}</option>
                <option value="col-4">{t("fieldConfig.oneThirdCol4")}</option>
                <option value="col-3">{t("fieldConfig.oneFourthCol3")}</option>
                <option value="col-2">{t("fieldConfig.oneSixthCol2")}</option>
                <option value="col-1">{t("fieldConfig.oneTwelfthCol1")}</option>
                <option value="col-md-6">{t("fieldConfig.mediumHalfColMd6")}</option>
                <option value="col-md-4">{t("fieldConfig.mediumThirdColMd4")}</option>
                <option value="col-lg-4">{t("fieldConfig.largeThirdColLg4")}</option>
                <option value="col-lg-3">{t("fieldConfig.largeFourthColLg3")}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t("fieldConfig.setCustomBootstrapGrid")}
              </p>
              {config.bootstrapClass && (
                <div className="mt-2 p-2 bg-indigo-50 rounded border border-indigo-200">
                  <p className="text-xs font-mono text-indigo-700">
                    {t("fieldConfig.class")}: {config.bootstrapClass}
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
                {t("fieldConfig.layoutProperties")}
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.gap")}
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
                {t("fieldConfig.justifyContent")}
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
                <option value="flex-start">{t("fieldConfig.flexStart")}</option>
                <option value="flex-end">{t("fieldConfig.flexEnd")}</option>
                <option value="center">{t("fieldConfig.center")}</option>
                <option value="space-between">{t("fieldConfig.spaceBetween")}</option>
                <option value="space-around">{t("fieldConfig.spaceAround")}</option>
                <option value="space-evenly">{t("fieldConfig.spaceEvenly")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.alignItems")}
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
                <option value="flex-start">{t("fieldConfig.flexStart")}</option>
                <option value="flex-end">{t("fieldConfig.flexEnd")}</option>
                <option value="center">{t("fieldConfig.center")}</option>
                <option value="stretch">{t("fieldConfig.stretch")}</option>
                <option value="baseline">{t("fieldConfig.baseline")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.padding")}
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
                {t("fieldConfig.margin")}
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
                {t("fieldConfig.flexWrap")}
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
                <option value="nowrap">{t("fieldConfig.noWrap")}</option>
                <option value="wrap">{t("fieldConfig.wrap")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("fieldConfig.minHeight")}
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
                  {t("fieldConfig.backgroundColor")}
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
                  {t("fieldConfig.borderRadius")}
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
                {t("fieldConfig.textAlign")}
              </label>
              <select
                value={config.fieldStyle?.textAlign || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    fieldStyle: {
                      ...config.fieldStyle,
                      textAlign: (e.target.value as any) || undefined,
                    },
                  })
                }
                className="w-full px-2 py-1.5 border rounded text-sm bg-white"
              >
                <option value="">{t("fieldConfig.default")}</option>
                <option value="left">{t("fieldConfig.left")}</option>
                <option value="center">{t("fieldConfig.center")}</option>
                <option value="right">{t("fieldConfig.right")}</option>
                <option value="justify">{t("fieldConfig.justify")}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {t("fieldConfig.borderColor")}
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
                  {t("fieldConfig.borderWidth")}
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
            <span>{t("fieldConfig.customStyling")}</span>
            <Palette size={16} />
          </button>
          <div id="styling-options" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.width")}
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
                  {t("fieldConfig.padding")}
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
                  placeholder={t("fieldConfig.paddingPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.textColor")}
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
                  {t("fieldConfig.labelColor")}
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
                  {t("fieldConfig.bgColor")}
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
                  {t("fieldConfig.borderColor")}
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
                  {t("fieldConfig.borderWidth")}
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
                  {t("fieldConfig.borderRadius")}
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
                {t("fieldConfig.margin")}
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
                placeholder={t("fieldConfig.marginPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.marginTop")}
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
                  placeholder={t("fieldConfig.marginTopPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.marginBottom")}
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
                  placeholder={t("fieldConfig.marginBottomPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.marginLeft")}
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
                  placeholder={t("fieldConfig.marginLeftPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.marginRight")}
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
                  placeholder={t("fieldConfig.marginRightPlaceholder")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.paddingTop")}
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
                  placeholder={t("fieldConfig.paddingTopPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.paddingBottom")}
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
                  placeholder={t("fieldConfig.paddingBottomPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.paddingLeft")}
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
                  placeholder={t("fieldConfig.paddingLeftPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  {t("fieldConfig.paddingRight")}
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
                  placeholder={t("fieldConfig.paddingRightPlaceholder")}
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
              {t("fieldConfig.eventHandlers")}
            </h4>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("fieldConfig.onClick")}
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
              placeholder={t("fieldConfig.handleClickOrFunctionName")}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("fieldConfig.javascriptFunctionName")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("fieldConfig.onChange")}
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
              placeholder={t("fieldConfig.handleChangeValue")}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("fieldConfig.functionToCallWhenValueChanges")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("fieldConfig.onFocus")}
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
              placeholder={t("fieldConfig.handleFocus")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("fieldConfig.onBlur")}
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
              placeholder={t("fieldConfig.handleBlur")}
            />
          </div>
        </div>

        {/* Inline Parameters (FormEngine-like) */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center gap-2">
            <Code className="text-purple-600" size={18} />
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t("fieldConfig.inlineParams")}
            </h4>
          </div>
          <p className="text-xs text-gray-600">
            {t("fieldConfig.useVariablesInLabels")}
          </p>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("fieldConfig.availableVariables")}
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
              {t("fieldConfig.addVariable")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("fieldConfig.variableName")}
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
              {t("fieldConfig.pressEnterToAdd")}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t sticky bottom-0 bg-white pb-2">
          <button
            onClick={handleUpdate}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {t("fieldConfig.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
};
