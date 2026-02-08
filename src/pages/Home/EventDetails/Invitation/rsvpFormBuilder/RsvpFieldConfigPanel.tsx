import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { RsvpFormField, RsvpFormFieldOption, RsvpFieldType } from "./types";

interface RsvpFieldConfigPanelProps {
  field: RsvpFormField;
  onUpdate: (field: RsvpFormField) => void;
  onClose: () => void;
}

const FIELD_TYPE_LABELS: Record<RsvpFieldType, string> = {
  text: "Text",
  email: "Email",
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

export const RsvpFieldConfigPanel: React.FC<RsvpFieldConfigPanelProps> = ({
  field,
  onUpdate,
  onClose,
}) => {
  const [config, setConfig] = useState<RsvpFormField>(field);

  React.useEffect(() => {
    setConfig(field);
  }, [field]);

  const handleSave = () => {
    onUpdate(config);
    onClose();
  };

  const isLabeled = !["paragraph", "divider", "heading"].includes(config.type);
  const hasOptions = config.type === "select" || config.type === "radio";
  const hasContent = config.type === "paragraph" || config.type === "heading";

  const updateOption = (index: number, upd: Partial<RsvpFormFieldOption>) => {
    const opts = [...(config.options ?? [])];
    opts[index] = { ...opts[index], ...upd };
    setConfig({ ...config, options: opts });
  };

  const addOption = () => {
    const opts = [...(config.options ?? []), { label: "New option", value: `opt_${Date.now()}` }];
    setConfig({ ...config, options: opts });
  };

  const removeOption = (index: number) => {
    const opts = (config.options ?? []).filter((_, i) => i !== index);
    setConfig({ ...config, options: opts });
  };

  return (
    <div className="fixed right-0 rtl:left-0 rtl:right-auto top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto border-l rtl:border-r border-gray-200">
      <div className="p-5 border-b sticky top-0 bg-gray-50 z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit {FIELD_TYPE_LABELS[config.type]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {isLabeled && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Label</label>
              <input
                type="text"
                value={config.label}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Field label"
              />
            </div>
            {config.type !== "checkbox" && config.type !== "radio" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Placeholder</label>
                <input
                  type="text"
                  value={config.placeholder ?? ""}
                  onChange={(e) =>
                    setConfig({ ...config, placeholder: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Placeholder"
                />
              </div>
            )}
          </>
        )}

        {hasContent && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {config.type === "heading" ? "Heading text" : "Paragraph text"}
              </label>
              <textarea
                value={config.content ?? ""}
                onChange={(e) => setConfig({ ...config, content: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={config.type === "heading" ? 2 : 4}
                placeholder={config.type === "heading" ? "Heading" : "Paragraph content"}
              />
            </div>
            {config.type === "heading" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Heading level</label>
                <select
                  value={config.headingLevel ?? 3}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      headingLevel: parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5 | 6,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>H{n}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {hasOptions && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Options</label>
            <div className="space-y-2">
              {(config.options ?? []).map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => updateOption(i, { label: e.target.value, value: opt.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Option label"
                  />
                  <input
                    type="text"
                    value={opt.value}
                    onChange={(e) => updateOption(i, { ...opt, value: e.target.value })}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Remove option"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus size={16} />
                Add option
              </button>
            </div>
          </div>
        )}

        {config.type === "number" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Min</label>
              <input
                type="number"
                value={config.min ?? ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    min: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Max</label>
              <input
                type="number"
                value={config.max ?? ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    max: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="—"
              />
            </div>
          </div>
        )}

        {config.type === "phone" && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Phone style (like Advance Registration)
            </label>
            <select
              value={config.inputVariant ?? "default"}
              onChange={(e) =>
                setConfig({
                  ...config,
                  inputVariant: e.target.value as "phone" | "default",
                })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">Single input</option>
              <option value="phone">Country code + number</option>
            </select>
          </div>
        )}

        {isLabeled && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={config.required}
              onChange={(e) => setConfig({ ...config, required: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700">
              Required field
            </label>
          </div>
        )}

        <div className="pt-4 border-t sticky bottom-0 bg-white pb-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};
