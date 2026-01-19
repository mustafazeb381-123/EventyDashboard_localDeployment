import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronLeft, X, Pencil, Trash2 } from "lucide-react";
import { createRoot } from "react-dom/client";
import {
  EmailTemplateBuilderModal,
  type MergeTag,
} from "@/components/EmailTemplateBuilder/EmailTemplateBuilderModal";
import ThanksTemplateOne from "../Confirmation/Templates/ThanksEmailTemplates/ThanksTemplateOne";
import ThanksTemplateTwo from "../Confirmation/Templates/ThanksEmailTemplates/ThanksTemplateTwo";
import ConfirmationTemplateOne from "../Confirmation/Templates/ConfirmationEmailTemplates/ConfirmationTemplateOne";
import ReminderTemplateOne from "../Confirmation/Templates/ReminderEmailTemplate/ReminderTemplateOne";
import ReminderTemplateTwo from "../Confirmation/Templates/ReminderEmailTemplate/ReminderTemplateTwo";
import {
  getEmailTemplatesApi,
  createEmailTemplateApi,
  updateEmailTemplateApi,
  deleteEmailTemplateApi,
  getShowEventData,
} from "@/apis/apiHelpers";

// Helper function to create static templates with event data
const createStaticTemplates = (eventData: any) => {
  console.log(
    "eventData in createStaticTemplates---------++++++++-------------",
    eventData
  );
  if (!eventData) {
    console.warn("createStaticTemplates called without eventData");
    return { thanks: [], confirmation: [], reminder: [] };
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
    thanks: [
      {
        id: "thanks-template-1",
        title: "Thanks Template 1",
        component: <ThanksTemplateOne {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "thanks",
        readyMadeId: "thanks-template-1",
      },
      {
        id: "thanks-template-2",
        title: "Thanks Template 2",
        component: <ThanksTemplateTwo {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "thanks",
        readyMadeId: "thanks-template-2",
      },
    ],
    confirmation: [
      {
        id: "confirmation-template-1",
        title: "Confirmation Template 1",
        component: <ConfirmationTemplateOne {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "confirmation",
        readyMadeId: "confirmation-template-1",
      },
    ],
    reminder: [
      {
        id: "reminder-template-1",
        title: "Reminder Template 1",
        component: <ReminderTemplateOne {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "reminder",
        readyMadeId: "reminder-template-1",
      },
      {
        id: "reminder-template-2",
        title: "Reminder Template 2",
        component: <ReminderTemplateTwo {...eventProps} />,
        html: null,
        design: null,
        isStatic: true,
        type: "reminder",
        readyMadeId: "reminder-template-2",
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
      ""
    );

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
        e
      );
    }

    // Try to extract design from HTML (embedded as comment)
    if (!design && tpl.attributes?.body) {
      const extractedDesign = extractDesignFromHtml(tpl.attributes.body);
      if (extractedDesign) {
        design = extractedDesign;
        console.log(
          "✅ Extracted design from HTML comment for template:",
          tpl.id
        );
      }
    }

    return {
      id: `api-${tpl.id}`,
      title:
        tpl.attributes?.name ||
        `${
          flowType.charAt(0).toUpperCase() + flowType.slice(1).replace("_", " ")
        } Template ${idx + 1}`,
      component: null,
      design: design, // Load from API or localStorage
      html: tpl.attributes?.body || "",
      apiId: tpl.id,
      isStatic: false,
      type: tpl.attributes?.template_type || flowType,
      isSelected:
        tpl.attributes?.selected || tpl.attributes?.is_selected || false, // Check for selected field from API
      readyMadeId: null, // Will be set if this matches a ready-made template
    };
  });
};

// Helper function to check if an API template matches a ready-made template
const matchesReadyMadeTemplate = (
  apiTemplate: any,
  readyMadeTemplate: any
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
  // Ready-made templates are read-only - check both isStatic and readyMadeId
  const isReadyMade = template.isStatic || template.readyMadeId;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      key={eventDataKey}
    >
      <div className="bg-white p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
          <div className="flex items-center gap-3">
            {!isReadyMade && template.apiId && (
              <button
                onClick={() => onEdit(template)}
                className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-sm"
              >
                <Pencil size={14} />
              </button>
            )}
            {!isReadyMade && template.apiId && (
              <button
                onClick={() => onDelete(template)}
                className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div
          className="mb-6 border rounded-lg p-4 bg-gray-50 min-h-[400px]"
          key={`modal-content-${eventDataKey}`}
        >
          {template.html ? (
            <div dangerouslySetInnerHTML={{ __html: template.html }} />
          ) : template.component ? (
            template.component
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
            <div dangerouslySetInnerHTML={{ __html: template.html }} />
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
const AdvanceEmail: React.FC<EmailConfirmationProps> = ({
  onNext,
  onPrevious,
  eventId,
}) => {
  const localStorageEventId = localStorage.getItem("create_eventId");
  const effectiveEventId = eventId || localStorageEventId;

  const [flows, setFlows] = useState<any[]>([
    { id: "thanks", label: "Thanks Email", templates: [] },
    { id: "confirmation", label: "Confirmation Email", templates: [] },
    { id: "reminder", label: "Reminder Email", templates: [] },
  ]);
  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<any>({});
  const [modalTemplate, setModalTemplate] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  const currentFlow = flows[currentFlowIndex];

  // Fetch event data when eventId is available - respond to both eventId prop and effectiveEventId changes
  useEffect(() => {
    const fetchEventData = async () => {
      const currentEventId = eventId || localStorage.getItem("create_eventId");
      if (!currentEventId) {
        setEventData(null); // Clear event data if no eventId
        // Reset flows when no eventId
        setFlows([
          { id: "thanks", label: "Thanks Email", templates: [] },
          { id: "confirmation", label: "Confirmation Email", templates: [] },
          { id: "reminder", label: "Reminder Email", templates: [] },
        ]);
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
  }, [eventId, effectiveEventId]); // Include both eventId prop and effectiveEventId to catch all changes

  // Update modal template when eventData or flows change to ensure it shows latest data
  useEffect(() => {
    if (modalTemplate && eventData && currentFlow) {
      // Find the latest version of this template from flows
      const latestTemplate = currentFlow.templates.find(
        (t: any) => t.id === modalTemplate.id
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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    setNotification({ message, type });
  };

  const loadTemplatesFromAPI = async () => {
    if (!effectiveEventId || !eventData) {
      console.log(
        "Skipping loadTemplatesFromAPI - missing eventId or eventData",
        { effectiveEventId, eventData }
      );
      return;
    }
    setIsLoading(true);
    try {
      console.log("Loading templates with eventData:", eventData);
      const response = await getEmailTemplatesApi(
        effectiveEventId,
        currentFlow.id
      );
      const apiTemplates = response.data.data || [];
      const convertedTemplates = convertApiTemplates(
        apiTemplates,
        currentFlow.id
      );
      // Get static templates with LATEST event data - always recreate with current eventData
      const staticTemplatesMap = createStaticTemplates(eventData);
      console.log(
        "Created static templates with eventData:",
        eventData?.attributes?.name
      );
      const staticTemplates =
        staticTemplatesMap[currentFlow.id as keyof typeof staticTemplatesMap] ||
        [];

      // Filter out ready-made templates from API response to avoid duplicates
      // Only show custom templates from API, not ready-made ones
      const customApiTemplates = convertedTemplates.filter((apiTpl: any) => {
        // Check if this API template matches any ready-made template
        const isReadyMade = staticTemplates.some((staticTpl: any) =>
          matchesReadyMadeTemplate(
            { attributes: { name: apiTpl.title } },
            staticTpl
          )
        );
        // Only include if it's NOT a ready-made template
        return !isReadyMade;
      });

      // Find the selected template from API response (check if a ready-made template is selected)
      const selectedApiTemplate = convertedTemplates.find(
        (t: any) => t.isSelected
      );
      if (selectedApiTemplate) {
        // Check if the selected template is a ready-made template
        const isSelectedReadyMade = staticTemplates.some((staticTpl: any) =>
          matchesReadyMadeTemplate(
            { attributes: { name: selectedApiTemplate.title } },
            staticTpl
          )
        );

        if (isSelectedReadyMade) {
          // If a ready-made template is selected, select the corresponding static template
          const matchingStaticTemplate = staticTemplates.find(
            (staticTpl: any) =>
              matchesReadyMadeTemplate(
                { attributes: { name: selectedApiTemplate.title } },
                staticTpl
              )
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

      // Always show static templates + only custom templates from API (no ready-made duplicates)
      const updatedTemplates = [...staticTemplates, ...customApiTemplates];
      console.log(
        "Setting flows with updated templates count:",
        updatedTemplates.length
      );
      setFlows((prev) =>
        prev.map((f) =>
          f.id === currentFlow.id
            ? {
                ...f,
                templates: updatedTemplates, // Use new array reference
              }
            : f
        )
      );
    } catch (e) {
      console.error("Failed to load templates:", e);
      showNotification("Failed to load templates", "error");
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
      (t: any) => t.id === templateId
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
          currentFlow.id
        );
        const apiTemplates = response.data.data || [];
        const existingTemplate = apiTemplates.find((apiTpl: any) =>
          matchesReadyMadeTemplate(apiTpl, selectedTemplate)
        );

        if (existingTemplate) {
          // Template already exists in API - just select the static template (don't replace it)
          // Keep static template visible, just mark it as selected
          setFlows((prev) =>
            prev.map((f) =>
              f.id === currentFlow.id
                ? {
                    ...f,
                    templates: f.templates.map(
                      (t: any) =>
                        t.id === templateId
                          ? { ...t, isSelected: true } // Select the static template
                          : { ...t, isSelected: false } // Deselect others
                    ),
                  }
                : f
            )
          );

          setSelectedTemplates({
            ...selectedTemplates,
            [currentFlow.id]: templateId, // Use static template ID
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
              (t: any) => t.id === templateId
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

          // Call POST API to save the ready-made template
          const apiResp = await createEmailTemplateApi(
            effectiveEventId,
            currentFlow.id,
            htmlString,
            selectedTemplate.title
          );
          console.log("apiResp of post api for ready-made template", apiResp);

          // Keep the static template visible, just mark it as selected
          // The template is saved to API but we don't replace the static template in the UI
          setFlows((prev) =>
            prev.map((f) =>
              f.id === currentFlow.id
                ? {
                    ...f,
                    templates: f.templates.map(
                      (t: any) =>
                        t.id === templateId
                          ? { ...t, isSelected: true } // Select the static template
                          : { ...t, isSelected: false } // Deselect others
                    ),
                  }
                : f
            )
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
      // For non-static templates or already saved static templates
      // Only one template can be selected at a time - clear previous selection
      setFlows((prev) =>
        prev.map((f) =>
          f.id === currentFlow.id
            ? {
                ...f,
                templates: f.templates.map((t: any) =>
                  t.id === templateId
                    ? { ...t, isSelected: true }
                    : { ...t, isSelected: false }
                ),
              }
            : f
        )
      );

      setSelectedTemplates({
        ...selectedTemplates,
        [currentFlow.id]: templateId,
      });
      setModalTemplate(null);
      showNotification("Template selected!", "success");
    }
  };

  const handleCreateNewTemplate = () => {
    setIsCreatingNew(true);
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };
  const handleEditTemplate = async (template: any) => {
    // Ready-made templates cannot be updated - check both isStatic and readyMadeId
    if (template.isStatic || template.readyMadeId) {
      showNotification(
        "Ready-made templates cannot be edited. Please create a custom template instead.",
        "warning"
      );
      return;
    }

    // Get the latest template from flows to ensure we have the most up-to-date data
    const latestTemplate =
      currentFlow.templates.find((t: any) => t.id === template.id) || template;

    // Ensure we have the design loaded from localStorage if not in template
    let templateWithDesign = { ...latestTemplate };

    // Try to extract design from HTML if not already loaded
    if (!templateWithDesign.design && templateWithDesign.html) {
      const extractedDesign = extractDesignFromHtml(templateWithDesign.html);
      if (extractedDesign) {
        templateWithDesign.design = extractedDesign;
        console.log(
          "✅ Extracted design from HTML for editing, templateId:",
          templateWithDesign.apiId
        );
      } else {
        console.warn(
          "No design found in HTML for templateId:",
          templateWithDesign.apiId
        );
        showNotification(
          "Template design not found. Editor will open empty. Please recreate the template.",
          "warning"
        );
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
        // Embed design in HTML so it's stored in API
        const htmlWithDesign = embedDesignInHtml(html, design);
        const apiResp = await createEmailTemplateApi(
          effectiveEventId,
          currentFlow.id,
          htmlWithDesign,
          `Custom ${currentFlow.label} Template`,
          design
        );
        console.log("apiResp of post api", apiResp);
        const apiId = apiResp.data.data.id;
        console.log(
          "✅ Design embedded in HTML and saved to API for new template, apiId:",
          apiId
        );

        const newTemplate = {
          id: `api-${apiId}`,
          title:
            apiResp.data.data.attributes?.name ||
            `Custom ${currentFlow.label} Template`,
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
              : f
          )
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
      // Ready-made templates cannot be updated - check both isStatic and readyMadeId
      if (editingTemplate.isStatic || editingTemplate.readyMadeId) {
        showNotification(
          "Ready-made templates cannot be updated. Please create a custom template instead.",
          "warning"
        );
        setIsEditorOpen(false);
        setEditingTemplate(null);
        return;
      }
      setIsLoading(true);
      try {
        const templateName =
          editingTemplate.title || `Custom ${currentFlow.label} Template`;
        console.log("Updating template:", {
          eventId: effectiveEventId,
          templateId: editingTemplate.apiId,
          flowType: currentFlow.id,
          hasDesign: !!design,
          htmlLength: html?.length,
        });

        // Embed design in HTML so it's stored in API
        const htmlWithDesign = embedDesignInHtml(html, design);
        const updateResponse = await updateEmailTemplateApi(
          effectiveEventId,
          editingTemplate.apiId,
          currentFlow.id,
          htmlWithDesign,
          templateName,
          design
        );
        console.log("Update API response:", updateResponse);
        console.log(
          "✅ Design embedded in HTML and saved to API after update, apiId:",
          editingTemplate.apiId
        );

        // Reload templates from API to get the latest data
        console.log("Reloading templates after update...");
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
        showNotification(e?.response?.data?.message || "Failed to update template", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 bg-white rounded-2xl shadow-sm">
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
                  disabled={idx > currentFlowIndex && !done}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    done
                      ? "bg-pink-500 border-pink-500"
                      : active
                      ? "border-pink-500"
                      : "border-gray-300"
                  }`}
                >
                  {done ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <span className="text-sm">{idx + 1}</span>
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
            className="border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition"
          >
            + New Template
          </div>
          {currentFlow.templates.map((template: any) => {
            const eventDataKey = `${effectiveEventId}-${eventData?.id || ""}-${
              eventData?.attributes?.name || ""
            }`;
            return (
              <div
                key={`${template.id}-${eventDataKey}`}
                onClick={() => handleOpenModal(template)}
                className={`cursor-pointer rounded-2xl border ${
                  selectedTemplates[currentFlow.id] === template.id
                    ? "border-pink-500"
                    : "border-gray-200"
                } overflow-hidden`}
              >
                <TemplateThumbnail
                  template={template}
                  eventDataKey={eventDataKey}
                />
                <div className="p-2 text-center font-medium">
                  {template.title}
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
          // Ready-made templates cannot be deleted - check both isStatic and readyMadeId
          if (tpl.isStatic || tpl.readyMadeId) {
            showNotification("Ready-made templates cannot be deleted.", "warning");
            return;
          }
          if (!effectiveEventId || !tpl.apiId) return;
          setIsLoading(true);
          try {
            await deleteEmailTemplateApi(effectiveEventId, tpl.apiId);
            // Remove the template from flows
            setFlows((prev) =>
              prev.map((f) => ({
                ...f,
                templates: f.templates.filter((t: any) => t.id !== tpl.id),
              }))
            );
            // If the deleted template was selected, clear the selection
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
        }}
        onSave={handleSaveFromEditor}
      />

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

export default AdvanceEmail;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   Check,
//   ChevronLeft,
//   X,
//   Pencil,
//   Plus,
//   Trash2,
// } from "lucide-react";

// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(onClose, 5000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   const bgColors = {
//     success: "bg-green-500",
//     error: "bg-red-500",
//     warning: "bg-yellow-500",
//     info: "bg-blue-500",
//   };

//   return (
//     <div
//       className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}
//     >
//       <span>{message}</span>
//       <button onClick={onClose} className="ml-4 hover:opacity-75">
//         <X size={16} />
//       </button>
//     </div>
//   );
// };

// const ToastContainer = ({ toasts, removeToast }) => {
//   return (
//     <div className="fixed top-4 right-4 z-[100] space-y-2">
//       {toasts.map((toast) => (
//         <Toast
//           key={toast.id}
//           message={toast.message}
//           type={toast.type}
//           onClose={() => removeToast(toast.id)}
//         />
//       ))}
//     </div>
//   );
// };

// const useToast = () => {
//   const [toasts, setToasts] = useState([]);

//   const addToast = (message, type) => {
//     const id = Date.now();
//     setToasts((prev) => [...prev, { id, message, type }]);
//   };

//   const removeToast = (id) => {
//     setToasts((prev) => prev.filter((toast) => toast.id !== id));
//   };

//   return {
//     toasts,
//     removeToast,
//     success: (message) => addToast(message, "success"),
//     error: (message) => addToast(message, "error"),
//     warning: (message) => addToast(message, "warning"),
//     info: (message) => addToast(message, "info"),
//   };
// };

// const CustomEmailEditor = ({ initialContent, onClose, onSave }) => {
//   const [subject, setSubject] = useState("");
//   const [bodyHtml, setBodyHtml] = useState("<p></p>");
//   const [selectedSuggestion, setSelectedSuggestion] = useState(null);
//   const editorRef = useRef(null);

//   const applyHtmlToEditor = (html) => {
//     if (editorRef.current) {
//       editorRef.current.innerHTML = html;
//     }
//   };

//   useEffect(() => {
//     if (initialContent) {
//       setSubject(initialContent.subject || "");
//       const incomingBody =
//         initialContent.body || initialContent.bodyHtml || "<p></p>";
//       setBodyHtml(incomingBody);
//       applyHtmlToEditor(incomingBody);
//     } else {
//       setSubject("");
//       setBodyHtml("<p></p>");
//       applyHtmlToEditor("<p></p>");
//     }
//   }, [initialContent]);

//   const execCommand = (command, value = null) => {
//     if (!editorRef.current) return;
//     editorRef.current.focus();
//     document.execCommand(command, false, value);
//     setBodyHtml(editorRef.current.innerHTML);
//   };

//   const isInList = () => {
//     if (!editorRef.current) return false;
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return false;
//     let node = selection.anchorNode;
//     while (node && node !== editorRef.current) {
//       if (node.nodeType === Node.ELEMENT_NODE) {
//         const el = node;
//         if (el.tagName === "UL" || el.tagName === "OL") return true;
//       }
//       // @ts-ignore: traverse up
//       node = node.parentNode;
//     }
//     return false;
//   };

//   const setListStyle = (style) => {
//     if (!editorRef.current) return;
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;
//     let node = selection.anchorNode;
//     while (node && node !== editorRef.current) {
//       if (node.nodeType === Node.ELEMENT_NODE) {
//         const el = node;
//         if (el.tagName === "UL" || el.tagName === "OL") {
//           el.style.listStyleType = style;
//           return;
//         }
//       }
//       // @ts-ignore: traverse up to parent
//       node = node.parentNode;
//     }
//   };

//   const insertTokenLink = (label, token) => {
//     const linkHtml = `<a href="${token}" data-token="${token}" style="color:#2563eb;text-decoration:underline;">${label}</a>`;
//     execCommand("insertHTML", linkHtml);
//   };

//   const handleBodyInput = (e) => {
//     setBodyHtml(e.currentTarget.innerHTML);
//   };

//   const convertPlainTextToHtml = (text) => {
//     if (!text) return "<p></p>";
//     const paragraphs = text.split(/\n\s*\n/).map((block) => {
//       const lines = block.split("\n").join("<br>");
//       return `<p>${lines}</p>`;
//     });
//     return paragraphs.join("");
//   };

//   const suggestions = [
//     {
//       id: 1,
//       text: "We hope you're doing well! 😊\n\nThank you for registering for our upcoming event from 2025-05-10 to 2025-05-30 at 14:13:00 - 17:11:00. We are thrilled to have you join us and look forward to seeing you there.\n\nYou will receive a confirmation email shortly with all the details you need.\n\nSee you soon!",
//     },
//     {
//       id: 2,
//       text: "We hope this message finds you well! 😊\n\nThank you for signing up for our upcoming event scheduled from May 10 to May 30, 2025, between 2:13 PM and 5:11 PM. We're excited to have you with us and can't wait to see you there.",
//     },
//     {
//       id: 3,
//       text: "We hope this message finds you well! 😊\n\nThank you for signing up for our upcoming event scheduled from May 10 to May 30, 2025, between 2:13 PM and 5:11 PM. We're excited to have you with us and can't wait to see you there.\n\nA confirmation email will be sent to you soon, containing all the necessary information.\n\nLooking forward to your participation!",
//     },
//     {
//       id: 4,
//       text: "We hope you're doing great! 😊\n\nThanks for signing up for our exciting event happening from May 10 to May 30, 2025, between 2:13 PM and 5:11 PM. We can't wait to see you there!",
//     },
//   ];

//   const handleSuggestionClick = (suggestion) => {
//     const htmlBody = convertPlainTextToHtml(suggestion.text);
//     setBodyHtml(htmlBody);
//     setSelectedSuggestion(suggestion.id);
//     applyHtmlToEditor(htmlBody);
//     if (editorRef.current) editorRef.current.focus();
//   };

//   const handleSave = () => {
//     const safeBody = bodyHtml || "<p></p>";
//     const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <style>
//     body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background:#f7f7f7; }
//     .email-container { max-width: 620px; margin: 0 auto; background:#ffffff; padding:24px; border-radius:12px; box-shadow:0 12px 35px rgba(0,0,0,0.05); }
//     h2 { color: #1f2937; margin:0 0 12px; font-size:20px; }
//     p { color: #4b5563; line-height: 1.6; }
//     a { color:#2563eb; }
//   </style>
// </head>
// <body>
//   <div class="email-container">
//     <h2>${subject}</h2>
//     <div>${safeBody}</div>
//   </div>
// </body>
// </html>
//     `.trim();

//     const design = { subject, body: safeBody };
//     onSave(design, html);
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-white flex flex-col">
//       {/* Header */}
//       <div className="px-8 py-6 border-b bg-white">
//         <h1 className="text-3xl font-bold text-gray-900">Create thanks email</h1>
//       </div>

//       {/* Content */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Left Side - Editor */}
//         <div className="flex-1 p-8 overflow-y-auto">
//           <div className="max-w-4xl">
//             {/* Email Subject */}
//             <div className="mb-6">
//               <label className="block text-base font-normal text-gray-900 mb-3">
//                 Email Subject
//               </label>
//               <input
//                 type="text"
//                 value={subject}
//                 onChange={(e) => setSubject(e.target.value)}
//                 placeholder="text here"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
//               />
//             </div>

//             {/* Email Body */}
//             <div>
//               <label className="block text-base font-normal text-gray-900 mb-3">
//                 Email Body
//               </label>
//               <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden bg-white">
//                 <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-700">
//                   <div className="flex items-center gap-1">
//                     <button
//                       type="button"
//                       onClick={() => execCommand("bold")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 font-semibold"
//                       title="Bold"
//                     >
//                       B
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("italic")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 italic"
//                       title="Italic"
//                     >
//                       I
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("underline")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 underline"
//                       title="Underline"
//                     >
//                       U
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("removeFormat")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Clear formatting"
//                     >
//                       Tx
//                     </button>
//                   </div>
//                   <div className="w-px h-4 bg-gray-300" />
//                   <div className="flex items-center gap-1">
//                     <button
//                       type="button"
//                       onClick={() => execCommand("undo")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Undo"
//                     >
//                       ↶
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("redo")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Redo"
//                     >
//                       ↷
//                     </button>
//                   </div>
//                   <div className="w-px h-4 bg-gray-300" />
//                   <div className="flex items-center gap-1">
//                     <button
//                       type="button"
//                       onClick={() => execCommand("justifyLeft")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Align left"
//                     >
//                       ⬅
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("justifyCenter")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Align center"
//                     >
//                       ⬍
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("justifyRight")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Align right"
//                     >
//                       ➡
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("justifyFull")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Justify"
//                     >
//                       ☰
//                     </button>
//                   </div>
//                   <div className="w-px h-4 bg-gray-300" />
//                   <div className="flex items-center gap-1">
//                     <button
//                       type="button"
//                       onClick={() => execCommand("insertUnorderedList")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Bullet list"
//                     >
//                       ••
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("insertOrderedList")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Numbered list"
//                     >
//                       1.
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setListStyle("disc")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
//                       title="Bullet: Disc"
//                     >
//                       •
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setListStyle("circle")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
//                       title="Bullet: Circle"
//                     >
//                       ○
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setListStyle("square")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
//                       title="Bullet: Square"
//                     >
//                       ◼
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setListStyle("decimal")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
//                       title="Numbered: 1,2,3"
//                     >
//                       1⋯
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setListStyle("lower-alpha")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
//                       title="Numbered: a,b,c"
//                     >
//                       a⋯
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setListStyle("lower-roman")}
//                       className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
//                       title="Numbered: i, ii, iii"
//                     >
//                       i⋯
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("outdent")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Outdent"
//                     >
//                       ⇤
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => execCommand("indent")}
//                       className="px-2 py-1 rounded hover:bg-gray-200"
//                       title="Indent"
//                     >
//                       ⇥
//                     </button>
//                   </div>
//                   <div className="w-px h-4 bg-gray-300" />
//                   <div className="flex items-center gap-2">
//                     <button
//                       type="button"
//                       onClick={() => insertTokenLink("Insert Unique Link", "{{unique_link}}")}
//                       className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-medium"
//                     >
//                       Insert Unique Link
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() =>
//                         insertTokenLink(
//                           "Insert Confirm Attendance Link",
//                           "{{confirm_attendance_link}}"
//                         )
//                       }
//                       className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-medium"
//                     >
//                       Insert Confirm Attendance Link
//                     </button>
//                   </div>
//                 </div>

//                 <div
//                   ref={editorRef}
//                   contentEditable
//                   suppressContentEditableWarning
//                   onInput={handleBodyInput}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && !e.shiftKey && isInList()) {
//                       e.preventDefault();
//                       execCommand("insertHTML", "<li><br></li>");
//                     }
//                   }}
//                   className="w-full min-h-[320px] px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Bottom Buttons */}
//           <div className="max-w-4xl mt-8 flex gap-4">
//             <button
//               onClick={onClose}
//               className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               <Plus size={20} />
//               Add Email
//             </button>
//             <button
//               onClick={handleSave}
//               className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
//             >
//               Add & Use Email
//               <span className="ml-2">→</span>
//             </button>
//           </div>
//         </div>

//         {/* Right Side - Suggestions */}
//         <div className="w-96 bg-gray-50 border-l overflow-y-auto p-6">
//           <div className="flex items-center gap-2 mb-6">
//             <div className="text-purple-500">✨</div>
//             <h2 className="text-base font-medium text-gray-900">
//               Suggestion Body text
//             </h2>
//           </div>

//           <div className="space-y-4">
//             {suggestions.map((suggestion) => (
//               <div
//                 key={suggestion.id}
//                 onClick={() => handleSuggestionClick(suggestion)}
//                 className={`p-4 rounded-lg cursor-pointer transition-all ${
//                   selectedSuggestion === suggestion.id
//                     ? "bg-white border-2 border-pink-500"
//                     : "bg-white border border-gray-200 hover:border-pink-300"
//                 }`}
//               >
//                 <p className="text-sm text-gray-700 whitespace-pre-wrap">
//                   {suggestion.text}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const apiService = {
//   templates: {},

//   async getTemplates(eventId, flowType) {
//     console.log("Mock API: Fetching templates for", flowType);
//     await new Promise((resolve) => setTimeout(resolve, 800));

//     const storageKey = `${eventId}_${flowType}`;
//     return this.templates[storageKey] || [];
//   },

//   async saveTemplate(eventId, flowType, html, design) {
//     console.log("Mock API: Saving template for", flowType);
//     await new Promise((resolve) => setTimeout(resolve, 1200));

//     const storageKey = `${eventId}_${flowType}`;
//     const existingTemplates = this.templates[storageKey] || [];

//     const newTemplate = {
//       id: Date.now(),
//       attributes: {
//         content: html,
//         design: JSON.stringify(design),
//         type: this.getTypeParam(flowType),
//         default: false,
//         created_at: new Date().toISOString(),
//       },
//     };

//     this.templates[storageKey] = [...existingTemplates, newTemplate];

//     return {
//       data: newTemplate,
//       message: "Template saved successfully!",
//     };
//   },

//   async updateTemplate(eventId, templateId, flowType, html, design) {
//     console.log("Mock API: Updating template for", flowType);
//     await new Promise((resolve) => setTimeout(resolve, 1200));

//     const storageKey = `${eventId}_${flowType}`;
//     const existingTemplates = this.templates[storageKey] || [];

//     const updatedTemplates = existingTemplates.map((template) =>
//       template.id.toString() === templateId.toString()
//         ? {
//             ...template,
//             attributes: {
//               ...template.attributes,
//               content: html,
//               design: JSON.stringify(design),
//               updated_at: new Date().toISOString(),
//             },
//           }
//         : template
//     );

//     this.templates[storageKey] = updatedTemplates;

//     const updatedTemplate = updatedTemplates.find(
//       (t) => t.id.toString() === templateId.toString()
//     );
//     return {
//       data: updatedTemplate,
//       message: "Template updated successfully!",
//     };
//   },

//   async deleteTemplate(eventId, templateId, flowType) {
//     console.log("Mock API: Deleting template from", flowType);
//     await new Promise((resolve) => setTimeout(resolve, 800));

//     const storageKey = `${eventId}_${flowType}`;
//     const existingTemplates = this.templates[storageKey] || [];

//     this.templates[storageKey] = existingTemplates.filter(
//       (template) => template.id.toString() !== templateId.toString()
//     );

//     return {
//       success: true,
//       message: "Template deleted successfully",
//     };
//   },

//   getTypeParam(flowType) {
//     const typeMap = {
//       thanks: "ConfirmationThanksTemplate",
//       confirmation: "ConfirmationRegisterTemplate",
//       reminder: "ConfirmationReminderTemplate",
//       rejection: "ConfirmationRejectionTemplate",
//     };
//     return typeMap[flowType] || "ConfirmationThanksTemplate";
//   },

//   convertApiTemplates(apiTemplates, flowType) {
//     return apiTemplates.map((template, index) => {
//       let designData = { blocks: [] };
//       try {
//         if (template.attributes?.design) {
//           designData = JSON.parse(template.attributes.design);
//         }
//       } catch (error) {
//         console.error("Error parsing design data:", error);
//       }

//       return {
//         id: `api-${template.id}`,
//         title: `${
//           flowType.charAt(0).toUpperCase() + flowType.slice(1)
//         } Template ${index + 1}`,
//         design: designData,
//         html: template.attributes?.content || "",
//         apiId: template.id,
//         type: template.attributes?.type || flowType,
//       };
//     });
//   },
// };

// const TemplateModal = ({ template, onClose, onSelect, onEdit, onDelete }) => {
//   if (!template) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => onEdit(template)}
//               className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-sm"
//             >
//               <Pencil size={14} />
//             </button>
//             <button
//               onClick={() => onDelete(template)}
//               className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm"
//             >
//               <Trash2 size={14} />
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//             >
//               <X size={20} className="text-gray-500" />
//             </button>
//           </div>
//         </div>

//         <div className="mb-6">
//           <div className="border rounded-lg p-4 bg-gray-50">
//             {template.html ? (
//               <div dangerouslySetInnerHTML={{ __html: template.html }} />
//             ) : (
//               <div className="text-gray-400 text-center py-8">
//                 No preview available
//               </div>
//             )}
//           </div>
//         </div>

//         <button
//           onClick={() => onSelect(template.id)}
//           className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium"
//         >
//           Choose this template
//         </button>
//       </div>
//     </div>
//   );
// };

// const AdvanceEmail = ({ onNext, onPrevious, eventId }) => {
//   const effectiveEventId = eventId || "demo-event-123";
//   const toast = useToast();

//   const [flows, setFlows] = useState([
//     { id: "thanks", label: "Thanks Email", templates: [] },
//     { id: "confirmation", label: "Confirmation Email", templates: [] },
//     { id: "reminder", label: "Reminder Email", templates: [] },
//     { id: "rejection", label: "Rejection Email", templates: [] },
//   ]);

//   const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
//   const [selectedTemplates, setSelectedTemplates] = useState({});
//   const [modalTemplate, setModalTemplate] = useState(null);
//   const [isEditorOpen, setIsEditorOpen] = useState(false);
//   const [editingTemplate, setEditingTemplate] = useState(null);
//   const [isCreatingNew, setIsCreatingNew] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const currentFlow = flows[currentFlowIndex];

//   useEffect(() => {
//     if (effectiveEventId) {
//       loadTemplatesFromAPI();
//     }
//   }, [effectiveEventId, currentFlowIndex]);

//   const loadTemplatesFromAPI = async () => {
//     if (!effectiveEventId) return;

//     setIsLoading(true);
//     try {
//       const apiTemplates = await apiService.getTemplates(
//         effectiveEventId,
//         currentFlow.id
//       );
//       const convertedTemplates = apiService.convertApiTemplates(
//         apiTemplates,
//         currentFlow.id
//       );

//       setFlows((prevFlows) =>
//         prevFlows.map((flow) =>
//           flow.id === currentFlow.id
//             ? { ...flow, templates: convertedTemplates }
//             : flow
//         )
//       );
//     } catch (error) {
//       console.error("Error loading templates from API:", error);
//       toast.error("Failed to load templates. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOpenModal = (template) => setModalTemplate(template);
//   const handleCloseModal = () => setModalTemplate(null);

//   const handleSelectTemplate = (templateId) => {
//     setSelectedTemplates({
//       ...selectedTemplates,
//       [currentFlow.id]: templateId,
//     });
//     setModalTemplate(null);
//   };

//   const handleEditTemplate = (template) => {
//     setEditingTemplate(template);
//     setModalTemplate(null);
//     setIsEditorOpen(true);
//   };

//   const handleCreateNewTemplate = () => {
//     setIsCreatingNew(true);
//     setEditingTemplate(null);
//     setIsEditorOpen(true);
//   };

//   const handleDeleteTemplate = async (template) => {
//     if (!effectiveEventId || !template.apiId) {
//       console.error(
//         "Cannot delete template: Missing eventId or template API ID"
//       );
//       toast.error("Cannot delete template: Missing required data.");
//       return;
//     }

//     const confirmed = window.confirm(
//       `Are you sure you want to delete "${template.title}"?`
//     );
//     if (!confirmed) return;

//     proceedWithDelete(template);
//   };

//   const proceedWithDelete = async (template) => {
//     setIsLoading(true);
//     try {
//       await apiService.deleteTemplate(
//         effectiveEventId,
//         template.apiId,
//         currentFlow.id
//       );

//       setFlows((prevFlows) =>
//         prevFlows.map((flow) => ({
//           ...flow,
//           templates: flow.templates.filter((tpl) => tpl.id !== template.id),
//         }))
//       );

//       if (selectedTemplates[currentFlow.id] === template.id) {
//         setSelectedTemplates((prev) => {
//           const newSelected = { ...prev };
//           delete newSelected[currentFlow.id];
//           return newSelected;
//         });
//       }

//       setModalTemplate(null);
//       toast.success("Template deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting template from API:", error);
//       toast.error("Failed to delete template. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSaveNewTemplate = async (design, html) => {
//     if (!isCreatingNew || !effectiveEventId) return;

//     setIsLoading(true);
//     try {
//       const apiResponse = await apiService.saveTemplate(
//         effectiveEventId,
//         currentFlow.id,
//         html,
//         design
//       );

//       const newTemplate = {
//         id: `custom-${Date.now()}`,
//         title: `Custom ${currentFlow.label} Template`,
//         design,
//         html,
//         apiId: apiResponse.data?.id,
//         type: currentFlow.id,
//       };

//       setFlows((prevFlows) =>
//         prevFlows.map((flow) =>
//           flow.id === currentFlow.id
//             ? { ...flow, templates: [...flow.templates, newTemplate] }
//             : flow
//         )
//       );

//       setSelectedTemplates({
//         ...selectedTemplates,
//         [currentFlow.id]: newTemplate.id,
//       });

//       setIsCreatingNew(false);
//       setIsEditorOpen(false);
//       toast.success("Template created successfully!");
//     } catch (error) {
//       console.error("Error saving template to API:", error);
//       toast.error("Failed to save template. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateTemplate = async (design, html) => {
//     if (!editingTemplate || !effectiveEventId || !editingTemplate.apiId) {
//       toast.error("Missing required data for updating template.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await apiService.updateTemplate(
//         effectiveEventId,
//         editingTemplate.apiId,
//         currentFlow.id,
//         html,
//         design
//       );

//       setFlows((prevFlows) =>
//         prevFlows.map((flow) => ({
//           ...flow,
//           templates: flow.templates.map((tpl) =>
//             tpl.id === editingTemplate.id ? { ...tpl, design, html } : tpl
//           ),
//         }))
//       );

//       setEditingTemplate(null);
//       setIsEditorOpen(false);
//       toast.success("Template updated successfully!");
//     } catch (error) {
//       console.error("Error updating template in API:", error);
//       toast.error("Failed to update template. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSaveFromEditor = async (design, html) => {
//     if (isCreatingNew) {
//       await handleSaveNewTemplate(design, html);
//     } else {
//       await handleUpdateTemplate(design, html);
//     }
//   };

//   const handleNext = () => {
//     if (!selectedTemplates[currentFlow.id]) {
//       toast.warning("Please select a template before proceeding");
//       return;
//     }

//     if (currentFlowIndex < flows.length - 1) {
//       setCurrentFlowIndex(currentFlowIndex + 1);
//     } else if (onNext) {
//       if (effectiveEventId) {
//         onNext(effectiveEventId);
//       } else {
//         onNext();
//       }
//       toast.success("All email templates configured successfully!");
//     }
//   };

//   const handleBack = () => {
//     if (currentFlowIndex > 0) {
//       setCurrentFlowIndex(currentFlowIndex - 1);
//     } else if (onPrevious) {
//       onPrevious();
//     }
//   };

//   const handleStepClick = (index) => {
//     const isCompleted = selectedTemplates[flows[index].id];
//     const isCurrentOrPrevious = index <= currentFlowIndex;

//     if (isCompleted || isCurrentOrPrevious) {
//       setCurrentFlowIndex(index);
//     }
//   };

//   const allStepsCompleted = flows.every((flow) => selectedTemplates[flow.id]);

//   return (
//     <div className="w-full bg-white p-6 rounded-2xl shadow-sm relative">
//       <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center gap-2">
//           <ChevronLeft className="text-gray-500" size={20} />
//           <h2 className="text-xl font-semibold text-gray-900">
//             {currentFlow.label}
//           </h2>
//         </div>
//         <div className="flex items-center gap-2">
//           {flows.map((flow, index) => {
//             const isCompleted = Boolean(selectedTemplates[flow.id]);
//             const isActive = index === currentFlowIndex;
//             const isAccessible = index <= currentFlowIndex || isCompleted;

//             return (
//               <div key={flow.id} className="flex items-center">
//                 <button
//                   onClick={() => handleStepClick(index)}
//                   disabled={!isAccessible}
//                   className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
//                     isCompleted
//                       ? "bg-pink-500 border-pink-500 cursor-pointer"
//                       : isActive
//                       ? "border-pink-500 bg-white cursor-pointer"
//                       : "border-gray-300 bg-white cursor-not-allowed"
//                   } ${isAccessible ? "cursor-pointer" : "cursor-not-allowed"}`}
//                 >
//                   {isCompleted ? (
//                     <Check size={16} className="text-white" />
//                   ) : (
//                     <span
//                       className={`text-sm font-medium ${
//                         isActive ? "text-pink-500" : "text-gray-400"
//                       }`}
//                     >
//                       {index + 1}
//                     </span>
//                   )}
//                 </button>

//                 {index !== flows.length - 1 && (
//                   <div
//                     className={`w-8 h-0.5 mx-1 ${
//                       selectedTemplates[flow.id] ? "bg-pink-500" : "bg-gray-300"
//                     }`}
//                   />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {isLoading && (
//         <div className="flex justify-center items-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
//           <span className="ml-2 text-gray-600">Loading templates...</span>
//         </div>
//       )}

//       {!isLoading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           <div
//             onClick={handleCreateNewTemplate}
//             className="border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
//           >
//             <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
//               <Plus className="text-pink-500" size={24} />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-1 text-center text-pink-500">
//               Create New Template
//             </h3>
//             <p className="text-sm text-gray-500 text-center">
//               Design a custom email template
//             </p>
//           </div>

//           {currentFlow.templates.map((tpl) => (
//             <div
//               key={tpl.id}
//               onClick={() => handleOpenModal(tpl)}
//               className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md aspect-square flex flex-col relative group ${
//                 selectedTemplates[currentFlow.id] === tpl.id
//                   ? "border-pink-500 bg-pink-50 shadow-md"
//                   : "border-gray-200 hover:border-pink-300"
//               }`}
//             >
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleDeleteTemplate(tpl);
//                 }}
//                 className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
//                 title="Delete template"
//               >
//                 <Trash2 size={14} />
//               </button>

//               <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
//                 {tpl.html ? (
//                   <div className="w-full h-full transform origin-top-left">
//                     <div dangerouslySetInnerHTML={{ __html: tpl.html }} />
//                   </div>
//                 ) : (
//                   <div className="text-gray-400 text-sm">No preview</div>
//                 )}
//               </div>
//               <div className="mt-3">
//                 <h3 className="font-medium text-gray-900 text-center">
//                   {tpl.title}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {modalTemplate && (
//         <TemplateModal
//           template={modalTemplate}
//           onClose={handleCloseModal}
//           onSelect={handleSelectTemplate}
//           onEdit={handleEditTemplate}
//           onDelete={handleDeleteTemplate}
//         />
//       )}

//       {isEditorOpen && (
//         <CustomEmailEditor
//           initialContent={editingTemplate?.design || null}
//           onClose={() => {
//             setIsEditorOpen(false);
//             setEditingTemplate(null);
//             setIsCreatingNew(false);
//           }}
//           onSave={handleSaveFromEditor}
//         />
//       )}

//       <div className="flex justify-between items-center pt-6 border-t border-gray-100">
//         <button
//           onClick={handleBack}
//           disabled={currentFlowIndex === 0 && !onPrevious}
//           className={`cursor-pointer px-6 py-2 border rounded-lg transition-colors ${
//             currentFlowIndex === 0 && !onPrevious
//               ? "text-gray-400 border-gray-200 cursor-not-allowed"
//               : "text-gray-700 border-gray-300 hover:bg-gray-100"
//           }`}
//         >
//           ← Previous
//         </button>

//         <span className="text-sm text-gray-500">
//           Step {currentFlowIndex + 1} of {flows.length}
//           {allStepsCompleted && " - All steps completed!"}
//         </span>

//         <button
//           onClick={handleNext}
//           disabled={!selectedTemplates[currentFlow.id] || isLoading}
//           className={`cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium ${
//             selectedTemplates[currentFlow.id] && !isLoading
//               ? "bg-slate-800 hover:bg-slate-800"
//               : "bg-gray-300 cursor-not-allowed"
//           }`}
//         >
//           {currentFlowIndex === flows.length - 1 ? "Finish" : "Next →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdvanceEmail;
