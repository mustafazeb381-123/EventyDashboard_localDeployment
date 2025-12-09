import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  Loader2,
  X,
  Plus,
  GripVertical,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Assets from "@/utils/Assets";
import {
  createTemplatePostApi,
  getRegistrationFieldApi,
  getRegistrationTemplateData,
} from "@/apis/apiHelpers";
import TemplateOne from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateOne/TemplateOne";
import TemplateTwo from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateTwo/TemplateTwo";
import TemplateThree from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateThree/TemplateThree";
import TemplateFour from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateFour/TemplateFour";
import TemplateFive from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateFive/TemplateFive";
import TemplateSix from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateSix/TemplateSix";
import TemplateSeven from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateSeven/TemplateSeven";
import TemplateFormOne from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateOne/TemplateForm";
import TemplateFormTwo from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateTwo/TemplateForm";
import TemplateFormThree from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateThree/TemplateForm";
import TemplateFormFour from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateFour/TemplateForm";
import TemplateFormFive from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateFive/TemplateForm";
import TemplateFormSix from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateSix/TemplateForm";
import TemplateFormSeven from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateSeven/TemplateForm";

// Import Form Builder Library
import {rSuiteComponents} from '@react-form-builder/components-rsuite'
import {BuilderView, FormBuilder} from '@react-form-builder/designer'

const components = rSuiteComponents.map(c => c.build())
const builderView = new BuilderView(components)

// -------------------- TYPES --------------------
interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "radio"
    | "header"
    | "paragraph"
    | "date"
    | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  value?: string;
  description?: string;
}

interface CustomFormTemplate {
  id: string;
  title: string;
  data: FormField[];
  formBuilderData?: any; // Store form builder JSON data
  createdAt: string;
  updatedAt?: string;
  isCustom?: boolean;
}

type ModalProps = {
  selectedTemplate: string | null;
  onClose: () => void;
  onUseTemplate: (id: string) => void;
  formData: any;
  isLoading: boolean;
  isLoadingFormData: boolean;
  eventId?: string;
};

type RegistrationFormProps = {
  onNext: (eventId?: string | number, plan?: string) => void;
  onPrevious: () => void;
  currentStep?: any;
  totalSteps?: any;
  eventId?: string;
  plan?: string;
};

// -------------------- FORM BUILDER MODAL (Using Library) --------------------
interface FormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: CustomFormTemplate) => void;
  template?: CustomFormTemplate | null;
  isEditMode?: boolean;
}

const FormBuilderModal: React.FC<FormBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
  isEditMode = false,
}) => {
  const [templateTitle, setTemplateTitle] = useState(template?.title || "My Form Builder Template");
  const [formBuilderJson, setFormBuilderJson] = useState<any>(template?.formBuilderData || null);
  const [isFormBuilderReady, setIsFormBuilderReady] = useState(false);

  // Initialize form builder
  useEffect(() => {
    if (template?.formBuilderData) {
      setFormBuilderJson(template.formBuilderData);
    }
    setIsFormBuilderReady(true);
  }, [template]);

  const handleSaveTemplate = () => {
    // if (!formBuilderJson) {
    //   toast.warning("Please design a form before saving.");
    //   return;
    // }

    // Convert form builder JSON to our FormField format for preview
    const formFields: FormField[] = convertFormBuilderToFields(formBuilderJson);

    const templateData: CustomFormTemplate = {
      id: template?.id || `formbuilder-template-${Date.now()}`,
      title: templateTitle,
      data: formFields,
      formBuilderData: formBuilderJson,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
    };

    onSave(templateData);
    onClose();
  };

  // Helper function to convert form builder JSON to FormField format
  const convertFormBuilderToFields = (jsonData: any): FormField[] => {
    if (!jsonData || !jsonData.formData) return [];
    
    const fields: FormField[] = [];
    
    // Process form builder structure
    // This is a simplified conversion - you'll need to adjust based on your form builder's structure
    jsonData.formData.forEach((item: any) => {
      const field: FormField = {
        id: item.id || `field-${Date.now()}`,
        type: mapFormBuilderType(item.type),
        label: item.label || item.name || "Field",
        placeholder: item.placeholder || "",
        required: item.required || false,
        value: item.value || "",
        description: item.description || "",
      };

      // Handle options for select/radio/checkbox
      if (item.options && Array.isArray(item.options)) {
        field.options = item.options.map((opt: any) => 
          typeof opt === 'string' ? opt : opt.label || opt.value
        );
      }

      fields.push(field);
    });

    return fields;
  };

  // Map form builder field types to our types
  const mapFormBuilderType = (fbType: string): FormField['type'] => {
    const typeMap: Record<string, FormField['type']> = {
      'text': 'text',
      'email': 'email',
      'number': 'number',
      'select': 'select',
      'textarea': 'textarea',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'header': 'header',
      'paragraph': 'paragraph',
      'date': 'date',
      'file': 'file'
    };

    return typeMap[fbType] || 'text';
  };

  // Handle form builder changes
  const handleFormBuilderChange = (jsonData: any) => {
    setFormBuilderJson(jsonData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditMode ? "Edit Form Template" : "Design Form with Builder"}
            </h3>
            <input
              type="text"
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Template name"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Form Builder */}
        <div className="flex-1 overflow-hidden">
          {isFormBuilderReady ? (
            <FormBuilder 
              view={builderView}
              onChange={handleFormBuilderChange}
              initialData={formBuilderJson}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end gap-3 bg-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTemplate}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isEditMode ? "Update Template" : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- MODAL COMPONENT (Default Templates) --------------------
const TemplateModal = ({
  selectedTemplate,
  onClose,
  onUseTemplate,
  formData,
  isLoading,
  isLoadingFormData,
  eventId,
}: ModalProps) => {
  if (!selectedTemplate) return null;

  const renderTemplate = (Component: any) => {
    if (isLoadingFormData || !formData || formData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
          <p className="text-slate-600 text-lg font-medium">
            Loading template...
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Preparing template data for preview
          </p>
        </div>
      );
    }
    return (
      <Component
        data={formData}
        eventId={eventId}
        isLoading={isLoading || isLoadingFormData}
        onUseTemplate={(tid: string) => onUseTemplate(tid)}
      />
    );
  };

  const templateMap: Record<string, any> = {
    "template-one": TemplateOne,
    "template-two": TemplateTwo,
    "template-three": TemplateThree,
    "template-four": TemplateFour,
    "template-five": TemplateFive,
    "template-six": TemplateSix,
    "template-seven": TemplateSeven,
  };

  const TemplateComponent = templateMap[selectedTemplate];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-[80%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <X />
          </button>
        </div>
        {TemplateComponent && renderTemplate(TemplateComponent)}
      </div>
    </div>
  );
};

// -------------------- MAIN COMPONENT --------------------
const AdvanceRegistration = ({
  onNext,
  onPrevious,
  eventId,
  plan,
}: RegistrationFormProps) => {
  const { id: routeId } = useParams();

  const effectiveEventId =
    (routeId as string | undefined) ||
    eventId ||
    (typeof window !== "undefined"
      ? localStorage.getItem("create_eventId") || undefined
      : undefined);

  // State for default templates
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [confirmedTemplate, setConfirmedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [getTemplatesData, setGetTemplatesData] = useState<any[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);

  // State for form builder templates
  const [formBuilderTemplates, setFormBuilderTemplates] = useState<CustomFormTemplate[]>([]);
  const [isFormBuilderModalOpen, setIsFormBuilderModalOpen] = useState(false);
  const [editingFormBuilderTemplate, setEditingFormBuilderTemplate] = useState<CustomFormTemplate | null>(null);
  const [isEditFormBuilderMode, setIsEditFormBuilderMode] = useState(false);

  // -------------------- DEFAULT TEMPLATE FUNCTIONS --------------------
  const getCreateTemplateApiData = async () => {
    try {
      if (!effectiveEventId) return;

      const result = await getRegistrationTemplateData(effectiveEventId);
      const responseData = result?.data?.data;

      if (!responseData) {
        setGetTemplatesData([]);
        return;
      }

      const registrationFields =
        responseData.attributes?.event_registration_fields?.data || [];
      const templateData = registrationFields.map((item: any) => ({
        id: item.id,
        type: item.type,
        attributes: item.attributes,
      }));

      const nameOfTemplate = responseData.attributes?.name;
      setSelectedTemplateName(nameOfTemplate);
      setConfirmedTemplate(nameOfTemplate);
      setGetTemplatesData(templateData);
    } catch (error) {
      toast.error("Failed to fetch template data");
    }
  };

  useEffect(() => {
    getCreateTemplateApiData();
    
    // Load form builder templates from localStorage
    if (effectiveEventId) {
      const savedTemplates = localStorage.getItem(`formBuilderTemplates_${effectiveEventId}`);
      if (savedTemplates) {
        setFormBuilderTemplates(JSON.parse(savedTemplates));
      }
    }
  }, [effectiveEventId]);

  useEffect(() => {
    if (effectiveEventId) getFieldAPi(effectiveEventId);
  }, [selectedTemplate, effectiveEventId]);

  const getTemplateData = (templateId: string) => {
    if (templateId === selectedTemplateName) {
      return getTemplatesData.length > 0 ? getTemplatesData : formData;
    }
    return formData;
  };

  const defaultTemplates = [
    { id: "template-one", component: TemplateFormOne },
    { id: "template-two", component: TemplateFormTwo },
    { id: "template-three", component: TemplateFormThree },
    { id: "template-four", component: TemplateFormFour },
    { id: "template-five", component: TemplateFormFive },
    { id: "template-six", component: TemplateFormSix },
    { id: "template-seven", component: TemplateFormSeven },
  ];

  // -------------------- FORM BUILDER FUNCTIONS --------------------
  const handleOpenFormBuilder = () => {
    setEditingFormBuilderTemplate(null);
    setIsEditFormBuilderMode(false);
    setIsFormBuilderModalOpen(true);
  };

  const handleEditFormBuilderTemplate = (template: CustomFormTemplate) => {
    setEditingFormBuilderTemplate(template);
    setIsEditFormBuilderMode(true);
    setIsFormBuilderModalOpen(true);
  };

  const handleSaveFormBuilderTemplate = (template: CustomFormTemplate) => {
    let updatedTemplates: CustomFormTemplate[];

    if (isEditFormBuilderMode && editingFormBuilderTemplate) {
      // Update existing template
      updatedTemplates = formBuilderTemplates.map((t) =>
        t.id === editingFormBuilderTemplate.id
          ? { ...template, updatedAt: new Date().toISOString() }
          : t
      );
    } else {
      // Create new template
      updatedTemplates = [...formBuilderTemplates, template];
      setConfirmedTemplate(template.id);
    }

    setFormBuilderTemplates(updatedTemplates);

    // Save to localStorage
    if (effectiveEventId) {
      localStorage.setItem(
        `formBuilderTemplates_${effectiveEventId}`,
        JSON.stringify(updatedTemplates)
      );
    }

    toast.success(`Form Builder template ${isEditFormBuilderMode ? 'updated' : 'created'} successfully!`);
  };

  const handleDeleteFormBuilderTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = formBuilderTemplates.filter(
        (template) => template.id !== templateId
      );
      setFormBuilderTemplates(updatedTemplates);

      if (confirmedTemplate === templateId) {
        setConfirmedTemplate(null);
      }

      // Update localStorage
      if (effectiveEventId) {
        localStorage.setItem(
          `formBuilderTemplates_${effectiveEventId}`,
          JSON.stringify(updatedTemplates)
        );
      }

      toast.success("Template deleted successfully!");
    }
  };

  const handleSelectFormBuilderTemplate = (templateId: string) => {
    setConfirmedTemplate(templateId);
    toast.success("Form Builder template selected!");
  };

  // -------------------- DEFAULT TEMPLATE HANDLERS --------------------
  const handleOpenModal = (id: string) => {
    setSelectedTemplate(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setSelectedTemplate(null);
      setIsModalOpen(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      if (!effectiveEventId) throw new Error("Event ID not found");

      const templateData = {
        name: templateId,
        description: `Registration template for ${templateId}`,
        fields: formData || [],
        templateComponent: templateId,
      };

      const payload = {
        registration_template: {
          name: templateId,
          content: JSON.stringify(templateData),
          event_registration_fields_ids: formData
            .filter((item) => item.attributes?.active === true)
            .map((item) => item.id),
          default: true,
        },
      };

      await createTemplatePostApi(payload, effectiveEventId);
      toast.success("Template applied successfully!");
      setConfirmedTemplate(templateId);
      handleCloseModal();
    } catch (error: any) {
      toast.error("Error applying template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldAPi = async (id: string) => {
    setIsLoadingFormData(true);
    try {
      const response = await getRegistrationFieldApi(id);
      setFormData(response.data.data);
    } catch (error) {
      toast.error("Failed to load form data");
    } finally {
      setIsLoadingFormData(false);
    }
  };

  const handleNextClick = () => {
    if (!confirmedTemplate) {
      toast.warning("Please select a template before proceeding");
      return;
    }
    if (onNext) onNext(effectiveEventId, plan);
  };

  // -------------------- RENDER FUNCTIONS --------------------
  const renderFormBuilderTemplatePreview = (template: CustomFormTemplate) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
        {/* Template Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {template.title}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Form Builder
              </span>
              <span className="text-xs text-gray-500">
                {template.data.length} fields
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditFormBuilderTemplate(template);
              }}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
              title="Edit template"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFormBuilderTemplate(template.id);
              }}
              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Delete template"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Form Preview Content */}
        <div className="flex-1 space-y-3 overflow-y-auto max-h-48">
          {template.data.slice(0, 5).map((field, index) => (
            <div
              key={field.id}
              className="text-sm border-b border-gray-100 pb-2 last:border-b-0"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-xs font-medium truncate">
                    {field.label}
                  </span>
                  {field.required && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">
                    {field.type}
                  </span>
                  {field.type === 'select' || field.type === 'radio' || field.type === 'checkbox' ? (
                    <span className="text-gray-400">
                      {field.options?.length || 0} options
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {template.data.length > 5 && (
            <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
              +{template.data.length - 5} more fields
            </div>
          )}
        </div>
      </div>
    );
  };

  // -------------------- RENDER --------------------
  return (
    <>
      <div className="w-full mx-5 bg-white p-5 rounded-2xl">
        {/* Header */}
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-2 items-center">
            <ChevronLeft />
            <p className="text-neutral-900 text-md font-poppins font-normal">
              Choose a registration form template
            </p>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoadingFormData ? (
          <div className="mt-16 flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
            <p className="text-slate-600 text-lg font-medium">
              Loading templates...
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Please wait while we prepare your registration forms
            </p>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Form Builder Template Card (First Position) */}
            <div
              onClick={handleOpenFormBuilder}
              className="border-2 border-dashed border-gray-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center aspect-square"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-blue-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-center text-blue-500">
                Design with Form Builder
              </h3>
              <p className="text-sm text-gray-500 text-center">
                Use drag & drop to create custom forms
              </p>
            </div>

            {/* Form Builder Templates */}
            {formBuilderTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectFormBuilderTemplate(template.id)}
                className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col ${
                  confirmedTemplate === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-500"
                }`}
              >
                {renderFormBuilderTemplatePreview(template)}
                
                {confirmedTemplate === template.id && (
                  <div className="mt-2 flex items-center justify-center">
                    <Check size={16} className="text-blue-500 mr-1" />
                    <span className="text-sm text-blue-500 font-medium">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Default Templates */}
            {defaultTemplates.map((tpl) => {
              const FormComponent = tpl.component;
              return (
                <div
                  key={tpl.id}
                  onClick={() =>
                    !isLoadingFormData && handleOpenModal(tpl.id)
                  }
                  className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col ${
                    confirmedTemplate === tpl.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-500"
                  }`}
                >
                  <div className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50 relative">
                    {isLoadingFormData && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                      </div>
                    )}
                    <div className="transform scale-[0.15] pointer-events-none">
                      <div className="w-[1200px]">
                        <FormComponent
                          data={getTemplateData(tpl.id)}
                          eventId={effectiveEventId}
                        />
                      </div>
                    </div>
                  </div>

                  {confirmedTemplate === tpl.id && (
                    <div className="mt-2 flex items-center justify-center">
                      <Check size={16} className="text-pink-500 mr-1" />
                      <span className="text-sm text-pink-500 font-medium">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Default Template Modal */}
        {isModalOpen && (
          <TemplateModal
            formData={formData}
            selectedTemplate={selectedTemplate}
            onClose={handleCloseModal}
            onUseTemplate={handleUseTemplate}
            isLoading={isLoading}
            isLoadingFormData={isLoadingFormData}
            eventId={effectiveEventId}
          />
        )}

        {/* Form Builder Modal */}
        <FormBuilderModal
          isOpen={isFormBuilderModalOpen}
          onClose={() => setIsFormBuilderModalOpen(false)}
          onSave={handleSaveFormBuilderTemplate}
          template={editingFormBuilderTemplate}
          isEditMode={isEditFormBuilderMode}
        />

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
          <button
            onClick={onPrevious}
            disabled={isLoading || isLoadingFormData}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium border text-slate-800 border-gray-300 hover:bg-gray-50 ${
              isLoading || isLoadingFormData
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={handleNextClick}
            disabled={!confirmedTemplate || isLoading || isLoadingFormData}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${
              !confirmedTemplate || isLoading || isLoadingFormData
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
          >
            {isLoading || isLoadingFormData ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Next →"
            )}
          </button>
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default AdvanceRegistration;