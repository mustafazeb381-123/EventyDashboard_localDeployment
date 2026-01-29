import React, { useState, useEffect } from "react";
import { Check, ChevronLeft, X, Pencil, Trash2, Eye } from "lucide-react";
import { createRoot } from "react-dom/client";
import {
  EmailTemplateBuilderModal,
  type MergeTag,
} from "@/components/EmailTemplateBuilder/EmailTemplateBuilderModal";

// ---------- Static Templates ----------
import ThanksTemplateOne from "./Templates/ThanksEmailTemplates/ThanksTemplateOne";
import ThanksTemplateTwo from "./Templates/ThanksEmailTemplates/ThanksTemplateTwo";
import RejectionTemplateOne from "./Templates/RejectionEmailTemplate/RejectionTemplateOne";
import RejectionTemplateTwo from "./Templates/RejectionEmailTemplate/RejectionTemplateTwo";
import {
  getEmailTemplatesApi,
  createEmailTemplateApi,
  updateEmailTemplateApi,
  deleteEmailTemplateApi,
  markAsDefaultEmailTemplateApi,
  getShowEventData,
} from "@/apis/apiHelpers";
import { wrapHtmlAsFullEmailDocument } from "@/utils/emailHtml";

// Base URL for email HTML so images work when backend sends emails (and in preview).
// Relative paths like /assets/xxx.png become absolute so email clients can load them.
const EMAIL_HTML_BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_APP_PUBLIC_URL) ||
  "https://scceventy.dev";

/**
 * Rewrites relative image/link URLs in HTML to absolute URLs.
 * Backend can then send this HTML in emails and images will display correctly.
 * Use when loading from API (preview) and when saving to API (email-ready body).
 */
const rewriteHtmlUrlsToAbsolute = (html: string, baseUrl: string): string => {
  if (!html || !baseUrl) return html;
  const base = baseUrl.replace(/\/$/, "");
  return html
    .replace(/src="\/(?!\/)/g, `src="${base}/`)
    .replace(/href="\/(?!\/)/g, `href="${base}/`);
};

// Helper function to create static templates with event data
const createStaticTemplates = (eventData: any) => {
  console.log(
    "eventData in createStaticTemplates---------++++++++-------------",
    eventData,
  );
  if (!eventData) {
    console.warn("createStaticTemplates called without eventData");
    return { thank_you: [], rejection: [] };
  }

  const eventProps = {
    eventName: eventData?.attributes?.name || "",
    dateFrom: eventData?.attributes?.event_date_from || undefined,
    dateTo: eventData?.attributes?.event_date_to || undefined,
    timeFrom: eventData?.attributes?.event_time_from
      ? new Date(eventData.attributes.event_time_from)
          .toTimeString()
          .slice(0, 5)
      : undefined,
    timeTo: eventData?.attributes?.event_time_to
      ? new Date(eventData.attributes.event_time_to).toTimeString().slice(0, 5)
      : undefined,
    location: eventData?.attributes?.location || "",
    logoUrl: eventData?.attributes?.logo_url || null,
  };

  console.log("Creating templates with eventProps:", eventProps);

  return {
    thank_you: [
      {
        id: "thank-you-template-1",
        title: "Thank You Template 1",
        component: <ThanksTemplateOne {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "thank_you",
        readyMadeId: "thank-you-template-1",
      },
      {
        id: "thank-you-template-2",
        title: "Thank You Template 2",
        component: <ThanksTemplateTwo {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "thank_you",
        readyMadeId: "thank-you-template-2",
      },
    ],
    rejection: [
      {
        id: "rejection-template-1",
        title: "Rejection Template 1",
        component: <RejectionTemplateOne {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "rejection",
        readyMadeId: "rejection-template-1",
      },
      {
        id: "rejection-template-2",
        title: "Rejection Template 2",
        component: <RejectionTemplateTwo {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "rejection",
        readyMadeId: "rejection-template-2",
      },
    ],
  };
};

// Helper function to embed design in HTML as a hidden comment
const embedDesignInHtml = (html: string, design: any): string => {
  if (!design) return html;
  try {
    const designJson =
      typeof design === "string" ? design : JSON.stringify(design);
    // Embed design as a hidden HTML comment
    const designComment = `<!-- EMAIL_EDITOR_DESIGN:${designJson} -->`;
    // Insert before closing </body> tag, or at the end if no body tag
    if (html.includes("</body>")) {
      return html.replace("</body>", `${designComment}\n</body>`);
    } else {
      return html + designComment;
    }
  } catch (e) {
    console.error("Failed to embed design in HTML:", e);
    return html;
  }
};

// Helper function to extract design from HTML
const extractDesignFromHtml = (html: string): any => {
  if (!html) return null;
  try {
    // First, try to extract from embedded comment (our solution)
    const designMatch = html.match(/<!-- EMAIL_EDITOR_DESIGN:(.+?) -->/s);
    if (designMatch && designMatch[1]) {
      const designJson = designMatch[1];
      return JSON.parse(designJson);
    }
  } catch (e) {
    console.error("Failed to extract design from HTML comment:", e);
  }

  // If no embedded design, try to convert HTML to basic design structure
  try {
    return convertHtmlToDesign(html);
  } catch (e) {
    console.error("Failed to convert HTML to design:", e);
  }

  return null;
};

// Helper function to convert HTML to a basic design object structure
// This creates a minimal design that our custom builder can load
const convertHtmlToDesign = (html: string): any => {
  if (!html) return null;

  try {
    // Parse HTML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Get body content
    const body = doc.body || doc.querySelector("body");
    if (!body) return null;

    const safeHtml = (body.innerHTML || "").replace(
      /<!--\s*EMAIL_EDITOR_DESIGN:[\s\S]*?-->/g,
      "",
    );

    const defaultGlobalStyles = {
      backgroundColor: "#f3f4f6",
      contentWidth: 600,
      fontFamily: "Arial, Helvetica, sans-serif",
      primaryColor: "#ec4899",
      textColor: "#111827",
      linkColor: "#3b82f6",
      paddingX: 24,
      paddingY: 32,
    };

    return {
      schema: "eventy-email-builder",
      schemaVersion: 1,
      blocks: [
        {
          id: `p_${Date.now()}`,
          type: "paragraph",
          html: safeHtml || "<p></p>",
          align: "left",
          color: "#111827",
          fontSize: 14,
          lineHeight: 1.6,
        },
      ],
      globalStyles: defaultGlobalStyles,
    };
  } catch (e) {
    console.error("Error converting HTML to design:", e);
    return null;
  }
};

// ---------- Helper Functions ----------
const convertApiTemplates = (apiTemplates: any[], flowType: string) => {
  return apiTemplates.map((tpl, idx) => {
    // Try to parse design from API attributes first (primary source)
    let design = null;
    try {
      if (tpl.attributes?.design) {
        design =
          typeof tpl.attributes.design === "string"
            ? JSON.parse(tpl.attributes.design)
            : tpl.attributes.design;
        console.log("Loaded design from API attributes for template:", tpl.id);
      }
    } catch (e) {
      console.warn(
        "Failed to parse design from API attributes for template:",
        e,
      );
    }

    // Try to extract design from HTML (embedded as comment)
    if (!design && tpl.attributes?.body) {
      const extractedDesign = extractDesignFromHtml(tpl.attributes.body);
      if (extractedDesign) {
        design = extractedDesign;
        console.log(
          "✅ Extracted design from HTML comment for template:",
          tpl.id,
        );
      }
    }

    const rawBody = tpl.attributes?.body || "";
    return {
      id: `api-${tpl.id}`,
      title:
        tpl.attributes?.name ||
        `${
          flowType.charAt(0).toUpperCase() + flowType.slice(1).replace("_", " ")
        } Template ${idx + 1}`,
      component: null,
      design: design, // Load from API or localStorage
      html: rewriteHtmlUrlsToAbsolute(rawBody, EMAIL_HTML_BASE_URL),
      apiId: tpl.id,
      isStatic: false,
      type: tpl.attributes?.template_type || flowType,
      isSelected:
        tpl.attributes?.default ||
        tpl.attributes?.selected ||
        tpl.attributes?.is_selected ||
        false, // API uses "default" for the selected template
      readyMadeId: null, // Will be set if this matches a ready-made template
    };
  });
};

// Helper function to check if an API template matches a ready-made template
const matchesReadyMadeTemplate = (
  apiTemplate: any,
  readyMadeTemplate: any,
): boolean => {
  // Match by exact title/name
  if (apiTemplate.attributes?.name === readyMadeTemplate.title) {
    return true;
  }
  // You can add more matching logic here if needed (e.g., by HTML content hash)
  return false;
};

// ---------- Modals ----------
const EmailEditorModal = ({
  open,
  initialDesign,
  initialHtml,
  templateId,
  onClose,
  onSave,
}: any) => {
  const mergeTags: MergeTag[] = [
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

  return (
    <EmailTemplateBuilderModal
      open={open}
      title="Edit Email Template"
      initialDesign={initialDesign}
      initialHtml={initialHtml}
      mergeTags={mergeTags}
      onClose={onClose}
      onSave={onSave}
      key={templateId || "new"}
    />
  );
};

const TemplateModal = ({
  template,
  onClose,
  onSelect,
  onEdit,
  onDelete,
  eventDataKey,
}: any) => {
  if (!template) return null;
  // Edit and Delete are enabled for all templates (including default/ready-made)
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      key={eventDataKey}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white p-6 rounded-2xl max-w-[95vw] w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEdit(template)}
              className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-sm"
              aria-label="Edit template"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(template);
              }}
              className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm"
              aria-label="Delete template"
            >
              <Trash2 size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div
          className="mb-6 border rounded-lg p-2 bg-gray-50 w-full overflow-x-hidden"
          key={`modal-content-${eventDataKey}`}
        >
          <style>{`
            .template-preview-content * {
              max-width: 100% !important;
              box-sizing: border-box;
            }
            .template-preview-content img {
              max-width: 100% !important;
              height: auto !important;
            }
            .template-preview-content div {
              max-width: 100% !important;
              width: 100% !important;
            }
            .template-preview-content table {
              max-width: 100% !important;
              table-layout: fixed;
            }
          `}</style>
          {template.html ? (
            <div
              className="template-preview-content w-full"
              style={{
                maxWidth: "100%",
                width: "100%",
                overflowX: "hidden",
              }}
              dangerouslySetInnerHTML={{
                __html: rewriteHtmlUrlsToAbsolute(
                  template.html,
                  EMAIL_HTML_BASE_URL,
                )
                  .replace(/max-width:\s*\d+px/gi, "max-width: 100%")
                  .replace(/width:\s*\d+px/gi, (match: string) => {
                    // Only replace width if it's not already percentage or auto
                    if (!match.includes("%") && !match.includes("auto")) {
                      return "max-width: 100%";
                    }
                    return match;
                  }),
              }}
            />
          ) : template.component ? (
            <div
              className="template-preview-content w-full"
              style={{ maxWidth: "100%", width: "100%" }}
            >
              {template.component}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No preview available
            </div>
          )}
        </div>
        <button
          onClick={() => onSelect(template.id)}
          className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          disabled={!template.component && !template.html}
        >
          Choose this template
        </button>
      </div>
    </div>
  );
};

const TemplateThumbnail = ({ template, eventDataKey }: any) => {
  const scale = 0.5;
  const scaledWidth = `${100 / scale}%`,
    scaledHeight = `${100 / scale}%`;
  return (
    <div
      className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 relative"
      key={eventDataKey}
    >
      {template.html ? (
        <div className="absolute inset-0">
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: scaledWidth,
              height: scaledHeight,
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: rewriteHtmlUrlsToAbsolute(
                  template.html,
                  EMAIL_HTML_BASE_URL,
                ),
              }}
            />
          </div>
        </div>
      ) : template.component ? (
        <div className="absolute inset-0" key={`component-${eventDataKey}`}>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: scaledWidth,
              height: scaledHeight,
            }}
          >
            {template.component}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          No preview available
        </div>
      )}
      {/* {template.isStatic && <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Static</div>} */}
    </div>
  );
};

// ---------- Main Component ----------
interface EmailConfirmationProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
}
const EmailConfirmation: React.FC<EmailConfirmationProps> = ({
  onNext,
  onPrevious,
  eventId,
}) => {
  const effectiveEventId = eventId;

  const [flows, setFlows] = useState<any[]>([
    { id: "thank_you", label: "Thank You Email", templates: [] },
    { id: "rejection", label: "Rejection Email", templates: [] },
  ]);
  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<any>({});
  const [modalTemplate, setModalTemplate] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  // Notification handler
  const showNotification = (
    message: string,
    type: "success" | "error" | "warning",
  ) => {
    setNotification({ message, type });
  };

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const currentFlow = flows[currentFlowIndex];

  // Reset selected templates when event changes so we don't show another event's selection
  useEffect(() => {
    if (effectiveEventId) {
      setSelectedTemplates({});
    }
  }, [effectiveEventId]);

  // Fetch event data when eventId is available - respond to both eventId prop and effectiveEventId changes
  useEffect(() => {
    const fetchEventData = async () => {
      const currentEventId = eventId;
      if (!currentEventId) {
        setEventData(null); // Clear event data if no eventId
        // Reset flows when no eventId
        setFlows([
          { id: "thank_you", label: "Thank You Email", templates: [] },
          { id: "rejection", label: "Rejection Email", templates: [] },
        ]);
        setSelectedTemplates({});
        return;
      }
      try {
        const response = await getShowEventData(currentEventId);
        console.log("response of get show event data", response);
        if (response.data?.data) {
          const newEventData = response.data.data;
          setEventData(newEventData);
          console.log("Event data updated:", newEventData);
        } else {
          setEventData(null);
        }
      } catch (error) {
        console.error("Failed to fetch event data:", error);
        setEventData(null);
      }
    };
    fetchEventData();
  }, [eventId, effectiveEventId]); // respond to eventId changes

  // Update modal template when eventData or flows change to ensure it shows latest data
  useEffect(() => {
    if (modalTemplate && eventData && currentFlow) {
      // Find the latest version of this template from flows
      const latestTemplate = currentFlow.templates.find(
        (t: any) => t.id === modalTemplate.id,
      );
      if (latestTemplate) {
        // Only update if it's actually different (new component with updated event data)
        setModalTemplate(latestTemplate);
      }
    }
  }, [eventData, flows, currentFlowIndex, modalTemplate?.id]);

  useEffect(() => {
    // Only load templates if we have both eventId and eventData
    if (effectiveEventId && eventData) {
      loadTemplatesFromAPI();
    }
  }, [effectiveEventId, currentFlowIndex, eventData]);

  const loadTemplatesFromAPI = async () => {
    if (!effectiveEventId || !eventData) {
      console.log(
        "Skipping loadTemplatesFromAPI - missing eventId or eventData",
        { effectiveEventId, eventData },
      );
      return;
    }
    setIsLoading(true);
    try {
      console.log("Loading templates with eventData:", eventData);
      const response = await getEmailTemplatesApi(
        effectiveEventId,
        currentFlow.id,
      );

      // Validate response structure
      if (!response || !response.data) {
        throw new Error("Invalid API response structure");
      }

      const apiTemplates = response.data.data || [];
      const convertedTemplates = convertApiTemplates(
        apiTemplates,
        currentFlow.id,
      );
      // Get static templates with LATEST event data - always recreate with current eventData
      const staticTemplatesMap = createStaticTemplates(eventData);
      console.log(
        "Created static templates with eventData:",
        eventData?.attributes?.name,
      );
      const staticTemplates =
        staticTemplatesMap[currentFlow.id as keyof typeof staticTemplatesMap] ||
        [];

      // Find the selected template from API response (check if a ready-made template is selected)
      // IMPORTANT: Only ONE template should be selected per flow type
      const selectedApiTemplate = convertedTemplates.find(
        (t: any) => t.isSelected,
      );

      // Ensure only ONE template is selected - deselect all others
      const templatesWithSingleSelection = convertedTemplates.map((t: any) => {
        // If this is the first selected template, keep it selected
        // Otherwise, deselect it
        if (
          t.isSelected &&
          selectedApiTemplate &&
          t.id === selectedApiTemplate.id
        ) {
          return t; // Keep selected
        } else {
          return { ...t, isSelected: false }; // Deselect
        }
      });

      // Merge API data into static templates when an API record matches a default by name (so Edit/Delete work)
      const enrichedStaticTemplates = staticTemplates.map((staticTpl: any) => {
        const match = templatesWithSingleSelection.find((ct: any) =>
          matchesReadyMadeTemplate(
            { attributes: { name: ct.title } },
            staticTpl,
          ),
        );
        if (match) {
          return {
            ...staticTpl,
            apiId: match.apiId,
            html: match.html,
            design: match.design,
            isSelected: match.isSelected,
          };
        }
        return staticTpl;
      });

      // Filter out ready-made templates from API response to avoid duplicates
      // Only show custom templates from API, not ready-made ones
      const customApiTemplates = templatesWithSingleSelection.filter(
        (apiTpl: any) => {
          // Check if this API template matches any ready-made template
          const isReadyMade = staticTemplates.some((staticTpl: any) =>
            matchesReadyMadeTemplate(
              { attributes: { name: apiTpl.title } },
              staticTpl,
            ),
          );
          // Only include if it's NOT a ready-made template
          return !isReadyMade;
        },
      );

      if (selectedApiTemplate) {
        // Check if the selected template is a ready-made template
        const isSelectedReadyMade = staticTemplates.some((staticTpl: any) =>
          matchesReadyMadeTemplate(
            { attributes: { name: selectedApiTemplate.title } },
            staticTpl,
          ),
        );

        if (isSelectedReadyMade) {
          // If a ready-made template is selected, select the corresponding static template
          const matchingStaticTemplate = staticTemplates.find(
            (staticTpl: any) =>
              matchesReadyMadeTemplate(
                { attributes: { name: selectedApiTemplate.title } },
                staticTpl,
              ),
          );
          if (matchingStaticTemplate) {
            setSelectedTemplates((prev: any) => ({
              ...prev,
              [currentFlow.id]: matchingStaticTemplate.id,
            }));
          }
        } else {
          // Custom template is selected
          setSelectedTemplates((prev: any) => ({
            ...prev,
            [currentFlow.id]: selectedApiTemplate.id,
          }));
        }
      }

      // Always show static templates (enriched with API data when matched) + only custom templates from API
      const updatedTemplates = [...enrichedStaticTemplates, ...customApiTemplates];
      console.log(
        "Setting flows with updated templates count:",
        updatedTemplates.length,
      );
      setFlows((prev) =>
        prev.map((f) =>
          f.id === currentFlow.id
            ? {
                ...f,
                templates: updatedTemplates, // Use new array reference
              }
            : f,
        ),
      );
    } catch (e: any) {
      console.error("Failed to load templates:", e);
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load templates. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (template: any) => {
    // Always get the latest template from current flows to ensure we have latest event data
    const latestTemplate =
      currentFlow.templates.find((t: any) => t.id === template.id) || template;
    setModalTemplate(latestTemplate);
  };
  const handleCloseModal = () => setModalTemplate(null);
  // Helper function to convert React component to HTML string
  const componentToHtml = (component: React.ReactElement): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary container
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "-9999px";
        tempDiv.style.width = "800px"; // Set a width for proper rendering
        document.body.appendChild(tempDiv);

        // Render the component
        const root = createRoot(tempDiv);
        root.render(component);

        // Wait for render to complete using requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              const html = tempDiv.innerHTML;
              root.unmount();
              document.body.removeChild(tempDiv);
              resolve(html);
            } catch (error) {
              root.unmount();
              document.body.removeChild(tempDiv);
              reject(error);
            }
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleSelectTemplate = async (templateId: string) => {
    if (!effectiveEventId) {
      showNotification("Event ID is missing", "error");
      return;
    }

    // Find the selected template
    const selectedTemplate = currentFlow.templates.find(
      (t: any) => t.id === templateId,
    );
    if (!selectedTemplate) {
      showNotification("Template not found", "error");
      return;
    }

    // Ready-made templates (isStatic or readyMadeId) - check if they exist in API
    if (selectedTemplate.isStatic || selectedTemplate.readyMadeId) {
      setIsLoading(true);
      try {
        // Check if this ready-made template already exists in API
        const response = await getEmailTemplatesApi(
          effectiveEventId,
          currentFlow.id,
        );
        const apiTemplates = response.data.data || [];
        const existingTemplate = apiTemplates.find((apiTpl: any) =>
          matchesReadyMadeTemplate(apiTpl, selectedTemplate),
        );

        if (existingTemplate) {
          // Default template already in API: mark it as default via PATCH so selection persists
          await markAsDefaultEmailTemplateApi(
            effectiveEventId,
            existingTemplate.id,
          );
          setFlows((prev) =>
            prev.map((f) =>
              f.id === currentFlow.id
                ? {
                    ...f,
                    templates: f.templates.map(
                      (t: any) =>
                        t.id === templateId
                          ? { ...t, isSelected: true }
                          : { ...t, isSelected: false },
                    ),
                  }
                : f,
            ),
          );
          setSelectedTemplates({
            ...selectedTemplates,
            [currentFlow.id]: templateId,
          });
          setModalTemplate(null);
          showNotification("Template selected!", "success");
        } else {
          // Template doesn't exist - create it via POST API
          // Convert React component to HTML string
          let htmlString = "";
          if (selectedTemplate.component) {
            // Re-render component with latest event data if available
            const staticTemplatesMap = createStaticTemplates(eventData);
            const flowTemplates =
              staticTemplatesMap[
                currentFlow.id as keyof typeof staticTemplatesMap
              ] || [];
            const updatedTemplate = flowTemplates.find(
              (t: any) => t.id === templateId,
            );
            const componentToRender =
              updatedTemplate?.component || selectedTemplate.component;
            htmlString = await componentToHtml(componentToRender);
          } else if (selectedTemplate.html) {
            htmlString = selectedTemplate.html;
          } else {
            showNotification("Template content not available", "error");
            setIsLoading(false);
            return;
          }

          // Full email document (html/head/body) so GET API returns correct format for backend to send
          const emailReadyHtml = rewriteHtmlUrlsToAbsolute(
            htmlString,
            EMAIL_HTML_BASE_URL,
          );
          const fullEmailBody = wrapHtmlAsFullEmailDocument(
            emailReadyHtml,
            selectedTemplate.title,
          );
          const apiResp = await createEmailTemplateApi(
            effectiveEventId,
            currentFlow.id,
            fullEmailBody,
            selectedTemplate.title,
          );
          console.log("apiResp of post api for ready-made template", apiResp);
          const newApiId = apiResp?.data?.data?.id ?? apiResp?.data?.data?.attributes?.id;
          if (newApiId != null) {
            await markAsDefaultEmailTemplateApi(effectiveEventId, newApiId);
          }

          // Keep the static template visible, just mark it as selected
          // Default template is saved to API but not shown again in GET list (we use static list)
          setFlows((prev) =>
            prev.map((f) =>
              f.id === currentFlow.id
                ? {
                    ...f,
                    templates: f.templates.map(
                      (t: any) =>
                        t.id === templateId
                          ? { ...t, isSelected: true } // Select the static template
                          : { ...t, isSelected: false }, // Deselect others
                    ),
                  }
                : f,
            ),
          );

          // Set static template as selected
          setSelectedTemplates({
            ...selectedTemplates,
            [currentFlow.id]: templateId, // Use static template ID
          });
          setModalTemplate(null);
          showNotification("Template saved and selected!", "success");
        }
      } catch (e) {
        console.error("Failed to save/select ready-made template:", e);
        showNotification("Failed to save template", "error");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Custom template: mark as default via API so selection persists
      const apiId = selectedTemplate.apiId;
      if (!apiId) {
        showNotification("Template cannot be selected", "error");
        return;
      }
      setIsLoading(true);
      try {
        await markAsDefaultEmailTemplateApi(effectiveEventId, apiId);
        setFlows((prev) =>
          prev.map((f) =>
            f.id === currentFlow.id
              ? {
                  ...f,
                  templates: f.templates.map((t: any) =>
                    t.id === templateId
                      ? { ...t, isSelected: true }
                      : { ...t, isSelected: false },
                  ),
                }
              : f,
          ),
        );
        setSelectedTemplates({
          ...selectedTemplates,
          [currentFlow.id]: templateId,
        });
        setModalTemplate(null);
        showNotification("Template selected!", "success");
      } catch (e) {
        console.error("Failed to mark template as default:", e);
        showNotification("Failed to select template", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleCreateNewTemplate = () => {
    setCustomTemplateName("");
    setShowNameDialog(true);
  };

  const handleStartCreatingTemplate = () => {
    if (!customTemplateName.trim()) {
      showNotification("Please enter a template name", "warning");
      return;
    }
    setShowNameDialog(false);
    setIsCreatingNew(true);
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = async (template: any) => {
    // Get the latest template from flows to ensure we have the most up-to-date data
    const latestTemplate =
      currentFlow.templates.find((t: any) => t.id === template.id) || template;

    let templateWithDesign = { ...latestTemplate };

    // For default/ready-made templates: if no html/design but has component, derive from component
    if (
      (templateWithDesign.isStatic || templateWithDesign.readyMadeId) &&
      !templateWithDesign.html &&
      templateWithDesign.component
    ) {
      try {
        templateWithDesign.html = await componentToHtml(
          templateWithDesign.component,
        );
        templateWithDesign.design =
          extractDesignFromHtml(templateWithDesign.html) ||
          convertHtmlToDesign(templateWithDesign.html);
      } catch (e) {
        console.warn("Could not derive html/design from default template:", e);
        showNotification(
          "Could not load template for editing. Please try again.",
          "warning",
        );
        return;
      }
    }

    // Try to extract design from HTML if not already loaded
    if (!templateWithDesign.design && templateWithDesign.html) {
      const extractedDesign = extractDesignFromHtml(templateWithDesign.html);
      if (extractedDesign) {
        templateWithDesign.design = extractedDesign;
        console.log(
          "✅ Extracted design from HTML for editing, templateId:",
          templateWithDesign.apiId,
        );
      } else {
        console.warn(
          "No design found in HTML for templateId:",
          templateWithDesign.apiId,
        );
        if (!templateWithDesign.isStatic && !templateWithDesign.readyMadeId) {
          showNotification(
            "Template design not found. Editor will open empty. Please recreate the template.",
            "warning",
          );
        }
      }
    }

    console.log("Editing template:", {
      id: templateWithDesign.id,
      apiId: templateWithDesign.apiId,
      title: templateWithDesign.title,
      hasDesign: !!templateWithDesign.design,
      hasHtml: !!templateWithDesign.html,
    });

    setEditingTemplate(templateWithDesign);
    setModalTemplate(null);
    setIsEditorOpen(true);
  };

  const handleBack = () => {
    if (currentFlowIndex > 0) setCurrentFlowIndex(currentFlowIndex - 1);
    else onPrevious?.();
  };
  const handleNext = () => {
    if (!selectedTemplates[currentFlow.id]) {
      showNotification("Please select template", "warning");
      return;
    }
    if (currentFlowIndex < flows.length - 1)
      setCurrentFlowIndex(currentFlowIndex + 1);
    else onNext?.(effectiveEventId || undefined);
  };

  const handleSaveFromEditor = async (design: any, html: string) => {
    if (!effectiveEventId) return;

    if (isCreatingNew) {
      setIsLoading(true);
      try {
        // Full email document (html/head/body) so GET API returns correct format
        const htmlWithDesign = embedDesignInHtml(html, design);
        const emailReadyHtml = rewriteHtmlUrlsToAbsolute(
          htmlWithDesign,
          EMAIL_HTML_BASE_URL,
        );
        const templateName =
          customTemplateName || `Custom ${currentFlow.label} Template`;
        const fullEmailBody = wrapHtmlAsFullEmailDocument(
          emailReadyHtml,
          templateName,
        );
        const apiResp = await createEmailTemplateApi(
          effectiveEventId,
          currentFlow.id,
          fullEmailBody,
          templateName,
          design,
        );
        console.log("apiResp of post api", apiResp);
        const apiId = apiResp.data.data.id;
        console.log(
          "✅ Design embedded in HTML and saved to API for new template, apiId:",
          apiId,
        );

        const newTemplate = {
          id: `api-${apiId}`,
          title: apiResp.data.data.attributes?.name || templateName,
          component: null,
          design: design, // Store design object for editing
          html,
          apiId: apiId,
          isStatic: false,
          type: currentFlow.id,
        };
        const staticTemplatesMap = createStaticTemplates(eventData);
        const staticTemplates =
          staticTemplatesMap[
            currentFlow.id as keyof typeof staticTemplatesMap
          ] || [];
        // Only one template can be selected - clear previous selection
        setFlows((prev) =>
          prev.map((f, idx) =>
            idx === currentFlowIndex
              ? {
                  ...f,
                  templates: [
                    ...staticTemplates,
                    ...f.templates
                      .filter((t: any) => !t.isStatic)
                      .map((t: any) => ({ ...t, isSelected: false })),
                    { ...newTemplate, isSelected: true },
                  ],
                }
              : f,
          ),
        );
        setSelectedTemplates({
          ...selectedTemplates,
          [currentFlow.id]: newTemplate.id,
        });
        setIsCreatingNew(false);
        setIsEditorOpen(false);
        showNotification("Template created!", "success");
      } catch (e) {
        console.error("Failed to create template:", e);
        showNotification("Failed to create template", "error");
      } finally {
        setIsLoading(false);
      }
    } else if (editingTemplate) {
      setIsLoading(true);
      try {
        const templateName =
          editingTemplate.title || `Custom ${currentFlow.label} Template`;
        // Full email document (html/head/body) so GET API returns correct format
        const htmlWithDesign = embedDesignInHtml(html, design);
        const emailReadyHtml = rewriteHtmlUrlsToAbsolute(
          htmlWithDesign,
          EMAIL_HTML_BASE_URL,
        );
        const fullEmailBody = wrapHtmlAsFullEmailDocument(
          emailReadyHtml,
          templateName,
        );

        if (editingTemplate.apiId) {
          // Update existing template (custom or default that was already saved)
          console.log("Updating template:", {
            eventId: effectiveEventId,
            templateId: editingTemplate.apiId,
            flowType: currentFlow.id,
            hasDesign: !!design,
            htmlLength: html?.length,
          });
          await updateEmailTemplateApi(
            effectiveEventId,
            editingTemplate.apiId,
            currentFlow.id,
            fullEmailBody,
            templateName,
            design,
          );
          console.log(
            "✅ Design embedded in HTML and saved to API after update, apiId:",
            editingTemplate.apiId,
          );
        } else {
          // Default template not yet saved: create new API record
          const apiResp = await createEmailTemplateApi(
            effectiveEventId,
            currentFlow.id,
            fullEmailBody,
            templateName,
            design,
          );
          console.log(
            "✅ Created API record for edited default template, apiId:",
            apiResp.data.data.id,
          );
        }

        // Reload templates from API to get the latest data (and merge into static when applicable)
        console.log("Reloading templates after save...");
        await loadTemplatesFromAPI();

        setEditingTemplate(null);
        setIsEditorOpen(false);
        showNotification("Template updated!", "success");
      } catch (e: any) {
        console.error("Failed to update template:", e);
        console.error("Error details:", {
          message: e?.message,
          response: e?.response?.data,
          status: e?.response?.status,
        });
        showNotification(
          e?.response?.data?.message || "Failed to update template",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 bg-white rounded-2xl shadow-sm">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-yellow-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft size={20} />{" "}
          <h2 className="text-xl font-semibold">{currentFlow.label}</h2>
        </div>
        <div className="flex items-center gap-2">
          {flows.map((f, idx) => {
            const active = idx === currentFlowIndex,
              done = Boolean(selectedTemplates[f.id]);
            return (
              <div key={f.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentFlowIndex(idx)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer ${
                    done
                      ? "bg-pink-500 border-pink-500 hover:bg-pink-600"
                      : active
                        ? "border-pink-500 bg-white"
                        : "border-gray-300 hover:border-pink-400"
                  }`}
                >
                  {done ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <span className="text-sm font-medium">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  )}
                </button>
                {idx !== flows.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      selectedTemplates[f.id] ? "bg-pink-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            onClick={handleCreateNewTemplate}
            className="border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 min-h-[280px]"
          >
            + New Template
          </div>
          {currentFlow.templates.map((template: any) => {
            const eventDataKey = `${effectiveEventId}-${eventData?.id || ""}-${
              eventData?.attributes?.name || ""
            }`;
            const isSelected = selectedTemplates[currentFlow.id] === template.id;
            return (
              <div
                key={`${template.id}-${eventDataKey}`}
                onClick={() => handleSelectTemplate(template.id)}
                className={`group cursor-pointer rounded-2xl border-2 p-4 transition-colors flex flex-col min-h-[280px] overflow-hidden ${
                  isSelected
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-pink-500 bg-white"
                }`}
              >
                <div className="flex-1 min-h-0 overflow-hidden rounded-lg relative">
                  <TemplateThumbnail
                    template={template}
                    eventDataKey={eventDataKey}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(template);
                      }}
                      className="pointer-events-auto w-12 h-12 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-pink-400 transition-colors cursor-pointer z-10 shrink-0"
                      aria-label="Preview template"
                    >
                      <Eye size={24} className="text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-gray-900 truncate pr-2">
                      {template.title}
                    </span>
                    {isSelected && (
                      <div className="flex items-center shrink-0">
                        <Check size={16} className="text-pink-500 mr-1" />
                        <span className="text-sm text-pink-500 font-medium">
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
      )}

      <div className="flex justify-between gap-4">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white"
        >
          Next
        </button>
      </div>

      <TemplateModal
        template={modalTemplate}
        eventDataKey={`${effectiveEventId}-${eventData?.id || ""}-${
          eventData?.attributes?.name || ""
        }`}
        onClose={handleCloseModal}
        onSelect={handleSelectTemplate}
        onEdit={handleEditTemplate}
        onDelete={async (tpl: any) => {
          if (!effectiveEventId) {
            handleCloseModal();
            return;
          }

          // Default/ready-made with no apiId: just deselect and close
          if ((tpl.isStatic || tpl.readyMadeId) && !tpl.apiId) {
            if (selectedTemplates[currentFlow.id] === tpl.id) {
              setSelectedTemplates((prev: any) => {
                const updated = { ...prev };
                delete updated[currentFlow.id];
                return updated;
              });
            }
            showNotification("Template deselected", "success");
            handleCloseModal();
            return;
          }

          // Delete from API when template has apiId (custom or saved default)
          if (!tpl.apiId) {
            showNotification("This template cannot be deleted.", "warning");
            handleCloseModal();
            return;
          }
          setIsLoading(true);
          try {
            await deleteEmailTemplateApi(effectiveEventId, tpl.apiId);
            if (tpl.isStatic || tpl.readyMadeId) {
              // Default template: keep card, clear apiId/html/design and deselect
              setFlows((prev) =>
                prev.map((f) =>
                  f.id === currentFlow.id
                    ? {
                        ...f,
                        templates: f.templates.map((t: any) =>
                          t.id === tpl.id
                            ? {
                                ...t,
                                apiId: undefined,
                                html: t.component ? undefined : t.html,
                                design: undefined,
                                isSelected: false,
                              }
                            : t,
                        ),
                      }
                    : f,
                ),
              );
            } else {
              // Custom template: remove from list
              setFlows((prev) =>
                prev.map((f) => ({
                  ...f,
                  templates: f.templates.filter((t: any) => t.id !== tpl.id),
                })),
              );
            }
            if (selectedTemplates[currentFlow.id] === tpl.id) {
              setSelectedTemplates((prev: any) => {
                const updated = { ...prev };
                delete updated[currentFlow.id];
                return updated;
              });
            }
            showNotification("Template deleted", "success");
            handleCloseModal();
          } catch (e) {
            console.error("Failed to delete template:", e);
            showNotification("Failed to delete template", "error");
          } finally {
            setIsLoading(false);
          }
        }}
      />

      <EmailEditorModal
        open={isEditorOpen}
        initialDesign={editingTemplate?.design}
        initialHtml={editingTemplate?.html}
        templateId={editingTemplate?.apiId || (isCreatingNew ? "new" : null)}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTemplate(null);
          setIsCreatingNew(false);
          setCustomTemplateName("");
        }}
        onSave={handleSaveFromEditor}
      />

      {/* Custom Template Name Dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
              value={customTemplateName}
              onChange={(e) => setCustomTemplateName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-pink-500"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleStartCreatingTemplate();
                }
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNameDialog(false);
                  setCustomTemplateName("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCreatingTemplate}
                className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmailConfirmation;
