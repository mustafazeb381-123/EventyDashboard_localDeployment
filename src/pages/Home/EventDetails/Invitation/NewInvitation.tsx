import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { getEventbyId } from "@/apis/apiHelpers";
import {
  EmailTemplateBuilderModal,
  type MergeTag,
} from "@/components/EmailTemplateBuilder/EmailTemplateBuilderModal";
import type { TabId, InvitationEmailTemplate } from "./newInvitationTypes";
import { InvitationDetailsTab } from "./InvitationDetailsTab";
import { EmailTemplateTab } from "./EmailTemplateTab";
import { RsvpTemplateTab } from "./RsvpTemplateTab";
import { InviteesTab } from "./InviteesTab";

function NewInvitation() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const eventIdFromUrl = searchParams.get("eventId");

  const [eventId, setEventId] = useState<string | null>(eventIdFromUrl);
  const [eventData, setEventData] = useState<any>(null);
  const [newInvitationActiveTab, setNewInvitationActiveTab] =
    useState<TabId>("invitation-details");
  const [enableRsvp, setEnableRsvp] = useState(true);
  const [invitationForm, setInvitationForm] = useState({
    invitationName: "",
    communicationType: "Email",
    invitationCategory: "",
    event: "",
    language: "Arabic (العربية)",
    scheduleSendAt: "",
    emailSubject: "",
    backgroundColor: "#ffffff",
    emailSender: "",
  });
  const [invitationEmailTemplates, setInvitationEmailTemplates] = useState<
    InvitationEmailTemplate[]
  >([]);
  const [
    selectedInvitationEmailTemplateId,
    setSelectedInvitationEmailTemplateId,
  ] = useState<string | null>(null);
  const [showInvitationNameDialog, setShowInvitationNameDialog] =
    useState(false);
  const [invitationCustomTemplateName, setInvitationCustomTemplateName] =
    useState("");
  const [invitationEmailBuilderOpen, setInvitationEmailBuilderOpen] =
    useState(false);
  const [invitationEmailEditingTemplate, setInvitationEmailEditingTemplate] =
    useState<InvitationEmailTemplate | null>(null);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [inviteesFile, setInviteesFile] = useState<File | null>(null);
  const inviteesFileInputRef = useRef<HTMLInputElement>(null);

  // RSVP Template tab: custom builder (same as Email Template)
  const [rsvpTemplates, setRsvpTemplates] = useState<InvitationEmailTemplate[]>(
    [],
  );
  const [selectedRsvpTemplateId, setSelectedRsvpTemplateId] = useState<
    string | null
  >(null);
  const [showRsvpNameDialog, setShowRsvpNameDialog] = useState(false);
  const [rsvpCustomTemplateName, setRsvpCustomTemplateName] = useState("");
  const [rsvpBuilderOpen, setRsvpBuilderOpen] = useState(false);
  const [rsvpEditingTemplate, setRsvpEditingTemplate] =
    useState<InvitationEmailTemplate | null>(null);
  const [rsvpPreviewTemplate, setRsvpPreviewTemplate] =
    useState<InvitationEmailTemplate | null>(null);
  const [rsvpEmailSubject, setRsvpEmailSubject] = useState("");

  useEffect(() => {
    const id = searchParams.get("eventId");
    if (id) setEventId(id);
  }, [location.search]);

  useEffect(() => {
    if (eventId) {
      getEventbyId(eventId)
        .then((res) => {
          setEventData(res.data);
        })
        .catch(() => setEventData(null));
    } else {
      const stored =
        localStorage.getItem("create_eventId") ||
        localStorage.getItem("edit_eventId");
      if (stored) setEventId(stored);
    }
  }, [eventId]);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info",
  ) => {
    setNotification({ message, type });
  };

  const invitationEmailMergeTags: MergeTag[] = [
    { name: "First Name", value: "{{user.firstname}}" },
    { name: "Last Name", value: "{{user.lastname}}" },
    { name: "Full Name", value: "{{user.fullname}}" },
    { name: "Email", value: "{{user.email}}" },
    { name: "Company", value: "{{user.company}}" },
    { name: "Organization", value: "{{user.organization}}" },
    { name: "Event Name", value: "{{event.name}}" },
    { name: "Event Location", value: "{{event.location}}" },
    { name: "Event Start", value: "{{event.startdate}}" },
    { name: "Event End", value: "{{event.enddate}}" },
    { name: "User QR Code", value: "{{user.qrcode}}" },
  ];

  // RSVP template merge tags: same as invitation + Accept/Decline links for buttons
  const rsvpMergeTags: MergeTag[] = [
    ...invitationEmailMergeTags,
    { name: "RSVP Accept Link", value: "{{rsvp.yes_url}}" },
    { name: "RSVP Decline Link", value: "{{rsvp.no_url}}" },
  ];

  const handleInvitationCreateNewTemplate = () => {
    setInvitationCustomTemplateName("");
    setShowInvitationNameDialog(true);
  };

  const handleInvitationStartCreatingTemplate = () => {
    if (!invitationCustomTemplateName.trim()) {
      showNotification("Please enter a template name", "info");
      return;
    }
    setShowInvitationNameDialog(false);
    setInvitationEmailEditingTemplate(null);
    setInvitationEmailBuilderOpen(true);
  };

  const handleInvitationSaveFromBuilder = (design: any, html: string) => {
    const title =
      invitationEmailEditingTemplate?.title ||
      invitationCustomTemplateName.trim() ||
      "Custom Template";
    if (invitationEmailEditingTemplate) {
      setInvitationEmailTemplates((prev) =>
        prev.map((t) =>
          t.id === invitationEmailEditingTemplate.id
            ? { ...t, title, html, design }
            : t,
        ),
      );
      setSelectedInvitationEmailTemplateId(invitationEmailEditingTemplate.id);
    } else {
      const id = `invitation-tpl-${Date.now()}`;
      setInvitationEmailTemplates((prev) => [
        ...prev,
        { id, title, html, design },
      ]);
      setSelectedInvitationEmailTemplateId(id);
    }
    setInvitationEmailBuilderOpen(false);
    setInvitationEmailEditingTemplate(null);
    setInvitationCustomTemplateName("");
    showNotification("Template saved", "success");
  };

  const handleInvitationEditTemplate = (template: InvitationEmailTemplate) => {
    setInvitationEmailEditingTemplate(template);
    setInvitationCustomTemplateName(template.title);
    setInvitationEmailBuilderOpen(true);
  };

  const handleInvitationDeleteTemplate = (
    template: InvitationEmailTemplate,
  ) => {
    setInvitationEmailTemplates((prev) =>
      prev.filter((t) => t.id !== template.id),
    );
    if (selectedInvitationEmailTemplateId === template.id)
      setSelectedInvitationEmailTemplateId(null);
  };

  const handleRsvpCreateNewTemplate = () => {
    setRsvpCustomTemplateName("");
    setShowRsvpNameDialog(true);
  };

  const handleRsvpStartCreatingTemplate = () => {
    if (!rsvpCustomTemplateName.trim()) {
      showNotification("Please enter a template name", "info");
      return;
    }
    setShowRsvpNameDialog(false);
    setRsvpEditingTemplate(null);
    setRsvpBuilderOpen(true);
  };

  const handleRsvpSaveFromBuilder = (design: any, html: string) => {
    const title =
      rsvpEditingTemplate?.title ||
      rsvpCustomTemplateName.trim() ||
      "RSVP Template";
    if (rsvpEditingTemplate) {
      setRsvpTemplates((prev) =>
        prev.map((t) =>
          t.id === rsvpEditingTemplate.id ? { ...t, title, html, design } : t,
        ),
      );
      setSelectedRsvpTemplateId(rsvpEditingTemplate.id);
    } else {
      const id = `rsvp-tpl-${Date.now()}`;
      setRsvpTemplates((prev) => [...prev, { id, title, html, design }]);
      setSelectedRsvpTemplateId(id);
    }
    setRsvpBuilderOpen(false);
    setRsvpEditingTemplate(null);
    setRsvpCustomTemplateName("");
    showNotification("RSVP template saved", "success");
  };

  const handleRsvpEditTemplate = (template: InvitationEmailTemplate) => {
    setRsvpEditingTemplate(template);
    setRsvpCustomTemplateName(template.title);
    setRsvpBuilderOpen(true);
  };

  const handleRsvpDeleteTemplate = (template: InvitationEmailTemplate) => {
    setRsvpTemplates((prev) => prev.filter((t) => t.id !== template.id));
    if (selectedRsvpTemplateId === template.id) setSelectedRsvpTemplateId(null);
  };

  const handleCreateInvitation = async () => {
    if (!eventId) {
      showNotification(
        "Event ID is missing. Cannot create invitation.",
        "error",
      );
      return;
    }
    if (!invitationForm.invitationName || !invitationForm.emailSubject) {
      showNotification(
        "Invitation Name and Email Subject are required",
        "error",
      );
      return;
    }
    const selectedTemplate = invitationEmailTemplates.find(
      (t) => t.id === selectedInvitationEmailTemplateId,
    );
    if (!selectedTemplate) {
      showNotification(
        "Please select or create an email template in the Email Template tab",
        "error",
      );
      return;
    }
    setIsCreatingInvitation(true);
    try {
      const formData = new FormData();
      const tenantUuid = localStorage.getItem("tenant_uuid");
      if (tenantUuid) formData.append("tenant_uuid", tenantUuid);
      formData.append("invitation[name]", invitationForm.invitationName);
      formData.append(
        "invitation[communication_type]",
        invitationForm.communicationType,
      );
      formData.append(
        "invitation[category]",
        invitationForm.invitationCategory,
      );
      formData.append("invitation[language]", invitationForm.language);
      formData.append("invitation[subject]", invitationForm.emailSubject);
      formData.append("invitation[title]", selectedTemplate.title);
      formData.append("invitation[body]", selectedTemplate.html);
      formData.append(
        "invitation[background_color]",
        invitationForm.backgroundColor,
      );
      if (invitationForm.scheduleSendAt)
        formData.append(
          "invitation[schedule_send_at]",
          invitationForm.scheduleSendAt,
        );
      console.log("Creating invitation with data:", {
        ...invitationForm,
        emailTemplate: selectedTemplate.title,
      });
      showNotification("Invitation preview ready!", "success");
      navigate(`/invitation${eventId ? `?eventId=${eventId}` : ""}`);
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create invitation.",
        "error",
      );
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  const backUrl = `/invitation${eventId ? `?eventId=${eventId}` : ""}`;

  return (
    <div className="min-h-full flex flex-col">
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg text-sm ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Figma-style: title + back, then tabs (Invitation Details | Email Template | RSVP Template | Invitees) */}
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <a
            href={backUrl}
            onClick={(e) => {
              e.preventDefault();
              navigate(backUrl);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Back to invitations"
          >
            <ChevronLeft className="w-5 h-5" />
          </a>
          <h1 className="text-2xl font-bold text-gray-900">New Invitation</h1>
        </div>
      </div>

      {/* Tabs: current + previous steps = colorful; next steps = gray */}
      <nav
        className="shrink-0 w-full flex border-b border-gray-200 mb-6"
        aria-label="Invitation steps"
      >
        {(() => {
          const tabs = [
            {
              id: "invitation-details" as TabId,
              label: "Invitation Details",
              colorClass: "text-violet-600 border-b-2 border-violet-600",
            },
            {
              id: "email-template" as TabId,
              label: "Email Template",
              colorClass: "text-red-600 border-b-2 border-red-600",
            },
            ...(enableRsvp
              ? [
                  {
                    id: "rsvp-template" as TabId,
                    label: "RSVP Template",
                    colorClass: "text-blue-600 border-b-2 border-blue-600",
                  },
                ]
              : []),
            {
              id: "invitees" as TabId,
              label: "Invitees",
              colorClass: "text-green-600 border-b-2 border-green-600",
            },
          ];
          const currentIndex = tabs.findIndex((t) => t.id === newInvitationActiveTab);
          return tabs.map((item, index) => {
            const isNext = index > currentIndex;
            const className = isNext
              ? "text-gray-400 border-b-2 border-gray-300"
              : item.colorClass;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setNewInvitationActiveTab(item.id)}
                className={`flex-1 min-w-0 py-4 text-sm font-medium transition-colors text-center ${className}`}
              >
                {item.label}
              </button>
            );
          });
        })()}
      </nav>

      {/* Full-width white card: Basic info + footer with Next/Close on white */}
      <div className="flex-1 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 md:px-10 py-8 md:py-10">
            {newInvitationActiveTab === "invitation-details" && (
              <InvitationDetailsTab
                invitationForm={invitationForm}
                setInvitationForm={setInvitationForm}
                enableRsvp={enableRsvp}
                setEnableRsvp={setEnableRsvp}
                eventData={eventData}
                eventId={eventId}
              />
            )}

            {newInvitationActiveTab === "email-template" && (
              <EmailTemplateTab
                invitationForm={invitationForm}
                setInvitationForm={setInvitationForm}
                invitationEmailTemplates={invitationEmailTemplates}
                selectedInvitationEmailTemplateId={
                  selectedInvitationEmailTemplateId
                }
                setSelectedInvitationEmailTemplateId={
                  setSelectedInvitationEmailTemplateId
                }
                onCreateNewTemplate={handleInvitationCreateNewTemplate}
                onEditTemplate={handleInvitationEditTemplate}
                onDeleteTemplate={handleInvitationDeleteTemplate}
              />
            )}

            {newInvitationActiveTab === "rsvp-template" && (
              <RsvpTemplateTab
                rsvpEmailSubject={rsvpEmailSubject}
                setRsvpEmailSubject={setRsvpEmailSubject}
                rsvpTemplates={rsvpTemplates}
                selectedRsvpTemplateId={selectedRsvpTemplateId}
                setSelectedRsvpTemplateId={setSelectedRsvpTemplateId}
                onCreateNewTemplate={handleRsvpCreateNewTemplate}
                onEditTemplate={handleRsvpEditTemplate}
                onDeleteTemplate={handleRsvpDeleteTemplate}
                onPreviewTemplate={setRsvpPreviewTemplate}
              />
            )}

            {newInvitationActiveTab === "invitees" && (
              <InviteesTab
                inviteesFile={inviteesFile}
                setInviteesFile={setInviteesFile}
                inviteesFileInputRef={inviteesFileInputRef}
              />
            )}
          </div>

          {/* Footer: Next + Close on same white background as Basic info */}
          <footer className="shrink-0 flex items-center justify-between gap-4 px-6 md:px-10 py-5 border-t border-slate-200 bg-white rounded-b-2xl">
            <div>
              {newInvitationActiveTab !== "invitation-details" && (
                <button
                  type="button"
                  onClick={() => {
                    if (newInvitationActiveTab === "invitees")
                      setNewInvitationActiveTab(
                        enableRsvp ? "rsvp-template" : "email-template",
                      );
                    else if (newInvitationActiveTab === "rsvp-template")
                      setNewInvitationActiveTab("email-template");
                    else setNewInvitationActiveTab("invitation-details");
                  }}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {newInvitationActiveTab === "invitation-details" && (
                <button
                  type="button"
                  onClick={() => setNewInvitationActiveTab("email-template")}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Next
                </button>
              )}
              {newInvitationActiveTab === "email-template" && (
                <button
                  type="button"
                  onClick={() =>
                    setNewInvitationActiveTab(
                      enableRsvp ? "rsvp-template" : "invitees",
                    )
                  }
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Next
                </button>
              )}
              {newInvitationActiveTab === "rsvp-template" && (
                <button
                  type="button"
                  onClick={() => setNewInvitationActiveTab("invitees")}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Next
                </button>
              )}
              {newInvitationActiveTab === "invitees" && (
                <button
                  onClick={handleCreateInvitation}
                  disabled={isCreatingInvitation}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingInvitation ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Create invitation"
                  )}
                </button>
              )}
              <a
                href={backUrl}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(backUrl);
                }}
                className="px-5 py-2.5 border border-slate-300 bg-white text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Close
              </a>
            </div>
          </footer>
        </div>
      </div>

      <EmailTemplateBuilderModal
        open={invitationEmailBuilderOpen}
        title={
          invitationEmailEditingTemplate
            ? "Edit Email Template"
            : "Create Email Template"
        }
        initialDesign={invitationEmailEditingTemplate?.design}
        initialHtml={invitationEmailEditingTemplate?.html}
        mergeTags={invitationEmailMergeTags}
        onClose={() => {
          setInvitationEmailBuilderOpen(false);
          setInvitationEmailEditingTemplate(null);
          setInvitationCustomTemplateName("");
        }}
        onSave={handleInvitationSaveFromBuilder}
        key={invitationEmailEditingTemplate?.id ?? "new"}
      />

      {showInvitationNameDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Create Custom Template
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Enter a name for your new email template
            </p>
            <input
              type="text"
              placeholder="e.g., Welcome Email with QR Code"
              value={invitationCustomTemplateName}
              onChange={(e) => setInvitationCustomTemplateName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInvitationStartCreatingTemplate();
              }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowInvitationNameDialog(false);
                  setInvitationCustomTemplateName("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInvitationStartCreatingTemplate}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSVP Template builder (same as Email Template tab) */}
      <EmailTemplateBuilderModal
        open={rsvpBuilderOpen}
        title={
          rsvpEditingTemplate ? "Edit RSVP Template" : "Create RSVP Template"
        }
        initialDesign={rsvpEditingTemplate?.design}
        initialHtml={rsvpEditingTemplate?.html}
        mergeTags={rsvpMergeTags}
        onClose={() => {
          setRsvpBuilderOpen(false);
          setRsvpEditingTemplate(null);
          setRsvpCustomTemplateName("");
        }}
        onSave={handleRsvpSaveFromBuilder}
        key={rsvpEditingTemplate?.id ?? "rsvp-new"}
      />

      {/* RSVP: name dialog for Create new */}
      {showRsvpNameDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Create RSVP Template
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Enter a name for your RSVP email template (e.g. Accept / Decline)
            </p>
            <input
              type="text"
              placeholder="e.g., RSVP Accept Decline"
              value={rsvpCustomTemplateName}
              onChange={(e) => setRsvpCustomTemplateName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRsvpStartCreatingTemplate();
              }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRsvpNameDialog(false);
                  setRsvpCustomTemplateName("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRsvpStartCreatingTemplate}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSVP Template preview modal */}
      {rsvpPreviewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setRsvpPreviewTemplate(null)}
          role="presentation"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Preview: {rsvpPreviewTemplate.title}
              </h3>
              <button
                type="button"
                onClick={() => setRsvpPreviewTemplate(null)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              {rsvpPreviewTemplate.html ? (
                <iframe
                  title={`Preview ${rsvpPreviewTemplate.title}`}
                  srcDoc={rsvpPreviewTemplate.html}
                  className="w-full min-h-[400px] border-0 rounded-lg bg-white shadow-inner"
                  style={{ height: "60vh" }}
                />
              ) : (
                <p className="text-slate-500 text-sm">No content to preview.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewInvitation;
