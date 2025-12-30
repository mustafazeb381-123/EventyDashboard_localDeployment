import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronLeft, X, Pencil, Plus, Trash2 } from "lucide-react";
import EmailEditor from "react-email-editor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ---------- Static Templates ----------
import ThanksTemplateOne from "./Templates/ThanksEmailTemplates/ThanksTemplateOne";
import ThanksTemplateTwo from "./Templates/ThanksEmailTemplates/ThanksTemplateTwo";
import ConfirmationTemplateOne from "./Templates/ConfirmationEmailTemplates/ConfirmationTemplateOne";
import ReminderTemplateOne from "./Templates/ReminderEmailTemplate/ReminderTemplateOne";
import ReminderTemplateTwo from "./Templates/ReminderEmailTemplate/ReminderTemplateTwo";
import RejectionTemplateOne from "./Templates/RejectionEmailTemplate/RejectionTemplateOne";
import RejectionTemplateTwo from "./Templates/RejectionEmailTemplate/RejectionTemplateTwo";
import { getConfirmationTemplatesApi, saveConfirmationTemplateApi, updateConfirmationTemplateApi, deleteConfirmationTemplateApi } from "@/apis/apiHelpers";

const STATIC_TEMPLATES = {
  thanks: [
    { id: "thanks-template-1", title: "Thanks Template 1", component: <ThanksTemplateOne />, html: null, design: null, isStatic: true, type: "thanks" },
    { id: "thanks-template-2", title: "Thanks Template 2", component: <ThanksTemplateTwo />, html: null, design: null, isStatic: true, type: "thanks" },
  ],
  confirmation: [
    { id: "confirmation-template-1", title: "Confirmation Template 1", component: <ConfirmationTemplateOne />, html: null, design: null, isStatic: true, type: "confirmation" },
  ],
  reminder: [
    { id: "reminder-template-1", title: "Reminder Template 1", component: <ReminderTemplateOne />, html: null, design: null, isStatic: true, type: "reminder" },
    { id: "reminder-template-2", title: "Reminder Template 2", component: <ReminderTemplateTwo />, html: null, design: null, isStatic: true, type: "reminder" },
  ],
  rejection: [
    { id: "rejection-template-1", title: "Rejection Template 1", component: <RejectionTemplateOne />, html: null, design: null, isStatic: true, type: "rejection" },
    { id: "rejection-template-2", title: "Rejection Template 2", component: <RejectionTemplateTwo />, html: null, design: null, isStatic: true, type: "rejection" },
  ]
};

// ---------- Helper Functions ----------
const convertApiTemplates = (apiTemplates: any[], flowType: string) => {
  return apiTemplates.map((tpl, idx) => ({
    id: `api-${tpl.id}`,
    title: `${flowType.charAt(0).toUpperCase() + flowType.slice(1)} Template ${idx + 1
      }`,
    component: null,
    design: tpl.attributes?.design ? JSON.parse(tpl.attributes.design) : null,
    html: tpl.attributes?.content || "",
    apiId: tpl.id,
    isStatic: false,
    type: tpl.attributes?.type || flowType,
  }));
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

const TemplateModal = ({ template, onClose, onSelect, onEdit, onDelete }: any) => {
  if (!template) return null;
  const isStatic = template.isStatic;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
          <div className="flex items-center gap-3">
            {!isStatic && template.apiId && <button onClick={() => onEdit(template)} className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-sm"><Pencil size={14} /></button>}
            {!isStatic && template.apiId && <button onClick={() => onDelete(template)} className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm"><Trash2 size={14} /></button>}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
          </div>
        </div>
        <div className="mb-6 border rounded-lg p-4 bg-gray-50 min-h-[400px]">
          {template.html ? <div dangerouslySetInnerHTML={{ __html: template.html }} /> : template.component ? template.component : <div className="flex items-center justify-center w-full h-full text-gray-400">No preview available</div>}
        </div>
        <button onClick={() => onSelect(template.id)} className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium">Choose this template</button>
      </div>
    </div>
  );
};

const TemplateThumbnail = ({ template }: any) => {
  const scale = 0.5;
  const scaledWidth = `${100 / scale}%`, scaledHeight = `${100 / scale}%`;
  return (
    <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 relative">
      {template.html ? (
        <div className="absolute inset-0">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: scaledWidth, height: scaledHeight }}>
            <div dangerouslySetInnerHTML={{ __html: template.html }} />
          </div>
        </div>
      ) : template.component ? (
        <div className="absolute inset-0">
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
    { id: "thanks", label: "Thanks Email", templates: [] },
    { id: "confirmation", label: "Confirmation Email", templates: [] },
    { id: "reminder", label: "Reminder Email", templates: [] },
    { id: "rejection", label: "Rejection Email", templates: [] },
  ]);
  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<any>({});
  const [modalTemplate, setModalTemplate] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentFlow = flows[currentFlowIndex];

  useEffect(() => { if (effectiveEventId) loadTemplatesFromAPI(); }, [effectiveEventId, currentFlowIndex]);

  const loadTemplatesFromAPI = async () => {
    if (!effectiveEventId) return;
    setIsLoading(true);
    try {
      const response = await getConfirmationTemplatesApi(effectiveEventId, currentFlow.id);
      const apiTemplates = response.data.data || [];
      const convertedTemplates = convertApiTemplates(apiTemplates, currentFlow.id);
      setFlows(prev => prev.map(f => f.id === currentFlow.id ? { ...f, templates: [...STATIC_TEMPLATES[currentFlow.id as keyof typeof STATIC_TEMPLATES], ...convertedTemplates] } : f));
    } catch (e) { toast.error("Failed to load templates"); }
    finally { setIsLoading(false); }
  };

  const handleOpenModal = (template: any) => setModalTemplate(template);
  const handleCloseModal = () => setModalTemplate(null);
  const handleSelectTemplate = (templateId: string) => { setSelectedTemplates({ ...selectedTemplates, [currentFlow.id]: templateId }); setModalTemplate(null); toast.success("Template selected!"); };
  const handleCreateNewTemplate = () => { setIsCreatingNew(true); setEditingTemplate(null); setIsEditorOpen(true); };
  const handleEditTemplate = (template: any) => { if (template.isStatic) { setIsCreatingNew(true); setEditingTemplate(null); setIsEditorOpen(true); } else { setEditingTemplate(template); setModalTemplate(null); setIsEditorOpen(true); }; };

  const handleBack = () => { if (currentFlowIndex > 0) setCurrentFlowIndex(currentFlowIndex - 1); else onPrevious?.(); };
  const handleNext = () => { if (!selectedTemplates[currentFlow.id]) { toast.warning("Please select template"); return; } if (currentFlowIndex < flows.length - 1) setCurrentFlowIndex(currentFlowIndex + 1); else onNext?.(effectiveEventId); };

  const handleSaveFromEditor = async (design: any, html: string) => {
    if (!effectiveEventId) return;

    if (isCreatingNew) {
      setIsLoading(true);
      try {
        const apiResp = await saveConfirmationTemplateApi(effectiveEventId, currentFlow.id, html, `Custom ${currentFlow.label} Template`);
        const newTemplate = { id: `custom-${Date.now()}`, title: `Custom ${currentFlow.label} Template`, component: null, design, html, apiId: apiResp.data.data?.id, isStatic: false, type: currentFlow.id };
        setFlows(prev => prev.map((f, idx) => idx === currentFlowIndex ? { ...f, templates: [...STATIC_TEMPLATES[currentFlow.id as keyof typeof STATIC_TEMPLATES], ...f.templates.filter(t => !t.isStatic), newTemplate] } : f));
        setSelectedTemplates({ ...selectedTemplates, [currentFlow.id]: newTemplate.id });
        setIsCreatingNew(false); setIsEditorOpen(false); toast.success("Template created!");
      } catch (e) { toast.error("Failed to create template"); } finally { setIsLoading(false); }
    } else if (editingTemplate) {
      setIsLoading(true);
      try { await updateConfirmationTemplateApi(effectiveEventId, editingTemplate.apiId, currentFlow.id, html); setFlows(prev => prev.map(f => ({ ...f, templates: f.templates.map((t: any) => t.id === editingTemplate.id ? { ...t, html, design } : t) }))); setEditingTemplate(null); setIsEditorOpen(false); toast.success("Template updated!"); }
      catch { toast.error("Failed to update template"); } finally { setIsLoading(false); }
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
        {currentFlow.templates.map(template => (
          <div key={template.id} onClick={() => handleOpenModal(template)} className={`cursor-pointer rounded-2xl border ${selectedTemplates[currentFlow.id] === template.id ? "border-pink-500" : "border-gray-200"} overflow-hidden`}>
            <TemplateThumbnail template={template} />
            <div className="p-2 text-center font-medium">{template.title}</div>
          </div>
        ))}
      </div>}

      <div className="flex justify-between gap-4">
        <button onClick={handleBack} className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100">Back</button>
        <button onClick={handleNext} className="px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white">Next</button>
      </div>

      <TemplateModal template={modalTemplate} onClose={handleCloseModal} onSelect={handleSelectTemplate} onEdit={handleEditTemplate} onDelete={async (tpl: any) => { if (!effectiveEventId || !tpl.apiId) return; setIsLoading(true); try { await deleteConfirmationTemplateApi(effectiveEventId, tpl.apiId); setFlows(prev => prev.map(f => ({ ...f, templates: f.templates.filter(t => t.id !== tpl.id) }))); toast.success("Template deleted"); handleCloseModal(); } catch { toast.error("Failed to delete template"); } finally { setIsLoading(false); } }} />

      <EmailEditorModal open={isEditorOpen} initialDesign={editingTemplate?.design} onClose={() => { setIsEditorOpen(false); setEditingTemplate(null); setIsCreatingNew(false); }} onSave={handleSaveFromEditor} />
    </div>
  );
};

export default EmailConfirmation;
