import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronLeft, X, Pencil, Plus, Trash2 } from "lucide-react";
import EmailEditor from "react-email-editor";

const TicketEditorModal = ({ open, initialDesign, onClose, onSave }: any) => {
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
      }
    }, 300);

    return () => clearTimeout(t);
  }, [open, initialDesign]);

  if (!open) return null;

  const handleExport = () => {
    emailEditorRef.current?.editor?.exportHtml((data: any) => {
      const { design, html } = data;
      onSave(design, html);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit Ticket Template
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1">
          <EmailEditor
            ref={emailEditorRef}
            minHeight="100%"
            appearance={{ theme: "dark" }}
          />
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

const TemplateModal = ({
  template,
  onClose,
  onSelect,
  onEdit,
  onDelete,
}: any) => {
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
            </button>
            <button
              onClick={() => onDelete(template)}
              className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

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

const TemplateThumbnail = ({ template }: any) => {
  return (
    <div className="w-full rounded-xl flex items-center justify-center bg-gray-100 relative">
      {template.html ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "scale(0.3)", transformOrigin: "top left" }}
        >
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: template.html }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "scale(0.3)", transformOrigin: "top left" }}
        >
          {template.component}
        </div>
      )}
    </div>
  );
};

const storageService = {
  getTemplates(eventId: string | number, flowType: string) {
    try {
      const key = `ticketTemplates_${eventId}_${flowType}`;
      const templates = localStorage.getItem(key);
      return templates ? JSON.parse(templates) : [];
    } catch (error) {
      console.error("Error getting templates from localStorage:", error);
      return [];
    }
  },

  saveTemplate(eventId: string | number, flowType: string, template: any) {
    try {
      const key = `ticketTemplates_${eventId}_${flowType}`;
      const existingTemplates = this.getTemplates(eventId, flowType);
      const newTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem(key, JSON.stringify(updatedTemplates));

      return newTemplate;
    } catch (error) {
      console.error("Error saving template to localStorage:", error);
      throw error;
    }
  },

  updateTemplate(
    eventId: string | number,
    flowType: string,
    templateId: string,
    updates: any
  ) {
    try {
      const key = `ticketTemplates_${eventId}_${flowType}`;
      const existingTemplates = this.getTemplates(eventId, flowType);

      const updatedTemplates = existingTemplates.map((tpl: any) =>
        tpl.id === templateId
          ? { ...tpl, ...updates, updatedAt: new Date().toISOString() }
          : tpl
      );

      localStorage.setItem(key, JSON.stringify(updatedTemplates));
      return updatedTemplates.find((tpl: any) => tpl.id === templateId);
    } catch (error) {
      console.error("Error updating template in localStorage:", error);
      throw error;
    }
  },

  deleteTemplate(
    eventId: string | number,
    flowType: string,
    templateId: string
  ) {
    try {
      const key = `ticketTemplates_${eventId}_${flowType}`;
      const existingTemplates = this.getTemplates(eventId, flowType);

      const filteredTemplates = existingTemplates.filter(
        (tpl: any) => tpl.id !== templateId
      );
      localStorage.setItem(key, JSON.stringify(filteredTemplates));

      return { success: true, message: "Template deleted successfully" };
    } catch (error) {
      console.error("Error deleting template from localStorage:", error);
      throw error;
    }
  },

  convertStoredTemplates(storedTemplates: any[], flowType: string) {
    return storedTemplates.map((template: any, index: number) => ({
      id: template.id,
      title:
        template.title ||
        `${flowType.charAt(0).toUpperCase() + flowType.slice(1)} Template ${
          index + 1
        }`,
      component: null,
      design: template.design || null,
      html: template.html || "",
      type: flowType,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  },
};

interface AdvanceTicketProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

const AdvanceTicket: React.FC<AdvanceTicketProps> = ({
  onNext,
  onPrevious,
  eventId,
  currentStep,
  totalSteps,
}) => {
  const effectiveEventId = eventId || localStorage.getItem("create_eventId") || 100;

  // FIXED: Added setFlows to useState
  const [flows, setFlows] = useState<any[]>([
    {
      id: "thanks",
      label: "Ticket",
      templates: [],
    },
  ]);

  const [currentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<any>({});
  const [modalTemplate, setModalTemplate] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentFlow = flows[currentFlowIndex];

  useEffect(() => {
    if (effectiveEventId) {
      loadTemplatesFromStorage();
    }
  }, [effectiveEventId]);

  const loadTemplatesFromStorage = () => {
    if (!effectiveEventId) return;

    setIsLoading(true);
    try {
      const storedTemplates = storageService.getTemplates(
        effectiveEventId,
        currentFlow.id
      );
      const convertedTemplates = storageService.convertStoredTemplates(
        storedTemplates,
        currentFlow.id
      );

      // FIXED: Now setFlows is properly defined
      setFlows((prevFlows) =>
        prevFlows.map((flow) =>
          flow.id === currentFlow.id
            ? { ...flow, templates: [...convertedTemplates] }
            : flow
        )
      );
    } catch (error) {
      console.error("Error loading templates from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (template: any) => setModalTemplate(template);
  const handleCloseModal = () => setModalTemplate(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates({
      ...selectedTemplates,
      [currentFlow.id]: templateId,
    });
    setModalTemplate(null);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setModalTemplate(null);
    setIsEditorOpen(true);
  };

  const handleCreateNewTemplate = () => {
    setIsCreatingNew(true);
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = async (template: any) => {
    if (!effectiveEventId || !template.id) return;

    if (
      window.confirm(`Are you sure you want to delete "${template.title}"?`)
    ) {
      proceedWithDelete(template);
    }
  };

  const proceedWithDelete = async (template: any) => {
    setIsLoading(true);
    try {
      await storageService.deleteTemplate(
        effectiveEventId,
        currentFlow.id,
        template.id
      );

      setFlows((prevFlows) =>
        prevFlows.map((flow) => ({
          ...flow,
          templates: flow.templates.filter(
            (tpl: any) => tpl.id !== template.id
          ),
        }))
      );

      if (selectedTemplates[currentFlow.id] === template.id) {
        setSelectedTemplates((prev: any) => {
          const newSelected = { ...prev };
          delete newSelected[currentFlow.id];
          return newSelected;
        });
      }

      setModalTemplate(null);
    } catch (error) {
      console.error("Error deleting template from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewTemplate = async (design: any, html: string) => {
    if (!isCreatingNew || !effectiveEventId) return;

    setIsLoading(true);
    try {
      const newTemplateData = {
        title: `Custom ${currentFlow.label} Template`,
        design,
        html,
        type: currentFlow.id,
      };

      const savedTemplate = storageService.saveTemplate(
        effectiveEventId,
        currentFlow.id,
        newTemplateData
      );

      const newTemplate = {
        id: savedTemplate.id,
        title: savedTemplate.title,
        component: null,
        design,
        html,
        type: currentFlow.id,
        createdAt: savedTemplate.createdAt,
      };

      setFlows((prevFlows) =>
        prevFlows.map((flow, index) =>
          index === currentFlowIndex
            ? { ...flow, templates: [...flow.templates, newTemplate] }
            : flow
        )
      );

      setSelectedTemplates({
        ...selectedTemplates,
        [currentFlow.id]: newTemplate.id,
      });

      setIsCreatingNew(false);
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Error saving template to localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (design: any, html: string) => {
    if (!editingTemplate || !effectiveEventId || !editingTemplate.id) return;

    setIsLoading(true);
    try {
      const updates = {
        design,
        html,
        title: editingTemplate.title,
      };

      await storageService.updateTemplate(
        effectiveEventId,
        currentFlow.id,
        editingTemplate.id,
        updates
      );

      setFlows((prevFlows) =>
        prevFlows.map((flow) => ({
          ...flow,
          templates: flow.templates.map((tpl: any) =>
            tpl.id === editingTemplate.id ? { ...tpl, design, html } : tpl
          ),
        }))
      );

      setEditingTemplate(null);
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Error updating template in localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFromEditor = async (design: any, html: string) => {
    if (isCreatingNew) {
      await handleSaveNewTemplate(design, html);
    } else {
      await handleUpdateTemplate(design, html);
    }
  };

  const initialDesign = editingTemplate?.design ?? null;

  const handleNext = () => {
    if (!selectedTemplates[currentFlow.id]) return;

    if (effectiveEventId) {
      localStorage.setItem(
        `selectedTicketTemplates_${effectiveEventId}`,
        JSON.stringify(selectedTemplates)
      );
    }

    onNext(effectiveEventId);
  };

  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm relative">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            Advance Ticket
          </h2>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === currentStep
                    ? "border-pink-500 bg-white text-pink-500"
                    : step < currentStep
                    ? "bg-pink-500 border-pink-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{step + 1}</span>
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    step < currentStep ? "bg-pink-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            onClick={handleCreateNewTemplate}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
              <Plus className="text-pink-500" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 text-center text-pink-500">
              Create New Template
            </h3>
            <p className="text-sm text-gray-500 text-center">
              Design a custom ticket template from scratch
            </p>
          </div>

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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTemplate(tpl);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                title="Delete template"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex-1">
                <TemplateThumbnail template={tpl} />
              </div>
              <div className="mt-3">
                <h3 className="font-medium text-gray-900 text-center">
                  {tpl.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalTemplate && (
        <TemplateModal
          template={modalTemplate}
          onClose={handleCloseModal}
          onSelect={handleSelectTemplate}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}

      <TicketEditorModal
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

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </span>

        <button
          onClick={handleNext}
          disabled={!selectedTemplates[currentFlow.id] || isLoading}
          className={`cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium ${
            selectedTemplates[currentFlow.id] && !isLoading
              ? "bg-slate-800 hover:bg-slate-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default AdvanceTicket;
