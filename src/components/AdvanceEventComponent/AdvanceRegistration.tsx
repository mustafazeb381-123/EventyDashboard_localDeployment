import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  Loader2,
  X,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
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
import ReusableRegistrationForm from "@/pages/Home/ExpressEvent/RegistrationForm/components/ReusableRegistrationForm";
import CustomFormBuilder from "./CustomFormBuilder";
import type { CustomFormField, FormTheme } from "./CustomFormBuilder";
import { FormHeader } from "./CustomFormBuilder/components/FormHeader";
import { FormButtonField } from "./CustomFormBuilder/components/FormButtonField";



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
  | "file"
  | "button";
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
  bannerImage?: File | string | null; // Store banner image
  theme?: FormTheme; // Store form theme/styling
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





// -------------------- CUSTOM FIELD RENDERER --------------------
const renderCustomField = (
  field: CustomFormField,
  inputStyle: React.CSSProperties,
  theme: FormTheme | undefined,
  formData: Record<string, any>,
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>
) => {
  const fieldInputStyle: React.CSSProperties = {
    ...inputStyle,
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

  const commonProps = {
    id: field.id,
    name: field.name,
    placeholder: field.placeholder,
    required: field.required,
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
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          style={fieldInputStyle}
          className="w-full transition-all outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    case "textarea":
      return (
        <textarea
          {...commonProps}
          value={formData[field.name] || ""}
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          style={fieldInputStyle}
          className="w-full transition-all outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          rows={4}
        />
      );
    case "select":
      return (
        <select
          {...commonProps}
          value={formData[field.name] || ""}
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          style={fieldInputStyle}
          className="w-full transition-all outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select an option...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">{opt.label}</span>
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
                  setFormData({ ...formData, [field.name]: updated });
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      );
    case "file":
    case "image":
      const fileName = formData[field.name]?.name || "";
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div
              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
              style={fieldInputStyle}
            >
              {fileName || `No ${field.type} selected`}
            </div>
            <label
              className="px-4 py-2 border rounded-lg cursor-pointer text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: theme?.buttonBackgroundColor || "#3b82f6",
                color: theme?.buttonTextColor || "#ffffff",
                borderColor: theme?.buttonBorderColor || "#3b82f6",
              }}
            >
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
                    setFormData({ ...formData, [field.name]: file });
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
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
          {field.content || field.label || "Heading"}
        </h3>
      );
      case "paragraph":
      const paragraphContent = formData[field.name] || field.content || field.label || "";
      return (
        <textarea
          value={paragraphContent}
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          className="w-full text-sm resize-y transition-all outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            ...fieldInputStyle,
            color: theme?.textColor || "#111827",
            fontSize: theme?.textFontSize || "16px",
            minHeight: "80px",
          }}
          rows={4}
          placeholder="Enter your paragraph"
        />
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

// -------------------- FORM BUILDER TEMPLATE FORM COMPONENT --------------------
interface FormBuilderTemplateFormProps {
  data?: any;
  eventId?: string;
  isUserRegistration?: boolean;
  eventData?: any;
  formBuilderData?: any;
  bannerImage?: File | string | null;
  theme?: FormTheme;
}

const FormBuilderTemplateForm: React.FC<FormBuilderTemplateFormProps> = ({
  isUserRegistration = false,
  formBuilderData,
  bannerImage,
  theme,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Check if this is a custom form builder template (has CustomFormField array)
  const isCustomFormBuilder =
    formBuilderData?.formData &&
    Array.isArray(formBuilderData.formData) &&
    formBuilderData.formData.length > 0 &&
    formBuilderData.formData[0]?.name !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Custom form submitted:", formData);
    toast.success("Registration submitted successfully!");
  };

  // Render custom form builder template (exactly like preview)
  if (isCustomFormBuilder) {
    const customFields = formBuilderData.formData as CustomFormField[];

    const bannerUrl = bannerImage
      ? typeof bannerImage === "string"
        ? bannerImage
        : bannerImage instanceof File || bannerImage instanceof Blob
          ? URL.createObjectURL(bannerImage)
          : null
      : null;

    const backgroundImageUrl = theme?.formBackgroundImage
      ? typeof theme.formBackgroundImage === "string"
        ? theme.formBackgroundImage
        : theme.formBackgroundImage instanceof File
          ? URL.createObjectURL(theme.formBackgroundImage)
          : null
      : null;

    const formContainerStyle: React.CSSProperties = {
      backgroundColor: theme?.formBackgroundColor || "#ffffff",
      backgroundImage: backgroundImageUrl
        ? `url(${backgroundImageUrl})`
        : undefined,
      backgroundSize: backgroundImageUrl ? "cover" : undefined,
      backgroundPosition: backgroundImageUrl ? "center" : undefined,
      backgroundRepeat: backgroundImageUrl ? "no-repeat" : undefined,
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

    return (
      <div className="w-full p-4">
        <div
          className="w-full rounded-xl shadow-lg overflow-hidden"
          style={{
            ...formContainerStyle,
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
          }}
        >
          {bannerUrl && (
            <div className="w-full h-24 bg-gray-100 overflow-hidden mb-2">
              <img
                src={bannerUrl}
                alt="Form banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <FormHeader theme={theme} />

          <div style={{ backgroundColor: theme?.formBackgroundColor || "#ffffff" }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {(() => {
                // Calculate all child field IDs once to avoid duplicate rendering
                const allChildIds = new Set(
                  customFields
                    .filter((f) => f.containerType && f.children)
                    .flatMap((f) => f.children || [])
                );

                return customFields.map((field) => {
                  // Skip rendering if this field is a child of a container (it will be rendered inside its parent)
                  if (allChildIds.has(field.id)) {
                    return null;
                  }

                  // Skip heading fields from rendering
                  if (field.type === "heading") {
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
                        field.layoutProps?.padding ||
                        (isRowLayout ? "0" : "16px"),
                      margin: field.layoutProps?.margin || undefined,
                      minHeight: field.layoutProps?.minHeight || undefined,
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
                        .map((id) => customFields.find((f) => f.id === id))
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

                            const fieldSpacing: React.CSSProperties = {
                              margin:
                                childField.fieldStyle?.margin || undefined,
                              padding:
                                childField.fieldStyle?.padding || undefined,
                              width: childField.fieldStyle?.width || "100%",
                              ...(childField.fieldStyle?.marginTop
                                ? { marginTop: childField.fieldStyle.marginTop }
                                : {}),
                              ...(childField.fieldStyle?.marginRight
                                ? {
                                  marginRight:
                                    childField.fieldStyle.marginRight,
                                }
                                : {}),
                              ...(childField.fieldStyle?.marginBottom
                                ? {
                                  marginBottom:
                                    childField.fieldStyle.marginBottom,
                                }
                                : {}),
                              ...(childField.fieldStyle?.marginLeft
                                ? {
                                  marginLeft:
                                    childField.fieldStyle.marginLeft,
                                }
                                : {}),
                              ...(childField.fieldStyle?.paddingTop
                                ? {
                                  paddingTop:
                                    childField.fieldStyle.paddingTop,
                                }
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
                                ? {
                                  paddingLeft:
                                    childField.fieldStyle.paddingLeft,
                                }
                                : {}),
                            };

                            if (
                              isColumnContainer &&
                              childField.bootstrapClass
                            ) {
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
                                {childField.type !== "checkbox" &&
                                  childField.type !== "divider" &&
                                  childField.type !== "spacer" &&
                                  childField.type !== "heading" &&
                                  childField.type !== "paragraph" &&
                                  childField.type !== "button" && (
                                    <label
                                      className="block font-semibold text-sm mb-1"
                                      style={{
                                        color:
                                          childField.fieldStyle?.labelColor ||
                                          theme?.labelColor ||
                                          "#374151",
                                        fontSize:
                                          theme?.labelFontSize || "14px",
                                        fontWeight:
                                          theme?.labelFontWeight || "600",
                                      }}
                                    >
                                      {childField.label}
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
                                  )}
                                <div style={{ width: "100%" }}>
                                  {renderCustomField(
                                    childField,
                                    baseInputStyle,
                                    theme,
                                    formData,
                                    setFormData
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

                  // Render regular fields
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
                      {field.type !== "checkbox" &&
                        field.type !== "divider" &&
                        field.type !== "spacer" &&
                        field.type !== "heading" &&
                        field.type !== "paragraph" &&
                        field.type !== "button" && (
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
                            {field.label}
                            {field.required && (
                              <span
                                style={{
                                  color:
                                    theme?.requiredIndicatorColor || "#ef4444",
                                  marginLeft: "4px",
                                }}
                              >
                                *
                              </span>
                            )}
                          </label>
                        )}
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
                      {/* Render fields based on type */}
                      {renderCustomField(
                        field,
                        baseInputStyle,
                        theme,
                        formData,
                        setFormData
                      )}
                    </div>
                  );
                });
              })()}

              {!customFields.some(
                (f) => f.type === "button" && f.buttonType === "submit"
              ) && (
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: theme?.formBorderColor || "#e5e7eb" }}
                  >
                    <button
                      type="submit"
                      className="w-full px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                      style={{
                        backgroundColor:
                          theme?.buttonBackgroundColor || "#3b82f6",
                        color: theme?.buttonTextColor || "#ffffff",
                        borderRadius: theme?.buttonBorderRadius || "6px",
                        padding: theme?.buttonPadding || "12px 24px",
                      }}
                    >
                      Submit Registration
                    </button>
                  </div>
                )}
            </form>

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
      </div>
    );
  }

  // Fallback to old form builder format
  const convertFormBuilderToFields = (jsonData: any): FormField[] => {
    if (!jsonData || !jsonData.formData) return [];

    const fields: FormField[] = [];

    jsonData.formData.forEach((item: any) => {
      // Check if it's a custom form field (has name property)
      const isCustomField = item.name && item.type;

      const field: any = {
        id: item.id || `field-${Date.now()}`,
        name: isCustomField
          ? item.name
          : item.id || item.name || `field-${Date.now()}`,
        type: mapFormBuilderType(item.type),
        label: item.label || item.name || "Field",
        placeholder: item.placeholder || `Enter ${item.label || "value"}`,
        required: item.required || false,
        active: true,
        description: item.description || "",
        defaultValue: item.defaultValue,
      };

      // Handle options for select/radio/checkbox
      if (item.options && Array.isArray(item.options)) {
        field.options = item.options.map((opt: any) => ({
          value: typeof opt === "string" ? opt : opt.value || opt.label,
          label: typeof opt === "string" ? opt : opt.label || opt.value,
        }));
      }

      // Handle file/image accept
      if (item.accept) {
        field.accept = item.accept;
      }

      fields.push(field);
    });

    return fields;
  };

  // Map form builder field types
  const mapFormBuilderType = (fbType: string): string => {
    const typeMap: Record<string, string> = {
      text: "text",
      email: "email",
      number: "number",
      select: "select",
      textarea: "textarea",
      checkbox: "checkbox",
      radio: "radio",
      header: "header",
      paragraph: "paragraph",
      date: "date",
      file: "file",
    };
    return typeMap[fbType] || "text";
  };

  const formFields = formBuilderData
    ? convertFormBuilderToFields(formBuilderData)
    : [];

  const handleFormSubmit = (formValues: Record<string, any>) => {
    console.log("Form submitted:", formValues);
    toast.success("Registration submitted successfully!");
  };

  const reusableFormFields = formFields.map((field) => ({
    id: field.id,
    name: field.name,
    type: field.type,
    label: field.label,
    placeholder: field.placeholder || `Enter ${field.label}`,
    required: field.required,
    active: field.active,
    options: field.options,
    description: field.description,
  }));

  // Get banner image URL
  const bannerUrl = bannerImage
    ? typeof bannerImage === "string"
      ? bannerImage
      : bannerImage instanceof File || bannerImage instanceof Blob
        ? URL.createObjectURL(bannerImage)
        : null
    : null;

  // Get background image URL
  const backgroundImageUrl = theme?.formBackgroundImage
    ? typeof theme.formBackgroundImage === "string"
      ? theme.formBackgroundImage
      : theme.formBackgroundImage instanceof File
        ? URL.createObjectURL(theme.formBackgroundImage)
        : null
    : null;

  const formContainerStyle: React.CSSProperties = {
    backgroundColor: theme?.formBackgroundColor || "#ffffff",
    backgroundImage: backgroundImageUrl
      ? `url(${backgroundImageUrl})`
      : undefined,
    backgroundSize: backgroundImageUrl ? "cover" : undefined,
    backgroundPosition: backgroundImageUrl ? "center" : undefined,
    backgroundRepeat: backgroundImageUrl ? "no-repeat" : undefined,
    padding: theme?.formPadding || "24px",
    borderRadius: theme?.formBorderRadius || "8px",
    borderColor: theme?.formBorderColor || "#e5e7eb",
    borderWidth: theme?.formBorderWidth || "1px",
    borderStyle: "solid",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: theme?.inputBackgroundColor || "#ffffff",
    borderColor: theme?.inputBorderColor || "#d1d5db",
    borderWidth: theme?.inputBorderWidth || "1px",
    borderRadius: theme?.inputBorderRadius || "6px",
    color: theme?.inputTextColor || "#111827",
    padding: theme?.inputPadding || "10px 16px",
  };

  return (
    <div className="w-full p-4">
      {/* Banner Image */}
      {bannerUrl && (
        <div className="w-full h-64 mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <img
            src={bannerUrl}
            alt="Form banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Logo */}
      {theme?.logo && (
        <div
          className="w-full mb-6 flex"
          style={{
            justifyContent:
              theme.logoPosition === "left"
                ? "flex-start"
                : theme.logoPosition === "right"
                  ? "flex-end"
                  : "center",
            paddingLeft: theme.logoPosition === "left" ? "16px" : "0",
            paddingRight: theme.logoPosition === "right" ? "16px" : "0",
          }}
        >
          <img
            src={
              typeof theme.logo === "string"
                ? theme.logo
                : theme.logo instanceof File || theme.logo instanceof Blob
                  ? URL.createObjectURL(theme.logo)
                  : ""
            }
            alt="Form logo"
            style={{
              width: theme.logoWidth || "100px",
              height: theme.logoHeight || "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <div className="rounded-lg" style={formContainerStyle}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Please fill in the registration information.
        </h3>

        {reusableFormFields.length > 0 ? (
          <ReusableRegistrationForm
            formFields={reusableFormFields}
            onSubmit={handleFormSubmit}
            submitButtonText="Register"
            isUserRegistration={isUserRegistration}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No form fields available</p>
          </div>
        )}
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
            className={`text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1 ${isLoading ? "cursor-not-allowed opacity-50" : ""
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
  const [confirmedTemplate, setConfirmedTemplate] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [getTemplatesData, setGetTemplatesData] = useState<any[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<
    string | null
  >(null);

  // State for form builder templates
  const [formBuilderTemplates, setFormBuilderTemplates] = useState<
    CustomFormTemplate[]
  >([]);

  const [isCustomFormBuilderOpen, setIsCustomFormBuilderOpen] = useState(false);
  const [editingFormBuilderTemplate, setEditingFormBuilderTemplate] =
    useState<CustomFormTemplate | null>(null);
  const [isEditFormBuilderMode, setIsEditFormBuilderMode] = useState(false);
  const [deleteFormBuilderCandidate, setDeleteFormBuilderCandidate] =
    useState<CustomFormTemplate | null>(null);
  const [isDeleteFormBuilderModalOpen, setIsDeleteFormBuilderModalOpen] =
    useState(false);

  // -------------------- HELPER FUNCTIONS FOR FORM BUILDER --------------------
  // Helper function to validate and convert form builder data
  const convertFormBuilderToFieldsForValidation = (
    jsonData: any
  ): FormField[] => {
    if (!jsonData) return [];

    let formDataArray: any[] = [];

    if (jsonData.formData && Array.isArray(jsonData.formData)) {
      formDataArray = jsonData.formData;
    } else if (Array.isArray(jsonData)) {
      formDataArray = jsonData;
    } else if (jsonData.items && Array.isArray(jsonData.items)) {
      formDataArray = jsonData.items;
    } else if (jsonData.elements && Array.isArray(jsonData.elements)) {
      formDataArray = jsonData.elements;
    }

    if (formDataArray.length === 0) return [];

    return formDataArray.map((item: any, index: number) => ({
      id: item.id || item.elementId || `field-${Date.now()}-${index}`,
      type: mapFormBuilderTypeForValidation(
        item.type || item.element || item.fieldType
      ),
      label: item.label || item.name || item.title || "Field",
      placeholder: item.placeholder || item.hint || "",
      required: item.required || item.mandatory || false,
      value: item.value || item.defaultValue || "",
      description: item.description || item.helpText || "",
      options:
        item.options || item.values
          ? (item.options || item.values).map((opt: any) =>
            typeof opt === "string" ? opt : opt.label || opt.value || opt.text
          )
          : undefined,
    }));
  };

  const mapFormBuilderTypeForValidation = (
    fbType: string
  ): FormField["type"] => {
    const typeMap: Record<string, FormField["type"]> = {
      text: "text",
      email: "email",
      number: "number",
      select: "select",
      textarea: "textarea",
      checkbox: "checkbox",
      radio: "radio",
      header: "header",
      paragraph: "paragraph",
      date: "date",
      file: "file",
    };
    return typeMap[fbType] || "text";
  };

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
      const savedTemplates = localStorage.getItem(
        `formBuilderTemplates_${effectiveEventId}`
      );
      if (savedTemplates) {
        try {
          const parsed = JSON.parse(savedTemplates);
          console.log(
            "Loaded form builder templates from localStorage:",
            parsed
          );
          // Validate and ensure data structure is correct
          const validatedTemplates = parsed.map((t: any) => ({
            ...t,
            data:
              t.data ||
              (t.formBuilderData
                ? convertFormBuilderToFieldsForValidation(t.formBuilderData)
                : []),
          }));
          setFormBuilderTemplates(validatedTemplates);
        } catch (error) {
          console.error("Error parsing saved templates:", error);
          setFormBuilderTemplates([]);
        }
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
  // const handleOpenFormBuilder = () => {
  //   setEditingFormBuilderTemplate(null);
  //   setIsEditFormBuilderMode(false);
  //   setIsFormBuilderModalOpen(true);
  // };

  const handleOpenCustomFormBuilder = (template?: CustomFormTemplate) => {
    if (template) {
      setEditingFormBuilderTemplate(template);
      setIsEditFormBuilderMode(true);
    } else {
      setEditingFormBuilderTemplate(null);
      setIsEditFormBuilderMode(false);
    }
    setIsCustomFormBuilderOpen(true);
  };

  // Helper function to compress image if too large
  const compressImageIfNeeded = async (
    base64String: string,
    maxSizeKB: number = 500
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920; // Max width or height

        // Resize if too large
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Try different quality levels until we get under maxSizeKB
        let quality = 0.9;
        let compressed = canvas.toDataURL("image/jpeg", quality);
        
        // If still too large, reduce quality
        while (
          compressed.length > maxSizeKB * 1024 &&
          quality > 0.1
        ) {
          quality -= 0.1;
          compressed = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(compressed);
      };
      img.onerror = () => resolve(base64String); // Return original if compression fails
      img.src = base64String;
    });
  };

  const handleSaveCustomForm = async (
    customFields: CustomFormField[],
    bannerImage?: File | string,
    theme?: FormTheme
  ) => {
    try {
      // Convert File to base64 string if needed
      let normalizedBannerImage: string | null = null;
      if (bannerImage) {
        if (bannerImage instanceof File) {
          // Convert File to base64 string
          normalizedBannerImage = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read banner image"));
            reader.readAsDataURL(bannerImage);
          });
          
          // Compress if larger than 500KB
          if (normalizedBannerImage.length > 500 * 1024) {
            console.log("Compressing banner image...");
            normalizedBannerImage = await compressImageIfNeeded(
              normalizedBannerImage,
              500
            );
            console.log(
              "Banner image compressed to:",
              (normalizedBannerImage.length / 1024).toFixed(2),
              "KB"
            );
          }
        } else if (typeof bannerImage === "string") {
          normalizedBannerImage = bannerImage;
          
          // Compress if larger than 500KB
          if (normalizedBannerImage.length > 500 * 1024) {
            console.log("Compressing existing banner image...");
            normalizedBannerImage = await compressImageIfNeeded(
              normalizedBannerImage,
              500
            );
            console.log(
              "Banner image compressed to:",
              (normalizedBannerImage.length / 1024).toFixed(2),
              "KB"
            );
          }
        }
      }

      // Convert CustomFormField to FormField format (for backward compatibility)
      const formFields: FormField[] = customFields
        .filter((field) => field.type !== "button" && !field.containerType) // Exclude buttons and layout containers from form fields
        .map((field) => ({
          id: field.id,
          type:
            field.type === "image" ? "file" : (field.type as FormField["type"]),
          label: field.label,
          placeholder: field.placeholder || "",
          required: field.required,
          options: field.options?.map((opt) => opt.label),
          value: field.defaultValue || "",
          description: field.description || "",
        }));

      // Store the complete custom fields data with ALL properties for exact preview rendering
      const formBuilderData = {
        formData: customFields, // Store complete CustomFormField[] with all properties
        bannerImage: normalizedBannerImage || null,
        theme: theme || undefined,
      };

      const templateData: CustomFormTemplate = {
        id: editingFormBuilderTemplate?.id || `custom-form-${Date.now()}`,
        title:
          editingFormBuilderTemplate?.title || "Custom Form Builder Template",
        data: formFields,
        formBuilderData: formBuilderData,
        bannerImage: normalizedBannerImage || null,
        theme: theme,
        createdAt:
          editingFormBuilderTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom: true,
      };

      await handleSaveFormBuilderTemplate(templateData);
      setIsCustomFormBuilderOpen(false);
      setEditingFormBuilderTemplate(null);
      setIsEditFormBuilderMode(false);
    } catch (error: any) {
      console.error("Error in handleSaveCustomForm:", error);
      toast.error(error?.message || "Failed to save form. Please try again.");
    }
  };

  const handleEditFormBuilderTemplate = (template: CustomFormTemplate) => {
    // Check if it's a custom form builder template
    if (
      template.formBuilderData?.formData &&
      Array.isArray(template.formBuilderData.formData)
    ) {
      // It's a custom form builder template
      handleOpenCustomFormBuilder(template);
    } else {
      toast.info("Legacy form templates cannot be edited. Please create a new Custom Form Template.");
    }
  };

  const handleSaveFormBuilderTemplate = async (
    template: CustomFormTemplate
  ) => {
    try {
      if (!effectiveEventId) {
        toast.error("Event ID not found");
        return;
      }

      const blobToDataUrl = (blob: Blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(blob);
        });

      const normalizeImageValue = async (
        value: unknown
      ): Promise<string | null | undefined> => {
        if (typeof value === "string") {
          // Already a base64 string or URL
          return value;
        }
        if (value instanceof File || value instanceof Blob) {
          // Convert File/Blob to base64 string
          return await blobToDataUrl(value);
        }
        if (value == null) {
          return null;
        }
        // Handles legacy corrupted values (e.g., {} after JSON.stringify)
        console.warn("Unexpected image value type:", typeof value, value);
        return null;
      };

      const normalizedBannerImage = await normalizeImageValue(
        template.bannerImage ?? template.formBuilderData?.bannerImage
      );

      // Check banner image size and warn if too large
      if (normalizedBannerImage && normalizedBannerImage.length > 5 * 1024 * 1024) {
        console.warn(
          "Banner image is large (",
          (normalizedBannerImage.length / 1024 / 1024).toFixed(2),
          "MB). This may cause save issues. Consider compressing the image."
        );
      }

      const normalizedTheme: FormTheme | undefined = template.theme
        ? {
          ...template.theme,
          logo: await normalizeImageValue(template.theme.logo),
          formBackgroundImage: await normalizeImageValue(
            template.theme.formBackgroundImage
          ),
        }
        : undefined;

      const normalizedFormBuilderData = template.formBuilderData
        ? {
          ...template.formBuilderData,
          bannerImage: normalizedBannerImage ?? null,
          theme: normalizedTheme,
        }
        : template.formBuilderData;

      const normalizedTemplate: CustomFormTemplate = {
        ...template,
        bannerImage: normalizedBannerImage ?? null,
        theme: normalizedTheme,
        formBuilderData: normalizedFormBuilderData,
      };

      // Save to API
      const templateData = {
        name: normalizedTemplate.title,
        description: `Custom form builder template: ${normalizedTemplate.title}`,
        fields: (normalizedTemplate.data || []) as FormField[],
        templateComponent: "FormBuilderTemplate",
        formBuilderData: normalizedTemplate.formBuilderData,
      };

      // Stringify the template data and check for errors
      let stringifiedContent: string;
      try {
        stringifiedContent = JSON.stringify(templateData);
        // Check if the content is too large (e.g., > 10MB)
        if (stringifiedContent.length > 10 * 1024 * 1024) {
          throw new Error(
            "Form data is too large. Please reduce the size of banner images or other assets."
          );
        }
      } catch (stringifyError: any) {
        console.error("Error stringifying template data:", stringifyError);
        if (stringifyError.message?.includes("circular")) {
          throw new Error(
            "Form data contains circular references. Please check your form configuration."
          );
        }
        throw new Error(
          `Failed to prepare form data: ${stringifyError.message || "Unknown error"}`
        );
      }

      const payload = {
        registration_template: {
          name: template.id,
          content: stringifiedContent,
          event_registration_fields_ids: [], // Form builder templates don't use API fields
          default: false,
          is_custom: true,
        },
      };

      // Log payload size for debugging
      console.log("Saving template with payload size:", stringifiedContent.length, "bytes");
      console.log("Payload structure:", {
        name: payload.registration_template.name,
        contentLength: payload.registration_template.content.length,
        hasBannerImage: !!normalizedBannerImage,
        bannerImageLength: normalizedBannerImage?.length || 0,
      });

      const response = await createTemplatePostApi(payload, effectiveEventId);
      console.log("Template saved successfully:", response);

      // Also save to localStorage for quick access
      let updatedTemplates: CustomFormTemplate[];

      if (isEditFormBuilderMode && editingFormBuilderTemplate) {
        // Update existing template
        updatedTemplates = formBuilderTemplates.map((t) =>
          t.id === editingFormBuilderTemplate.id
            ? { ...normalizedTemplate, updatedAt: new Date().toISOString() }
            : t
        );
      } else {
        // Create new template
        updatedTemplates = [...formBuilderTemplates, normalizedTemplate];
        setConfirmedTemplate(normalizedTemplate.id);
      }

      setFormBuilderTemplates(updatedTemplates);

      // Save to localStorage
      if (effectiveEventId) {
        localStorage.setItem(
          `formBuilderTemplates_${effectiveEventId}`,
          JSON.stringify(updatedTemplates)
        );
      }

      toast.success(
        `Form Builder template ${isEditFormBuilderMode ? "updated" : "saved"
        } successfully!`
      );
    } catch (error: any) {
      console.error("Error saving form builder template:", error);
      
      // Extract detailed error message
      let errorMessage = "Failed to save template. Please try again.";
      
      if (error?.response) {
        // API returned an error response
        const apiError = error.response.data;
        if (apiError?.error) {
          errorMessage = `API Error: ${apiError.error}`;
        } else if (apiError?.message) {
          errorMessage = `API Error: ${apiError.message}`;
        } else if (typeof apiError === "string") {
          errorMessage = `API Error: ${apiError}`;
        } else {
          errorMessage = `API Error: ${error.response.status} ${error.response.statusText || "Unknown error"}`;
        }
        console.error("API Error Details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: apiError,
        });
      } else if (error?.request) {
        // Request was made but no response received
        errorMessage = "Network error: No response from server. Please check your connection.";
        console.error("Network Error:", error.request);
      } else if (error?.message) {
        // Error in setting up the request or other error
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteFormBuilderTemplate = (templateId: string) => {
    const template =
      formBuilderTemplates.find((t) => t.id === templateId) || null;
    setDeleteFormBuilderCandidate(template);
    setIsDeleteFormBuilderModalOpen(true);
  };

  const cancelDeleteFormBuilderTemplate = () => {
    setIsDeleteFormBuilderModalOpen(false);
    setDeleteFormBuilderCandidate(null);
  };

  const confirmDeleteFormBuilderTemplate = () => {
    if (!deleteFormBuilderCandidate) {
      cancelDeleteFormBuilderTemplate();
      return;
    }

    const templateId = deleteFormBuilderCandidate.id;
    const updatedTemplates = formBuilderTemplates.filter(
      (template) => template.id !== templateId
    );
    setFormBuilderTemplates(updatedTemplates);

    if (confirmedTemplate === templateId) {
      setConfirmedTemplate(null);
    }

    if (effectiveEventId) {
      localStorage.setItem(
        `formBuilderTemplates_${effectiveEventId}`,
        JSON.stringify(updatedTemplates)
      );
    }

    toast.success("Template deleted successfully!");
    cancelDeleteFormBuilderTemplate();
  };

  React.useEffect(() => {
    if (!isDeleteFormBuilderModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelDeleteFormBuilderTemplate();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDeleteFormBuilderModalOpen]);

  const [isFormBuilderPreviewModalOpen, setIsFormBuilderPreviewModalOpen] =
    useState(false);
  const [previewFormBuilderTemplate, setPreviewFormBuilderTemplate] =
    useState<CustomFormTemplate | null>(null);

  // Remove unused function
  // const renderFormBuilderTemplatePreview = (template: CustomFormTemplate) => { ... }

  const handleSelectFormBuilderTemplate = (templateId: string) => {
    const template = formBuilderTemplates.find((t) => t.id === templateId);
    if (template) {
      setPreviewFormBuilderTemplate(template);
      setIsFormBuilderPreviewModalOpen(true);
    }
  };

  const handleUseFormBuilderTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      if (!effectiveEventId) throw new Error("Event ID not found");

      const template = formBuilderTemplates.find((t) => t.id === templateId);
      if (!template) throw new Error("Template not found");

      const templateData = {
        name: template.title,
        description: `Custom form builder template: ${template.title}`,
        fields: (template.data || []) as FormField[],
        templateComponent: "FormBuilderTemplate",
        formBuilderData: template.formBuilderData,
      };

      const payload = {
        registration_template: {
          name: templateId,
          content: JSON.stringify(templateData),
          event_registration_fields_ids: [],
          default: true,
          is_custom: true,
        },
      };

      await createTemplatePostApi(payload, effectiveEventId);
      toast.success("Form Builder template applied successfully!");
      setConfirmedTemplate(templateId);
      setIsFormBuilderPreviewModalOpen(false);
    } catch (error: any) {
      toast.error("Error applying template. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            {/* Custom Form Builder Card (First Position - Recommended) */}
            <div
              onClick={() => handleOpenCustomFormBuilder()}
              className="border-2 border-dashed border-green-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-green-500 hover:bg-green-50 flex flex-col items-center justify-center aspect-square relative"
            >
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-medium mb-2 text-center text-green-600">
                Custom Form Builder
              </h3>
              <p className="text-sm text-gray-500 text-center">
                Fully customizable with drag & drop, conditions, validation &
                more
              </p>
            </div>

            {/* Form Builder Template Card (Second Position) */}


            {/* Form Builder Templates */}
            {formBuilderTemplates.map((template) => {
              const FormBuilderComponent = () => (
                <FormBuilderTemplateForm
                  data={template.data}
                  eventId={effectiveEventId}
                  formBuilderData={template.formBuilderData}
                  bannerImage={template.bannerImage}
                />
              );

              // Get banner preview URL
              const bannerPreviewUrl = template.bannerImage
                ? typeof template.bannerImage === "string"
                  ? template.bannerImage
                  : template.bannerImage instanceof File ||
                    template.bannerImage instanceof Blob
                    ? URL.createObjectURL(template.bannerImage)
                    : null
                : null;

              return (
                <div
                  key={template.id}
                  className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col relative overflow-hidden ${confirmedTemplate === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-500"
                    }`}
                >
                  {/* Edit/Delete buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFormBuilderTemplate(template);
                      }}
                      className="p-1.5 bg-white rounded-lg shadow-sm text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Edit template"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFormBuilderTemplate(template.id);
                      }}
                      className="p-1.5 bg-white rounded-lg shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div
                    onClick={() =>
                      !isLoadingFormData &&
                      handleSelectFormBuilderTemplate(template.id)
                    }
                    className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50 relative"
                  >
                    {isLoadingFormData && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-20">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                      </div>
                    )}
                    {/* Always show the full form preview (banner + fields) */}
                    <div style={{scale:0.25}} className="transform pointer-events-none">
                      <div className="w-[1200px]">
                        <FormBuilderComponent />
                      </div>
                    </div>
                  </div>

                  {/* Template Title */}
                  {!bannerPreviewUrl && (
                    <div className="mt-2 text-center">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {template.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {template.data?.length || 0} fields
                      </span>
                    </div>
                  )}

                  {confirmedTemplate === template.id && (
                    <div className="mt-2 flex items-center justify-center">
                      <Check size={16} className="text-blue-500 mr-1" />
                      <span className="text-sm text-blue-500 font-medium">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Default Templates */}
            {defaultTemplates.map((tpl) => {
              const FormComponent = tpl.component;
              return (
                <div
                  key={tpl.id}
                  onClick={() => !isLoadingFormData && handleOpenModal(tpl.id)}
                  className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col ${confirmedTemplate === tpl.id
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



        {/* Delete Form Builder Template Modal */}
        {isDeleteFormBuilderModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget)
                cancelDeleteFormBuilderTemplate();
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Template
                </h3>
                <button
                  onClick={cancelDeleteFormBuilderTemplate}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {deleteFormBuilderCandidate?.title || "this template"}
                  </span>
                  ?
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This action can’t be undone.
                </p>
              </div>

              <div className="p-4 border-t flex items-center justify-end gap-3">
                <button
                  onClick={cancelDeleteFormBuilderTemplate}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFormBuilderTemplate}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Form Builder Modal */}
        {isCustomFormBuilderOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-full h-full max-w-[95vw] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden">
              <CustomFormBuilder
                initialFields={
                  editingFormBuilderTemplate?.formBuilderData?.formData
                    ? (editingFormBuilderTemplate.formBuilderData
                      .formData as CustomFormField[])
                    : []
                }
                initialBannerImage={editingFormBuilderTemplate?.bannerImage}
                initialTheme={editingFormBuilderTemplate?.theme}
                onSave={handleSaveCustomForm}
                onClose={() => {
                  setIsCustomFormBuilderOpen(false);
                  setEditingFormBuilderTemplate(null);
                  setIsEditFormBuilderMode(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Form Builder Preview Modal */}
        {isFormBuilderPreviewModalOpen && previewFormBuilderTemplate && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-[80%] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {previewFormBuilderTemplate.title}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleUseFormBuilderTemplate(
                        previewFormBuilderTemplate.id
                      )
                    }
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-pink-500 hover:bg-pink-600 text-white"
                      }`}
                  >
                    {isLoading ? "Saving..." : "Use This Template"}
                  </button>
                  <button
                    onClick={() => {
                      setIsFormBuilderPreviewModalOpen(false);
                      setPreviewFormBuilderTemplate(null);
                    }}
                    disabled={isLoading}
                    className={`text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1 ${isLoading ? "cursor-not-allowed opacity-50" : ""
                      }`}
                  >
                    <X />
                  </button>
                </div>
              </div>
              <FormBuilderTemplateForm
                data={previewFormBuilderTemplate.data}
                eventId={effectiveEventId}
                formBuilderData={previewFormBuilderTemplate.formBuilderData}
                bannerImage={previewFormBuilderTemplate.bannerImage}
                theme={previewFormBuilderTemplate.theme}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
          <button
            onClick={onPrevious}
            disabled={isLoading || isLoadingFormData}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium border text-slate-800 border-gray-300 hover:bg-gray-50 ${isLoading || isLoadingFormData
              ? "cursor-not-allowed opacity-50"
              : ""
              }`}
          >
            ← Previous
          </button>

          <button
            onClick={handleNextClick}
            disabled={!confirmedTemplate || isLoading || isLoadingFormData}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${!confirmedTemplate || isLoading || isLoadingFormData
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
