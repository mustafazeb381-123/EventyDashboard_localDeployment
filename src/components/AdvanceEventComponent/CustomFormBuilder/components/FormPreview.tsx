import React, { useState } from "react";
import { AlertCircle, X, FileText, Image as ImageIcon } from "lucide-react";
import type { CustomFormField, FormTheme } from "../types";
import { FormHeader } from "./FormHeader";
import { FormButtonField } from "./FormButtonField";

interface FormPreviewProps {
  fields: CustomFormField[];
  bannerImage?: string | null;
  theme?: FormTheme;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  fields,
  bannerImage,
  theme,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(null);
  const [inlineParams, _setInlineParams] = useState<Record<string, string>>({
    Name: "John Doe",
    Email: "john@example.com",
    Company: "Acme Corp",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // -------------------- VALIDATION & LOGIC --------------------

  const checkCondition = (condition: any, data: any) => {
    const fieldValue = data[condition.field];
    const targetValue = condition.value;
    if (fieldValue === undefined || fieldValue === null) return false;

    switch (condition.operator) {
      case "equals":
        return String(fieldValue) == targetValue;
      case "notEquals":
        return String(fieldValue) != targetValue;
      case "contains":
        return String(fieldValue).includes(targetValue);
      case "greaterThan":
        return Number(fieldValue) > Number(targetValue);
      case "lessThan":
        return Number(fieldValue) < Number(targetValue);
      default:
        return false;
    }
  };

  const isFieldVisible = (field: CustomFormField, data: any) => {
    if (!field.conditions || field.conditions.length === 0) return true;
    const hasShowAction = field.conditions.some((c) => c.action === "show");
    if (hasShowAction) {
      return field.conditions.some(
        (c) => c.action === "show" && checkCondition(c, data)
      );
    }
    const shouldHide = field.conditions.some(
      (c) => c.action === "hide" && checkCondition(c, data)
    );
    return !shouldHide;
  };

  const validateField = (field: CustomFormField, value: any): string | null => {
    if (!isFieldVisible(field, formData)) return null;
    if (
      field.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      return "This field is required";
    }
    if (value) {
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Invalid email address";
      if (
        field.validation?.min !== undefined &&
        Number(value) < field.validation.min
      )
        return `Min value: ${field.validation.min}`;
      if (
        field.validation?.max !== undefined &&
        Number(value) > field.validation.max
      )
        return `Max value: ${field.validation.max}`;
      if (
        field.validation?.minLength !== undefined &&
        String(value).length < field.validation.minLength
      )
        return `Min length: ${field.validation.minLength}`;
      if (
        field.validation?.maxLength !== undefined &&
        String(value).length > field.validation.maxLength
      )
        return `Max length: ${field.validation.maxLength}`;
      if (field.validation?.pattern) {
        try {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(String(value))) return "Invalid format";
        } catch (e) {}
      }
    }
    return null;
  };

  // Replace inline parameters in text (FormEngine-like)
  const replaceInlineParams = (text: string | undefined): string => {
    if (!text) return "";
    let result = text;
    Object.keys(inlineParams).forEach((key) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      result = result.replace(regex, inlineParams[key]);
    });
    return result;
  };

  // Execute event handlers (FormEngine-like)
  const executeEventHandler = (
    handler: string | undefined,
    fieldName: string,
    value?: any
  ) => {
    if (!handler) return;
    try {
      // Simple handler execution - in production, you'd want a more secure approach
      if (handler.includes("(")) {
        // Function call like "handleChange(value)"
        const funcName = handler.split("(")[0].trim();
        if (typeof (window as any)[funcName] === "function") {
          (window as any)[funcName](value, fieldName);
        } else {
          console.log(
            `Event handler "${handler}" called for field "${fieldName}" with value:`,
            value
          );
        }
      } else {
        // Simple function name
        if (typeof (window as any)[handler] === "function") {
          (window as any)[handler](value, fieldName);
        } else {
          console.log(
            `Event handler "${handler}" called for field "${fieldName}"`
          );
        }
      }
    } catch (error) {
      console.error("Error executing event handler:", error);
    }
  };

  React.useEffect(() => {
    if (theme?.formBackgroundImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImagePreview(reader.result as string);
      };
      reader.readAsDataURL(theme.formBackgroundImage);
    } else if (typeof theme?.formBackgroundImage === "string") {
      setBackgroundImagePreview(theme.formBackgroundImage);
    }
  }, [theme?.formBackgroundImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      console.log("Form submitted:", formData);
      alert(
        "Form submitted successfully!\n" + JSON.stringify(formData, null, 2)
      );
    } else {
      alert("Please fix the errors in the form.");
    }
  };

  const renderField = (
    field: CustomFormField,
    overrideInputStyle?: React.CSSProperties,
    theme?: FormTheme
  ) => {
    // Merge field-specific styles with theme styles
    const fieldInputStyle: React.CSSProperties = {
      ...overrideInputStyle,
      backgroundColor:
        field.fieldStyle?.backgroundColor ||
        theme?.inputBackgroundColor ||
        "#ffffff",
      borderColor:
        field.fieldStyle?.borderColor || theme?.inputBorderColor || "#d1d5db",
      borderWidth:
        field.fieldStyle?.borderWidth || theme?.inputBorderWidth || "1px",
      borderRadius:
        field.fieldStyle?.borderRadius || theme?.inputBorderRadius || "6px",
      color: field.fieldStyle?.textColor || theme?.inputTextColor || "#111827",
      padding: field.fieldStyle?.padding || theme?.inputPadding || "10px 16px",
      width: field.fieldStyle?.width || "100%",
      ...(field.fieldStyle?.paddingTop
        ? { paddingTop: field.fieldStyle.paddingTop }
        : {}),
      ...(field.fieldStyle?.paddingRight
        ? { paddingRight: field.fieldStyle.paddingRight }
        : {}),
      ...(field.fieldStyle?.paddingBottom
        ? { paddingBottom: field.fieldStyle.paddingBottom }
        : {}),
      ...(field.fieldStyle?.paddingLeft
        ? { paddingLeft: field.fieldStyle.paddingLeft }
        : {}),
    };
    // Replace inline parameters
    const displayPlaceholder = replaceInlineParams(field.placeholder);

    const handleChange = (name: string, value: any) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      executeEventHandler(field.events?.onChange, name, value);
    };

    const commonProps = {
      id: field.id,
      name: field.name,
      placeholder: displayPlaceholder,
      required: field.required,
      defaultValue: field.defaultValue,
    };

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <input
            type={field.type}
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={{
              ...fieldInputStyle,
              width: field.fieldStyle?.width || "100%",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputFocusBorderColor || "#3b82f6";
              e.currentTarget.style.backgroundColor =
                theme?.inputFocusBackgroundColor ||
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onFocus, field.name);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                field.fieldStyle?.borderColor ||
                theme?.inputBorderColor ||
                "#d1d5db";
              e.currentTarget.style.backgroundColor =
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onBlur, field.name);
            }}
            onClick={() =>
              executeEventHandler(field.events?.onClick, field.name)
            }
            className="w-full transition-all"
          />
        );
      case "textarea":
        return (
          <textarea
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={{
              ...fieldInputStyle,
              width: field.fieldStyle?.width || "100%",
              outline: "none",
              resize: "vertical" as const,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputFocusBorderColor || "#3b82f6";
              e.currentTarget.style.backgroundColor =
                theme?.inputFocusBackgroundColor ||
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onFocus, field.name);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                field.fieldStyle?.borderColor ||
                theme?.inputBorderColor ||
                "#d1d5db";
              e.currentTarget.style.backgroundColor =
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onBlur, field.name);
            }}
            className="w-full transition-all resize-y"
            rows={4}
          />
        );
      case "select":
        return (
          <select
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={{
              ...fieldInputStyle,
              width: field.fieldStyle?.width || "100%",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                theme?.inputFocusBorderColor || "#3b82f6";
              e.currentTarget.style.backgroundColor =
                theme?.inputFocusBackgroundColor ||
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onFocus, field.name);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                field.fieldStyle?.borderColor ||
                theme?.inputBorderColor ||
                "#d1d5db";
              e.currentTarget.style.backgroundColor =
                field.fieldStyle?.backgroundColor ||
                theme?.inputBackgroundColor ||
                "#ffffff";
              executeEventHandler(field.events?.onBlur, field.name);
            }}
            onClick={() =>
              executeEventHandler(field.events?.onClick, field.name)
            }
            className="w-full transition-all bg-white"
          >
            <option value="">
              {displayPlaceholder || "Select an option..."}
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {replaceInlineParams(opt.label)}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-3">
            {field.options?.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={formData[field.name] === opt.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onFocus={() =>
                    executeEventHandler(field.events?.onFocus, field.name)
                  }
                  onBlur={() =>
                    executeEventHandler(field.events?.onBlur, field.name)
                  }
                  onClick={() =>
                    executeEventHandler(field.events?.onClick, field.name)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {replaceInlineParams(opt.label)}
                </span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={formData[field.name]?.includes(opt.value) || false}
                  onChange={(e) => {
                    const current = formData[field.name] || [];
                    const updated = e.target.checked
                      ? [...current, opt.value]
                      : current.filter((v: string) => v !== opt.value);
                    handleChange(field.name, updated);
                  }}
                  onFocus={() =>
                    executeEventHandler(field.events?.onFocus, field.name)
                  }
                  onBlur={() =>
                    executeEventHandler(field.events?.onBlur, field.name)
                  }
                  onClick={() =>
                    executeEventHandler(field.events?.onClick, field.name)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {replaceInlineParams(opt.label)}
                </span>
              </label>
            ))}
          </div>
        );
      case "file":
      case "image":
        const fileValue = formData[field.name];
        const fileName =
          fileValue instanceof File
            ? fileValue.name
            : typeof fileValue === "string"
            ? fileValue.split("/").pop() || fileValue
            : "";

        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  ...fieldInputStyle,
                  cursor: "default",
                }}
              >
                {fileName || `No ${field.type} selected`}
              </div>
              <label
                className="px-4 py-2 border rounded-lg cursor-pointer text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                style={{
                  backgroundColor: theme?.buttonBackgroundColor || "#3b82f6",
                  color: theme?.buttonTextColor || "#ffffff",
                  borderColor: theme?.buttonBorderColor || "#3b82f6",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme?.buttonHoverBackgroundColor || "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme?.buttonBackgroundColor || "#3b82f6";
                }}
              >
                {field.type === "image" ? (
                  <ImageIcon size={16} />
                ) : (
                  <FileText size={16} />
                )}
                Choose {field.type === "image" ? "Image" : "File"}
                <input
                  type="file"
                  {...commonProps}
                  accept={
                    field.accept ||
                    (field.type === "image" ? "image/*" : undefined)
                  }
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file type for images
                      if (
                        field.type === "image" &&
                        !file.type.startsWith("image/")
                      ) {
                        alert("Please select an image file");
                        e.target.value = "";
                        return;
                      }
                      // Validate file size (10MB for images)
                      if (
                        field.type === "image" &&
                        file.size > 10 * 1024 * 1024
                      ) {
                        alert("Image size should be less than 10MB");
                        e.target.value = "";
                        return;
                      }
                      // Store file object
                      handleChange(field.name, file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {fileName && (
                <button
                  type="button"
                  onClick={() => {
                    handleChange(field.name, null);
                    const input = document.querySelector(
                      `input[name="${field.name}"]`
                    ) as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                  className="px-3 py-2 border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {fileName && (
              <p className="text-xs text-gray-500 pl-1">
                {fileValue instanceof File && (
                  <>
                    {field.type === "image" ? "Image" : "File"}: {fileName} (
                    {(fileValue.size / 1024).toFixed(2)} KB)
                  </>
                )}
                {typeof fileValue === "string" && <>Selected: {fileName}</>}
              </p>
            )}
          </div>
        );
      case "button":
        return <FormButtonField field={field} theme={theme} />;
      case "table":
        if (!field.tableData) {
          return <div className="text-gray-400 text-sm">No table data</div>;
        }
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  {field.tableData.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2 text-left border-b border-gray-300 font-semibold"
                      style={{ color: theme?.labelColor || "#374151" }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {field.tableData.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-200">
                    {field.tableData!.columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-4 py-2"
                        style={{ color: theme?.textColor || "#111827" }}
                      >
                        {row[col.key] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "divider":
        return (
          <hr
            className="my-4"
            style={{
              borderColor: theme?.formBorderColor || "#e5e7eb",
              borderWidth: "1px",
            }}
          />
        );
      case "heading":
        return (
          <h3
            className="font-bold"
            style={{
              color: theme?.headingColor || "#111827",
              fontSize: theme?.headingFontSize || "24px",
              fontWeight: theme?.headingFontWeight || "bold",
            }}
          >
            {replaceInlineParams(field.content || field.label || "Heading")}
          </h3>
        );
      case "paragraph":
        return (
          <p
            className="text-sm"
            style={{
              color: theme?.textColor || "#111827",
              fontSize: theme?.textFontSize || "16px",
            }}
          >
            {replaceInlineParams(
              field.content || field.label || "Paragraph text"
            )}
          </p>
        );
      case "spacer":
        return (
          <div
            style={{
              height: field.height || "20px",
              width: "100%",
            }}
          />
        );
      default:
        return null;
    }
  };

  const formStyle: React.CSSProperties = {
    backgroundColor: theme?.formBackgroundColor || "#ffffff",
    backgroundImage: theme?.formBackgroundImage
      ? typeof theme.formBackgroundImage === "string"
        ? `url(${theme.formBackgroundImage})`
        : backgroundImagePreview
        ? `url(${backgroundImagePreview})`
        : undefined
      : undefined,
    backgroundSize: theme?.formBackgroundImage ? "cover" : undefined,
    backgroundPosition: theme?.formBackgroundImage ? "center" : undefined,
    backgroundRepeat: theme?.formBackgroundImage ? "no-repeat" : undefined,
    padding: theme?.formPadding || "24px",
    borderRadius: theme?.formBorderRadius || "8px",
    borderColor: theme?.formBorderColor || "#e5e7eb",
    borderWidth: theme?.formBorderWidth || "1px",
    borderStyle: "solid",
  };

  const baseInputStyle: React.CSSProperties = {
    backgroundColor: theme?.inputBackgroundColor || "#ffffff",
    borderColor: theme?.inputBorderColor || "#d1d5db",
    borderWidth: theme?.inputBorderWidth || "1px",
    borderRadius: theme?.inputBorderRadius || "6px",
    color: theme?.inputTextColor || "#111827",
    padding: theme?.inputPadding || "10px 16px",
  };

  const formLayoutStyle: React.CSSProperties = {
    ...formStyle,
    maxWidth: theme?.formMaxWidth || "768px",
    marginLeft:
      theme?.formAlignment === "left"
        ? "0"
        : theme?.formAlignment === "right"
        ? "auto"
        : "auto",
    marginRight:
      theme?.formAlignment === "left"
        ? "auto"
        : theme?.formAlignment === "right"
        ? "0"
        : "auto",
  };

  return (
    <div
      className="w-full rounded-xl shadow-lg overflow-hidden"
      style={formLayoutStyle}
    >
      {/* Banner Image */}
      {bannerImage && (
        <div className="w-full h-64 bg-gray-100 overflow-hidden">
          <img
            src={bannerImage}
            alt="Form banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <FormHeader theme={theme} />

      <div>
        <div
          className="mb-6 pb-4 border-b"
          style={{ borderColor: theme?.formBorderColor || "#e5e7eb" }}
        >
          <h3
            className="text-2xl font-bold mb-2"
            style={{
              color: theme?.headingColor || "#111827",
              fontSize: theme?.headingFontSize || "24px",
              fontWeight: theme?.headingFontWeight || "bold",
            }}
          >
            Form Preview
          </h3>
          <p
            className="text-sm"
            style={{ color: theme?.descriptionColor || "#6b7280" }}
          >
            See how your form will look to users
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {(() => {
            // Calculate all child field IDs once to avoid duplicate rendering
            const allChildIds = new Set(
              fields
                .filter((f) => f.containerType && f.children)
                .flatMap((f) => f.children || [])
            );

            return fields.map((field) => {
              // Skip rendering if this field is a child of a container (it will be rendered inside its parent)
              if (allChildIds.has(field.id)) {
                return null;
              }

              // Check visibility
              if (!isFieldVisible(field, formData)) {
                return null;
              }

              // Render containers with their children
              if (field.containerType) {
                const isRowLayout = field.containerType === "row";
                const containerStyle: React.CSSProperties = {
                  display: "flex",
                  flexDirection: isRowLayout ? "row" : "column",
                  justifyContent:
                    field.layoutProps?.justifyContent || "flex-start",
                  alignItems:
                    field.layoutProps?.alignItems ||
                    (isRowLayout ? "flex-start" : "stretch"),
                  gap: field.layoutProps?.gap || "16px",
                  padding:
                    field.layoutProps?.padding || (isRowLayout ? "0" : "16px"),
                  margin: field.layoutProps?.margin || "0",
                  backgroundColor:
                    field.layoutProps?.backgroundColor || "transparent",
                  borderRadius: field.layoutProps?.borderRadius || "0px",
                  borderColor: field.layoutProps?.borderColor || undefined,
                  borderWidth: field.layoutProps?.borderWidth || undefined,
                  borderStyle:
                    field.layoutProps?.borderColor ||
                    field.layoutProps?.borderWidth
                      ? "solid"
                      : undefined,
                  flexWrap:
                    field.layoutProps?.flexWrap ||
                    (isRowLayout ? "wrap" : "nowrap"),
                  width: "100%",
                };

                const childFields = field.children
                  ? (field.children
                      .map((id) => fields.find((f) => f.id === id))
                      .filter(Boolean) as CustomFormField[])
                  : [];

                // For column containers, use Bootstrap grid if Bootstrap classes are set
                const isColumnContainer = field.containerType === "column";
                const hasBootstrapClasses = childFields.some(
                  (f) => f.bootstrapClass
                );

                // If column container with Bootstrap classes, use row wrapper
                const containerClassName =
                  isColumnContainer && hasBootstrapClasses ? "row" : "";

                // Always apply containerStyle for row containers, or if no Bootstrap classes
                const shouldApplyContainerStyle =
                  isRowLayout || !hasBootstrapClasses;

                return (
                  <div
                    key={field.id}
                    className={`w-full ${containerClassName}`}
                    style={
                      shouldApplyContainerStyle ? containerStyle : undefined
                    }
                  >
                    {childFields.length > 0 ? (
                      childFields.map((childField) => {
                        // Determine wrapper style/class based on container type and Bootstrap class
                        let fieldWrapperClassName = "";
                        let fieldWrapperStyle: React.CSSProperties = {};

                        // Apply per-field spacing so custom margins/paddings are respected
                        const fieldSpacing: React.CSSProperties = {
                          margin: childField.fieldStyle?.margin || undefined,
                          padding: childField.fieldStyle?.padding || undefined,
                          width: childField.fieldStyle?.width || "100%",
                          ...(childField.fieldStyle?.marginTop
                            ? { marginTop: childField.fieldStyle.marginTop }
                            : {}),
                          ...(childField.fieldStyle?.marginRight
                            ? { marginRight: childField.fieldStyle.marginRight }
                            : {}),
                          ...(childField.fieldStyle?.marginBottom
                            ? {
                                marginBottom:
                                  childField.fieldStyle.marginBottom,
                              }
                            : {}),
                          ...(childField.fieldStyle?.marginLeft
                            ? { marginLeft: childField.fieldStyle.marginLeft }
                            : {}),
                          ...(childField.fieldStyle?.paddingTop
                            ? { paddingTop: childField.fieldStyle.paddingTop }
                            : {}),
                          ...(childField.fieldStyle?.paddingRight
                            ? {
                                paddingRight:
                                  childField.fieldStyle.paddingRight,
                              }
                            : {}),
                          ...(childField.fieldStyle?.paddingBottom
                            ? {
                                paddingBottom:
                                  childField.fieldStyle.paddingBottom,
                              }
                            : {}),
                          ...(childField.fieldStyle?.paddingLeft
                            ? { paddingLeft: childField.fieldStyle.paddingLeft }
                            : {}),
                        };

                        if (isColumnContainer && childField.bootstrapClass) {
                          // Use Bootstrap class
                          fieldWrapperClassName = childField.bootstrapClass;
                          fieldWrapperStyle = {
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            ...fieldSpacing,
                          };
                        } else if (isRowLayout) {
                          // For row layouts without Bootstrap, use flex equal width
                          fieldWrapperStyle = {
                            flex: "1 1 0%",
                            minWidth: "0",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            ...fieldSpacing,
                          };
                        } else {
                          // Default column layout
                          fieldWrapperStyle = {
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            ...fieldSpacing,
                          };
                        }

                        return (
                          <div
                            key={childField.id}
                            className={fieldWrapperClassName}
                            style={fieldWrapperStyle}
                          >
                            <label
                              className="block font-semibold text-sm mb-1"
                              style={{
                                color:
                                  childField.fieldStyle?.labelColor ||
                                  theme?.labelColor ||
                                  "#374151",
                                fontSize: theme?.labelFontSize || "14px",
                                fontWeight: theme?.labelFontWeight || "600",
                              }}
                            >
                              {replaceInlineParams(childField.label)}
                              {childField.required && (
                                <span
                                  style={{
                                    color:
                                      theme?.requiredIndicatorColor ||
                                      "#ef4444",
                                    marginLeft: "4px",
                                  }}
                                >
                                  *
                                </span>
                              )}
                            </label>
                            <div style={{ width: "100%" }}>
                              {renderField(
                                childField,
                                {
                                  ...baseInputStyle,
                                  width: "100%",
                                },
                                theme
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm italic w-full">
                        Drop fields here
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={field.id}
                  className="space-y-2"
                  style={{
                    margin: field.fieldStyle?.margin || undefined,
                    padding: field.fieldStyle?.padding || undefined,
                    width: field.fieldStyle?.width || "100%",
                    ...(field.fieldStyle?.marginTop
                      ? { marginTop: field.fieldStyle.marginTop }
                      : {}),
                    ...(field.fieldStyle?.marginRight
                      ? { marginRight: field.fieldStyle.marginRight }
                      : {}),
                    ...(field.fieldStyle?.marginBottom
                      ? { marginBottom: field.fieldStyle.marginBottom }
                      : {}),
                    ...(field.fieldStyle?.marginLeft
                      ? { marginLeft: field.fieldStyle.marginLeft }
                      : {}),
                    ...(field.fieldStyle?.paddingTop
                      ? { paddingTop: field.fieldStyle.paddingTop }
                      : {}),
                    ...(field.fieldStyle?.paddingRight
                      ? { paddingRight: field.fieldStyle.paddingRight }
                      : {}),
                    ...(field.fieldStyle?.paddingBottom
                      ? { paddingBottom: field.fieldStyle.paddingBottom }
                      : {}),
                    ...(field.fieldStyle?.paddingLeft
                      ? { paddingLeft: field.fieldStyle.paddingLeft }
                      : {}),
                  }}
                >
                  <label
                    className="block font-semibold"
                    style={{
                      color:
                        field.fieldStyle?.labelColor ||
                        theme?.labelColor ||
                        "#374151",
                      fontSize: theme?.labelFontSize || "14px",
                      fontWeight: theme?.labelFontWeight || "600",
                    }}
                  >
                    {replaceInlineParams(field.label)}
                    {field.required && (
                      <span
                        style={{
                          color: theme?.requiredIndicatorColor || "#ef4444",
                          marginLeft: "4px",
                        }}
                      >
                        *
                      </span>
                    )}
                    {field.unique && (
                      <span
                        className="ml-2 text-xs bg-blue-50 px-2 py-0.5 rounded"
                        style={{ color: "#2563eb" }}
                      >
                        Unique
                      </span>
                    )}
                  </label>
                  {field.description && (
                    <p
                      className="text-xs mb-2 italic"
                      style={{
                        color: theme?.descriptionColor || "#6b7280",
                        fontSize: theme?.descriptionFontSize || "12px",
                      }}
                    >
                      {field.description}
                    </p>
                  )}
                  {renderField(field, baseInputStyle, theme)}
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              );
            });
          })()}
        </form>

        {/* Footer */}
        {theme?.footerEnabled && theme?.footerText && (
          <div
            className="mt-6 pt-4 border-t"
            style={{
              backgroundColor: theme.footerBackgroundColor || "#f9fafb",
              color: theme.footerTextColor || "#6b7280",
              padding: theme.footerPadding || "16px",
              fontSize: theme.footerFontSize || "14px",
              textAlign: theme.footerAlignment || "center",
              borderTopColor: theme.formBorderColor || "#e5e7eb",
            }}
          >
            {theme.footerText}
          </div>
        )}
      </div>
    </div>
  );
};
