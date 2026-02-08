import React, { useState } from "react";
import { X, Plus, Trash2, Palette, ChevronDown } from "lucide-react";
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
  const [isStylingOpen, setIsStylingOpen] = useState(false);

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

        {/* Custom Styling (like Advance Registration FieldConfigPanel) */}
        <div className="pt-4 border-t">
          <button
            type="button"
            onClick={() => setIsStylingOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 hover:text-indigo-600 transition-colors"
          >
            <span>Custom styling</span>
            <span className="flex items-center gap-1">
              <Palette size={16} />
              <ChevronDown
                size={16}
                className={`transition-transform ${isStylingOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>
          {isStylingOpen && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Width</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.width ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, width: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="100% or 300px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Padding</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.padding ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, padding: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="8px 12px"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Text color</label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={config.fieldStyle?.textColor ?? "#000000"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, textColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0"
                    />
                    <input
                      type="text"
                      value={config.fieldStyle?.textColor ?? ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, textColor: e.target.value || undefined },
                        })
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Label color</label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={config.fieldStyle?.labelColor ?? "#374151"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, labelColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0"
                    />
                    <input
                      type="text"
                      value={config.fieldStyle?.labelColor ?? ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, labelColor: e.target.value || undefined },
                        })
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="#374151"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Background</label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={config.fieldStyle?.backgroundColor ?? "#ffffff"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, backgroundColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0"
                    />
                    <input
                      type="text"
                      value={config.fieldStyle?.backgroundColor ?? ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, backgroundColor: e.target.value || undefined },
                        })
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Border color</label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={config.fieldStyle?.borderColor ?? "#e2e8f0"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, borderColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0"
                    />
                    <input
                      type="text"
                      value={config.fieldStyle?.borderColor ?? ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, borderColor: e.target.value || undefined },
                        })
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="#e2e8f0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Border width</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.borderWidth ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, borderWidth: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="1px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Border radius</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.borderRadius ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, borderRadius: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="8px"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Margin</label>
                <input
                  type="text"
                  value={config.fieldStyle?.margin ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      fieldStyle: { ...config.fieldStyle, margin: e.target.value || undefined },
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0 or 8px 0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Margin top</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.marginTop ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, marginTop: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Margin bottom</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.marginBottom ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, marginBottom: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Margin left</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.marginLeft ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, marginLeft: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Margin right</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.marginRight ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, marginRight: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Padding top</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.paddingTop ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, paddingTop: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Padding bottom</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.paddingBottom ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, paddingBottom: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Padding left</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.paddingLeft ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, paddingLeft: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Padding right</label>
                  <input
                    type="text"
                    value={config.fieldStyle?.paddingRight ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fieldStyle: { ...config.fieldStyle, paddingRight: e.target.value || undefined },
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {(config.type === "heading" || config.type === "paragraph") && (
                <div className="grid grid-cols-2 gap-3">
                  {config.type === "heading" && (
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">Font size</label>
                      <input
                        type="text"
                        value={config.fieldStyle?.fontSize ?? ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            fieldStyle: { ...config.fieldStyle, fontSize: e.target.value || undefined },
                          })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="24px"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Text align</label>
                    <select
                      value={config.fieldStyle?.textAlign ?? ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: {
                            ...config.fieldStyle,
                            textAlign: (e.target.value as "left" | "center" | "right" | "justify") || undefined,
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Default</option>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                      <option value="justify">Justify</option>
                    </select>
                  </div>
                </div>
              )}

              {config.type === "divider" && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Divider color</label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={config.fieldStyle?.borderColor ?? "#e5e7eb"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, borderColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0"
                    />
                    <input
                      type="text"
                      value={config.fieldStyle?.borderColor ?? ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          fieldStyle: { ...config.fieldStyle, borderColor: e.target.value || undefined },
                        })
                      }
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="#e5e7eb"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
