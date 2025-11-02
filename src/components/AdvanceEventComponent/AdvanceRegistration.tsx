import React, { useState } from "react";
import {
  ChevronLeft,
  Check,
  Plus,
  X,
  GripVertical,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
} from "lucide-react";

interface AdvanceRegistrationProps {
  onNext: (eventId?: string | number, formData?: any) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

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

interface FormTemplate {
  id: string;
  title: string;
  data: FormField[];
  createdAt: string;
  updatedAt?: string;
}

const AdvanceRegistration: React.FC<AdvanceRegistrationProps> = ({
  onNext,
  onPrevious,
  eventId,
  currentStep,
  totalSteps,
}) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const [currentFormData, setCurrentFormData] = useState<FormField[]>([]);
  const [templateTitle, setTemplateTitle] = useState("My Form Template");
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showTemplateMenu, setShowTemplateMenu] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingTemplate, setReviewingTemplate] =
    useState<FormTemplate | null>(null);

  const handleNext = () => {
    onNext(eventId, currentFormData);
  };

  const handleBack = () => {
    if (onPrevious) onPrevious();
  };

  const handleCreateNewTemplate = () => {
    setCurrentFormData([]);
    setTemplateTitle("My Form Template");
    setIsModalOpen(true);
    setIsEditMode(false);
    setEditingTemplateId(null);
  };

  const handleEditTemplate = (template: FormTemplate) => {
    setCurrentFormData(template.data);
    setTemplateTitle(template.title);
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditingTemplateId(template.id);
    setShowTemplateMenu(null);
    setIsReviewModalOpen(false);
  };

  const handleSaveTemplate = () => {
    if (currentFormData.length === 0) {
      alert("Please add some form fields before saving.");
      return;
    }

    let updatedTemplates: FormTemplate[];

    if (isEditMode && editingTemplateId) {
      // Update existing template
      updatedTemplates = templates.map((template) =>
        template.id === editingTemplateId
          ? {
              ...template,
              title: templateTitle,
              data: currentFormData,
              updatedAt: new Date().toISOString(),
            }
          : template
      );
    } else {
      // Create new template
      const newTemplate: FormTemplate = {
        id: `template-${Date.now()}`,
        title: templateTitle,
        data: currentFormData,
        createdAt: new Date().toISOString(),
      };
      updatedTemplates = [...templates, newTemplate];
      setSelectedTemplate(newTemplate.id);
    }

    setTemplates(updatedTemplates);

    // Save to localStorage
    if (eventId) {
      localStorage.setItem(
        `formTemplates_${eventId}`,
        JSON.stringify(updatedTemplates)
      );
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTemplateId(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = templates.filter(
        (template) => template.id !== templateId
      );
      setTemplates(updatedTemplates);

      if (selectedTemplate === templateId) {
        setSelectedTemplate(null);
        setCurrentFormData([]);
      }

      // Update localStorage
      if (eventId) {
        localStorage.setItem(
          `formTemplates_${eventId}`,
          JSON.stringify(updatedTemplates)
        );
      }

      setShowTemplateMenu(null);
      setIsReviewModalOpen(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setCurrentFormData(template.data);
    }
    setShowTemplateMenu(null);
  };

  const handleReviewTemplate = (template: FormTemplate) => {
    setReviewingTemplate(template);
    setIsReviewModalOpen(true);
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

  const fieldTypes = [
    {
      type: "text",
      label: "Text Input",
      icon: "T",
      description: "Single line text input",
    },
    {
      type: "email",
      label: "Email Input",
      icon: "✉",
      description: "Email address field",
    },
    {
      type: "number",
      label: "Number Input",
      icon: "🔢",
      description: "Numeric input field",
    },
    {
      type: "select",
      label: "Dropdown",
      icon: "▼",
      description: "Select from options",
    },
    {
      type: "textarea",
      label: "Text Area",
      icon: "📝",
      description: "Multi-line text input",
    },
    {
      type: "checkbox",
      label: "Checkbox",
      icon: "☑",
      description: "Checkbox option",
    },
    {
      type: "radio",
      label: "Radio Button",
      icon: "⚪",
      description: "Radio button option",
    },
    {
      type: "header",
      label: "Header",
      icon: "🏷️",
      description: "Section header",
    },
    {
      type: "paragraph",
      label: "Paragraph",
      icon: "📄",
      description: "Text paragraph",
    },
    {
      type: "date",
      label: "Date Picker",
      icon: "📅",
      description: "Date selection",
    },
    {
      type: "file",
      label: "File Upload",
      icon: "📎",
      description: "File upload field",
    },
  ];

  // Function to render field preview in the modal
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
            value={field.value || ""}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isReviewModalOpen} // Disable in review mode
          />
        );
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={field.value || ""}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isReviewModalOpen} // Disable in review mode
          />
        );
      case "select":
        return (
          <select
            value={field.value || ""}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isReviewModalOpen} // Disable in review mode
          >
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
                  disabled={isReviewModalOpen} // Disable in review mode
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
                  name={`radio-${field.id}`}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
                  disabled={isReviewModalOpen} // Disable in review mode
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
            <input
              type="file"
              className="hidden"
              id={`file-${field.id}`}
              disabled={isReviewModalOpen}
            />
            <label htmlFor={`file-${field.id}`} className="cursor-pointer">
              <div className="text-gray-500">📎 Click to upload file</div>
              <div className="text-sm text-gray-400">{field.placeholder}</div>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTemplatePreview = (template: FormTemplate) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
        {/* Template Header */}
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-medium text-gray-900 text-sm truncate flex-1">
            {template.title}
          </h4>
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
                      className="w-full text-xs p-4 border border-gray-300 rounded-2xl cursor-not-allowed"
                      disabled
                    />
                  )}

                  {field.type === "email" && (
                    <input
                      type="email"
                      placeholder={field.placeholder}
                      className="w-full text-xs p-4 border border-gray-300 rounded-2xl cursor-not-allowed"
                      disabled
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      placeholder={field.placeholder}
                      className="w-full text-xs p-4 border border-gray-300 rounded-2xl cursor-not-allowed"
                      disabled
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      placeholder={field.placeholder}
                      rows={2}
                      className="w-full text-xs p-4 border border-gray-300 rounded-2xl cursor-not-allowed resize-none"
                      disabled
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      className="w-full text-xs p-4 border border-gray-300 rounded-2xl cursor-not-allowed"
                      disabled
                    >
                      <option value="">
                        {field.placeholder || "Select..."}
                      </option>
                      {field.options?.slice(0, 2).map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                      {field.options && field.options.length > 2 && (
                        <option disabled>
                          ... and {field.options.length - 2} more
                        </option>
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
                          <span className="text-gray-600 text-xs">
                            {option}
                          </span>
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
                          <span className="text-gray-600 text-xs">
                            {option}
                          </span>
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
                      className="w-full text-xs p-4 border border-gray-300 rounded-2xl cursor-not-allowed"
                      disabled
                    />
                  )}

                  {field.type === "file" && (
                    <div className="border border-dashed border-gray-300 rounded text-xs text-gray-5ed-2xl text-center">
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

  // Function to render full form preview in review modal
  const renderFullFormPreview = (template: FormTemplate) => {
    return (
      <div>
        {template.data.map((field, index) => (
          <div key={field.id} className="bg-white rounded-lg border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              {field.required && (
                <span className="text-xs bg-red-100 text-red-600 rounded">
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
        ))}
      </div>
    );
  };

  const getFieldIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      text: "T",
      email: "E",
      number: "N",
      select: "S",
      textarea: "A",
      checkbox: "C",
      radio: "R",
      header: "H",
      paragraph: "P",
      date: "D",
      file: "F",
    };
    return icons[type] || "?";
  };

  React.useEffect(() => {
    if (eventId) {
      const savedTemplates = localStorage.getItem(`formTemplates_${eventId}`);
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
    }
  }, [eventId]);

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            Advance Registration
          </h2>
        </div>

        {/* Stepper */}
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

      {/* Template Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Create New Template Card */}
        <div
          onClick={handleCreateNewTemplate}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
        >
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-pink-500" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center text-pink-500">
            Create New Template
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Design a custom registration form from scratch
          </p>
        </div>

        {/* Existing Templates */}
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border-2 rounded-2xl p-4 transition-all duration-200 hover:shadow-md aspect-square flex flex-col relative cursor-pointer ${
              selectedTemplate === template.id
                ? "border-pink-500 bg-pink-50 shadow-md"
                : "border-gray-200 hover:border-pink-300"
            }`}
            onClick={() => handleReviewTemplate(template)}
          >
            {/* Template Content */}
            <div className="flex-1">{renderTemplatePreview(template)}</div>
          </div>
        ))}
      </div>

      {/* Custom Form Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-7xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {isEditMode ? "Edit Template" : "Create Form Template"}
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
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Split Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Side - Form Builder Canvas */}
              <div className="flex-1 overflow-auto p-6">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Form Preview
                </h4>

                {currentFormData.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      No fields added yet
                    </div>
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
                        className={`bg-white p-4 rounded-lg transition-all ${
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
                                <span className="text-xs bg-red-100 text-red-600 rounded">
                                  Required
                                </span>
                              )}
                            </div>

                            {field.type !== "header" &&
                              field.type !== "paragraph" && (
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {field.label}
                                  {field.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </label>
                              )}

                            {renderFieldPreview(field)}

                            {field.description && (
                              <p className="text-xs text-gray-500 mt-2">
                                {field.description}
                              </p>
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
              <div className="w-80 bordered-2xl p-4 overflow-auto">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Form Elements
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Click to add fields to your form
                </p>

                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => (
                    <button
                      key={fieldType.type}
                      onClick={() => addField(fieldType.type)}
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
                      <label className="text-sm text-gray-700">
                        Required field
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 px-6 py-4 border-t">
                    <button
                      onClick={() => setEditingField(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hoved-2xl"
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
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hoved-2xl transition-colors"
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
      )}

      {/* Review Template Modal */}
      {isReviewModalOpen && reviewingTemplate && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[80vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Review Template: {reviewingTemplate.title}
                </h3>
                <span className="text-sm text-gray-500">
                  {reviewingTemplate.data.length} fields • Created{" "}
                  {new Date(reviewingTemplate.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-2xl mx-auto">
                {renderFullFormPreview(reviewingTemplate)}
              </div>
            </div>

            {/* Modal Footer with Edit/Delete Actions */}
            <div className="p-4 border-t flex justify-between items-center bg-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteTemplate(reviewingTemplate.id)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => handleEditTemplate(reviewingTemplate)}
                  className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleSelectTemplate(reviewingTemplate.id);
                    setIsReviewModalOpen(false);
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Choose Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
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
          disabled={!selectedTemplate}
          className={`cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium ${
            selectedTemplate
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

export default AdvanceRegistration;
