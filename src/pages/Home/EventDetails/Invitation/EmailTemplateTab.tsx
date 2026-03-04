import { useState, useEffect } from "react";
import { Plus, Check, Pencil, Trash2, Eye, Code, X, Copy } from "lucide-react";
import { getEventInvitations } from "@/apis/invitationService";
import type { InvitationEmailTemplate, InvitationForm } from "./newInvitationTypes";

/** Invitation from API (made templates) – used for preview only */
export type MadeInvitationTemplate = {
  id: number;
  title: string;
  invitation_email_subject: string;
  invitation_email_body?: string;
};

type EmailTemplateTabProps = {
  invitationForm: InvitationForm;
  setInvitationForm: React.Dispatch<React.SetStateAction<InvitationForm>>;
  invitationEmailTemplates: InvitationEmailTemplate[];
  selectedInvitationEmailTemplateId: string | null;
  setSelectedInvitationEmailTemplateId: (id: string | null) => void;
  onCreateNewTemplate: () => void;
  onEditTemplate: (template: InvitationEmailTemplate) => void;
  onDeleteTemplate: (template: InvitationEmailTemplate) => void;
  /** When set, fetches event invitations and shows "Made templates" previews */
  eventId?: string | null;
};

export function EmailTemplateTab({
  invitationForm,
  setInvitationForm,
  invitationEmailTemplates,
  selectedInvitationEmailTemplateId,
  setSelectedInvitationEmailTemplateId,
  onCreateNewTemplate,
  onEditTemplate,
  onDeleteTemplate,
  eventId,
}: EmailTemplateTabProps) {
  const [previewTemplate, setPreviewTemplate] = useState<InvitationEmailTemplate | MadeInvitationTemplate | null>(null);
  const [codeTemplate, setCodeTemplate] = useState<InvitationEmailTemplate | MadeInvitationTemplate | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [madeTemplates, setMadeTemplates] = useState<MadeInvitationTemplate[]>([]);
  const [loadingMadeTemplates, setLoadingMadeTemplates] = useState(false);

  // Fetch event invitations (made templates) when eventId is set
  useEffect(() => {
    if (!eventId) {
      setMadeTemplates([]);
      return;
    }
    setLoadingMadeTemplates(true);
    getEventInvitations(eventId, { page: 1, per_page: 20 })
      .then((res) => {
        const data = (res.data as unknown) as {
          data?: Array<{ id: string; attributes?: Record<string, unknown> }>;
        };
        const rawList = Array.isArray(data?.data) ? data.data : [];
        const list: MadeInvitationTemplate[] = rawList
          .filter((item) => item?.attributes)
          .map((item) => ({
            id: Number(item.id) || 0,
            title: String(item.attributes?.title ?? ""),
            invitation_email_subject: String(item.attributes?.invitation_email_subject ?? ""),
            invitation_email_body: item.attributes?.invitation_email_body
              ? String(item.attributes.invitation_email_body)
              : undefined,
          }));
        setMadeTemplates(list);
      })
      .catch(() => setMadeTemplates([]))
      .finally(() => setLoadingMadeTemplates(false));
  }, [eventId]);

  const getTemplateHtml = (t: InvitationEmailTemplate | MadeInvitationTemplate | null) =>
    t && "html" in t ? t.html : (t as MadeInvitationTemplate)?.invitation_email_body ?? "";

  const getTemplateTitle = (t: InvitationEmailTemplate | MadeInvitationTemplate | null) =>
    t?.title ?? "";

  const handleCopyCode = () => {
    const html = getTemplateHtml(codeTemplate);
    if (!html) return;
    navigator.clipboard.writeText(html).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-6">
          Email content
        </h3>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Email Subject
        </label>
        <input
          type="text"
          placeholder="e.g., You're invited to our event"
          value={invitationForm.emailSubject}
          onChange={(e) =>
            setInvitationForm({
              ...invitationForm,
              emailSubject: e.target.value,
            })
          }
          className="w-full max-w-xl px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Email Template
        </label>
        <p className="text-xs text-slate-500 mb-4">
          Create a custom template with the builder or select one below. The
          selected template is used as the invitation email body.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={onCreateNewTemplate}
            className="border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 min-h-[280px]"
          >
            <div className="text-center">
              <Plus className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                Create new
              </span>
            </div>
          </div>
          {invitationEmailTemplates.map((template) => {
            const isSelected =
              selectedInvitationEmailTemplateId === template.id;
            return (
              <div
                key={template.id}
                onClick={() =>
                  setSelectedInvitationEmailTemplateId(
                    selectedInvitationEmailTemplateId === template.id
                      ? null
                      : template.id,
                  )
                }
                className={`group cursor-pointer rounded-2xl border-2 p-4 transition-colors flex flex-col min-h-[280px] overflow-hidden ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                    : "border-slate-200 hover:border-indigo-400 bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex-1 min-h-0 overflow-hidden rounded-lg relative bg-slate-100">
                  {template.html ? (
                    <iframe
                      title={template.title}
                      srcDoc={template.html}
                      className="w-full h-full min-h-[180px] pointer-events-none border-0 scale-[0.35] origin-top-left"
                      style={{ width: "285%", height: "285%" }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                      No preview
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <div className="flex flex-wrap justify-center gap-2 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                        aria-label="Preview"
                        title="Preview"
                      >
                        <Eye size={18} className="text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCodeTemplate(template);
                        }}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                        aria-label="See code"
                        title="See code"
                      >
                        <Code size={18} className="text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTemplate(template);
                        }}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                        aria-label="Edit template"
                        title="Edit"
                      >
                        <Pencil size={18} className="text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTemplate(template);
                        }}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-red-400 transition-colors cursor-pointer"
                        aria-label="Delete template"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-slate-900 truncate pr-2">
                      {template.title}
                    </span>
                    {isSelected && (
                      <div className="flex items-center shrink-0">
                        <Check
                          size={16}
                          className="text-indigo-500 mr-1"
                        />
                        <span className="text-sm text-indigo-500 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Made templates (from API) – read-only previews, at bottom */}
      {eventId && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Made templates
          </label>
          <p className="text-xs text-slate-500 mb-4">
            Invitation email templates already created for this event. Preview only.
          </p>
          {loadingMadeTemplates ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-slate-200 bg-slate-50 min-h-[280px] animate-pulse"
                />
              ))}
            </div>
          ) : madeTemplates.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No invitation templates for this event yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {madeTemplates.map((template) => {
                const html = template.invitation_email_body ?? "";
                return (
                  <div
                    key={template.id}
                    className="group rounded-2xl border-2 border-slate-200 bg-white hover:shadow-sm transition-colors flex flex-col min-h-[280px] overflow-hidden"
                  >
                    <div className="flex-1 min-h-0 overflow-hidden rounded-lg relative bg-slate-100">
                      {html ? (
                        <iframe
                          title={template.title}
                          srcDoc={html}
                          className="w-full h-full min-h-[180px] pointer-events-none border-0 scale-[0.35] origin-top-left"
                          style={{ width: "285%", height: "285%" }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                          No preview
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <div className="flex flex-wrap justify-center gap-2 pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(template);
                            }}
                            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                            aria-label="Preview"
                            title="Preview"
                          >
                            <Eye size={18} className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCodeTemplate(template);
                            }}
                            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                            aria-label="See code"
                            title="See code"
                          >
                            <Code size={18} className="text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 px-1">
                      <div className="font-medium text-sm text-slate-900 truncate">
                        {template.title || `Invitation #${template.id}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Preview modal – full email preview */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreviewTemplate(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Preview – {getTemplateTitle(previewTemplate)}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-slate-100 p-4">
              {getTemplateHtml(previewTemplate) ? (
                <iframe
                  title={`Preview ${getTemplateTitle(previewTemplate)}`}
                  srcDoc={getTemplateHtml(previewTemplate)}
                  className="w-full min-h-[500px] border-0 rounded-lg bg-white shadow-inner"
                  style={{ height: "70vh" }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  No content to preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code modal – raw HTML */}
      {codeTemplate && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCodeTemplate(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Code – {getTemplateTitle(codeTemplate)}
              </h3>
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
                  onClick={() => setCodeTemplate(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-4">
              <pre className="text-xs font-mono text-slate-800 bg-slate-50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap break-words max-h-[70vh]">
                {getTemplateHtml(codeTemplate) || "No HTML content"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
