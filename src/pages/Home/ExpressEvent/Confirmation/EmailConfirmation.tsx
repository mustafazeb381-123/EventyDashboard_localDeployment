import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronLeft, X, Pencil, Trash2 } from "lucide-react";
import EmailEditor from "react-email-editor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createRoot } from "react-dom/client";

// ---------- Static Templates ----------
import ThanksTemplateOne from "./Templates/ThanksEmailTemplates/ThanksTemplateOne";
import ThanksTemplateTwo from "./Templates/ThanksEmailTemplates/ThanksTemplateTwo";
import ConfirmationTemplateOne from "./Templates/ConfirmationEmailTemplates/ConfirmationTemplateOne";
import ReminderTemplateOne from "./Templates/ReminderEmailTemplate/ReminderTemplateOne";
import ReminderTemplateTwo from "./Templates/ReminderEmailTemplate/ReminderTemplateTwo";
import { getEmailTemplatesApi, createEmailTemplateApi, updateEmailTemplateApi, deleteEmailTemplateApi, getShowEventData } from "@/apis/apiHelpers";

// Helper function to create static templates with event data
const createStaticTemplates = (eventData: any) => {
  console.log("eventData in createStaticTemplates---------++++++++-------------", eventData);
  if (!eventData) {
    console.warn("createStaticTemplates called without eventData");
    return { welcome: [], thank_you: [], reminder: [] };
  }
  
  const eventProps = {
    eventName: eventData?.attributes?.name || "",
    dateFrom: eventData?.attributes?.event_date_from || undefined,
    dateTo: eventData?.attributes?.event_date_to || undefined,
    timeFrom: eventData?.attributes?.event_time_from 
      ? new Date(eventData.attributes.event_time_from).toTimeString().slice(0, 5)
      : undefined,
    timeTo: eventData?.attributes?.event_time_to
      ? new Date(eventData.attributes.event_time_to).toTimeString().slice(0, 5)
      : undefined,
    location: eventData?.attributes?.location || "",
    logoUrl: eventData?.attributes?.logo_url || null,
  };
  
  console.log("Creating templates with eventProps:", eventProps);

  return {
    welcome: [
      { 
        id: "welcome-template-1", 
        title: "Welcome Template 1", 
        component: <ConfirmationTemplateOne {...eventProps} />, 
        html: null, 
        design: null, 
        isStatic: true, 
        type: "welcome", 
        readyMadeId: "welcome-template-1" 
      },
    ],
    thank_you: [
      { 
        id: "thank-you-template-1", 
        title: "Thank You Template 1", 
        component: <ThanksTemplateOne {...eventProps} />, 
        html: null, 
        design: null, 
        isStatic: true, 
        type: "thank_you", 
        readyMadeId: "thank-you-template-1" 
      },
      { 
        id: "thank-you-template-2", 
        title: "Thank You Template 2", 
        component: <ThanksTemplateTwo {...eventProps} />, 
        html: null, 
        design: null, 
        isStatic: true, 
        type: "thank_you", 
        readyMadeId: "thank-you-template-2" 
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
        readyMadeId: "reminder-template-1" 
      },
      { 
        id: "reminder-template-2", 
        title: "Reminder Template 2", 
        component: <ReminderTemplateTwo {...eventProps} />, 
        html: null, 
        design: null, 
        isStatic: true, 
        type: "reminder", 
        readyMadeId: "reminder-template-2" 
      },
    ],
  };
};

// ---------- Helper Functions ----------
const convertApiTemplates = (apiTemplates: any[], flowType: string) => {
  return apiTemplates.map((tpl, idx) => ({
    id: `api-${tpl.id}`,
    title: tpl.attributes?.name || `${flowType.charAt(0).toUpperCase() + flowType.slice(1).replace('_', ' ')} Template ${idx + 1}`,
    component: null,
    design: null, // New API doesn't use design, only body/html
    html: tpl.attributes?.body || "",
    apiId: tpl.id,
    isStatic: false,
    type: tpl.attributes?.template_type || flowType,
    isSelected: tpl.attributes?.selected || tpl.attributes?.is_selected || false, // Check for selected field from API
    readyMadeId: null, // Will be set if this matches a ready-made template
  }));
};

// Helper function to check if an API template matches a ready-made template
const matchesReadyMadeTemplate = (apiTemplate: any, readyMadeTemplate: any): boolean => {
  // Match by exact title/name
  if (apiTemplate.attributes?.name === readyMadeTemplate.title) {
    return true;
  }
  // You can add more matching logic here if needed (e.g., by HTML content hash)
  return false;
};

// ---------- Modals ----------
const EmailEditorModal = ({ open, initialDesign, onClose, onSave }: any) => {
  const emailEditorRef = useRef<any>(null);
  useEffect(() => { if (!open) return; setTimeout(() => initialDesign && emailEditorRef.current?.editor?.loadDesign(initialDesign), 300); }, [open, initialDesign]);
  if (!open) return null;
  const handleExport = () => emailEditorRef.current?.editor?.exportHtml((data: any) => { onSave(data.design, data.html); onClose(); });
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Edit Email Template</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-1">
          <EmailEditor ref={emailEditorRef} minHeight="100%" appearance={{ theme: "dark" }} />
        </div>
        <div className="p-3 border-t flex justify-end bg-gray-100">
          <button onClick={handleExport} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium">Save Template</button>
        </div>
      </div>
    </div>
  );
};

const TemplateModal = ({ template, onClose, onSelect, onEdit, onDelete, eventDataKey }: any) => {
  if (!template) return null;
  // Ready-made templates are read-only - check both isStatic and readyMadeId
  const isReadyMade = template.isStatic || template.readyMadeId;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" key={eventDataKey}>
      <div className="bg-white p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
          <div className="flex items-center gap-3">
            {!isReadyMade && template.apiId && <button onClick={() => onEdit(template)} className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-sm"><Pencil size={14} /></button>}
            {!isReadyMade && template.apiId && <button onClick={() => onDelete(template)} className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm"><Trash2 size={14} /></button>}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
          </div>
        </div>
        <div className="mb-6 border rounded-lg p-4 bg-gray-50 min-h-[400px]" key={`modal-content-${eventDataKey}`}>
          {template.html ? <div dangerouslySetInnerHTML={{ __html: template.html }} /> : template.component ? template.component : <div className="flex items-center justify-center w-full h-full text-gray-400">No preview available</div>}
        </div>
        <button onClick={() => onSelect(template.id)} className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium" disabled={!template.component && !template.html}>Choose this template</button>
      </div>
    </div>
  );
};

const TemplateThumbnail = ({ template, eventDataKey }: any) => {
  const scale = 0.5;
  const scaledWidth = `${100 / scale}%`, scaledHeight = `${100 / scale}%`;
  return (
    <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 relative" key={eventDataKey}>
      {template.html ? (
        <div className="absolute inset-0">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: scaledWidth, height: scaledHeight }}>
            <div dangerouslySetInnerHTML={{ __html: template.html }} />
          </div>
        </div>
      ) : template.component ? (
        <div className="absolute inset-0" key={`component-${eventDataKey}`}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: scaledWidth, height: scaledHeight }}>{template.component}</div>
        </div>
      ) : <div className="flex items-center justify-center w-full h-full text-gray-400">No preview available</div>}
      {/* {template.isStatic && <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Static</div>} */}
    </div>
  );
};

// ---------- Main Component ----------
interface EmailConfirmationProps { onNext: (eventId?: string | number) => void; onPrevious?: () => void; eventId?: string | number; }
const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ onNext, onPrevious, eventId }) => {
  const localStorageEventId = localStorage.getItem("create_eventId");
  const effectiveEventId = eventId || localStorageEventId;

  const [flows, setFlows] = useState<any[]>([
    { id: "welcome", label: "Welcome Email", templates: [] },
    { id: "thank_you", label: "Thank You Email", templates: [] },
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

  const currentFlow = flows[currentFlowIndex];

  // Fetch event data when eventId is available - respond to both eventId prop and effectiveEventId changes
  useEffect(() => {
    const fetchEventData = async () => {
      const currentEventId = eventId || localStorage.getItem("create_eventId");
      if (!currentEventId) {
        setEventData(null); // Clear event data if no eventId
        // Reset flows when no eventId
        setFlows([
          { id: "welcome", label: "Welcome Email", templates: [] },
          { id: "thank_you", label: "Thank You Email", templates: [] },
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
      const latestTemplate = currentFlow.templates.find((t: any) => t.id === modalTemplate.id);
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
      console.log("Skipping loadTemplatesFromAPI - missing eventId or eventData", { effectiveEventId, eventData });
      return;
    }
    setIsLoading(true);
    try {
      console.log("Loading templates with eventData:", eventData);
      const response = await getEmailTemplatesApi(effectiveEventId, currentFlow.id);
      const apiTemplates = response.data.data || [];
      const convertedTemplates = convertApiTemplates(apiTemplates, currentFlow.id);
      // Get static templates with LATEST event data - always recreate with current eventData
      const staticTemplatesMap = createStaticTemplates(eventData);
      console.log("Created static templates with eventData:", eventData?.attributes?.name);
      const staticTemplates = staticTemplatesMap[currentFlow.id as keyof typeof staticTemplatesMap] || [];
      
      // Filter out ready-made templates from API response to avoid duplicates
      // Only show custom templates from API, not ready-made ones
      const customApiTemplates = convertedTemplates.filter((apiTpl: any) => {
        // Check if this API template matches any ready-made template
        const isReadyMade = staticTemplates.some((staticTpl: any) => 
          matchesReadyMadeTemplate({ attributes: { name: apiTpl.title } }, staticTpl)
        );
        // Only include if it's NOT a ready-made template
        return !isReadyMade;
      });
      
      // Find the selected template from API response (check if a ready-made template is selected)
      const selectedApiTemplate = convertedTemplates.find((t: any) => t.isSelected);
      if (selectedApiTemplate) {
        // Check if the selected template is a ready-made template
        const isSelectedReadyMade = staticTemplates.some((staticTpl: any) => 
          matchesReadyMadeTemplate({ attributes: { name: selectedApiTemplate.title } }, staticTpl)
        );
        
        if (isSelectedReadyMade) {
          // If a ready-made template is selected, select the corresponding static template
          const matchingStaticTemplate = staticTemplates.find((staticTpl: any) => 
            matchesReadyMadeTemplate({ attributes: { name: selectedApiTemplate.title } }, staticTpl)
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
      console.log("Setting flows with updated templates count:", updatedTemplates.length);
      setFlows(prev => prev.map(f => 
        f.id === currentFlow.id 
          ? { 
              ...f, 
              templates: updatedTemplates // Use new array reference
            } 
          : f
      ));
    } catch (e) { 
      console.error("Failed to load templates:", e);
      toast.error("Failed to load templates"); 
    }
    finally { setIsLoading(false); }
  };

  const handleOpenModal = (template: any) => {
    // Always get the latest template from current flows to ensure we have latest event data
    const latestTemplate = currentFlow.templates.find((t: any) => t.id === template.id) || template;
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
      toast.error("Event ID is missing");
      return;
    }

    // Find the selected template
    const selectedTemplate = currentFlow.templates.find((t: any) => t.id === templateId);
    if (!selectedTemplate) {
      toast.error("Template not found");
      return;
    }

    // Ready-made templates (isStatic or readyMadeId) - check if they exist in API
    if (selectedTemplate.isStatic || selectedTemplate.readyMadeId) {
      setIsLoading(true);
      try {
        // Check if this ready-made template already exists in API
        const response = await getEmailTemplatesApi(effectiveEventId, currentFlow.id);
        const apiTemplates = response.data.data || [];
        const existingTemplate = apiTemplates.find((apiTpl: any) => 
          matchesReadyMadeTemplate(apiTpl, selectedTemplate)
        );

        if (existingTemplate) {
          // Template already exists in API - just select the static template (don't replace it)
          // Keep static template visible, just mark it as selected
          setFlows(prev =>
            prev.map(f =>
              f.id === currentFlow.id
                ? {
                    ...f,
                    templates: f.templates.map((t: any) =>
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
          toast.success("Template selected!");
        } else {
          // Template doesn't exist - create it via POST API
          // Convert React component to HTML string
          let htmlString = "";
          if (selectedTemplate.component) {
            // Re-render component with latest event data if available
            const staticTemplatesMap = createStaticTemplates(eventData);
            const flowTemplates = staticTemplatesMap[currentFlow.id as keyof typeof staticTemplatesMap] || [];
            const updatedTemplate = flowTemplates.find((t: any) => t.id === templateId);
            const componentToRender = updatedTemplate?.component || selectedTemplate.component;
            htmlString = await componentToHtml(componentToRender);
          } else if (selectedTemplate.html) {
            htmlString = selectedTemplate.html;
          } else {
            toast.error("Template content not available");
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
          setFlows(prev =>
            prev.map(f =>
              f.id === currentFlow.id
                ? {
                    ...f,
                    templates: f.templates.map((t: any) =>
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
          toast.success("Template saved and selected!");
        }
      } catch (e) {
        console.error("Failed to save/select ready-made template:", e);
        toast.error("Failed to save template");
      } finally {
        setIsLoading(false);
      }
    } else {
      // For non-static templates or already saved static templates
      // Only one template can be selected at a time - clear previous selection
      setFlows(prev =>
        prev.map(f =>
          f.id === currentFlow.id
            ? {
                ...f,
                templates: f.templates.map((t: any) =>
                  t.id === templateId ? { ...t, isSelected: true } : { ...t, isSelected: false }
                ),
              }
            : f
        )
      );
      
      setSelectedTemplates({ ...selectedTemplates, [currentFlow.id]: templateId });
      setModalTemplate(null);
      toast.success("Template selected!");
    }
  };
  const handleCreateNewTemplate = () => { setIsCreatingNew(true); setEditingTemplate(null); setIsEditorOpen(true); };
  const handleEditTemplate = (template: any) => { 
    // Ready-made templates cannot be updated - check both isStatic and readyMadeId
    if (template.isStatic || template.readyMadeId) {
      toast.warning("Ready-made templates cannot be edited. Please create a custom template instead.");
      return;
    }
    setEditingTemplate(template); 
    setModalTemplate(null); 
    setIsEditorOpen(true); 
  };

  const handleBack = () => { if (currentFlowIndex > 0) setCurrentFlowIndex(currentFlowIndex - 1); else onPrevious?.(); };
  const handleNext = () => { if (!selectedTemplates[currentFlow.id]) { toast.warning("Please select template"); return; } if (currentFlowIndex < flows.length - 1) setCurrentFlowIndex(currentFlowIndex + 1); else onNext?.(effectiveEventId || undefined); };

  const handleSaveFromEditor = async (_design: any, html: string) => {
    if (!effectiveEventId) return;

    if (isCreatingNew) {
      setIsLoading(true);
      try {
        const apiResp = await createEmailTemplateApi(effectiveEventId, currentFlow.id, html, `Custom ${currentFlow.label} Template`);
        console.log("apiResp of post api", apiResp);
        const newTemplate = { 
          id: `api-${apiResp.data.data.id}`, 
          title: apiResp.data.data.attributes?.name || `Custom ${currentFlow.label} Template`, 
          component: null, 
          design: null, 
          html, 
          apiId: apiResp.data.data.id, 
          isStatic: false, 
          type: currentFlow.id 
        };
        const staticTemplatesMap = createStaticTemplates(eventData);
        const staticTemplates = staticTemplatesMap[currentFlow.id as keyof typeof staticTemplatesMap] || [];
        // Only one template can be selected - clear previous selection
        setFlows(prev => prev.map((f, idx) => 
          idx === currentFlowIndex 
            ? { 
                ...f, 
                templates: [
                  ...staticTemplates, 
                  ...f.templates.filter((t: any) => !t.isStatic).map((t: any) => ({ ...t, isSelected: false })),
                  { ...newTemplate, isSelected: true }
                ] 
              } 
            : f
        ));
        setSelectedTemplates({ ...selectedTemplates, [currentFlow.id]: newTemplate.id });
        setIsCreatingNew(false); 
        setIsEditorOpen(false); 
        toast.success("Template created!");
      } catch (e) { 
        console.error("Failed to create template:", e);
        toast.error("Failed to create template"); 
      } finally { setIsLoading(false); }
    } else if (editingTemplate) {
      // Ready-made templates cannot be updated - check both isStatic and readyMadeId
      if (editingTemplate.isStatic || editingTemplate.readyMadeId) {
        toast.warning("Ready-made templates cannot be updated. Please create a custom template instead.");
        setIsEditorOpen(false);
        setEditingTemplate(null);
        return;
      }
      setIsLoading(true);
      try { 
        const templateName = editingTemplate.title || `Custom ${currentFlow.label} Template`;
        await updateEmailTemplateApi(effectiveEventId, editingTemplate.apiId, currentFlow.id, html, templateName); 
        setFlows(prev => prev.map(f => ({ 
          ...f, 
          templates: f.templates.map((t: any) => 
            t.id === editingTemplate.id 
              ? { ...t, html, design: null, title: templateName } 
              : t
          ) 
        }))); 
        setEditingTemplate(null); 
        setIsEditorOpen(false); 
        toast.success("Template updated!"); 
      }
      catch (e) { 
        console.error("Failed to update template:", e);
        toast.error("Failed to update template"); 
      } finally { setIsLoading(false); }
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 bg-white rounded-2xl shadow-sm">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2"><ChevronLeft size={20} /> <h2 className="text-xl font-semibold">{currentFlow.label}</h2></div>
        <div className="flex items-center gap-2">
          {flows.map((f, idx) => {
            const active = idx === currentFlowIndex, done = Boolean(selectedTemplates[f.id]);
            return (
              <div key={f.id} className="flex items-center">
                <button disabled={idx > currentFlowIndex && !done} className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${done ? "bg-pink-500 border-pink-500" : active ? "border-pink-500" : "border-gray-300"}`}>{done ? <Check size={16} className="text-white" /> : <span className="text-sm">{idx + 1}</span>}</button>
                {idx !== flows.length - 1 && <div className={`w-8 h-0.5 mx-1 ${selectedTemplates[f.id] ? "bg-pink-500" : "bg-gray-300"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" /></div>}

      {!isLoading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={handleCreateNewTemplate} className="border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition">+ New Template</div>
        {currentFlow.templates.map((template: any) => {
          const eventDataKey = `${effectiveEventId}-${eventData?.id || ''}-${eventData?.attributes?.name || ''}`;
          return (
            <div key={`${template.id}-${eventDataKey}`} onClick={() => handleOpenModal(template)} className={`cursor-pointer rounded-2xl border ${selectedTemplates[currentFlow.id] === template.id ? "border-pink-500" : "border-gray-200"} overflow-hidden`}>
              <TemplateThumbnail template={template} eventDataKey={eventDataKey} />
              <div className="p-2 text-center font-medium">{template.title}</div>
            </div>
          );
        })}
      </div>}

      <div className="flex justify-between gap-4">
        <button onClick={handleBack} className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100">Back</button>
        <button onClick={handleNext} className="px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white">Next</button>
      </div>

      <TemplateModal 
        template={modalTemplate} 
        eventDataKey={`${effectiveEventId}-${eventData?.id || ''}-${eventData?.attributes?.name || ''}`}
        onClose={handleCloseModal} 
        onSelect={handleSelectTemplate} 
        onEdit={handleEditTemplate} 
        onDelete={async (tpl: any) => { 
        // Ready-made templates cannot be deleted - check both isStatic and readyMadeId
        if (tpl.isStatic || tpl.readyMadeId) {
          toast.warning("Ready-made templates cannot be deleted.");
          return;
        }
        if (!effectiveEventId || !tpl.apiId) return; 
        setIsLoading(true); 
        try { 
          await deleteEmailTemplateApi(effectiveEventId, tpl.apiId); 
          // Remove the template from flows
          setFlows(prev => prev.map(f => ({ ...f, templates: f.templates.filter((t: any) => t.id !== tpl.id) }))); 
          // If the deleted template was selected, clear the selection
          if (selectedTemplates[currentFlow.id] === tpl.id) {
            setSelectedTemplates((prev: any) => {
              const updated = { ...prev };
              delete updated[currentFlow.id];
              return updated;
            });
          }
          toast.success("Template deleted"); 
          handleCloseModal(); 
        } catch (e) { 
          console.error("Failed to delete template:", e); 
          toast.error("Failed to delete template"); 
        } finally { 
          setIsLoading(false); 
        } 
      }} />

      <EmailEditorModal open={isEditorOpen} initialDesign={editingTemplate?.design} onClose={() => { setIsEditorOpen(false); setEditingTemplate(null); setIsCreatingNew(false); }} onSave={handleSaveFromEditor} />
    </div>
  );
};

export default EmailConfirmation;
