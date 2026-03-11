import { useState, useEffect } from "react";
import { Check, X, Plus, Edit, Trash2, Eye, Code, Copy, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RsvpFormBuilder } from "./rsvpFormBuilder/RsvpFormBuilder";
import { RsvpFormPreview } from "./rsvpFormBuilder/RsvpFormPreview";
import type {
  RsvpFormField,
  RsvpTheme,
  RsvpLanguageConfig,
  RsvpFormBuilderTemplate,
} from "./rsvpFormBuilder/types";
import { getDefaultRsvpFormFields } from "./rsvpFormBuilder/types";
import { getRsvpUrl } from "./resolveInvitationEmailLinks";

type RsvpTemplateTabProps = {
  rsvpEmailSubject: string;
  setRsvpEmailSubject: (value: string) => void;
  /** Initial RSVP template JSON from API (event_invitations.rsvp_template) */
  initialRsvpTemplate?: string | null;
  /** Called when the selected RSVP template changes; pass JSON string for API */
  onRsvpTemplateChange?: (rsvpTemplateJson: string | null) => void;
  /** Event ID for Share RSVP link (copies URL to clipboard) */
  eventId?: string | null;
  /** Invitation ID for Share RSVP link; when set, link is /rsvp/{eventId}/{invitationId}?tenant_uuid=... */
  invitationId?: string | null;
};

/** Default theme for auto-created RSVP template (matches RsvpFormBuilder defaultTheme) */
const DEFAULT_RSVP_THEME: RsvpTheme = {
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

/** Sanitize theme so image fields are string (base64) or null only – never {} (File stringifies as {}) */
function sanitizeThemeForJson(theme: RsvpTheme): RsvpTheme {
  const next = { ...theme };
  if (typeof next.bannerImage !== "string") next.bannerImage = null;
  if (typeof next.footerBannerImage !== "string") next.footerBannerImage = null;
  if (typeof next.formBackgroundImage !== "string") next.formBackgroundImage = null;
  return next;
}

/** Serialize confirmed template to JSON string for API (title, formFields, theme, languageConfig) */
function serializeRsvpTemplate(template: RsvpFormBuilderTemplate): string {
  const theme = sanitizeThemeForJson(template.theme);
  return JSON.stringify({
    title: template.title,
    formFields: template.formFields,
    theme,
    languageConfig: template.languageConfig,
  });
}

/** RSVP Template Tab – same flow as AdvanceRegistration: Custom Builder card + saved templates only. No default templates. No API calls (you will wire APIs later). */
export function RsvpTemplateTab({
  rsvpEmailSubject: _rsvpEmailSubject,
  setRsvpEmailSubject: _setRsvpEmailSubject,
  initialRsvpTemplate = null,
  onRsvpTemplateChange,
  eventId = null,
  invitationId = null,
}: RsvpTemplateTabProps) {
  const { t } = useTranslation("dashboard");
  // Saved RSVP Form Builder templates (local state only; replace with API when ready)
  const [rsvpFormBuilderTemplates, setRsvpFormBuilderTemplates] = useState<
    RsvpFormBuilderTemplate[]
  >(() => {
    if (!initialRsvpTemplate || typeof initialRsvpTemplate !== "string" || !initialRsvpTemplate.trim())
      return [];
    try {
      const parsed = JSON.parse(initialRsvpTemplate) as {
        title?: string;
        formFields?: RsvpFormField[];
        theme?: RsvpTheme;
        languageConfig?: RsvpLanguageConfig;
      };
      if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) return [];
      const now = new Date().toISOString();
      const id = "rsvp-template-initial";
      const template: RsvpFormBuilderTemplate = {
        id,
        title: parsed.title ?? "RSVP Template",
        formFields: Array.isArray(parsed.formFields) ? parsed.formFields : [],
        theme: parsed.theme ?? {},
        languageConfig: parsed.languageConfig ?? { languageMode: "single", primaryLanguage: "en" },
        createdAt: now,
        updatedAt: now,
      };
      return [template];
    } catch {
      return [];
    }
  });
  // Which template is selected / "in use" (for preview and submission)
  const [confirmedTemplate, setConfirmedTemplate] = useState<string | null>(
    () => {
      if (!initialRsvpTemplate || typeof initialRsvpTemplate !== "string" || !initialRsvpTemplate.trim())
        return null;
      try {
        const parsed = JSON.parse(initialRsvpTemplate) as Record<string, unknown>;
        if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) return null;
        return "rsvp-template-initial";
      } catch {
        return null;
      }
    }
  );

  // When initialRsvpTemplate is set after load (e.g. edit mode: invitation data loads after mount), sync into local state.
  // Only sync when we have no templates yet so we don't overwrite user edits.
  useEffect(() => {
    if (!initialRsvpTemplate || typeof initialRsvpTemplate !== "string" || !initialRsvpTemplate.trim())
      return;
    try {
      const parsed = JSON.parse(initialRsvpTemplate) as {
        title?: string;
        formFields?: RsvpFormField[];
        theme?: RsvpTheme;
        languageConfig?: RsvpLanguageConfig;
      };
      if (!parsed || typeof parsed !== "object") return;
      // Do not show template if empty (e.g. {})
      if (Object.keys(parsed).length === 0) return;
      const now = new Date().toISOString();
      const id = "rsvp-template-initial";
      const template: RsvpFormBuilderTemplate = {
        id,
        title: parsed.title ?? "RSVP Template",
        formFields: Array.isArray(parsed.formFields) ? parsed.formFields : [],
        theme: parsed.theme ?? {},
        languageConfig: parsed.languageConfig ?? { languageMode: "single", primaryLanguage: "en" },
        createdAt: now,
        updatedAt: now,
      };
      setRsvpFormBuilderTemplates((prev) => (prev.length > 0 ? prev : [template]));
      setConfirmedTemplate((prev) => (prev === null ? id : prev));
    } catch {
      // ignore parse error
    }
  }, [initialRsvpTemplate]);

  // Whenever confirmed template or its data changes, notify parent with JSON string for API
  useEffect(() => {
    if (!onRsvpTemplateChange) return;
    if (!confirmedTemplate) {
      onRsvpTemplateChange(null);
      return;
    }
    const template = rsvpFormBuilderTemplates.find((t) => t.id === confirmedTemplate);
    if (template) {
      onRsvpTemplateChange(serializeRsvpTemplate(template));
    } else {
      onRsvpTemplateChange(null);
    }
  }, [confirmedTemplate, rsvpFormBuilderTemplates, onRsvpTemplateChange]);

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

  // Preview modal (click template card or Preview button → preview → "Use This Template")
  const [previewTemplate, setPreviewTemplate] =
    useState<RsvpFormBuilderTemplate | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Code modal – show form definition as JSON
  const [codeTemplate, setCodeTemplate] =
    useState<RsvpFormBuilderTemplate | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Inline edit template name on card
  const [editingTitleTemplateId, setEditingTitleTemplateId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

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
      setIsCustomFormBuilderOpen(true);
    } else {
      // Auto-generate one RSVP template when user wants to build; open builder to edit name and form
      const now = new Date().toISOString();
      const id = `rsvp-template-${Date.now()}`;
      const newTemplate: RsvpFormBuilderTemplate = {
        id,
        title: `RSVP Form ${rsvpFormBuilderTemplates.length + 1}`,
        formFields: getDefaultRsvpFormFields(),
        theme: { ...DEFAULT_RSVP_THEME },
        languageConfig: { languageMode: "single", primaryLanguage: "en" },
        createdAt: now,
        updatedAt: now,
      };
      setRsvpFormBuilderTemplates((prev) => [...prev, newTemplate]);
      setConfirmedTemplate(id);
      setEditingFormBuilderTemplate(newTemplate);
      setIsEditFormBuilderMode(true);
      setIsCustomFormBuilderOpen(true);
    }
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
      showNotification(t("invitation.rsvpTemplateTab.templateUpdatedSuccess"), "success");
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
      showNotification(t("invitation.rsvpTemplateTab.templateSavedSuccess"), "success");
    }
    setIsCustomFormBuilderOpen(false);
    setEditingFormBuilderTemplate(null);
    setIsEditFormBuilderMode(false);
  };

  const handleEditFormBuilderTemplate = (template: RsvpFormBuilderTemplate) => {
    handleOpenCustomFormBuilder(template);
  };

  const handleStartEditTitle = (e: React.MouseEvent, template: RsvpFormBuilderTemplate) => {
    e.stopPropagation();
    setEditingTitleTemplateId(template.id);
    setEditingTitleValue(template.title);
  };

  const handleCommitTitleEdit = (templateId: string) => {
    const trimmed = editingTitleValue.trim();
    setRsvpFormBuilderTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId ? { ...t, title: trimmed || t.title, updatedAt: new Date().toISOString() } : t
      )
    );
    setEditingTitleTemplateId(null);
    setEditingTitleValue("");
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
    showNotification(t("invitation.rsvpTemplateTab.templateDeletedSuccess"), "success");
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
    showNotification(t("invitation.rsvpTemplateTab.templateAppliedSuccess"), "success");
    setIsPreviewModalOpen(false);
    setPreviewTemplate(null);
  };

  const handleOpenPreview = (template: RsvpFormBuilderTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleOpenCode = (template: RsvpFormBuilderTemplate) => {
    setCodeTemplate(template);
    setIsCodeModalOpen(true);
  };

  const handleCopyCode = () => {
    if (!codeTemplate) return;
    const json = JSON.stringify(
      {
        title: codeTemplate.title,
        formFields: codeTemplate.formFields,
        theme: codeTemplate.theme,
        languageConfig: codeTemplate.languageConfig,
      },
      null,
      2
    );
    navigator.clipboard.writeText(json).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  // RSVP link must include invitation ID so recipients can load the form. Without it, link in emails won't work.
  const tenantUuid = typeof window !== "undefined" ? localStorage.getItem("tenant_uuid") : null;
  const rsvpLinkUrlWithToken = getRsvpUrl(eventId ?? null, invitationId ?? null, tenantUuid, true);
  const rsvpLinkHasInvitationId = Boolean(invitationId);
  const rsvpLinkUrl = rsvpLinkHasInvitationId ? rsvpLinkUrlWithToken : null;
  const rsvpLinkUrlForPreview = getRsvpUrl(eventId ?? null, invitationId ?? null, tenantUuid, false);
  const handleShareRsvpLink = () => {
    if (!rsvpLinkHasInvitationId) {
      showNotification(
        t("invitation.rsvpTemplateTab.saveInvitationFirstLink"),
        "warning"
      );
      return;
    }
    if (!rsvpLinkUrl) {
      showNotification(t("invitation.rsvpTemplateTab.eventIdMissing"), "warning");
      return;
    }
    navigator.clipboard
      .writeText(rsvpLinkUrlWithToken)
      .then(() => showNotification(t("invitation.rsvpTemplateTab.rsvpLinkCopied"), "success"))
      .catch(() => showNotification(t("invitation.rsvpTemplateTab.failedToCopyLink"), "error"));
  };

  return (
    <div className="space-y-10">
      {/* Share RSVP link – clickable link + copy URL for this event's RSVP page */}
      {eventId && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800">{t("invitation.rsvpTemplateTab.rsvpLink")}</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {t("invitation.rsvpTemplateTab.shareRsvpDescription")}
              {!rsvpLinkHasInvitationId && (
                <span className="mt-1 block font-medium text-amber-700">
                  {t("invitation.rsvpTemplateTab.saveInvitationFirstWarning")}
                </span>
              )}
            </p>
            {rsvpLinkUrl ? (
              <>
                <a
                  href={rsvpLinkUrlForPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800 hover:underline break-all"
                >
                  Open RSVP page
                </a>
                <p className="mt-1 text-xs text-slate-500 break-all" title="Backend will replace {{tenant_uuid}} and {{rsvp_token}} per invitee when sending">
                  {rsvpLinkUrlWithToken}
                </p>
              </>
            ) : rsvpLinkHasInvitationId ? null : (
              <p className="mt-2 text-xs text-amber-700">{t("invitation.rsvpTemplateTab.linkWillAppear")}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleShareRsvpLink}
            className="flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            disabled={!rsvpLinkHasInvitationId}
          >
            <Share2 size={18} />
            {t("invitation.rsvpTemplateTab.copyLink")}
          </button>
        </div>
      )}

      {/* RSVP template grid – Custom Builder first, then saved templates only (no default templates) */}
      <div>
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
              {t("invitation.rsvpTemplateTab.new")}
            </div>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-indigo-600" size={32} />
            </div>
            <h3 className="text-lg font-medium mb-2 text-center text-indigo-600">
              {t("invitation.rsvpTemplateTab.customRsvpBuilder")}
            </h3>
            <p className="text-sm text-gray-500 text-center">
              {t("invitation.rsvpTemplateTab.customRsvpDescription")}
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
                <div className="absolute top-2 right-2 flex flex-wrap gap-1 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPreview(template);
                    }}
                    className="p-1.5 bg-white rounded-lg shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    title={t("invitation.rsvpTemplateTab.preview")}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCode(template);
                    }}
                    className="p-1.5 bg-white rounded-lg shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    title={t("invitation.rsvpTemplateTab.seeCode")}
                  >
                    <Code size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditFormBuilderTemplate(template);
                    }}
                    className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-500 hover:bg-indigo-50 transition-colors"
                    title={t("invitation.rsvpTemplateTab.editTemplate")}
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
                    title={t("invitation.rsvpTemplateTab.deleteTemplate")}
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
                      visibleOnly={true}
                    />
                  </div>
                </div>
                <div className="mt-2 text-center shrink-0">
                  {editingTitleTemplateId === template.id ? (
                    <input
                      type="text"
                      value={editingTitleValue}
                      onChange={(e) => setEditingTitleValue(e.target.value)}
                      onBlur={() => handleCommitTitleEdit(template.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCommitTitleEdit(template.id);
                        if (e.key === "Escape") {
                          setEditingTitleTemplateId(null);
                          setEditingTitleValue("");
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-sm font-medium text-slate-900 border border-indigo-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                      aria-label={t("invitation.rsvpTemplateTab.templateName")}
                    />
                  ) : (
                    <h4
                      className="text-sm font-medium text-slate-900 truncate cursor-pointer hover:text-indigo-600 hover:underline"
                      onClick={(e) => handleStartEditTitle(e, template)}
                      title={t("invitation.rsvpTemplateTab.clickToEditName")}
                    >
                      {template.title}
                    </h4>
                  )}
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {template.formFields.length} {template.formFields.length !== 1 ? t("invitation.rsvpTemplateTab.elements") : t("invitation.rsvpTemplateTab.element")}
                  </span>
                </div>
                {isSelected && (
                  <div className="mt-2 flex items-center justify-center">
                    <Check size={16} className="text-indigo-500 mr-1" />
                    <span className="text-sm text-indigo-600 font-medium">
                      {t("invitation.rsvpTemplateTab.selected")}
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
                {t("invitation.rsvpTemplateTab.deleteTemplateTitle")}
              </h3>
              <button
                type="button"
                onClick={cancelDelete}
                className="p-2 hover:bg-slate-100 rounded-lg"
                aria-label={t("invitation.rsvpTemplateTab.close")}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-700">
                {t("invitation.rsvpTemplateTab.deleteTemplateConfirm")}{" "}
                <span className="font-semibold">
                  {deleteCandidate?.title ?? t("invitation.rsvpTemplateTab.thisTemplate")}
                </span>
                ?
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {t("invitation.rsvpTemplateTab.cannotBeUndone")}
              </p>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t("invitation.rsvpTemplateTab.cancel")}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {isDeleting ? t("invitation.rsvpTemplateTab.deletingEllipsis") : t("invitation.rsvpTemplateTab.deleteVerb")}
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
                  {t("invitation.rsvpTemplateTab.useThisTemplate")}
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
              visibleOnly={true}
            />
          </div>
        </div>
      )}

      {/* Code modal – form definition as JSON */}
      {isCodeModalOpen && codeTemplate && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsCodeModalOpen(false);
              setCodeTemplate(null);
            }
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Code – {codeTemplate.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  <Copy size={16} />
                  {codeCopied ? t("invitation.rsvpTemplateTab.copiedBang") : t("invitation.rsvpTemplateTab.copy")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCodeModalOpen(false);
                    setCodeTemplate(null);
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  aria-label={t("invitation.rsvpTemplateTab.close")}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-4">
              <pre className="text-xs font-mono text-slate-800 bg-slate-50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap break-words max-h-[70vh]">
                {JSON.stringify(
                  {
                    title: codeTemplate.title,
                    formFields: codeTemplate.formFields,
                    theme: codeTemplate.theme,
                    languageConfig: codeTemplate.languageConfig,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
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
