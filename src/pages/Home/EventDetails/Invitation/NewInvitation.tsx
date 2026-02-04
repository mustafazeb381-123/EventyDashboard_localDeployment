import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Check,
  Pencil,
  Trash2,
  Info,
  FileText,
  ChevronLeft,
  ChevronDown,
  Upload,
  X,
} from "lucide-react";
import { getEventbyId } from "@/apis/apiHelpers";
import {
  EmailTemplateBuilderModal,
  type MergeTag,
} from "@/components/EmailTemplateBuilder/EmailTemplateBuilderModal";

type InvitationEmailTemplate = {
  id: string;
  title: string;
  html: string;
  design: any;
};

type TabId =
  | "invitation-details"
  | "email-template"
  | "rsvp-template"
  | "invitees";

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

      {/* Figma-style tabs with purple underline for active */}
      <nav
        className="shrink-0 flex gap-6 md:gap-8 border-b border-gray-200 mb-6"
        aria-label="Invitation steps"
      >
        {[
          { id: "invitation-details" as TabId, label: "Invitation Details" },
          { id: "email-template" as TabId, label: "Email Template" },
          ...(enableRsvp
            ? [{ id: "rsvp-template" as TabId, label: "RSVP Template" }]
            : []),
          { id: "invitees" as TabId, label: "Invitees" },
        ].map((item) => {
          const isActive = newInvitationActiveTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setNewInvitationActiveTab(item.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-indigo-600 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Full-width white card: Basic info + footer with Next/Close on white */}
      <div className="flex-1 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 md:px-10 py-8 md:py-10">
            {newInvitationActiveTab === "invitation-details" && (
              <>
                <h3 className="text-base font-semibold text-slate-800 mb-6">
                  Basic information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Invitation Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Annual Conference 2025"
                        value={invitationForm.invitationName}
                        onChange={(e) =>
                          setInvitationForm({
                            ...invitationForm,
                            invitationName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Communication Type
                      </label>
                      <select
                        value={invitationForm.communicationType}
                        onChange={(e) =>
                          setInvitationForm({
                            ...invitationForm,
                            communicationType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-slate-900"
                      >
                        <option>Email</option>
                        <option>SMS</option>
                        <option>WhatsApp</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Schedule Send At{" "}
                        <span className="text-slate-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="datetime-local"
                        value={invitationForm.scheduleSendAt}
                        onChange={(e) =>
                          setInvitationForm({
                            ...invitationForm,
                            scheduleSendAt: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Leave empty to send immediately
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Event
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={
                          eventData?.data?.attributes?.name ??
                          (eventId ? `Event (ID: ${eventId})` : "—")
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 text-slate-700 cursor-not-allowed"
                        tabIndex={-1}
                        aria-readonly="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Invitation Language
                      </label>
                      <select
                        value={invitationForm.language}
                        onChange={(e) =>
                          setInvitationForm({
                            ...invitationForm,
                            language: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-slate-900"
                      >
                        <option>Arabic (العربية)</option>
                        <option>English</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Language for invitation links and email content
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email Sender
                      </label>
                      <select
                        value={invitationForm.emailSender}
                        onChange={(e) =>
                          setInvitationForm({
                            ...invitationForm,
                            emailSender: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-slate-500"
                      >
                        <option value="">Select Email Sender</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    Enable RSVP?
                  </span>
                  <button
                    type="button"
                    className="p-0.5 rounded-full text-slate-400 hover:text-slate-600"
                    title="RSVP allows invitees to respond yes/no"
                    aria-label="Info about RSVP"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableRsvp}
                    onClick={() => setEnableRsvp(!enableRsvp)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      enableRsvp ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ${
                        enableRsvp ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs text-slate-500">
                    Let invitees respond yes or no
                  </span>
                </div>
              </>
            )}

            {newInvitationActiveTab === "email-template" && (
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
                    Create a custom template with the builder or select one
                    below. The selected template is used as the invitation email
                    body.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div
                      onClick={handleInvitationCreateNewTemplate}
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
                              <div className="flex gap-2 pointer-events-auto">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInvitationEditTemplate(template);
                                  }}
                                  className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                                  aria-label="Edit template"
                                >
                                  <Pencil size={18} className="text-gray-700" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInvitationDeleteTemplate(template);
                                  }}
                                  className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-red-400 transition-colors cursor-pointer"
                                  aria-label="Delete template"
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
              </div>
            )}

            {newInvitationActiveTab === "rsvp-template" && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    RSVP email subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Please confirm your attendance"
                    value={rsvpEmailSubject}
                    onChange={(e) => setRsvpEmailSubject(e.target.value)}
                    className="w-full max-w-xl px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-2">
                    RSVP email template
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Design the email invitees receive to respond (Accept /
                    Decline). Use the builder to add text, images, and insert{" "}
                    <strong>RSVP Accept Link</strong> or{" "}
                    <strong>RSVP Decline Link</strong> as buttons or links so
                    invitees can respond.
                  </p>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    RSVP templates
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div
                      onClick={handleRsvpCreateNewTemplate}
                      className="border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 min-h-[280px]"
                    >
                      <div className="text-center">
                        <Plus className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">
                          Create new
                        </span>
                      </div>
                    </div>
                    {rsvpTemplates.map((template) => {
                      const isSelected = selectedRsvpTemplateId === template.id;
                      return (
                        <div
                          key={template.id}
                          onClick={() =>
                            setSelectedRsvpTemplateId(
                              selectedRsvpTemplateId === template.id
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
                                style={{
                                  width: "285%",
                                  height: "285%",
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                                No preview
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                              <div className="flex gap-2 pointer-events-auto">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRsvpPreviewTemplate(template);
                                  }}
                                  className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                                  aria-label="Preview template"
                                >
                                  <FileText className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRsvpEditTemplate(template);
                                  }}
                                  className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                                  aria-label="Edit template"
                                >
                                  <Pencil className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRsvpDeleteTemplate(template);
                                  }}
                                  className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-red-400 transition-colors cursor-pointer"
                                  aria-label="Delete template"
                                >
                                  <Trash2 className="w-5 h-5 text-red-600" />
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
              </div>
            )}

            {newInvitationActiveTab === "invitees" && (
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-slate-800">
                  Send to
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Import From Excel"
                      readOnly
                      className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400"
                    />
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                      aria-hidden
                    />
                  </div>
                  <input
                    ref={inviteesFileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setInviteesFile(file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => inviteesFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Choose file
                  </button>
                </div>
                {inviteesFile && (
                  <div className="flex items-center justify-between gap-4 py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {inviteesFile.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {inviteesFile.size < 1024
                          ? `${inviteesFile.size} B`
                          : inviteesFile.size < 1024 * 1024
                          ? `${(inviteesFile.size / 1024).toFixed(1)} KB`
                          : `${(inviteesFile.size / (1024 * 1024)).toFixed(
                              1,
                            )} MB`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInviteesFile(null)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
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
