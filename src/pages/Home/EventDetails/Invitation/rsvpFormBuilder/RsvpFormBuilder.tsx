import React, { useRef, useState } from "react";
import {
  Save,
  Palette as PaletteIcon,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import type { RsvpFormField, RsvpTheme, RsvpLanguageConfig, RsvpFieldType } from "./types";
import { getDefaultRsvpFormFields } from "./types";

function migrateFormFields(fields: RsvpFormField[]): RsvpFormField[] {
  return fields.map((f) => {
    let next = f;
    if (!(f as RsvpFormField & { type?: RsvpFieldType }).type) {
      const name = (f as RsvpFormField & { name: string }).name;
      const type: RsvpFieldType = name === "phone_number" ? "phone" : "text";
      next = { ...f, type };
    }
    if ((next as RsvpFormField & { visible?: boolean }).visible === undefined) {
      next = { ...next, visible: true };
    }
    return next;
  });
}
import { RsvpFieldPalette } from "./RsvpFieldPalette";
import { RsvpFieldConfigPanel } from "./RsvpFieldConfigPanel";
import { RsvpThemeConfigPanel } from "./RsvpThemeConfigPanel";
import { RsvpFormPreview } from "./RsvpFormPreview";

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
    initialFormFields?.length ? migrateFormFields(initialFormFields) : getDefaultRsvpFormFields()
  );
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [editingField, setEditingField] = useState<RsvpFormField | null>(null);
  const [showThemePanel, setShowThemePanel] = useState(false);
  /** When true: show all fields in preview. When false: show only visible fields (guest view). */
  const [showFullPreview, setShowFullPreview] = useState(true);
  /** Builder steps: 1 = Fields, 3 = Styling (Variables and Actions steps removed) */
  const [builderStep, setBuilderStep] = useState<1 | 3>(1);
  /** Reason popup when Attend/Decline is clicked in preview */
  const [reasonModal, setReasonModal] = useState<{ type: "attend" | "decline" } | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [theme, setTheme] = useState<RsvpTheme>({
    ...defaultTheme,
    ...initialTheme,
  });
  const [languageConfig] = useState<RsvpLanguageConfig>(
    initialLanguageConfig ?? { languageMode: "single", primaryLanguage: "en" }
  );
  const [isSaving, setIsSaving] = useState(false);

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

  const handleAddField = (field: RsvpFormField) => {
    setFormFields((prev) => [...prev, field]);
    setEditingField(field);
  };

  const handleDeleteField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
    if (editingField?.id === id) setEditingField(null);
  };

  const handleToggleVisible = (field: RsvpFormField) => {
    setFormFields((prev) =>
      prev.map((f) =>
        f.id === field.id ? { ...f, visible: f.visible === false ? true : false } : f
      )
    );
    if (editingField?.id === field.id) {
      setEditingField((prev) =>
        prev ? { ...prev, visible: prev.visible === false ? true : false } : null
      );
    }
  };

  const openReasonModal = (type: "attend" | "decline") => {
    setReasonText("");
    setReasonModal({ type });
  };

  const closeReasonModal = () => {
    setReasonModal(null);
    setReasonText("");
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

  const steps: { step: 1 | 3; label: string }[] = [
    { step: 1, label: "Fields" },
    { step: 3, label: "Styling" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col gap-2 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 shrink-0">
              RSVP Form Builder
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
            onClick={() => setShowFullPreview(!showFullPreview)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium"
            title={showFullPreview ? "Show only visible fields (guest view)" : "Show all fields including hidden"}
          >
            {showFullPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            {showFullPreview ? "Hide preview" : "Show preview"}
          </button>
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
        {/* Step navigator */}
        <div className="flex items-center gap-1 flex-wrap">
          {steps.map(({ step, label }) => (
            <button
              key={step}
              type="button"
              onClick={() => {
                setBuilderStep(step);
                if (step === 3) setShowThemePanel(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                builderStep === step
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {step}. {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Form fields list (Step 1 focus) */}
        <div className="w-56 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto p-3">
          <RsvpFieldPalette
            formFields={formFields}
            selectedFieldId={editingField?.id ?? null}
            onSelectField={setEditingField}
            onAddField={handleAddField}
            onToggleVisible={handleToggleVisible}
            onDeleteField={handleDeleteField}
          />
        </div>

        {/* Center: Full form in both Preview and Hide Preview – banner, fields, footer, Attend/Decline always visible */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-100">
            <div className="p-6 flex justify-center min-h-full">
              <RsvpFormPreview
                formFields={formFields}
                theme={theme}
                currentLanguage={languageConfig.primaryLanguage ?? "en"}
                visibleOnly={!showFullPreview}
                variableMode={false}
                showActionButtons={true}
                onAttendClick={openReasonModal.bind(null, "attend")}
                onDeclineClick={openReasonModal.bind(null, "decline")}
                onBannerClick={() => bannerInputRef.current?.click()}
                onFooterClick={() => footerInputRef.current?.click()}
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

        {/* Right: Config / Theme / Translation panels */}
        {editingField && (
          <RsvpFieldConfigPanel
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

      {/* Step 4: Reason popup when Attend or Decline is clicked */}
      {reasonModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onMouseDown={(e) => e.target === e.currentTarget && closeReasonModal()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {reasonModal.type === "attend" ? "Reason for attending" : "Reason for declining"}
              </h3>
              <button
                type="button"
                onClick={closeReasonModal}
                className="p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={
                  reasonModal.type === "attend"
                    ? "e.g. Looking forward to it!"
                    : "e.g. Sorry, I have a conflict."
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
              />
            </div>
            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeReasonModal}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  closeReasonModal();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
