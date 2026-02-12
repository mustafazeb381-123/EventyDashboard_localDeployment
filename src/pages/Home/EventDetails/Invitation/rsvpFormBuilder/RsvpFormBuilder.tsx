import React, { useRef, useState } from "react";
import {
  Save,
  Palette as PaletteIcon,
  X,
  Trash2,
  Type,
  Heading,
  Minus,
  Code,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { RsvpFormField, RsvpTheme, RsvpLanguageConfig, RsvpFieldType } from "./types";
import { getDefaultRsvpFormFields, createRsvpFormField } from "./types";
import { RsvpTextStylingPanel } from "./RsvpTextStylingPanel";
import { RsvpThemeConfigPanel } from "./RsvpThemeConfigPanel";
import { RsvpFormPreview } from "./RsvpFormPreview";

const AVAILABLE_VARIABLES = [
  { label: "First Name", value: "((firstname))" },
  { label: "Last Name", value: "{{lastname}}" },
  { label: "Full Name", value: "{{fullname}}" },
  { label: "Email", value: "{{email}}" },
  { label: "Company", value: "{{comapny}}" },
  { label: "Organization", value: "{{organization}}" },
  { label: "Event Name", value: "{{eventname}}" },
  { label: "Event Location", value: "{{eventlocation}}" },
  { label: "Event Start", value: "{{eventstart}}" },
  { label: "Event End", value: "{{eventend}}" },
];

export interface RsvpFormBuilderProps {
  initialFormFields?: RsvpFormField[];
  initialTheme?: Partial<RsvpTheme>;
  initialLanguageConfig?: RsvpLanguageConfig;
  initialTemplateName?: string;
  onSave: (
    formFields: RsvpFormField[],
    theme: RsvpTheme,
    languageConfig: RsvpLanguageConfig,
    templateName?: string
  ) => void | Promise<void>;
  onClose: () => void;
}

const defaultTheme: RsvpTheme = {
  headerBackgroundColor: "#1e293b",
  headerTextColor: "#ffffff",
  bodyBackgroundColor: "#f8fafc",
  bodyTextColor: "#1e293b",
  labelColor: "#374151",
  acceptButtonBackgroundColor: "#10b981",
  acceptButtonTextColor: "#ffffff",
  declineButtonBackgroundColor: "#ef4444",
  declineButtonTextColor: "#ffffff",
  inputBorderColor: "#e2e8f0",
  inputBackgroundColor: "#f8fafc",
};

export const RsvpFormBuilder: React.FC<RsvpFormBuilderProps> = ({
  initialFormFields,
  initialTheme,
  initialLanguageConfig,
  initialTemplateName = "",
  onSave,
  onClose,
}) => {
  const [formFields, setFormFields] = useState<RsvpFormField[]>(() =>
    initialFormFields?.length ? initialFormFields : getDefaultRsvpFormFields()
  );
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [editingField, setEditingField] = useState<RsvpFormField | null>(null);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [theme, setTheme] = useState<RsvpTheme>({
    ...defaultTheme,
    ...initialTheme,
  });
  const [languageConfig] = useState<RsvpLanguageConfig>(
    initialLanguageConfig ?? { languageMode: "single", primaryLanguage: "en" }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setTheme((prev) => ({ ...prev, bannerImage: file }));
    }
    e.target.value = "";
  };

  const handleFooterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setTheme((prev) => ({ ...prev, footerBannerImage: file }));
    }
    e.target.value = "";
  };

  const handleUpdateField = (updated: RsvpFormField) => {
    setFormFields((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
    if (editingField?.id === updated.id) setEditingField(updated);
  };

  const handleAddField = (type: RsvpFieldType) => {
    const newField = createRsvpFormField(type);
    setFormFields((prev) => [...prev, newField]);
    setEditingField(newField);
  };

  const handleInsertVariable = (variable: string) => {
    // Always create a new separate paragraph element with the variable
    const newField = createRsvpFormField("paragraph");
    newField.content = variable;
    setFormFields((prev) => [...prev, newField]);
    setEditingField(newField);
  };

  const handleDeleteField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
    if (editingField?.id === id) setEditingField(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.resolve(
        onSave(formFields, theme, languageConfig, templateName.trim() || undefined)
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col gap-2 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 shrink-0">
              RSVP Template Editor
            </h2>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-w-[200px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                showThemePanel
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <PaletteIcon size={18} />
              Theme
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              <Save size={18} />
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Add text elements */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Add Text Elements</h3>
          <div className="space-y-2 mb-4">
            <button
              type="button"
              onClick={() => handleAddField("heading")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-all"
            >
              <Heading size={18} />
              Add Heading
            </button>
            <button
              type="button"
              onClick={() => handleAddField("paragraph")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-all"
            >
              <Type size={18} />
              Add Paragraph
            </button>
            <button
              type="button"
              onClick={() => handleAddField("divider")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-all"
            >
              <Minus size={18} />
              Add Divider
            </button>
          </div>

          {/* Available Variables */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowVariables(!showVariables)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors mb-2"
            >
              <div className="flex items-center gap-2">
                <Code size={16} />
                <span>Available Variables</span>
              </div>
              {showVariables ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showVariables && (
              <div className="space-y-2">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <button
                    key={variable.value}
                    type="button"
                    onClick={() => handleInsertVariable(variable.value)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-all text-left"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium">{variable.label}</span>
                      <code className="text-xs font-mono text-indigo-600 mt-0.5">
                        {variable.value}
                      </code>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current elements list */}
          {formFields.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Text Elements</h3>
              <div className="space-y-2">
                {formFields.map((field) => (
                  <div
                    key={field.id}
                    className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                      editingField?.id === field.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setEditingField(field)}
                      className="flex-1 text-left text-sm text-slate-700 truncate"
                    >
                      {field.type === "heading" ? (
                        <Heading size={14} className="inline mr-2" />
                      ) : field.type === "divider" ? (
                        <Minus size={14} className="inline mr-2" />
                      ) : (
                        <Type size={14} className="inline mr-2" />
                      )}
                      {field.content?.slice(0, 30) || field.type}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Preview */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-100">
            <div className="p-6 flex justify-center min-h-full">
              <RsvpFormPreview
                formFields={formFields}
                theme={theme}
                currentLanguage={languageConfig.primaryLanguage ?? "en"}
                visibleOnly={false}
                variableMode={false}
                showActionButtons={true}
                onBannerClick={() => bannerInputRef.current?.click()}
                onFooterClick={() => footerInputRef.current?.click()}
                builderMode={true}
                editingFieldId={editingField?.id ?? null}
                onFieldClick={setEditingField}
                onFieldContentChange={(fieldId, content) => {
                  setFormFields((prev) =>
                    prev.map((f) => (f.id === fieldId ? { ...f, content } : f))
                  );
                  if (editingField?.id === fieldId) {
                    setEditingField({ ...editingField, content });
                  }
                }}
              />
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerFileChange}
              className="hidden"
              aria-hidden
            />
            <input
              ref={footerInputRef}
              type="file"
              accept="image/*"
              onChange={handleFooterFileChange}
              className="hidden"
              aria-hidden
            />
          </div>
        </div>

        {/* Right: Styling / Theme panels */}
        {editingField && (
          <RsvpTextStylingPanel
            field={editingField}
            onUpdate={handleUpdateField}
            onClose={() => setEditingField(null)}
          />
        )}
        {showThemePanel && !editingField && (
          <RsvpThemeConfigPanel
            theme={theme}
            onUpdate={setTheme}
            onClose={() => setShowThemePanel(false)}
          />
        )}
      </div>
    </div>
  );
};
