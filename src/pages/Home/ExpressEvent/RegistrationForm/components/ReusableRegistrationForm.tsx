// ReusableRegistrationForm.jsx
import React, { useState } from "react";
import { Info, Eye, EyeOff } from "lucide-react";

const ReusableRegistrationForm = ({
  formFields = [],
  onSubmit,
  submitButtonText = "Register",
  submitButtonClassName = "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [fieldVisibility, setFieldVisibility] = useState(() => {
    const initialVisibility = {};
    formFields.forEach(field => {
      initialVisibility[field.name] = true;
    });
    return initialVisibility;
  });

  const toggleFieldVisibility = (fieldName) => {
    setFieldVisibility(prev => {
      const isCurrentlyVisible = prev[fieldName];
      if (isCurrentlyVisible) {
        const currentField = formFields.find(f => f.name === fieldName);
        setFormData(prevData => {
          const newData = { ...prevData };
          newData[fieldName] = currentField?.type === 'checkbox' ? false : "";
          return newData;
        });
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
      return {
        ...prev,
        [fieldName]: !isCurrentlyVisible
      };
    });
  };

  const isFieldVisible = (fieldName) => {
    return fieldVisibility[fieldName] !== false;
  };

  const handleInputChange = (fieldName, value, file = null) => {
    if (!isFieldVisible(fieldName)) return;

    setFormData(prev => ({
      ...prev,
      [fieldName]: file || value
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    formFields.forEach(field => {
      if (!isFieldVisible(field.name)) {
        return;
      }

      if (field.required && (!formData[field.name] || formData[field.name] === "")) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.validation && formData[field.name]) {
        const validationResult = field.validation(formData[field.name]);
        if (validationResult !== true) {
          newErrors[field.name] = validationResult;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSubmit = Object.keys(formData).reduce((acc, key) => {
        if (isFieldVisible(key)) {
          acc[key] = formData[key];
        }
        return acc;
      }, {});
      onSubmit(dataToSubmit);
    }
  };

  const renderField = (field) => {
    const isVisible = isFieldVisible(field.name);
    const commonInputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
      errors[field.name] ? 'border-red-300' : 'border-gray-300'
    } ${!isVisible ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`;

    const inputProps = {
      disabled: !isVisible,
      className: commonInputClasses
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={field.type}
            placeholder={isVisible ? field.placeholder : "Field is disabled"}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            {...inputProps}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={isVisible ? field.placeholder : "Field is disabled"}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={field.rows || 3}
            {...inputProps}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            {...inputProps}
          >
            <option value="">{isVisible ? (field.placeholder || `Select ${field.label}`) : "Field is disabled"}</option>
            {isVisible && field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept={field.accept}
              disabled={!isVisible}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  let hasError = false;

                  // File size validation first
                  if (field.maxSize && file.size > field.maxSize) {
                    setErrors(prev => ({
                      ...prev,
                      [field.name]: `File size exceeds ${(field.maxSize / (1024 * 1024)).toFixed(1)}MB limit`
                    }));
                    hasError = true;
                  }

                  // File type validation
                  if (field.allowedTypes && !field.allowedTypes.includes(file.type)) {
                    setErrors(prev => ({
                      ...prev,
                      [field.name]: `Invalid file type. Allowed: ${field.allowedTypes.join(', ')}`
                    }));
                    hasError = true;
                  }

                  // If there's an error, clear the form data for this field
                  if (hasError) {
                    setFormData(prev => ({
                      ...prev,
                      [field.name]: ""
                    }));
                  } else {
                    // If no errors, update the state with the valid file
                    handleInputChange(field.name, file.name, file);
                  }
                }
              }}
              className={`w-full text-sm border rounded-lg py-2 px-3 ${
                isVisible 
                  ? 'text-gray-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100' 
                  : 'text-gray-400 bg-gray-100 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-400 cursor-not-allowed'
              } ${errors[field.name] ? 'border-red-300' : 'border-gray-300'}`}
            />
            
            {/* Conditionally display the selected file name */}
            {formData[field.name] && isVisible && typeof formData[field.name] === 'string' && (
              <p className="mt-2 text-sm text-gray-600 truncate">
                Selected file: **{formData[field.name]}**
              </p>
            )}

            {field.hint && (
              <p className={`text-xs ${isVisible ? 'text-gray-500' : 'text-gray-400'}`}>
                {isVisible ? field.hint : "Field is disabled"}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              disabled={!isVisible}
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className={`rounded border-gray-300 ${
                isVisible
                  ? 'text-blue-600 focus:ring-blue-500'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            />
            <label className={`text-sm ${isVisible ? 'text-gray-700' : 'text-gray-400'}`}>
              {field.checkboxLabel}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formFields.map((field) => (
        <div key={field.name}>
          {field.type !== 'checkbox' && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1">
              {renderField(field)}
            </div>

            <button
              style={{padding:10, borderRadius:10, backgroundColor:"#f5f5f5",}}
              type="button"
              onClick={() => toggleFieldVisibility(field.name)}
              className="flex items-center justify-center transition-colors flex-shrink-0"
              title={isFieldVisible(field.name) ? "Disable field" : "Enable field"}
            >
              {isFieldVisible(field.name) ? (
                <Eye size={24} className="text-red-500" />
              ) : (
                <EyeOff size={24} className="text-gray-400" />
              )}
            </button>
          </div>

          {errors[field.name] && (
            <p className="mt-1 flex items-center text-xs text-red-600">
              <Info size={14} className="mr-1 flex-shrink-0" />
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        className={submitButtonClassName}
      >
        {submitButtonText}
      </button>
    </form>
  );
};

export default ReusableRegistrationForm;