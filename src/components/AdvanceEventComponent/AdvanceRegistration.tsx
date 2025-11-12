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

// -------------------- CUSTOM FORM BUILDER MODAL --------------------
interface CustomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: CustomFormTemplate) => void;
  template?: CustomFormTemplate | null;
  isEditMode?: boolean;
}

const CustomFormModal: React.FC<CustomFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
  isEditMode = false,
}) => {
  const [currentFormData, setCurrentFormData] = useState<FormField[]>([]);
  const [templateTitle, setTemplateTitle] = useState("My Custom Form");
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setCurrentFormData(template.data);
      setTemplateTitle(template.title);
    } else {
      setCurrentFormData([]);
      setTemplateTitle("My Custom Form");
    }
  }, [template]);

  const handleSaveTemplate = () => {
    if (currentFormData.length === 0) {
      toast.warning("Please add some form fields before saving.");
      return;
    }

    const templateData: CustomFormTemplate = {
      id: template?.id || `custom-template-${Date.now()}`,
      title: templateTitle,
      data: currentFormData,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
    };

    onSave(templateData);
    onClose();
  };

  const addField = (type: FormField["type"]) => {
    const defaultConfigs = {
      text: { label: "Text Field", placeholder: "Enter text" },
      email: { label: "Email Address", placeholder: "Enter email" },
      number: { label: "Number Field", placeholder: "Enter number" },
      select: { label: "Dropdown Selection", placeholder: "Select an option" },
      textarea: { label: "Text Area", placeholder: "Enter your message" },
      checkbox: { label: "Checkbox Option" },
      radio: { label: "Radio Option" },
      header: { label: "Section Header" },
      paragraph: { label: "Paragraph Text" },
      date: { label: "Date Field", placeholder: "Select date" },
      file: { label: "File Upload", placeholder: "Choose file" },
    };

    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: defaultConfigs[type].label,
      placeholder: defaultConfigs[type].placeholder,
      required: false,
      value: "",
      description: "",
    };

    if (type === "select" || type === "radio" || type === "checkbox") {
      newField.options = ["Option 1", "Option 2", "Option 3"];
    }

    if (type === "header" || type === "paragraph") {
      newField.value = defaultConfigs[type].label;
    }

    setCurrentFormData([...currentFormData, newField]);
  };

  const removeField = (id: string) => {
    setCurrentFormData(currentFormData.filter((field) => field.id !== id));
    if (editingField?.id === id) {
      setEditingField(null);
    }
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setCurrentFormData(
      currentFormData.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));

    if (sourceIndex !== targetIndex) {
      const newFields = [...currentFormData];
      const [movedField] = newFields.splice(sourceIndex, 1);
      newFields.splice(targetIndex, 0, movedField);
      setCurrentFormData(newFields);
    }

    setDragOverIndex(null);
  };

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled
          />
        );
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled
          />
        );
      case "select":
        return (
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" disabled>
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  disabled
                />
                <span className="text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
                  disabled
                />
                <span className="text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );
      case "header":
        return (
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
            {field.value || field.label}
          </h3>
        );
      case "paragraph":
        return (
          <p className="text-gray-600 leading-relaxed">
            {field.value || field.label}
          </p>
        );
      case "file":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <div className="text-gray-500">📎 Click to upload file</div>
            <div className="text-sm text-gray-400">{field.placeholder}</div>
          </div>
        );
      default:
        return null;
    }
  };

  const fieldTypes = [
    { type: "text", label: "Text Input", icon: "T", description: "Single line text input" },
    { type: "email", label: "Email Input", icon: "✉", description: "Email address field" },
    { type: "number", label: "Number Input", icon: "🔢", description: "Numeric input field" },
    { type: "select", label: "Dropdown", icon: "▼", description: "Select from options" },
    { type: "textarea", label: "Text Area", icon: "📝", description: "Multi-line text input" },
    { type: "checkbox", label: "Checkbox", icon: "☑", description: "Checkbox option" },
    { type: "radio", label: "Radio Button", icon: "⚪", description: "Radio button option" },
    { type: "header", label: "Header", icon: "🏷️", description: "Section header" },
    { type: "paragraph", label: "Paragraph", icon: "📄", description: "Text paragraph" },
    { type: "date", label: "Date Picker", icon: "📅", description: "Date selection" },
    { type: "file", label: "File Upload", icon: "📎", description: "File upload field" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditMode ? "Edit Custom Template" : "Create Custom Form Template"}
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

        {/* Modal Body - Split Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Form Builder Canvas */}
          <div className="flex-1 overflow-auto p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Form Preview</h4>

            {currentFormData.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 mb-2">No fields added yet</div>
                <div className="text-sm text-gray-500">
                  Add fields from the right panel to build your form
                </div>
              </div>
            ) : (
              <div>
                {currentFormData.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragLeave}
                    className={`bg-white p-4 rounded-lg border transition-all ${
                      dragOverIndex === index
                        ? "border-pink-400 bg-pink-50 border-dashed"
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical
                        className="text-gray-400 mt-3 cursor-move"
                        size={16}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {field.required && (
                            <span className="text-xs bg-red-100 text-red-600 rounded px-2 py-1">
                              Required
                            </span>
                          )}
                        </div>

                        {field.type !== "header" && field.type !== "paragraph" && (
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                        )}

                        {renderFieldPreview(field)}

                        {field.description && (
                          <p className="text-xs text-gray-500 mt-2">{field.description}</p>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingField(field)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Edit field"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => removeField(field.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete field"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Form Elements Toolbox */}
          <div className="w-80 border-l border-gray-200 p-4 overflow-auto">
            <h4 className="font-semibold text-gray-800 mb-4">Form Elements</h4>
            <p className="text-sm text-gray-600 mb-4">
              Click to add fields to your form
            </p>

            <div className="space-y-2">
              {fieldTypes.map((fieldType) => (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type as FormField["type"])}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded flex items-center justify-center text-pink-600">
                      {fieldType.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {fieldType.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {fieldType.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Field Editor Modal */}
        {editingField && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Edit Field</h3>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={editingField.label}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        label: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {(editingField.type === "text" ||
                  editingField.type === "email" ||
                  editingField.type === "number" ||
                  editingField.type === "textarea" ||
                  editingField.type === "date" ||
                  editingField.type === "file") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={editingField.placeholder || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          placeholder: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                )}

                {(editingField.type === "header" ||
                  editingField.type === "paragraph") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={editingField.value || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          value: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                )}

                {(editingField.type === "select" ||
                  editingField.type === "radio" ||
                  editingField.type === "checkbox") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options (one per line)
                    </label>
                    <textarea
                      value={editingField.options?.join("\n") || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          options: e.target.value
                            .split("\n")
                            .filter((opt) => opt.trim()),
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingField.description || ""}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Field description (optional)"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingField.required}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        required: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label className="text-sm text-gray-700">Required field</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateField(editingField.id, editingField);
                    setEditingField(null);
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

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

  // State for custom templates
  const [customTemplates, setCustomTemplates] = useState<CustomFormTemplate[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomTemplate, setEditingCustomTemplate] = useState<CustomFormTemplate | null>(null);
  const [isEditCustomMode, setIsEditCustomMode] = useState(false);

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
    
    // Load custom templates from localStorage
    if (effectiveEventId) {
      const savedTemplates = localStorage.getItem(`formTemplates_${effectiveEventId}`);
      if (savedTemplates) {
        setCustomTemplates(JSON.parse(savedTemplates));
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

  // -------------------- CUSTOM TEMPLATE FUNCTIONS --------------------
  const handleCreateNewTemplate = () => {
    setEditingCustomTemplate(null);
    setIsEditCustomMode(false);
    setIsCustomModalOpen(true);
  };

  const handleEditCustomTemplate = (template: CustomFormTemplate) => {
    setEditingCustomTemplate(template);
    setIsEditCustomMode(true);
    setIsCustomModalOpen(true);
  };

  const handleSaveCustomTemplate = (template: CustomFormTemplate) => {
    let updatedTemplates: CustomFormTemplate[];

    if (isEditCustomMode && editingCustomTemplate) {
      // Update existing template
      updatedTemplates = customTemplates.map((t) =>
        t.id === editingCustomTemplate.id
          ? { ...template, updatedAt: new Date().toISOString() }
          : t
      );
    } else {
      // Create new template
      updatedTemplates = [...customTemplates, template];
      setConfirmedTemplate(template.id);
    }

    setCustomTemplates(updatedTemplates);

    // Save to localStorage
    if (effectiveEventId) {
      localStorage.setItem(
        `formTemplates_${effectiveEventId}`,
        JSON.stringify(updatedTemplates)
      );
    }

    toast.success(`Template ${isEditCustomMode ? 'updated' : 'created'} successfully!`);
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = customTemplates.filter(
        (template) => template.id !== templateId
      );
      setCustomTemplates(updatedTemplates);

      if (confirmedTemplate === templateId) {
        setConfirmedTemplate(null);
      }

      // Update localStorage
      if (effectiveEventId) {
        localStorage.setItem(
          `formTemplates_${effectiveEventId}`,
          JSON.stringify(updatedTemplates)
        );
      }

      toast.success("Template deleted successfully!");
    }
  };

  const handleSelectCustomTemplate = (templateId: string) => {
    setConfirmedTemplate(templateId);
    toast.success("Custom template selected!");
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
  const renderCustomTemplatePreview = (template: CustomFormTemplate) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
        {/* Template Header */}
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-medium text-gray-900 text-sm truncate flex-1">
            {template.title}
          </h4>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditCustomTemplate(template);
              }}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
              title="Edit template"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCustomTemplate(template.id);
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
              {field.type === "header" ? (
                <div className="font-semibold text-gray-700 border-b pb-1 text-xs">
                  {field.value || field.label}
                </div>
              ) : field.type === "paragraph" ? (
                <div className="text-gray-600 text-xs leading-tight">
                  {field.value?.substring(0, 60)}
                  {field.value && field.value.length > 60 ? "..." : ""}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs font-medium truncate">
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>

                  {/* Field Previews */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full text-xs p-2 border border-gray-300 rounded cursor-not-allowed"
                      disabled
                    />
                  )}

                  {field.type === "email" && (
                    <input
                      type="email"
                      placeholder={field.placeholder}
                      className="w-full text-xs p-2 border border-gray-300 rounded cursor-not-allowed"
                      disabled
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      placeholder={field.placeholder}
                      className="w-full text-xs p-2 border border-gray-300 rounded cursor-not-allowed"
                      disabled
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      placeholder={field.placeholder}
                      rows={2}
                      className="w-full text-xs p-2 border border-gray-300 rounded cursor-not-allowed resize-none"
                      disabled
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      className="w-full text-xs p-2 border border-gray-300 rounded cursor-not-allowed"
                      disabled
                    >
                      <option value="">{field.placeholder || "Select..."}</option>
                      {field.options?.slice(0, 2).map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                      {field.options && field.options.length > 2 && (
                        <option disabled>... and {field.options.length - 2} more</option>
                      )}
                    </select>
                  )}

                  {field.type === "checkbox" && (
                    <div className="space-y-1">
                      {field.options?.slice(0, 2).map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            className="w-3 h-3 text-pink-500 border-gray-300 rounded cursor-not-allowed"
                            disabled
                          />
                          <span className="text-gray-600 text-xs">{option}</span>
                        </div>
                      ))}
                      {field.options && field.options.length > 2 && (
                        <div className="text-gray-400 text-xs">
                          +{field.options.length - 2} more options
                        </div>
                      )}
                    </div>
                  )}

                  {field.type === "radio" && (
                    <div className="space-y-1">
                      {field.options?.slice(0, 2).map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-1">
                          <input
                            type="radio"
                            className="w-3 h-3 text-pink-500 border-gray-300 cursor-not-allowed"
                            disabled
                          />
                          <span className="text-gray-600 text-xs">{option}</span>
                        </div>
                      ))}
                      {field.options && field.options.length > 2 && (
                        <div className="text-gray-400 text-xs">
                          +{field.options.length - 2} more options
                        </div>
                      )}
                    </div>
                  )}

                  {field.type === "date" && (
                    <input
                      type="date"
                      className="w-full text-xs p-2 border border-gray-300 rounded cursor-not-allowed"
                      disabled
                    />
                  )}

                  {field.type === "file" && (
                    <div className="border border-dashed border-gray-300 rounded text-xs text-gray-500 p-2 text-center">
                      📎 {field.placeholder || "Choose file"}
                    </div>
                  )}
                </div>
              )}
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
            {/* Custom Form Template Card (First Position) */}
            <div
              onClick={handleCreateNewTemplate}
              className="border-2 border-dashed border-gray-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-pink-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-center text-pink-500">
                Create Custom Form
              </h3>
              <p className="text-sm text-gray-500 text-center">
                Design a custom registration form from scratch
              </p>
            </div>

            {/* Custom Templates */}
            {customTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectCustomTemplate(template.id)}
                className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col ${
                  confirmedTemplate === template.id
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-pink-500"
                }`}
              >
                {renderCustomTemplatePreview(template)}
                
                {confirmedTemplate === template.id && (
                  <div className="mt-2 flex items-center justify-center">
                    <Check size={16} className="text-pink-500 mr-1" />
                    <span className="text-sm text-pink-500 font-medium">
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

        {/* Custom Form Builder Modal */}
        <CustomFormModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onSave={handleSaveCustomTemplate}
          template={editingCustomTemplate}
          isEditMode={isEditCustomMode}
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
