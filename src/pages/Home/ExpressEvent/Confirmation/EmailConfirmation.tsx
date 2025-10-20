import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronLeft, X, Pencil, Plus, Trash2 } from "lucide-react";
import EmailEditor from "react-email-editor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThanksTemplateOne from "./Templates/ThanksEmailTemplates/ThanksTemplateOne";
import ThanksTemplateTwo from "./Templates/ThanksEmailTemplates/ThanksTemplateTwo";
import ConfirmationTemplateOne from "./Templates/ConfirmationEmailTemplates/ConfirmationTemplateOne";
import ReminderTemplateOne from "./Templates/ReminderEmailTemplate/ReminderTemplateOne";
import ReminderTemplateTwo from "./Templates/ReminderEmailTemplate/ReminderTemplateTwo";
import RejectionTemplateOne from "./Templates/RejectionEmailTemplate/RejectionTemplateOne";
import RejectionTemplateTwo from "./Templates/RejectionEmailTemplate/RejectionTemplateTwo";

const EmailEditorModal = ({ open, initialDesign, onClose, onSave }: any) => {
  const emailEditorRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (emailEditorRef.current?.editor && initialDesign) {
        try {
          emailEditorRef.current.editor.loadDesign(initialDesign);
        } catch (err) {
          console.warn("Failed to load design into editor:", err);
        }
      } else if (emailEditorRef.current?.editor && !initialDesign) {
      }
    }, 300);

    return () => clearTimeout(t);
  }, [open, initialDesign]);

  if (!open) return null;

  const handleExport = () => {
    emailEditorRef.current?.editor?.exportHtml((data: any) => {
      const { design, html } = data;
      
      console.log("=== SAVING TEMPLATE DATA ===");
      console.log("Design JSON:", JSON.stringify(design, null, 2));
      console.log("HTML Content:", html);
      console.log("Design object structure:", {
        counters: design?.counters,
        body: design?.body ? `Present (${Object.keys(design.body).length} properties)` : 'Missing',
        head: design?.head ? `Present (${Object.keys(design.head).length} properties)` : 'Missing'
      });
      console.log("============================");
      
      onSave(design, html);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Edit Email Template</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1">
          <EmailEditor ref={emailEditorRef} minHeight="100%" appearance={{ theme: "dark" }} />
        </div>

        <div className="p-3 border-t flex justify-end bg-gray-100">
          <button
            onClick={handleExport}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplateModal = ({ template, onClose, onSelect, onEdit, onDelete }: any) => {
  if (!template) return null;

  const content = template.html ? (
    <div
      className="w-full"
      dangerouslySetInnerHTML={{ __html: template.html }}
    />
  ) : (
    <div className="w-full">{template.component}</div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(template)}
              className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-sm"
            >
              <Pencil size={14} />
              Edit Template
            </button>
            {/* DELETE BUTTON - ALWAYS SHOW FOR ALL TEMPLATES */}
            <button
              onClick={() => onDelete(template)}
              className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm"
            >
              <Trash2 size={14} />
              Delete Template
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Template content */}
        <div className="mb-6">{content}</div>

        <button
          onClick={() => onSelect(template.id)}
          className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          Choose this template
        </button>
      </div>
    </div>
  );
};

/**
 * TemplateThumbnail - Component to display template preview in grid
 */
const TemplateThumbnail = ({ template }: any) => {
  return (
    <div className="w-full aspect-square overflow-hidden rounded-xl flex items-center justify-center bg-gray-100 relative">
      {template.html ? (
        // For edited templates: Show scaled preview of the actual HTML
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: 'scale(0.3)', transformOrigin: 'top left' }}
        >
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: template.html }}
          />
        </div>
      ) : (
        // For static templates: Show the React component properly scaled
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: 'scale(0.3)', transformOrigin: 'top left' }}
        >
          {template.component}
        </div>
      )}
    </div>
  );
};

const apiService = {
  getAuthToken() {
    const token = localStorage.getItem('token')
    console.log("token-------+++++++++++000000000000000", token);
    return token;
  },

  // Get templates from API
  async getTemplates(eventId: string | number, flowType: string) {
    try {
      const endpoint = this.getEndpoint();
      const typeParam = this.getTypeParam(flowType);
      
      const url = `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/${endpoint}?type=${typeParam}`;
      
      console.log(`=== FETCHING TEMPLATES ===`);
      console.log("URL:", url);
      console.log("Flow Type:", flowType);
      console.log("Type Param:", typeParam);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`=== GET ${flowType.toUpperCase()} TEMPLATES RESPONSE ===`, data);
      
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching ${flowType} templates:`, error);
      throw error;
    }
  },

  // Save NEW template to API (POST)
  async saveTemplate(eventId: string | number, flowType: string, html: string, title: string = 'Custom Template') {
    try {
      const endpoint = this.getEndpoint();
      const payload = this.getPayload(flowType, html, title);
      
      console.log(`=== SAVING NEW ${flowType.toUpperCase()} TEMPLATE ===`);
      console.log("Event ID:", eventId);
      console.log("Endpoint:", endpoint);
      console.log("Payload:", payload);
      
      const response = await fetch(`https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(`Failed to save template: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`=== ${flowType.toUpperCase()} TEMPLATE SAVED ===`, data);
      
      return data;
    } catch (error) {
      console.error(`Error saving ${flowType} template:`, error);
      throw error;
    }
  },

  // UPDATE existing template via PATCH API
  async updateTemplate(eventId: string | number, templateId: string | number, flowType: string, html: string, title: string = 'Updated Template') {
    try {
      const endpoint = this.getEndpoint();
      const typeParam = this.getTypeParam(flowType);
      const url = `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/${endpoint}/${templateId}?type=${typeParam}`;
      
      const payload = this.getUpdatePayload(flowType, html, title);
      
      console.log(`=== UPDATING ${flowType.toUpperCase()} TEMPLATE ===`);
      console.log("URL:", url);
      console.log("Template ID:", templateId);
      console.log("Payload:", payload);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(`Failed to update template: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`=== ${flowType.toUpperCase()} TEMPLATE UPDATED ===`, data);
      
      return data;
    } catch (error) {
      console.error(`Error updating ${flowType} template:`, error);
      throw error;
    }
  },

  // Delete template from API
  async deleteTemplate(eventId: string | number, templateId: string | number, flowType: string) {
    try {
      const endpoint = this.getEndpoint();
      const typeParam = this.getTypeParam(flowType);
      const url = `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/${endpoint}/${templateId}?type=${typeParam}`;
      
      console.log(`=== DELETING TEMPLATE ===`);
      console.log("URL:", url);
      console.log("Template ID:", templateId);
      console.log("Flow Type:", flowType);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {
          // Ignore text parsing errors
        }
        throw new Error(`Failed to delete template: ${errorMessage}`);
      }
      
      // Check if response has content before trying to parse JSON
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      console.log('Response content-length:', contentLength);
      console.log('Response content-type:', contentType);
      
      // If no content or not JSON, return success
      if (contentLength === '0' || !contentType || !contentType.includes('application/json')) {
        console.log('=== TEMPLATE DELETED SUCCESSFULLY (empty response) ===');
        return { success: true, message: 'Template deleted successfully' };
      }
      
      // If there is JSON content, parse it
      try {
        const data = await response.json();
        console.log('=== TEMPLATE DELETED SUCCESSFULLY ===', data);
        return data;
      } catch (jsonError) {
        console.log('JSON parse error, but considering deletion successful');
        return { success: true, message: 'Template deleted successfully' };
      }
      
    } catch (error) {
      console.error(`Error in deleteTemplate:`, error);
      throw error;
    }
  },

  // All templates use the same endpoint
  getEndpoint() {
    return 'confirmation_templates';
  },

  // Map flow types to API type parameters - BASED ON YOUR SCREENSHOT
  getTypeParam(flowType: string) {
    const typeMap: { [key: string]: string } = {
      thanks: 'ConfirmationThanksTemplate',
      confirmation: 'ConfirmationRegisterTemplate',
      reminder: 'ConfirmationReminderTemplate',
      rejection: 'ConfirmationRejectionTemplate'
    };
    
    return typeMap[flowType] || 'ConfirmationThanksTemplate';
  },

  // Create payload for NEW template (POST)
  getPayload(flowType: string, html: string, title: string) {
    const type = this.getTypeParam(flowType);
    
    return {
      confirmation_template: {
        content: html,
        default: false,
        type: type
      }
    };
  },

  // Create payload for UPDATING template (PATCH)
  getUpdatePayload(flowType: string, html: string, title: string) {
    const type = this.getTypeParam(flowType);
    
    return {
      confirmation_template: {
        content: html,
        type: type
        // Note: We don't include 'default' field for updates as it might be controlled separately
      }
    };
  },

  // Convert API templates to our format - REMOVED isDefault CHECK
  convertApiTemplates(apiTemplates: any[], flowType: string) {
    return apiTemplates.map((template: any, index: number) => ({
      id: `api-${template.id}`,
      title: `${flowType.charAt(0).toUpperCase() + flowType.slice(1)} Template ${index + 1}`,
      component: null,
      design: null,
      html: template.attributes?.content || '',
      apiId: template.id,
      // REMOVED: isDefault property since we don't need it anymore
      type: template.attributes?.type || flowType
    }));
  }
};

// -------- Main Component --------
interface EmailConfirmationProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ onNext, onPrevious, eventId }) => {
  // Log the received eventId
  console.log('EmailConfirmation - Received eventId:', eventId);
  
  // Also check localStorage as fallback
  const localStorageEventId = localStorage.getItem("create_eventId");
  console.log('EmailConfirmation - localStorage eventId:', localStorageEventId);
  
  // Use the eventId from props first, then fall back to localStorage
  const effectiveEventId = eventId || localStorageEventId;
  console.log('EmailConfirmation - Effective eventId:', effectiveEventId);

  // Initialize flows structure - no longer using localStorage for emailTemplates
  const [flows, setFlows] = useState<any[]>([
    {
      id: "thanks",
      label: "Thanks Email",
      templates: [],
    },
    {
      id: "confirmation",
      label: "Confirmation Email",
      templates: [],
    },
    {
      id: "reminder",
      label: "Reminder Email",
      templates: [],
    },
    {
      id: "rejection",
      label: "Rejection Email",
      templates: [],
    },
  ]);

  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<any>({});
  const [modalTemplate, setModalTemplate] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentFlow = flows[currentFlowIndex];

  // Load templates from API when component mounts or flow changes
  useEffect(() => {
    if (effectiveEventId) {
      loadTemplatesFromAPI();
    }
  }, [effectiveEventId, currentFlowIndex]);

  // Remove localStorage saving for emailTemplates since we're using API only

  // Load templates from API
  const loadTemplatesFromAPI = async () => {
    if (!effectiveEventId) return;
    
    setIsLoading(true);
    try {
      const apiTemplates = await apiService.getTemplates(effectiveEventId, currentFlow.id);
      const convertedTemplates = apiService.convertApiTemplates(apiTemplates, currentFlow.id);
      
      console.log(`=== LOADED ${currentFlow.id.toUpperCase()} TEMPLATES FROM API ===`, convertedTemplates);
      
      // Update flows with API templates
      setFlows(prevFlows =>
        prevFlows.map(flow =>
          flow.id === currentFlow.id
            ? { ...flow, templates: [...convertedTemplates] }
            : flow
        )
      );
    } catch (error) {
      console.error('Error loading templates from API:', error);
      toast.error('Failed to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open template preview modal
  const handleOpenModal = (template: any) => setModalTemplate(template);
  const handleCloseModal = () => setModalTemplate(null);

  // Select a template for the flow
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates({ ...selectedTemplates, [currentFlow.id]: templateId });
    setModalTemplate(null);
    toast.success('Template selected successfully!');
  };

  // When user clicks edit in TemplateModal
  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setModalTemplate(null); // close preview
    setIsEditorOpen(true); // open editor
  };

  // Handle creating a new template
  const handleCreateNewTemplate = () => {
    setIsCreatingNew(true);
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (template: any) => {
    if (!effectiveEventId || !template.apiId) {
      console.error("Cannot delete template: Missing eventId or template API ID");
      toast.error('Cannot delete template: Missing required data.');
      return;
    }

    // Use toast for confirmation instead of window.confirm
    toast.info(
      <div>
        <p>Are you sure you want to delete "{template.title}"?</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss();
              proceedWithDelete(template);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
      }
    );
  };

  // Proceed with deletion after confirmation
  const proceedWithDelete = async (template: any) => {
    setIsLoading(true);
    try {
      // Delete from API - PASS ALL THREE PARAMETERS
      await apiService.deleteTemplate(effectiveEventId, template.apiId, currentFlow.id);

      console.log("=== DELETING TEMPLATE ===");
      console.log("Template ID:", template.id);
      console.log("API ID:", template.apiId);
      console.log("Current Flow:", currentFlow.label);
      console.log("=========================");

      // Update flows state: remove the deleted template
      setFlows((prevFlows) =>
        prevFlows.map((flow) => ({
          ...flow,
          templates: flow.templates.filter((tpl: any) => tpl.id !== template.id),
        }))
      );

      // If the deleted template was selected, clear the selection
      if (selectedTemplates[currentFlow.id] === template.id) {
        setSelectedTemplates((prev: any) => {
          const newSelected = { ...prev };
          delete newSelected[currentFlow.id];
          return newSelected;
        });
      }

      // Close modal if open
      setModalTemplate(null);

      // Show success message
      toast.success('Template deleted successfully!');
    } catch (error) {
      console.error('Error deleting template from API:', error);
      toast.error('Failed to delete template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Callback when editor saves design & html for a NEW template
  const handleSaveNewTemplate = async (design: any, html: string) => {
    if (!isCreatingNew || !effectiveEventId) return;

    setIsLoading(true);
    try {
      // Save to API first using POST
      const apiResponse = await apiService.saveTemplate(
        effectiveEventId, 
        currentFlow.id, 
        html, 
        `Custom ${currentFlow.label} Template`
      );

      const newTemplate = {
        id: `custom-${Date.now()}`,
        title: `Custom ${currentFlow.label} Template`,
        component: null,
        design,
        html,
        apiId: apiResponse.data?.id,
        // REMOVED: isDefault property
        type: currentFlow.id
      };

      console.log("=== CREATING NEW TEMPLATE ===");
      console.log("New Template Data:", newTemplate);
      console.log("API Response:", apiResponse);
      console.log("Current Flow:", currentFlow.label);
      console.log("============================");

      // Update flows with the new template
      setFlows((prevFlows) =>
        prevFlows.map((flow, index) =>
          index === currentFlowIndex
            ? { ...flow, templates: [...flow.templates, newTemplate] }
            : flow
        )
      );

      // Auto-select the newly created template
      setSelectedTemplates({ ...selectedTemplates, [currentFlow.id]: newTemplate.id });

      setIsCreatingNew(false);
      setIsEditorOpen(false);
      
      toast.success('Template created successfully!');
    } catch (error) {
      console.error('Error saving template to API:', error);
      toast.error('Failed to save template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Callback when editor saves design & html for an EXISTING template
  const handleUpdateTemplate = async (design: any, html: string) => {
    console.log("=== UPDATE TEMPLATE CALLBACK ===");
    console.log("Is Creating New:", isCreatingNew);
    console.log("Editing Template:", editingTemplate);
    console.log("Design received:", design ? `Present (${Object.keys(design).length} properties)` : 'Missing');
    console.log("HTML received:", html ? `Present (${html.length} characters)` : 'Missing');
    console.log("Event ID:", effectiveEventId);
    console.log("=============================");

    if (!editingTemplate || !effectiveEventId || !editingTemplate.apiId) {
      console.warn("Missing required data for updating template:", {
        editingTemplate: !!editingTemplate,
        eventId: !!effectiveEventId,
        apiId: editingTemplate?.apiId
      });
      toast.error('Missing required data for updating template.');
      return;
    }

    setIsLoading(true);
    try {
      // Update existing template in API using PATCH
      await apiService.updateTemplate(
        effectiveEventId, 
        editingTemplate.apiId,
        currentFlow.id, 
        html, 
        editingTemplate.title
      );

      console.log("=== UPDATING EXISTING TEMPLATE ===");
      console.log("Template ID:", editingTemplate.id);
      console.log("API ID:", editingTemplate.apiId);
      console.log("Previous Design:", editingTemplate.design ? `Present` : 'Missing');
      console.log("New Design:", design ? `Present` : 'Missing');
      console.log("================================");

      // Update flows state: find template by id and update design/html
      setFlows((prevFlows) =>
        prevFlows.map((flow) => ({
          ...flow,
          templates: flow.templates.map((tpl: any) =>
            tpl.id === editingTemplate.id ? { ...tpl, design, html } : tpl
          ),
        }))
      );

      // Clear editing template
      setEditingTemplate(null);
      setIsEditorOpen(false);
      
      // Show success message
      toast.success('Template updated successfully!');
    } catch (error) {
      console.error('Error updating template in API:', error);
      toast.error('Failed to update template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Main save handler that routes to either create or update
  const handleSaveFromEditor = async (design: any, html: string) => {
    if (isCreatingNew) {
      await handleSaveNewTemplate(design, html);
    } else {
      await handleUpdateTemplate(design, html);
    }
  };

  // For EmailEditorModal: initialDesign should be the design of the editing template (if exists)
  const initialDesign = editingTemplate?.design ?? null;

  const handleNext = () => {
    if (!selectedTemplates[currentFlow.id]) {
      toast.warning("Please select a template before proceeding");
      return;
    }
    
    console.log('EmailConfirmation - Proceeding to next step with eventId:', effectiveEventId);
    
    if (currentFlowIndex < flows.length - 1) {
      setCurrentFlowIndex(currentFlowIndex + 1);
      toast.success(`Moving to ${flows[currentFlowIndex + 1].label}`);
    } else if (onNext) {
      // Log final state before proceeding
      console.log("=== FINAL STATE BEFORE PROCEEDING ===");
      console.log("All Flows:", flows);
      console.log("All Selected Templates:", selectedTemplates);
      console.log("Event ID:", effectiveEventId);
      console.log("====================================");
      
      // Pass the eventId to the next component
      if (effectiveEventId) {
        console.log('EmailConfirmation - Sending eventId to next component:', effectiveEventId);
        onNext(effectiveEventId);
      } else {
        console.log('EmailConfirmation - No eventId available, calling onNext without parameter');
        onNext();
      }
      
      toast.success('All email templates configured successfully!');
    }
  };

  const handleBack = () => {
    if (currentFlowIndex > 0) {
      setCurrentFlowIndex(currentFlowIndex - 1);
      toast.info(`Returning to ${flows[currentFlowIndex - 1].label}`);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleStepClick = (index: number) => {
    if (index <= currentFlowIndex || selectedTemplates[flows[index].id]) {
      setCurrentFlowIndex(index);
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm relative">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">{currentFlow.label}</h2>
        </div>
        {/* Progress Stepper */}
        <div className="flex items-center gap-2">
          {flows.map((flow, index) => {
            const isCompleted = Boolean(selectedTemplates[flow.id]);
            const isActive = index === currentFlowIndex;

            return (
              <div key={flow.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={index > currentFlowIndex && !isCompleted}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? "bg-pink-500 border-pink-500 cursor-pointer"
                      : isActive
                      ? "border-pink-500 bg-white cursor-pointer"
                      : "border-gray-300 bg-white cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <span className={`text-sm font-medium ${isActive ? "text-pink-500" : "text-gray-400"}`}>
                      {index + 1}
                    </span>
                  )}
                </button>

                {index !== flows.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${selectedTemplates[flow.id] ? "bg-pink-500" : "bg-gray-300"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      )}

      {/* Template Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Create New Template Card - Always show first */}
          <div
            onClick={handleCreateNewTemplate}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
              <Plus className="text-pink-500" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 text-center text-pink-500">Create New Template</h3>
            <p className="text-sm text-gray-500 text-center">Design a custom email template from scratch</p>
          </div>

          {/* Existing Templates */}
          {currentFlow.templates.map((tpl: any) => (
            <div
              key={tpl.id}
              onClick={() => handleOpenModal(tpl)}
              className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md aspect-square flex flex-col relative ${
                selectedTemplates[currentFlow.id] === tpl.id 
                  ? "border-pink-500 bg-pink-50 shadow-md" 
                  : "border-gray-200 hover:border-pink-300"
              }`}
            >
              {/* DELETE BUTTON - ALWAYS SHOW FOR ALL TEMPLATES */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening modal
                  handleDeleteTemplate(tpl);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                title="Delete template"
              >
                <Trash2 size={14} />
              </button>

              {/* Template Thumbnail */}
              <div className="flex-1">
                <TemplateThumbnail template={tpl} />
              </div>
              <div className="mt-3">
                <h3 className="font-medium text-gray-900 text-center">{tpl.title}</h3>
                {/* REMOVED: Default badge since we don't have default templates anymore */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modalTemplate && (
        <TemplateModal
          template={modalTemplate}
          onClose={handleCloseModal}
          onSelect={handleSelectTemplate}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}

      <EmailEditorModal
        open={isEditorOpen}
        initialDesign={initialDesign}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTemplate(null);
          setIsCreatingNew(false);
        }}
        onSave={(design: any, html: string) => {
          handleSaveFromEditor(design, html);
        }}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          disabled={currentFlowIndex === 0 && !onPrevious}
          className={`cursor-pointer px-6 py-2 border rounded-lg transition-colors ${
            currentFlowIndex === 0 && !onPrevious ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentFlowIndex + 1} of {flows.length}
        </span>

        <button
          onClick={handleNext}
          disabled={!selectedTemplates[currentFlow.id] || isLoading}
          className={`cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium ${
            selectedTemplates[currentFlow.id] && !isLoading ? "bg-pink-500 hover:bg-pink-600" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {currentFlowIndex === flows.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmation;