import React, { useState } from "react";
import { X, Code, ChevronDown, ChevronUp } from "lucide-react";
import type { RsvpFormField } from "./types";

interface RsvpTextStylingPanelProps {
  field: RsvpFormField;
  onUpdate: (field: RsvpFormField) => void;
  onClose: () => void;
}

const AVAILABLE_VARIABLES = [
  { label: "First Name", value: "((firstname))", syntax: "double-paren" },
  { label: "Last Name", value: "{{lastname}}", syntax: "double-brace" },
  { label: "Full Name", value: "{{fullname}}", syntax: "double-brace" },
  { label: "Email", value: "{{email}}", syntax: "double-brace" },
  { label: "Company", value: "{{comapny}}", syntax: "double-brace" },
  { label: "Organization", value: "{{organization}}", syntax: "double-brace" },
  { label: "Event Name", value: "{{eventname}}", syntax: "double-brace" },
  { label: "Event Location", value: "{{eventlocation}}", syntax: "double-brace" },
  { label: "Event Start", value: "{{eventstart}}", syntax: "double-brace" },
  { label: "Event End", value: "{{eventend}}", syntax: "double-brace" },
];

export const RsvpTextStylingPanel: React.FC<RsvpTextStylingPanelProps> = ({
  field,
  onUpdate,
  onClose,
}) => {
  const style = field.fieldStyle ?? {};
  const [showVariables, setShowVariables] = useState(false);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const updateStyle = (updates: Partial<NonNullable<RsvpFormField["fieldStyle"]>>) => {
    onUpdate({
      ...field,
      fieldStyle: { ...style, ...updates },
    });
  };

  const insertVariable = (variable: string) => {
    if (!textareaRef) return;
    const textarea = textareaRef;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = field.content ?? "";
    const newContent =
      currentContent.substring(0, start) + variable + currentContent.substring(end);
    
    onUpdate({
      ...field,
      content: newContent,
    });

    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
      <div className="p-5 border-b sticky top-0 bg-gray-50 z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Text Styling
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
        {/* Text Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.type === "heading" ? "Heading text" : field.type === "divider" ? "Divider" : "Paragraph text"}
            </label>
            {field.type !== "divider" && (
              <button
                type="button"
                onClick={() => setShowVariables(!showVariables)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              >
                <Code size={14} />
                Variables
                {showVariables ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
          
          {/* Variables picker */}
          {showVariables && field.type !== "divider" && (
            <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs font-medium text-indigo-900 mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <button
                    key={variable.value}
                    type="button"
                    onClick={() => insertVariable(variable.value)}
                    className="px-2 py-1 bg-white border border-indigo-300 rounded text-xs font-mono text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400 transition-colors"
                    title={variable.label}
                  >
                    {variable.value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-indigo-600 mt-2">
                Click a variable to insert it at the cursor position
              </p>
            </div>
          )}

          {field.type === "divider" ? (
            <div className="text-sm text-gray-500 italic">Divider line</div>
          ) : (
            <textarea
              ref={setTextareaRef}
              value={field.content ?? ""}
              onChange={(e) =>
                onUpdate({ ...field, content: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
              rows={field.type === "heading" ? 3 : 5}
              placeholder={field.type === "heading" ? "Heading" : "Text content"}
            />
          )}
          {field.type === "heading" && (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">Heading level</label>
              <select
                value={field.headingLevel ?? 3}
                onChange={(e) =>
                  onUpdate({
                    ...field,
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
        </div>

        {/* Border */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Border
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Border color</label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={style.borderColor ?? "#e5e7eb"}
                  onChange={(e) => updateStyle({ borderColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0"
                />
                <input
                  type="text"
                  value={style.borderColor ?? ""}
                  onChange={(e) => updateStyle({ borderColor: e.target.value || undefined })}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="#e5e7eb"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Border width</label>
                <input
                  type="text"
                  value={style.borderWidth ?? ""}
                  onChange={(e) => updateStyle({ borderWidth: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="1px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Border style</label>
                <select
                  value={style.borderStyle ?? "solid"}
                  onChange={(e) =>
                    updateStyle({
                      borderStyle: (e.target.value || undefined) as "solid" | "dashed" | "dotted" | "double" | "none" | undefined,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Border radius</label>
              <input
                type="text"
                value={style.borderRadius ?? ""}
                onChange={(e) => updateStyle({ borderRadius: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="8px"
              />
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Background
          </h4>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Background color</label>
            <div className="flex gap-1">
              <input
                type="color"
                value={style.backgroundColor ?? "#ffffff"}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0"
              />
              <input
                type="text"
                value={style.backgroundColor ?? ""}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value || undefined })}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        {/* Padding */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Padding
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">All sides</label>
              <input
                type="text"
                value={style.padding ?? ""}
                onChange={(e) => updateStyle({ padding: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="16px"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Top</label>
                <input
                  type="text"
                  value={style.paddingTop ?? ""}
                  onChange={(e) => updateStyle({ paddingTop: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Right</label>
                <input
                  type="text"
                  value={style.paddingRight ?? ""}
                  onChange={(e) => updateStyle({ paddingRight: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Bottom</label>
                <input
                  type="text"
                  value={style.paddingBottom ?? ""}
                  onChange={(e) => updateStyle({ paddingBottom: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Left</label>
                <input
                  type="text"
                  value={style.paddingLeft ?? ""}
                  onChange={(e) => updateStyle({ paddingLeft: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Margin */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Margin
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">All sides</label>
              <input
                type="text"
                value={style.margin ?? ""}
                onChange={(e) => updateStyle({ margin: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Top</label>
                <input
                  type="text"
                  value={style.marginTop ?? ""}
                  onChange={(e) => updateStyle({ marginTop: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Right</label>
                <input
                  type="text"
                  value={style.marginRight ?? ""}
                  onChange={(e) => updateStyle({ marginRight: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Bottom</label>
                <input
                  type="text"
                  value={style.marginBottom ?? ""}
                  onChange={(e) => updateStyle({ marginBottom: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Left</label>
                <input
                  type="text"
                  value={style.marginLeft ?? ""}
                  onChange={(e) => updateStyle({ marginLeft: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Text Styling */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Text Styling
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Text color</label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={style.textColor ?? "#000000"}
                  onChange={(e) => updateStyle({ textColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0"
                />
                <input
                  type="text"
                  value={style.textColor ?? ""}
                  onChange={(e) => updateStyle({ textColor: e.target.value || undefined })}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Font size</label>
                <input
                  type="text"
                  value={style.fontSize ?? ""}
                  onChange={(e) => updateStyle({ fontSize: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="16px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Text align</label>
                <select
                  value={style.textAlign ?? "left"}
                  onChange={(e) =>
                    updateStyle({
                      textAlign: (e.target.value as "left" | "center" | "right" | "justify") || undefined,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Font weight</label>
                <select
                  value={style.fontWeight ?? "normal"}
                  onChange={(e) =>
                    updateStyle({
                      fontWeight: (e.target.value as any) || undefined,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Lighter</option>
                  <option value="bolder">Bolder</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Font style</label>
                <select
                  value={style.fontStyle ?? "normal"}
                  onChange={(e) =>
                    updateStyle({
                      fontStyle: (e.target.value as "normal" | "italic" | "oblique") || undefined,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Text decoration</label>
              <select
                value={style.textDecoration ?? "none"}
                onChange={(e) =>
                  updateStyle({
                    textDecoration: (e.target.value as "none" | "underline" | "overline" | "line-through") || undefined,
                  })
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="overline">Overline</option>
                <option value="line-through">Line through</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Line height</label>
                <input
                  type="text"
                  value={style.lineHeight ?? ""}
                  onChange={(e) => updateStyle({ lineHeight: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="1.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Letter spacing</label>
                <input
                  type="text"
                  value={style.letterSpacing ?? ""}
                  onChange={(e) => updateStyle({ letterSpacing: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="0px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Layout
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Width</label>
              <input
                type="text"
                value={style.width ?? ""}
                onChange={(e) => updateStyle({ width: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="100%"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Max width</label>
              <input
                type="text"
                value={style.maxWidth ?? ""}
                onChange={(e) => updateStyle({ maxWidth: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="100%"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-4 border-t sticky bottom-0 bg-white pb-4">
          <button
            type="button"
            onClick={() => {
              onUpdate(field);
              onClose();
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
