import { useState } from "react";

interface FormField {
  id: number;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  active?: boolean;
  fullWidth?: boolean;
  options?: Array<{ value: string; label: string }>;
  accept?: string;
  hint?: string;
  rows?: number;
  checkboxLabel?: string;
}

interface RegistrationFormPreviewProps {
  formFields?: FormField[];
  submitButtonText?: string;
}

// Simple Registration Form Component (UI Only - No Toggle/Functionality)
const RegistrationFormPreview = ({
  formFields = [],
  submitButtonText = "Register",
}: RegistrationFormPreviewProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const renderField = (field: FormField) => {
    const commonInputClasses =
      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white";

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={commonInputClasses}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={field.rows || 3}
            className={commonInputClasses}
          />
        );

      case "select":
        return (
          <select
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={commonInputClasses}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "file":
        return (
          <div>
            <input
              type="file"
              accept={field.accept}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files[0]) {
                  handleInputChange(field.name, files[0].name);
                }
              }}
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 transition-colors text-gray-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {field.hint && (
              <p className="mt-2 text-xs text-gray-500">{field.hint}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">
              {field.checkboxLabel}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {formFields.map((field) => (
        <div key={field.name} className={field.fullWidth ? "w-full" : ""}>
          {field.type !== "checkbox" && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
        </div>
      ))}

      <button
        type="button"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {submitButtonText}
      </button>
    </div>
  );
};

export default RegistrationFormPreview;
