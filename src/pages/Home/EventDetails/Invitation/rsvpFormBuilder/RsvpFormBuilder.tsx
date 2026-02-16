import React, { useRef, useState, useEffect } from "react";
import {
  Save,
  Palette as PaletteIcon,
  X,
  Trash2,
  Type,
  Heading,
  Minus,
  Code,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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

/** Theme presets for high-end RSVP look */
const THEME_PRESETS: { name: string; theme: Partial<RsvpTheme> }[] = [
  {
    name: "Elegant",
    theme: {
      headerBackgroundColor: "#1f2937",
      bodyBackgroundColor: "#fafaf9",
      formBackgroundColor: "#ffffff",
      formBorderRadius: "16px",
      acceptButtonBackgroundColor: "#292524",
      declineButtonBackgroundColor: "#78716c",
      inputBorderColor: "#e7e5e4",
      inputBorderRadius: "10px",
    },
  },
  {
    name: "Modern",
    theme: {
      headerBackgroundColor: "#0f172a",
      bodyBackgroundColor: "#f1f5f9",
      formBackgroundColor: "#ffffff",
      formBorderRadius: "12px",
      acceptButtonBackgroundColor: "#3b82f6",
      declineButtonBackgroundColor: "#64748b",
      inputBorderColor: "#cbd5e1",
      inputBorderRadius: "8px",
    },
  },
  {
    name: "Minimal",
    theme: {
      headerBackgroundColor: "#ffffff",
      headerTextColor: "#0f172a",
      bodyBackgroundColor: "#f8fafc",
      formBackgroundColor: "#ffffff",
      formBorderRadius: "8px",
      formBorderColor: "#e2e8f0",
      acceptButtonBackgroundColor: "#10b981",
      declineButtonBackgroundColor: "#94a3b8",
      inputBorderColor: "#e2e8f0",
      inputBorderRadius: "6px",
    },
  },
];

/** Convert File to base64 data URL so theme can be saved in JSON (rsvp_template) */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Only keep image fields that are valid for JSON: string (base64) or null. File → base64; {} or other → null. */
function sanitizeThemeImages(theme: RsvpTheme): RsvpTheme {
  const next: RsvpTheme = { ...theme };
  if (typeof theme.bannerImage !== "string" && !(theme.bannerImage instanceof File)) {
    next.bannerImage = null;
  }
  if (typeof theme.footerBannerImage !== "string" && !(theme.footerBannerImage instanceof File)) {
    next.footerBannerImage = null;
  }
  if (typeof theme.formBackgroundImage !== "string" && !(theme.formBackgroundImage instanceof File)) {
    next.formBackgroundImage = null;
  }
  return next;
}

/** Convert theme image fields (File) to base64 so data saves as drawn. Sanitizes {} to null. */
async function themeFilesToBase64(theme: RsvpTheme): Promise<RsvpTheme> {
  const sanitized = sanitizeThemeImages(theme);
  const next: RsvpTheme = { ...sanitized };
  if (sanitized.bannerImage instanceof File) {
    try {
      next.bannerImage = await fileToDataUrl(sanitized.bannerImage);
    } catch {
      next.bannerImage = null;
    }
  }
  if (sanitized.footerBannerImage instanceof File) {
    try {
      next.footerBannerImage = await fileToDataUrl(sanitized.footerBannerImage);
    } catch {
      next.footerBannerImage = null;
    }
  }
  if (sanitized.formBackgroundImage instanceof File) {
    try {
      next.formBackgroundImage = await fileToDataUrl(sanitized.formBackgroundImage);
    } catch {
      next.formBackgroundImage = null;
    }
  }
  return next;
}

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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  /** JSON string for Code modal (theme images as base64); set when modal opens */
  const [codeModalJson, setCodeModalJson] = useState<string | null>(null);

  useEffect(() => {
    if (!showCodeModal) {
      setCodeModalJson(null);
      return;
    }
    let cancelled = false;
    themeFilesToBase64(theme).then((themeWithBase64) => {
      if (!cancelled) {
        setCodeModalJson(
          JSON.stringify(
            { title: templateName, formFields, theme: themeWithBase64, languageConfig },
            null,
            2
          )
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showCodeModal, theme, templateName, formFields, languageConfig]);

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

  const handleRemoveBanner = () => {
    setTheme((prev) => ({ ...prev, bannerImage: null }));
  };

  const handleRemoveFooter = () => {
    setTheme((prev) => ({ ...prev, footerBannerImage: null }));
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

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;
    setFormFields((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setTheme((prev) => ({ ...prev, ...preset.theme }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const themeWithBase64 = await themeFilesToBase64(theme);
      await Promise.resolve(
        onSave(formFields, themeWithBase64, languageConfig, templateName.trim() || undefined)
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = async () => {
    const json =
      codeModalJson ??
      (await themeFilesToBase64(theme).then((themeWithBase64) =>
        JSON.stringify(
          { title: templateName, formFields, theme: themeWithBase64, languageConfig },
          null,
          2
        )
      ));
    navigator.clipboard.writeText(json).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
      {/* Header – high-end toolbar */}
      <div className="flex-shrink-0 flex flex-col gap-2 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-semibold text-white shrink-0">
              RSVP Builder
            </h2>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="px-3 py-1.5 border border-slate-500 rounded-lg text-sm text-white bg-slate-700/50 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 max-w-[200px]"
            />
            <div className="hidden sm:flex items-center gap-1 rounded-lg bg-slate-700/50 p-1">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                  title={`Apply ${preset.name} style`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-500 bg-slate-700/50 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
              title="Preview"
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-500 bg-slate-700/50 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
              title="See code"
            >
              <Code size={18} />
              Code
            </button>
            <button
              type="button"
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showThemePanel
                  ? "border-indigo-400 bg-indigo-500/30 text-white"
                  : "border-slate-500 bg-slate-700/50 hover:bg-slate-600 text-slate-200"
              }`}
            >
              <PaletteIcon size={18} />
              Theme
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 text-sm transition-colors"
            >
              <Save size={18} />
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-600 text-slate-300"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Content palette */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Content</h3>
          <div className="space-y-2 mb-4">
            <button type="button" onClick={() => handleAddField("heading")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-all">
              <Heading size={18} />
              Heading
            </button>
            <button type="button" onClick={() => handleAddField("paragraph")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-all">
              <Type size={18} />
              Paragraph
            </button>
            <button type="button" onClick={() => handleAddField("divider")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-all">
              <Minus size={18} />
              Divider
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

          {/* Current elements list with reorder */}
          {formFields.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Elements ({formFields.length})</h3>
              <div className="space-y-1.5">
                {formFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`flex items-center gap-1 p-2 rounded-lg border transition-all ${
                      editingField?.id === field.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col shrink-0 gap-0.5">
                      <button type="button" onClick={() => handleMoveField(index, "up")} disabled={index === 0} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move up" aria-label="Move up">
                        <ChevronLeft size={14} className="rotate-[-90deg]" />
                      </button>
                      <button type="button" onClick={() => handleMoveField(index, "down")} disabled={index === formFields.length - 1} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move down" aria-label="Move down">
                        <ChevronRight size={14} className="rotate-[-90deg]" />
                      </button>
                    </div>
                    <button type="button" onClick={() => setEditingField(field)} className="flex-1 min-w-0 text-left text-sm text-slate-700 truncate">
                      {field.type === "heading" && <Heading size={14} className="inline mr-2 shrink-0" />}
                      {field.type === "paragraph" && <Type size={14} className="inline mr-2 shrink-0" />}
                      {field.type === "divider" && <Minus size={14} className="inline mr-2 shrink-0" />}
                      <span className="truncate">{field.content?.slice(0, 24) || field.type}</span>
                    </button>
                    <button type="button" onClick={() => handleDeleteField(field.id)} className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0" title="Delete" aria-label="Delete">
                      <Trash2 size={14} />
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
                onRemoveBanner={handleRemoveBanner}
                onRemoveFooter={handleRemoveFooter}
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

        {/* Right: Text styling or Theme */}
        {editingField && (
          <RsvpTextStylingPanel field={editingField} onUpdate={handleUpdateField} onClose={() => setEditingField(null)} />
        )}
        {showThemePanel && !editingField && (
          <RsvpThemeConfigPanel
            theme={theme}
            onUpdate={setTheme}
            onClose={() => setShowThemePanel(false)}
          />
        )}
      </div>

      {/* Preview modal – full preview while building */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowPreviewModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Preview</h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-6 bg-slate-50">
              <div className="max-w-md mx-auto">
                <RsvpFormPreview
                  formFields={formFields}
                  theme={theme}
                  currentLanguage={languageConfig.primaryLanguage ?? "en"}
                  visibleOnly={true}
                  variableMode={false}
                  showActionButtons={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code modal – form definition as JSON */}
      {showCodeModal && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCodeModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Code</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  <Copy size={16} />
                  {codeCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-4">
              <pre className="text-xs font-mono text-slate-800 bg-slate-50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap break-words max-h-[70vh]">
                {codeModalJson ?? "Loading…"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
