import { useState, useEffect } from "react";
import { Check, X, Plus, Edit, Trash2 } from "lucide-react";
import { RsvpFormBuilder } from "./rsvpFormBuilder/RsvpFormBuilder";
import { RsvpFormPreview } from "./rsvpFormBuilder/RsvpFormPreview";
import type {
  RsvpFormField,
  RsvpTheme,
  RsvpLanguageConfig,
  RsvpFormBuilderTemplate,
} from "./rsvpFormBuilder/types";

type RsvpTemplateTabProps = {
  rsvpEmailSubject: string;
  setRsvpEmailSubject: (value: string) => void;
};

/** RSVP Template Tab – same flow as AdvanceRegistration: Custom Builder card + saved templates only. No default templates. No API calls (you will wire APIs later). */
export function RsvpTemplateTab({
  rsvpEmailSubject,
  setRsvpEmailSubject,
}: RsvpTemplateTabProps) {
  // Saved RSVP Form Builder templates (local state only; replace with API when ready)
  const [rsvpFormBuilderTemplates, setRsvpFormBuilderTemplates] = useState<
    RsvpFormBuilderTemplate[]
  >([]);
  // Which template is selected / "in use" (for preview and submission)
  const [confirmedTemplate, setConfirmedTemplate] = useState<string | null>(
    null
  );

  // Custom Form Builder modal
  const [isCustomFormBuilderOpen, setIsCustomFormBuilderOpen] = useState(false);
  const [editingFormBuilderTemplate, setEditingFormBuilderTemplate] =
    useState<RsvpFormBuilderTemplate | null>(null);
  const [isEditFormBuilderMode, setIsEditFormBuilderMode] = useState(false);

  // Delete confirmation modal
  const [deleteCandidate, setDeleteCandidate] =
    useState<RsvpFormBuilderTemplate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview modal (click template card → preview → "Use This Template")
  const [previewTemplate, setPreviewTemplate] =
    useState<RsvpFormBuilderTemplate | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Notification (same pattern as AdvanceRegistration)
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => setNotification({ message, type });

  // ---------- Handlers (no API; local state only) ----------

  const handleOpenCustomFormBuilder = (template?: RsvpFormBuilderTemplate) => {
    if (template) {
      setEditingFormBuilderTemplate(template);
      setIsEditFormBuilderMode(true);
    } else {
      setEditingFormBuilderTemplate(null);
      setIsEditFormBuilderMode(false);
    }
    setIsCustomFormBuilderOpen(true);
  };

  const handleSaveRsvpForm = (
    formFields: RsvpFormField[],
    theme: RsvpTheme,
    languageConfig: RsvpLanguageConfig,
    templateName?: string
  ) => {
    const now = new Date().toISOString();
    if (isEditFormBuilderMode && editingFormBuilderTemplate) {
      const updated: RsvpFormBuilderTemplate = {
        ...editingFormBuilderTemplate,
        title:
          (templateName && templateName.trim()) ||
          editingFormBuilderTemplate.title,
        formFields,
        theme,
        languageConfig,
        updatedAt: now,
      };
      setRsvpFormBuilderTemplates((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      showNotification("Template updated successfully", "success");
    } else {
      const id = `rsvp-template-${Date.now()}`;
      const title =
        (templateName && templateName.trim()) ||
        `RSVP Template ${rsvpFormBuilderTemplates.length + 1}`;
      const newTemplate: RsvpFormBuilderTemplate = {
        id,
        title,
        formFields,
        theme,
        languageConfig,
        createdAt: now,
        updatedAt: now,
      };
      setRsvpFormBuilderTemplates((prev) => [...prev, newTemplate]);
      setConfirmedTemplate(id);
      showNotification("Template saved successfully", "success");
    }
    setIsCustomFormBuilderOpen(false);
    setEditingFormBuilderTemplate(null);
    setIsEditFormBuilderMode(false);
  };

  const handleEditFormBuilderTemplate = (template: RsvpFormBuilderTemplate) => {
    handleOpenCustomFormBuilder(template);
  };

  const handleDeleteFormBuilderTemplate = (templateId: string) => {
    const template =
      rsvpFormBuilderTemplates.find((t) => t.id === templateId) ?? null;
    setDeleteCandidate(template);
    setIsDeleteModalOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteCandidate(null);
  };

  const confirmDelete = () => {
    if (!deleteCandidate) {
      cancelDelete();
      return;
    }
    setIsDeleting(true);
    setRsvpFormBuilderTemplates((prev) =>
      prev.filter((t) => t.id !== deleteCandidate.id)
    );
    if (confirmedTemplate === deleteCandidate.id) {
      setConfirmedTemplate(null);
    }
    showNotification("Template deleted successfully", "success");
    setIsDeleting(false);
    cancelDelete();
  };

  const handleSelectFormBuilderTemplate = (templateId: string) => {
    const template = rsvpFormBuilderTemplates.find((t) => t.id === templateId);
    if (template) {
      setPreviewTemplate(template);
      setIsPreviewModalOpen(true);
    }
  };

  const handleUseFormBuilderTemplate = (templateId: string) => {
    setConfirmedTemplate(templateId);
    showNotification("Template applied successfully", "success");
    setIsPreviewModalOpen(false);
    setPreviewTemplate(null);
  };

  return (
    <div className="space-y-10">
      {/* RSVP email subject */}
      <div className="max-w-xl">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          RSVP email subject
        </label>
        <input
          type="text"
          placeholder="e.g., Please confirm your attendance"
          value={rsvpEmailSubject}
          onChange={(e) => setRsvpEmailSubject(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-shadow"
        />
      </div>

      {/* RSVP template grid – Custom Builder first, then saved templates only (no default templates) */}
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          RSVP email template
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          Create a custom RSVP template or choose one you’ve saved. The selected
          template defines the wording and layout of the RSVP section.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* First card: Custom RSVP Builder (like AdvanceRegistration) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleOpenCustomFormBuilder()}
            onKeyDown={(e) =>
              e.key === "Enter" && handleOpenCustomFormBuilder()
            }
            className="border-2 border-dashed border-indigo-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-indigo-500 hover:bg-indigo-50 flex flex-col items-center justify-center aspect-square relative"
          >
            <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
              New
            </div>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-indigo-600" size={32} />
            </div>
            <h3 className="text-lg font-medium mb-2 text-center text-indigo-600">
              Custom RSVP Builder
            </h3>
            <p className="text-sm text-gray-500 text-center">
              Fully customizable with drag and drop, theme and translations
            </p>
          </div>

          {/* Saved RSVP Form Builder templates */}
          {rsvpFormBuilderTemplates.map((template) => {
            const isSelected = confirmedTemplate === template.id;
            return (
              <div
                key={template.id}
                className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col relative overflow-hidden ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-500"
                }`}
              >
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditFormBuilderTemplate(template);
                    }}
                    className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-500 hover:bg-indigo-50 transition-colors"
                    title="Edit Template"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFormBuilderTemplate(template.id);
                    }}
                    className="p-1.5 bg-white rounded-lg shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Template"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectFormBuilderTemplate(template.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleSelectFormBuilderTemplate(template.id)
                  }
                  className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-slate-50 relative flex-1 min-h-0"
                >
                  <div
                    style={{ scale: 0.25 }}
                    className="transform pointer-events-none origin-top-left w-[800px]"
                  >
                    <RsvpFormPreview
                      formFields={template.formFields}
                      theme={template.theme}
                      currentLanguage={
                        template.languageConfig.primaryLanguage ?? "en"
                      }
                    />
                  </div>
                </div>
                <div className="mt-2 text-center flex-shrink-0">
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {template.title}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {template.formFields.length} field
                    {template.formFields.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {isSelected && (
                  <div className="mt-2 flex items-center justify-center">
                    <Check size={16} className="text-indigo-500 mr-1" />
                    <span className="text-sm text-indigo-600 font-medium">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Form Builder modal */}
      {isCustomFormBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-full h-full max-w-[95vw] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden">
            <RsvpFormBuilder
              initialFormFields={editingFormBuilderTemplate?.formFields}
              initialTheme={editingFormBuilderTemplate?.theme}
              initialLanguageConfig={editingFormBuilderTemplate?.languageConfig}
              initialTemplateName={editingFormBuilderTemplate?.title ?? ""}
              onSave={handleSaveRsvpForm}
              onClose={() => {
                setIsCustomFormBuilderOpen(false);
                setEditingFormBuilderTemplate(null);
                setIsEditFormBuilderMode(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cancelDelete();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Delete Template
              </h3>
              <button
                type="button"
                onClick={cancelDelete}
                className="p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteCandidate?.title ?? "this template"}
                </span>
                ?
              </p>
              <p className="text-xs text-slate-500 mt-2">
                This action can’t be undone.
              </p>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal – "Use This Template" */}
      {isPreviewModalOpen && previewTemplate && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                {previewTemplate.title}
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleUseFormBuilderTemplate(previewTemplate.id)
                  }
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  Use This Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    setPreviewTemplate(null);
                  }}
                  className="text-slate-400 hover:text-slate-800 bg-slate-200 rounded p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <RsvpFormPreview
              formFields={previewTemplate.formFields}
              theme={previewTemplate.theme}
              currentLanguage={
                previewTemplate.languageConfig.primaryLanguage ?? "en"
              }
            />
          </div>
        </div>
      )}

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                  ? "bg-red-500 text-white"
                  : notification.type === "warning"
                    ? "bg-yellow-500 text-white"
                    : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
