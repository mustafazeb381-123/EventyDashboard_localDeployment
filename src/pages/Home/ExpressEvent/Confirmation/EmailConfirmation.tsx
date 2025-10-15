import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronLeft, X, Pencil } from "lucide-react";
import EmailEditor from "react-email-editor";
import ThanksTemplateOne from "./Templates/ThanksEmailTemplates/ThanksTemplateOne";
import ThanksTemplateTwo from "./Templates/ThanksEmailTemplates/ThanksTemplateTwo";
import ConfirmationTemplateOne from "./Templates/ConfirmationEmailTemplates/ConfirmationTemplateOne";
import ReminderTemplateOne from "./Templates/ReminderEmailTemplate/ReminderTemplateOne";
import ReminderTemplateTwo from "./Templates/ReminderEmailTemplate/ReminderTemplateTwo";
import RejectionTemplateOne from "./Templates/RejectionEmailTemplate/RejectionTemplateOne";
import RejectionTemplateTwo from "./Templates/RejectionEmailTemplate/RejectionTemplateTwo";

/**
 * EmailEditorModal
 * - props:
 *    open: boolean
 *    initialDesign: any (optional) — load this into editor when opened
 *    onClose: () => void
 *    onSave: (design: any, html: string) => void
 */
const EmailEditorModal = ({ open, initialDesign, onClose, onSave }: any) => {
  const emailEditorRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    // Small timeout to ensure editor instance exists
    const t = setTimeout(() => {
      if (emailEditorRef.current?.editor && initialDesign) {
        try {
          emailEditorRef.current.editor.loadDesign(initialDesign);
        } catch (err) {
          console.warn("Failed to load design into editor:", err);
        }
      } else if (emailEditorRef.current?.editor && !initialDesign) {
        // Optionally, we could load an empty design or leave as-is
      }
    }, 300);

    return () => clearTimeout(t);
  }, [open, initialDesign]);

  if (!open) return null;

  const handleExport = () => {
    emailEditorRef.current?.editor?.exportHtml((data: any) => {
      const { design, html } = data;
      // Pass design + html back to parent
      onSave(design, html);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Edit Email Template</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1">
          <EmailEditor ref={emailEditorRef} minHeight="100%" appearance={{ theme: "dark" }} />
        </div>

        <div className="p-3 border-t flex justify-end bg-gray-50">
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

/**
 * TemplateModal
 * - Shows template preview and Edit button in the same top row.
 * - If template.html exists, render it (dangerouslySetInnerHTML), else render template.component
 */
const TemplateModal = ({ template, onClose, onSelect, onEdit }: any) => {
  if (!template) return null;

  const content = template.html ? (
    // Render edited HTML
    <div
      className="w-full"
      // IMPORTANT: the html comes from the editor export; ensure you trust the source.
      dangerouslySetInnerHTML={{ __html: template.html }}
    />
  ) : (
    // Fallback to the original React component (static)
    <div className="w-full">{template.component}</div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header row with Edit + Close in one row */}
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
    <div className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50 relative">
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

// -------- Main Component --------
const EmailConfirmation = ({ onNext }: any) => {
  // Initialize templates as part of state so we can update design/html per-template
  const [flows, setFlows] = useState<any[]>([
    {
      id: "thanks",
      label: "Thanks Email",
      templates: [
        {
          id: "tpl1",
          title: "Thanks Template 1",
          component: <ThanksTemplateOne />,
          design: null, // design JSON (if user edits)
          html: null, // exported html (if user edits)
        },
        {
          id: "tpl2",
          title: "Thanks Template 2",
          component: <ThanksTemplateTwo />,
          design: null,
          html: null,
        },
      ],
    },
    {
      id: "confirmation",
      label: "Confirmation Email",
      templates: [
        {
          id: "tpl3",
          title: "Confirmation Template 1",
          component: <ConfirmationTemplateOne />,
          design: null,
          html: null,
        },
      ],
    },
    {
      id: "reminder",
      label: "Reminder Email",
      templates: [
        {
          id: "tpl5",
          title: "Reminder Template 1",
          component: <ReminderTemplateOne />,
          design: null,
          html: null,
        },
        {
          id: "tpl6",
          title: "Reminder Template 2",
          component: <ReminderTemplateTwo />,
          design: null,
          html: null,
        },
      ],
    },
    {
      id: "rejection",
      label: "Rejection Email",
      templates: [
        {
          id: "tpl7",
          title: "Rejection Template 1",
          component: <RejectionTemplateOne />,
          design: null,
          html: null,
        },
        {
          id: "tpl8",
          title: "Rejection Template 2",
          component: <RejectionTemplateTwo />,
          design: null,
          html: null,
        },
      ],
    },
  ]);

  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<any>({});
  const [modalTemplate, setModalTemplate] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  const currentFlow = flows[currentFlowIndex];

  // Open template preview modal
  const handleOpenModal = (template: any) => setModalTemplate(template);
  const handleCloseModal = () => setModalTemplate(null);

  // Select a template for the flow
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates({ ...selectedTemplates, [currentFlow.id]: templateId });
    setModalTemplate(null);
  };

  // When user clicks edit in TemplateModal
  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setModalTemplate(null); // close preview
    setIsEditorOpen(true); // open editor
  };

  // Callback when editor saves design & html
  const handleSaveFromEditor = (design: any, html: string) => {
    if (!editingTemplate) {
      console.warn("No editing template set when saving.");
      return;
    }

    // update flows state: find template by id and update design/html
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
  };

  // For EmailEditorModal: initialDesign should be the design of the editing template (if exists)
  const initialDesign = editingTemplate?.design ?? null;

  const handleNext = () => {
    if (!selectedTemplates[currentFlow.id]) {
      alert("Please select a template before proceeding");
      return;
    }
    if (currentFlowIndex < flows.length - 1) {
      setCurrentFlowIndex(currentFlowIndex + 1);
    } else if (onNext) {
      onNext();
    }
  };

  const handleBack = () => {
    if (currentFlowIndex > 0) setCurrentFlowIndex(currentFlowIndex - 1);
  };

  const handleStepClick = (index: number) => {
    if (index <= currentFlowIndex || selectedTemplates[flows[index].id]) {
      setCurrentFlowIndex(index);
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm relative">
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

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentFlow.templates.map((tpl: any) => (
          <div
            key={tpl.id}
            onClick={() => handleOpenModal(tpl)}
            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTemplates[currentFlow.id] === tpl.id 
                ? "border-pink-500 bg-pink-50 shadow-md" 
                : "border-gray-200 hover:border-pink-300"
            }`}
          >
            {/* Template Thumbnail */}
            <TemplateThumbnail template={tpl} />
          </div>
        ))}
      </div>

      {/* Modals */}
      {modalTemplate && (
        <TemplateModal
          template={modalTemplate}
          onClose={handleCloseModal}
          onSelect={handleSelectTemplate}
          onEdit={handleEditTemplate}
        />
      )}

      <EmailEditorModal
        open={isEditorOpen}
        initialDesign={initialDesign}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTemplate(null);
        }}
        onSave={(design: any, html: string) => {
          handleSaveFromEditor(design, html);
        }}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          disabled={currentFlowIndex === 0}
          className={`cursor-pointer px-6 py-2 border rounded-lg transition-colors ${
            currentFlowIndex === 0 ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentFlowIndex + 1} of {flows.length}
        </span>

        <button
          onClick={handleNext}
          className={`cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium ${
            selectedTemplates[currentFlow.id] ? "bg-pink-500 hover:bg-pink-600" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {currentFlowIndex === flows.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmation;

