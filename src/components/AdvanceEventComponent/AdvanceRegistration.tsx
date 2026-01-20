import React, { useEffect, useState, useRef } from "react";
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
import {
  createTemplatePostApi,
  getRegistrationFieldApi,
  getRegistrationTemplateData,
  getRegistrationFormTemplates,
  createRegistrationFormTemplate,
  updateRegistrationFormTemplate,
  deleteRegistrationFormTemplate,
  setRegistrationFormTemplateAsDefault,
  createEventUser,
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
import type { CustomFormField, FormTheme } from "./CustomFormBuilder/types";
import { FormHeader } from "./CustomFormBuilder/components/FormHeader";
import { FormButtonField } from "./CustomFormBuilder/components/FormButtonField";
import { COUNTRIES, COUNTRY_DIAL_CODES } from "@/utils/countries";

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
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  imagePreviewUrls?: Record<string, string>
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
    case "text": {
      const isPhoneVariant =
        field.inputVariant === "phone" ||
        /phone/i.test(field.label || "") ||
        /phone/i.test(field.name || "");

      if (isPhoneVariant) {
        const dialCodeKey = `${field.name}_country`;
        const countryValue = formData[dialCodeKey] || "";
        const phoneValue = formData[field.name] || "";

        return (
          <div className="flex gap-2">
            <select
              value={countryValue}
              onChange={(e) =>
                setFormData({ ...formData, [dialCodeKey]: e.target.value })
              }
              style={{
                ...fieldInputStyle,
                width: "140px",
                outline: "none",
              }}
              className="transition-all bg-white outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Code</option>
              {COUNTRY_DIAL_CODES.map((c) => (
                <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                  {c.name} ({c.dialCode})
                </option>
              ))}
            </select>
            <input
              type="tel"
              {...commonProps}
              value={phoneValue}
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }
              placeholder={field.placeholder || "+1 (555) 000-0000"}
              style={{
                ...fieldInputStyle,
                flex: 1,
                outline: "none",
              }}
              className="w-full transition-all outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        );
      }

      return (
        <input
          type="text"
          {...commonProps}
          value={formData[field.name] || ""}
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          style={fieldInputStyle}
          className="w-full transition-all outline-none focus:ring-2 focus:ring-pink-500"
        />
      );
    }
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
          className="w-full transition-all outline-none focus:ring-2 focus:ring-pink-500"
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
          className="w-full transition-all outline-none focus:ring-2 focus:ring-pink-500 resize-y"
          rows={4}
        />
      );
    case "select":
      const selectOptions =
        field.optionsSource === "countries" ||
        /country/i.test(field.label || "") ||
        /country/i.test(field.name || "")
          ? COUNTRIES.map((c) => ({ label: c.name, value: c.code }))
          : field.options || [];
      return (
        <select
          {...commonProps}
          value={formData[field.name] || ""}
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          style={fieldInputStyle}
          className="w-full transition-all outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">{field.placeholder || "Select an option..."}</option>
          {selectOptions.map((opt) => (
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
                className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
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
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-gray-700">{opt.label}</span>
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

      // For image fields, show preview if it's a File object
      // Use the preview URL from state (managed by useEffect for proper cleanup)
      const imagePreviewUrl =
        field.type !== "image"
          ? null
          : fileValue instanceof File
            ? imagePreviewUrls?.[field.name] || null
            : typeof fileValue === "string" && fileValue.trim() !== ""
              ? fileValue
              : null;

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
            {fileName && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => {
                    const newData = { ...prev };
                    delete newData[field.name];
                    return newData;
                  });
                  // Clear the file input
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
          {/* Image preview removed - don't show uploaded images */}
          {fileValue instanceof File && (
            <p className="text-xs text-gray-500 pl-1">
              File: {fileName} ({(fileValue.size / 1024).toFixed(2)} KB)
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
          {field.content || field.label || "Heading"}
        </h3>
      );
    case "helperText":
      return (
        <div
          style={{
            backgroundColor: field.fieldStyle?.backgroundColor || "transparent",
            color: field.fieldStyle?.textColor || theme?.textColor || "#111827",
            borderColor: field.fieldStyle?.borderColor || "transparent",
            borderWidth: field.fieldStyle?.borderWidth || "0px",
            borderStyle: "solid",
            borderRadius: field.fieldStyle?.borderRadius || "0px",
            padding: field.fieldStyle?.padding || "0px",
            marginTop: field.fieldStyle?.marginTop || "0px",
            marginRight: field.fieldStyle?.marginRight || "0px",
            marginBottom: field.fieldStyle?.marginBottom || "0px",
            marginLeft: field.fieldStyle?.marginLeft || "0px",
            textAlign: field.fieldStyle?.textAlign || "left",
            whiteSpace: "pre-wrap",
            width: field.fieldStyle?.width || "100%",
          }}
        >
          {field.content || ""}
        </div>
      );
    case "paragraph":
      const paragraphContent =
        formData[field.name] || field.content || field.label || "";
      return (
        <textarea
          value={paragraphContent}
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          className="w-full text-sm resize-y transition-all outline-none focus:ring-2 focus:ring-pink-500"
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
  onRegistrationSuccess?: (message: string) => void;
  onRegistrationError?: (message: string) => void;
}

export const FormBuilderTemplateForm: React.FC<
  FormBuilderTemplateFormProps
> = ({
  isUserRegistration = false,
  formBuilderData,
  bannerImage,
  theme,
  eventId,
  eventData,
  onRegistrationSuccess,
  onRegistrationError,
}: FormBuilderTemplateFormProps) => {
  // State declarations - must be before useEffects that use them
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<
    Record<string, string>
  >({});
  const imagePreviewMapRef = useRef<Map<string, { file: File; url: string }>>(
    new Map()
  );

  const [bannerBlobUrl, setBannerBlobUrl] = useState<string | null>(null);
  const [backgroundBlobUrl, setBackgroundBlobUrl] = useState<string | null>(
    null
  );
  const [logoBlobUrl, setLogoBlobUrl] = useState<string | null>(null);

  const [bannerLoadError, setBannerLoadError] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  // Maintain stable object URLs for image fields (no revoke-before-render race)
  useEffect(() => {
    const customFields = getUniqueFields(
      (formBuilderData?.formData as CustomFormField[]) || []
    );
    const imageFieldNames = new Set(
      customFields.filter((f) => f.type === "image").map((f) => f.name)
    );

    const map = imagePreviewMapRef.current;
    const nextUrls: Record<string, string> = {};

    // Update / create URLs for current image fields
    for (const field of customFields) {
      if (field.type !== "image") continue;

      const value = formData[field.name];
      if (value instanceof File) {
        const existing = map.get(field.name);
        if (existing && existing.file === value) {
          nextUrls[field.name] = existing.url;
        } else {
          if (existing) {
            URL.revokeObjectURL(existing.url);
          }
          const url = URL.createObjectURL(value);
          map.set(field.name, { file: value, url });
          nextUrls[field.name] = url;
        }
      } else {
        const existing = map.get(field.name);
        if (existing) {
          URL.revokeObjectURL(existing.url);
          map.delete(field.name);
        }
      }
    }

    // Cleanup URLs for removed image fields
    for (const [fieldName, entry] of Array.from(map.entries())) {
      if (!imageFieldNames.has(fieldName)) {
        URL.revokeObjectURL(entry.url);
        map.delete(fieldName);
      }
    }

    setImagePreviewUrls(nextUrls);
  }, [formData, formBuilderData]);

  // Cleanup all image preview URLs on unmount
  useEffect(() => {
    return () => {
      for (const { url } of imagePreviewMapRef.current.values()) {
        URL.revokeObjectURL(url);
      }
      imagePreviewMapRef.current.clear();
    };
  }, []);

  // Stable object URL for banner image (if a Blob/File is passed)
  useEffect(() => {
    if (bannerImage instanceof Blob) {
      const url = URL.createObjectURL(bannerImage);
      setBannerBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBannerBlobUrl(null);
  }, [bannerImage]);

  // Stable object URL for background image (if a File is passed)
  useEffect(() => {
    const bg = theme?.formBackgroundImage;
    if (bg instanceof Blob) {
      const url = URL.createObjectURL(bg);
      setBackgroundBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBackgroundBlobUrl(null);
  }, [theme?.formBackgroundImage]);

  // Stable object URL for logo (if a Blob/File is passed)
  useEffect(() => {
    const logo = theme?.logo;
    if (logo instanceof Blob) {
      const url = URL.createObjectURL(logo);
      setLogoBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLogoBlobUrl(null);
  }, [theme?.logo]);

  // Check if this is a custom form builder template (has CustomFormField array)
  const isCustomFormBuilder =
    formBuilderData?.formData &&
    Array.isArray(formBuilderData.formData) &&
    formBuilderData.formData.length > 0 &&
    formBuilderData.formData[0]?.name !== undefined;

  // Filter out duplicate fields by name (especially for Country/Region fields)
  // Keep only the first occurrence of each field name
  const getUniqueFields = (fields: CustomFormField[]): CustomFormField[] => {
    const seenNames = new Set<string>();
    const uniqueFields: CustomFormField[] = [];

    fields.forEach((field) => {
      // For fields with the same name, only keep the first one
      // Special handling for Country/Region - only keep one
      if (
        field.label === "Country / Region" ||
        field.name === "country" ||
        field.name?.startsWith("country")
      ) {
        if (!seenNames.has("country")) {
          seenNames.add("country");
          uniqueFields.push(field);
        }
      } else if (!seenNames.has(field.name)) {
        seenNames.add(field.name);
        uniqueFields.push(field);
      }
    });

    return uniqueFields;
  };

  // Debug logging for formBuilderData
  useEffect(() => {
    if (isUserRegistration) {
      console.log("🔍 FormBuilderTemplateForm - Data Debug:", {
        hasFormBuilderData: !!formBuilderData,
        formBuilderDataKeys: formBuilderData
          ? Object.keys(formBuilderData)
          : [],
        hasFormData: !!formBuilderData?.formData,
        formDataIsArray: Array.isArray(formBuilderData?.formData),
        formDataLength: formBuilderData?.formData?.length || 0,
        firstField: formBuilderData?.formData?.[0],
        isCustomFormBuilder,
        formBuilderDataFull: formBuilderData,
      });
    }
  }, [formBuilderData, isUserRegistration, isCustomFormBuilder]);

  // Get effective event ID - prioritize props (eventId) FIRST, then route, then eventData, then localStorage
  const { id: routeId } = useParams();

  // For user registration, prioritize eventData ID FIRST (most reliable), then eventId prop, then route
  // This ensures we use the actual database ID from the API response, not the route ID which might be different
  const effectiveEventId = isUserRegistration
    ? eventData?.id ||
      eventData?.data?.id ||
      eventId ||
      (routeId as string | undefined) ||
      eventData?.data?.attributes?.id
    : eventId ||
      (routeId as string | undefined) ||
      eventData?.id ||
      eventData?.attributes?.id ||
      eventData?.data?.id ||
      eventData?.data?.attributes?.id ||
      (typeof window !== "undefined"
        ? localStorage.getItem("create_eventId") ||
          localStorage.getItem("edit_eventId")
        : undefined);

  // Debug logging
  useEffect(() => {
    if (isUserRegistration) {
      console.log("🔍 FormBuilderTemplateForm - Event ID Debug:", {
        eventIdProp: eventId,
        routeId,
        eventDataId: eventData?.id,
        eventDataAttributesId: eventData?.attributes?.id,
        eventDataDataId: eventData?.data?.id,
        eventDataDataAttributesId: eventData?.data?.attributes?.id,
        localStorageCreate:
          typeof window !== "undefined"
            ? localStorage.getItem("create_eventId")
            : null,
        localStorageEdit:
          typeof window !== "undefined"
            ? localStorage.getItem("edit_eventId")
            : null,
        effectiveEventId,
        effectiveEventIdType: typeof effectiveEventId,
        eventDataFull: eventData,
        windowLocation:
          typeof window !== "undefined" ? window.location.href : null,
        isUserRegistration,
      });

      // Validate eventId before form is used
      if (!effectiveEventId) {
        console.warn(
          "⚠️ WARNING: No effectiveEventId found! Form submission will fail."
        );
        console.warn("⚠️ Available sources:", {
          eventIdProp: eventId,
          routeId,
          eventData,
        });
      } else {
        console.log(
          "✅ Event ID is available for submission:",
          effectiveEventId
        );
      }
    }
  }, [eventId, routeId, eventData, effectiveEventId, isUserRegistration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUserRegistration) {
      // If not user registration, just log (for preview/admin mode)
      console.log("Custom form submitted:", formData);
      showNotification("Form submitted successfully!", "success");
      return;
    }

    console.log("🚀 Form submission started:", {
      effectiveEventId,
      eventIdProp: eventId,
      routeId,
      eventData,
      hasFormData: Object.keys(formData).length > 0,
      formDataKeys: Object.keys(formData),
    });

    if (!effectiveEventId) {
      console.error("❌ Event ID not found. Available sources:", {
        eventIdProp: eventId,
        routeId,
        eventDataId: eventData?.id,
        eventDataAttributesId: eventData?.attributes?.id,
        localStorageCreate:
          typeof window !== "undefined"
            ? localStorage.getItem("create_eventId")
            : null,
        localStorageEdit:
          typeof window !== "undefined"
            ? localStorage.getItem("edit_eventId")
            : null,
      });
      showNotification(
        "Event ID not found. Cannot submit registration.",
        "error"
      );
      return;
    }

    // Get the actual event ID from eventData - match default template pattern
    // Default templates use eventData?.id where eventData is the data part
    // Since we pass eventData?.data as eventDataForForm, eventData.id is the actual event ID
    // Declare outside try block so it's accessible in catch block for error logging
    const actualEventId: string | number | undefined =
      eventData?.id || effectiveEventId;

    try {
      setIsSubmitting(true);

      // Double-check eventId before submission
      if (!actualEventId) {
        console.error(
          "❌ CRITICAL: actualEventId is missing at submission time!"
        );
        showNotification(
          "Event ID is missing. Please refresh the page.",
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      console.log("✅ Event ID validated before submission:", actualEventId);

      // Validate required fields
      const customFields = getUniqueFields(
        (formBuilderData?.formData as CustomFormField[]) || []
      );
      const requiredFields = customFields.filter(
        (field) => field.required && !field.containerType
      );
      const missingFields = requiredFields.filter((field) => {
        const value = formData[field.name];
        return !value || (typeof value === "string" && value.trim() === "");
      });

      if (missingFields.length > 0) {
        const fieldNames = missingFields
          .map((f) => f.label || f.name)
          .join(", ");
        showNotification(
          `Please fill in required fields: ${fieldNames}`,
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      // Get tenant_uuid from localStorage (same as default templates)
      const tenantUuid =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_uuid")
          : null;

      if (!actualEventId) {
        console.error(
          "❌ CRITICAL: No event ID found. Cannot submit registration.",
          {
            eventData,
            eventDataId: eventData?.id,
            eventDataDataId: eventData?.data?.id,
            effectiveEventId,
          }
        );
        showNotification(
          "Event ID not found. Please refresh the page and try again.",
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      console.log("📤 Submitting registration data:", {
        eventId: actualEventId,
        tenantUuid,
        formData,
      });

      // Create FormData for API submission - match RegistrationFormPreview pattern exactly
      const formDataToSend = new FormData();

      // ✅ Append tenant_uuid if provided (same as default templates)
      if (tenantUuid) {
        formDataToSend.append("tenant_uuid", tenantUuid);
      }

      // ✅ Map standard fields to API format (same as RegistrationFormPreview)
      // Standard fields that the API expects
      const fieldMapping: Record<string, string> = {
        name: "event_user[name]",
        firstname: "event_user[name]", // Map firstname to name
        first_name: "event_user[name]", // Map first_name to name
        fullname: "event_user[name]", // Map fullname to name
        full_name: "event_user[name]", // Map full_name to name
        email: "event_user[email]",
        email_address: "event_user[email]", // Map email_address to email
        phone_number: "event_user[phone_number]",
        phone: "event_user[phone_number]",
        phoneNumber: "event_user[phone_number]", // Map phoneNumber to phone_number
        position: "event_user[position]",
        // Note: organization field will be saved to custom_fields.title (handled below)
        company: "event_user[organization]", // Map company to organization
      };

      // ✅ Collect name fields that might be split (firstname, lastname, etc.)
      let combinedName = "";
      const nameFields = [
        "name",
        "firstname",
        "first_name",
        "fullname",
        "full_name",
      ];
      const nameValues: string[] = [];

      nameFields.forEach((fieldName) => {
        const value = formData[fieldName];
        if (value && typeof value === "string" && value.trim() !== "") {
          nameValues.push(value.trim());
        }
      });

      // Combine name fields (e.g., "John" + "Doe" = "John Doe")
      if (nameValues.length > 0) {
        combinedName = nameValues.join(" ");
      } else {
        // Fallback: check if there's a lastname field
        const lastName = formData["lastname"] || formData["last_name"];
        if (
          lastName &&
          typeof lastName === "string" &&
          lastName.trim() !== ""
        ) {
          combinedName = lastName.trim();
        }
      }

      // ✅ Always append name field (even if empty) - CRITICAL for API
      formDataToSend.append("event_user[name]", combinedName || "");

      // ✅ Always append email (even if empty) - CRITICAL for API
      const emailValue = formData["email"] || formData["email_address"];
      formDataToSend.append(
        "event_user[email]",
        emailValue && typeof emailValue === "string" ? emailValue : ""
      );

      // ✅ Always append phone_number (even if empty) - CRITICAL for API
      const phoneFieldCandidates = [
        "phone_number",
        "phone",
        "phoneNumber",
      ] as const;
      let phoneKeyUsed: (typeof phoneFieldCandidates)[number] | null = null;
      let phoneRawValue = "";
      for (const k of phoneFieldCandidates) {
        const v = formData[k];
        if (typeof v === "string" && v.trim() !== "") {
          phoneKeyUsed = k;
          phoneRawValue = v.trim();
          break;
        }
        if (typeof v === "number") {
          phoneKeyUsed = k;
          phoneRawValue = String(v);
          break;
        }
      }

      const phoneCountryCodeKeyToSkip = phoneKeyUsed
        ? `${phoneKeyUsed}_country`
        : null;
      const dialCodeValue =
        phoneCountryCodeKeyToSkip &&
        typeof formData[phoneCountryCodeKeyToSkip] === "string"
          ? String(formData[phoneCountryCodeKeyToSkip]).trim()
          : "";

      const phoneCombined =
        dialCodeValue && phoneRawValue && !/^\+/.test(phoneRawValue)
          ? `${dialCodeValue} ${phoneRawValue}`
          : phoneRawValue;

      formDataToSend.append(
        "event_user[phone_number]",
        phoneCombined ? String(phoneCombined) : ""
      );

      // ✅ Append optional standard fields if they have values
      if (formData["position"]) {
        formDataToSend.append(
          "event_user[position]",
          String(formData["position"])
        );
      }

      // ✅ Save organization field to both custom_fields.title AND event_user[organization]
      const orgValue = formData["organization"];
      if (orgValue) {
        // Save to custom_fields.title (for display in registered users table)
        formDataToSend.append(
          "event_user[custom_fields][title]",
          String(orgValue)
        );
        // Also save to event_user[organization] (standard field)
        formDataToSend.append("event_user[organization]", String(orgValue));
      }

      // Handle company field separately (if it exists, save to event_user[organization])
      const companyValue = formData["company"];
      if (companyValue && !orgValue) {
        // Only if organization wasn't already set
        formDataToSend.append("event_user[organization]", String(companyValue));
      }

      // ✅ Handle image/file upload (same as RegistrationFormPreview)
      // Map common image field names to the standard "image" field
      const imageFieldNames = [
        "image",
        "photo",
        "profile_image",
        "profileImage",
        "avatar",
        "picture",
      ];
      let imageAppended = false;

      // First, check all custom fields for image/file types
      customFields.forEach((field) => {
        if (field.type === "image" || field.type === "file") {
          const imageValue = formData[field.name];
          // If field name matches any image field name OR it's the first image field found
          if (
            imageFieldNames.includes(field.name.toLowerCase()) ||
            (!imageAppended && imageValue instanceof File)
          ) {
            if (imageValue instanceof File) {
              formDataToSend.append("event_user[image]", imageValue);
              console.log(
                `✅ Appending image field '${field.name}' to event_user[image]:`,
                imageValue.name,
                `(${(imageValue.size / 1024).toFixed(2)}KB)`
              );
              imageAppended = true;
            } else if (typeof imageValue === "string") {
              console.warn(
                `Image field '${field.name}' is a base64 string, skipping upload`
              );
            }
          }
        }
      });

      // Also check formData directly for any image field names (fallback)
      if (!imageAppended) {
        for (const imageFieldName of imageFieldNames) {
          const imageValue = formData[imageFieldName];
          if (imageValue instanceof File) {
            formDataToSend.append("event_user[image]", imageValue);
            console.log(
              `✅ Appending image from '${imageFieldName}' to event_user[image]:`,
              imageValue.name,
              `(${(imageValue.size / 1024).toFixed(2)}KB)`
            );
            imageAppended = true;
            break;
          }
        }
      }

      // If still no image found, check for any File object in formData (last resort)
      if (!imageAppended) {
        for (const [key, value] of Object.entries(formData)) {
          if (
            value instanceof File &&
            (value.type.startsWith("image/") ||
              key.toLowerCase().includes("image") ||
              key.toLowerCase().includes("photo"))
          ) {
            formDataToSend.append("event_user[image]", value);
            console.log(
              `✅ Appending image from '${key}' to event_user[image]:`,
              value.name,
              `(${(value.size / 1024).toFixed(2)}KB)`
            );
            imageAppended = true;
            break;
          }
        }
      }

      // Debug: Log all image/file fields found in formData
      console.log(
        "🔍 Image/File fields in formData:",
        Object.keys(formData)
          .filter((key) => {
            const value = formData[key];
            return (
              value instanceof File ||
              (typeof value === "object" && value?.name)
            );
          })
          .map((key) => ({
            fieldName: key,
            value:
              formData[key] instanceof File
                ? `File: ${formData[key].name} (${(formData[key].size / 1024).toFixed(2)}KB)`
                : formData[key],
          }))
      );

      // ✅ Append any other custom fields that don't match standard fields
      // These will be stored as custom field data
      customFields.forEach((field) => {
        if (
          field.containerType ||
          field.type === "heading" ||
          field.type === "paragraph" ||
          field.type === "divider" ||
          field.type === "spacer" ||
          field.type === "button" ||
          field.type === "helperText" ||
          field.type === "table"
        ) {
          return; // Skip non-input fields
        }

        const fieldName = field.name;
        const value = formData[fieldName];

        // Skip phone dial-code helper field when we already combined it
        if (
          phoneCountryCodeKeyToSkip &&
          fieldName === phoneCountryCodeKeyToSkip
        ) {
          return;
        }

        // Skip if already handled by standard fields (including "image" field)
        // Also skip "organization" field as it's handled separately (saved to both custom_fields.title and event_user[organization])
        if (
          fieldMapping[fieldName] ||
          fieldName === "image" ||
          fieldName === "organization"
        ) {
          return;
        }

        // Skip if no value
        if (value === undefined || value === null || value === "") {
          return;
        }

        // Handle file/image fields - append File objects directly
        if (value instanceof File) {
          // For image/file type fields, append to custom_fields
          formDataToSend.append(
            `event_user[custom_fields][${fieldName}]`,
            value
          );
        } else {
          // For other field types, convert to string
          formDataToSend.append(
            `event_user[custom_fields][${fieldName}]`,
            String(value)
          );
        }
      });

      console.log("📤 Submitting to API:", {
        eventId: actualEventId,
        eventIdType: typeof actualEventId,
        tenantUuid,
        apiEndpoint: `/events/${actualEventId}/event_users`,
        formDataKeys: Array.from(formDataToSend.keys()),
      });
      console.log("📤 FormData contents:", {
        tenant_uuid: formDataToSend.get("tenant_uuid"),
        name: formDataToSend.get("event_user[name]"),
        email: formDataToSend.get("event_user[email]"),
        phone_number: formDataToSend.get("event_user[phone_number]"),
        position: formDataToSend.get("event_user[position]"),
        organization: formDataToSend.get("event_user[organization]"),
        hasImage: formDataToSend.has("event_user[image]"),
        allFields: Array.from(formDataToSend.entries()).map(([key, value]) => ({
          key,
          value:
            value instanceof File
              ? `File: ${value.name} (${(value.size / 1024).toFixed(2)}KB)`
              : value,
        })),
      });

      const response = await createEventUser(
        String(actualEventId),
        formDataToSend
      );

      console.log("✅ Registration successful:", response);

      // Call success callback if provided (for hard toast in UserRegistration)
      if (onRegistrationSuccess) {
        onRegistrationSuccess("Registration submitted successfully!");
      } else {
        showNotification("Registration submitted successfully!", "success");
      }

      // Reset form
      setFormData({});

      // Optionally redirect or show success message
      // You can add navigation here if needed
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        eventIdUsed: actualEventId,
        effectiveEventId,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
        fullUrl:
          error?.config?.baseURL && error?.config?.url
            ? `${error.config.baseURL}${error.config.url}`
            : null,
        request: error?.request,
        code: error?.code,
      });

      let errorMessage = "Failed to submit registration. Please try again.";

      // Handle network errors (no response received)
      if (error?.request && !error?.response) {
        errorMessage =
          "Network error: Unable to connect to the server. Please check your internet connection and try again.";
        console.error("❌ Network Error - No response from server:", {
          eventId: actualEventId,
          url: error?.config?.url,
          baseURL: error?.config?.baseURL,
        });
      }
      // Handle response errors (server responded with error)
      else if (error?.response?.data) {
        const apiError = error.response.data;

        // Check for error field (could be string, object, or array)
        if (apiError.error) {
          if (typeof apiError.error === "string") {
            errorMessage = `Registration failed: ${apiError.error}`;
          } else if (Array.isArray(apiError.error)) {
            errorMessage = `Registration failed: ${apiError.error.join(", ")}`;
          } else {
            errorMessage = `Registration failed: ${JSON.stringify(apiError.error)}`;
          }
        }
        // Check for message field
        else if (apiError.message) {
          errorMessage = `Registration failed: ${apiError.message}`;
        }
        // Check for errors object (validation errors)
        else if (apiError.errors) {
          const errorMessages: string[] = [];
          Object.keys(apiError.errors).forEach((field) => {
            const fieldErrors = apiError.errors[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((err: string) => {
                errorMessages.push(`${field}: ${err}`);
              });
            } else {
              errorMessages.push(`${field}: ${fieldErrors}`);
            }
          });
          errorMessage = `Validation failed:\n${errorMessages.join("\n")}`;
        }
      }
      // Handle network errors (no response received from server)
      else if (error?.request && !error?.response) {
        errorMessage =
          "Network error: Unable to connect to the server. Please check your internet connection and try again.";
        console.error("❌ Network Error - No response from server:", {
          eventId: actualEventId,
          url: error?.config?.url,
          baseURL: error?.config?.baseURL,
          fullUrl:
            error?.config?.baseURL && error?.config?.url
              ? `${error.config.baseURL}${error.config.url}`
              : null,
        });
      } else if (error?.message) {
        errorMessage = `Registration failed: ${error.message}`;
      }

      // If it's a 404, it might be an event ID issue or endpoint issue
      if (error?.response?.status === 404) {
        const requestedUrl = error?.config?.url || error?.response?.config?.url;
        const baseURL = error?.config?.baseURL;
        const fullUrl =
          baseURL && requestedUrl
            ? `${baseURL}${requestedUrl.startsWith("/") ? "" : "/"}${requestedUrl}`
            : requestedUrl;
        const eventIdUsed =
          actualEventId || effectiveEventId || eventId || routeId;
        const responseData = error?.response?.data;

        console.error("❌ 404 Error - Event Not Found:", {
          eventIdUsed,
          requestedUrl,
          baseURL,
          fullUrl,
          responseData,
          status: error?.response?.status,
          hasToken: !!localStorage.getItem("token"),
        });

        // Try to extract backend error message
        let backendMessage = "";
        if (responseData) {
          if (responseData.error) {
            backendMessage =
              typeof responseData.error === "string"
                ? responseData.error
                : JSON.stringify(responseData.error);
          } else if (responseData.message) {
            backendMessage = responseData.message;
          } else if (responseData.errors) {
            backendMessage = JSON.stringify(responseData.errors);
          }
        }

        errorMessage = backendMessage
          ? `Registration failed: ${backendMessage}`
          : `Event not found (ID: ${eventIdUsed}).\n\nPlease verify:\n1. The event ID is correct\n2. The event exists\n3. You have access to this event\n\nAPI URL: ${fullUrl || requestedUrl}`;
      }

      // Call error callback if provided (for hard toast in UserRegistration)
      if (onRegistrationError) {
        onRegistrationError(errorMessage);
      } else {
        showNotification(errorMessage, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render custom form builder template (exactly like preview)
  if (isCustomFormBuilder) {
    const allFields = (formBuilderData.formData as CustomFormField[]) || [];
    const customFields = getUniqueFields(allFields);

    // Debug: Log fields before and after getUniqueFields
    console.log("🔍 FormBuilderTemplateForm - Field Processing:", {
      totalFieldsBefore: allFields.length,
      totalFieldsAfter: customFields.length,
      hasTitleFieldBefore: allFields.some(
        (f) => f.name === "title" || f.label === "Title"
      ),
      hasTitleFieldAfter: customFields.some(
        (f) => f.name === "title" || f.label === "Title"
      ),
      titleFieldBefore: allFields.find(
        (f) => f.name === "title" || f.label === "Title"
      ),
      titleFieldAfter: customFields.find(
        (f) => f.name === "title" || f.label === "Title"
      ),
      allFieldNames: customFields.map((f) => ({
        name: f.name,
        label: f.label,
        type: f.type,
      })),
    });

    const bannerUrl =
      bannerImage &&
      typeof bannerImage === "string" &&
      bannerImage.trim() !== ""
        ? bannerImage
        : bannerBlobUrl;

    const backgroundImageUrl =
      theme?.formBackgroundImage &&
      typeof theme.formBackgroundImage === "string" &&
      theme.formBackgroundImage.trim() !== ""
        ? theme.formBackgroundImage
        : backgroundBlobUrl;

    const logoUrl =
      theme?.logo && typeof theme.logo === "string" && theme.logo.trim() !== ""
        ? theme.logo
        : logoBlobUrl;

    // If the src changes, allow the image to render again
    useEffect(() => {
      setBannerLoadError(false);
    }, [bannerUrl]);
    useEffect(() => {
      setLogoLoadError(false);
    }, [logoUrl]);

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
          {bannerUrl && !bannerLoadError && (
            <div className="w-full h-[300px] bg-gray-100 overflow-hidden mb-2">
              <img
                src={bannerUrl}
                alt="Form banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Banner image failed to load:", bannerUrl);
                  setBannerLoadError(true);
                }}
                onLoad={() => {
                  console.log("Banner image loaded successfully:", bannerUrl);
                  setBannerLoadError(false);
                }}
              />
            </div>
          )}

          {bannerUrl && bannerLoadError && (
            <div className="w-full h-[300px] bg-gray-100 overflow-hidden mb-2 flex items-center justify-center">
              <span className="text-sm text-gray-500">
                Banner failed to load
              </span>
            </div>
          )}

          {/* Logo - render directly if theme has logo, otherwise FormHeader will handle it */}
          {logoUrl && !logoLoadError && (
            <div
              className="w-full mb-4 flex"
              style={{
                justifyContent:
                  theme?.logoPosition === "right"
                    ? "flex-end"
                    : theme?.logoPosition === "center"
                      ? "center"
                      : "flex-start",
                paddingLeft:
                  theme?.logoPosition === "right" ||
                  theme?.logoPosition === "center"
                    ? "0"
                    : "16px",
                paddingRight: theme?.logoPosition === "right" ? "16px" : "0",
              }}
            >
              <img
                src={logoUrl}
                alt="Form logo"
                style={{
                  width: theme?.logoWidth || "100px",
                  height: theme?.logoHeight || "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
                onError={() => {
                  console.error("Logo image failed to load:", logoUrl);
                  setLogoLoadError(true);
                }}
                onLoad={() => {
                  console.log("Logo image loaded successfully:", logoUrl);
                  setLogoLoadError(false);
                }}
              />
            </div>
          )}

          {logoUrl && logoLoadError && (
            <div className="w-full mb-4 flex items-center justify-center">
              <span className="text-sm text-gray-500">Logo failed to load</span>
            </div>
          )}

          <FormHeader theme={theme} />

          <div
            style={{ backgroundColor: theme?.formBackgroundColor || "#ffffff" }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {(() => {
                // Calculate all child field IDs once to avoid duplicate rendering
                const allChildIds = new Set(
                  customFields
                    .filter((f) => f.containerType && f.children)
                    .flatMap((f) => f.children || [])
                );

                // Track rendered field IDs to prevent duplicates
                const renderedFieldIds = new Set<string>();

                // Debug: Log all fields before rendering
                console.log("🔍 Rendering custom form fields:", {
                  totalFields: customFields.length,
                  fields: customFields.map((f) => ({
                    id: f.id,
                    name: f.name,
                    type: f.type,
                    label: f.label,
                    isChild: allChildIds.has(f.id),
                    isHeading: f.type === "heading",
                  })),
                });

                return customFields.map((field) => {
                  // Skip rendering if this field is a child of a container (it will be rendered inside its parent)
                  if (allChildIds.has(field.id)) {
                    return null;
                  }

                  // Skip heading fields from rendering (but allow other text fields like "title")
                  if (field.type === "heading") {
                    return null;
                  }

                  // Skip if this field has already been rendered (prevent duplicates)
                  if (renderedFieldIds.has(field.id)) {
                    return null;
                  }

                  // Mark this field as rendered
                  renderedFieldIds.add(field.id);

                  // Debug: Log when rendering title field
                  if (field.name === "title" || field.label === "Title") {
                    console.log("✅ Rendering title field:", {
                      id: field.id,
                      name: field.name,
                      type: field.type,
                      label: field.label,
                    });
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
                            // Mark child field as rendered to prevent duplicates
                            renderedFieldIds.add(childField.id);
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
                                    setFormData,
                                    imagePreviewUrls
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
                        setFormData,
                        imagePreviewUrls
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
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        theme?.buttonBackgroundColor || "#3b82f6",
                      color: theme?.buttonTextColor || "#ffffff",
                      borderRadius: theme?.buttonBorderRadius || "6px",
                      padding: theme?.buttonPadding || "12px 24px",
                    }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
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
    showNotification("Registration submitted successfully!", "success");
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
    ? typeof bannerImage === "string" && bannerImage.trim() !== ""
      ? bannerImage
      : bannerImage instanceof File || bannerImage instanceof Blob
        ? URL.createObjectURL(bannerImage)
        : null
    : null;

  // Get background image URL
  const backgroundImageUrl = theme?.formBackgroundImage
    ? typeof theme.formBackgroundImage === "string" &&
      theme.formBackgroundImage.trim() !== ""
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
            onError={(e) => {
              console.error("Banner image failed to load:", bannerUrl);
              e.currentTarget.style.display = "none";
            }}
            onLoad={() => {
              console.log("Banner image loaded successfully:", bannerUrl);
            }}
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
              typeof theme.logo === "string" && theme.logo.trim() !== ""
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
            onError={(e) => {
              console.error("Logo image failed to load:", theme.logo);
              e.currentTarget.style.display = "none";
            }}
            onLoad={() => {
              console.log("Logo image loaded successfully:", theme.logo);
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
  currentStep,
  totalSteps,
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
  // Track which system was just selected to handle priority when both have default: true
  const [lastSelectedSystem, setLastSelectedSystem] = useState<
    "default" | "custom" | null
  >(null);
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
  const [isDeletingFormBuilder, setIsDeletingFormBuilder] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => {
    setNotification({ message, type });
  };

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
      console.log("Name of template:", nameOfTemplate);
      setSelectedTemplateName(nameOfTemplate);
      // Don't set confirmedTemplate here - let checkAndSetDefaultTemplate handle it
      // It will check both systems and set the correct default
      setGetTemplatesData(templateData);
    } catch (error) {
      showNotification("Failed to fetch template data", "error");
    }
  };

  // Transform API response to component format
  const transformApiTemplateToComponent = (
    apiTemplate: any
  ): CustomFormTemplate => {
    const attrs = apiTemplate.attributes || {};
    const formData = attrs.form_template_data || {};

    // Extract fields from formData - could be in fields or formBuilderData.formData
    const fields = formData.formBuilderData?.formData || formData.fields || [];

    // Get banner image - API stores images as ActiveStorage blobs and returns URLs in attributes
    // Always prefer URLs from attributes (they're the source of truth after API processing)
    const bannerImage = attrs.banner_image || null;

    // Get theme data - merge from formData.theme and attributes
    const themeFromFormData =
      formData.theme || formData.formBuilderData?.theme || {};
    const theme: FormTheme = {
      ...themeFromFormData,
      // Always prefer URLs from API attributes (ActiveStorage URLs are the source of truth)
      logo: attrs.logo || null,
      formBackgroundImage: attrs.form_background_image || null,
    };

    // Debug logging
    console.log("Transforming template:", {
      id: apiTemplate.id,
      name: attrs.name,
      banner_image: attrs.banner_image,
      logo: attrs.logo,
      form_background_image: attrs.form_background_image,
      hasFormData: !!formData,
    });

    // Reconstruct formBuilderData structure
    const formBuilderData = {
      formData: fields,
      bannerImage: bannerImage,
      theme: theme,
    };

    return {
      id: apiTemplate.id.toString(),
      title: attrs.name || "Untitled Template",
      data:
        fields.length > 0
          ? convertFormBuilderToFieldsForValidation({ formData: fields })
          : [],
      formBuilderData: formBuilderData,
      bannerImage: bannerImage,
      theme: theme,
      createdAt: attrs.created_at || new Date().toISOString(),
      updatedAt: attrs.updated_at || new Date().toISOString(),
      isCustom: true,
    };
  };

  // Check which template system has the default template and update confirmedTemplate
  // This function checks the API's default: true/false flag to determine selection
  const checkAndSetDefaultTemplate = async () => {
    if (!effectiveEventId) return;

    try {
      // Check both systems in parallel
      const [customTemplatesResponse, oldTemplateResponse] =
        await Promise.allSettled([
          getRegistrationFormTemplates(effectiveEventId),
          getRegistrationTemplateData(effectiveEventId),
        ]);

      // Check custom form builder templates - look for default: true
      let defaultCustomTemplate = null;
      if (customTemplatesResponse.status === "fulfilled") {
        const customTemplates = customTemplatesResponse.value?.data?.data || [];
        defaultCustomTemplate = customTemplates.find(
          (t: any) => t.attributes?.default === true
        );
        console.log("Custom templates default check:", {
          total: customTemplates.length,
          defaultFound: !!defaultCustomTemplate,
          defaultId: defaultCustomTemplate?.id,
          allDefaults: customTemplates
            .filter((t: any) => t.attributes?.default === true)
            .map((t: any) => ({ id: t.id, name: t.attributes?.name })),
        });
      }

      // Check old template system - look for default: true
      let defaultOldTemplate = null;
      if (oldTemplateResponse.status === "fulfilled") {
        const oldTemplate = oldTemplateResponse.value?.data?.data;
        if (oldTemplate && oldTemplate.attributes?.default === true) {
          defaultOldTemplate = oldTemplate;
        }
        console.log("Old template default check:", {
          exists: !!oldTemplate,
          default: oldTemplate?.attributes?.default,
          name: oldTemplate?.attributes?.name,
        });
      }

      // Determine which one is default based on API's default: true/false flag
      // Only one can be selected at a time (either default OR custom, not both)
      // Priority: If both exist, prioritize the one that was most recently set
      // But typically backend ensures only one has default: true

      if (defaultOldTemplate && defaultCustomTemplate) {
        // Both are marked default - determine which was last selected
        // Priority: 1) lastSelectedSystem (if set), 2) updated_at timestamp (most recent)
        const customUpdatedAt = defaultCustomTemplate.attributes?.updated_at;
        const oldUpdatedAt = defaultOldTemplate.attributes?.updated_at;

        let shouldUseCustom = false;

        if (lastSelectedSystem === "custom") {
          // User just selected a custom template - prioritize it
          shouldUseCustom = true;
          console.warn(
            "⚠️ Both systems have default: true - using custom template (lastSelectedSystem: custom):",
            defaultCustomTemplate.id
          );
        } else if (lastSelectedSystem === "default") {
          // User just selected a default template - prioritize it
          shouldUseCustom = false;
          console.warn(
            "⚠️ Both systems have default: true - using default template (lastSelectedSystem: default):",
            defaultOldTemplate.attributes?.name
          );
        } else if (customUpdatedAt && oldUpdatedAt) {
          // No lastSelectedSystem - use timestamp comparison (most recent = last selected)
          const customDate = new Date(customUpdatedAt);
          const oldDate = new Date(oldUpdatedAt);

          // Use the one with the most recent timestamp (last selected)
          shouldUseCustom = customDate > oldDate;
          console.warn(
            "⚠️ Both systems have default: true - using",
            shouldUseCustom ? "custom" : "default",
            "template (newer timestamp):",
            {
              custom: customUpdatedAt,
              old: oldUpdatedAt,
              customDate: customDate.toISOString(),
              oldDate: oldDate.toISOString(),
              customIsNewer: customDate > oldDate,
            }
          );
        } else {
          // No timestamps or lastSelectedSystem - default to custom if it exists
          shouldUseCustom = true;
          console.warn(
            "⚠️ Both systems have default: true but no timestamps/lastSelectedSystem - defaulting to custom template"
          );
        }

        if (shouldUseCustom) {
          const customTemplateId = defaultCustomTemplate.id.toString();
          setConfirmedTemplate(customTemplateId);
        } else {
          const templateName = defaultOldTemplate.attributes?.name;
          setConfirmedTemplate(templateName);
        }
      } else if (defaultOldTemplate) {
        // Only old template system has default: true
        const templateName = defaultOldTemplate.attributes?.name;
        console.log(
          "✅ Default template selected (old system) - default: true:",
          templateName
        );
        setConfirmedTemplate(templateName);
      } else if (defaultCustomTemplate) {
        // Only custom template has default: true
        const customTemplateId = defaultCustomTemplate.id.toString();
        console.log("✅ Custom template selected - default: true:", {
          id: customTemplateId,
          idType: typeof customTemplateId,
          name: defaultCustomTemplate.attributes?.name,
          default: defaultCustomTemplate.attributes?.default,
          rawId: defaultCustomTemplate.id,
        });
        setConfirmedTemplate(customTemplateId);
        console.log("✅ Updated confirmedTemplate to:", customTemplateId);
      } else {
        // No template has default: true
        console.log("ℹ️ No template has default: true in either system");
        // Clear confirmedTemplate if nothing is selected
        setConfirmedTemplate(null);
      }

      // Log final state for debugging
      console.log(
        "📊 Final selection state after checkAndSetDefaultTemplate:",
        {
          confirmedTemplate,
          hasDefaultOld: !!defaultOldTemplate,
          hasDefaultCustom: !!defaultCustomTemplate,
          lastSelectedSystem,
        }
      );

      // Don't clear lastSelectedSystem immediately - keep it until next selection
      // This ensures the selection persists and works correctly
      // It will be updated when user selects a different template
    } catch (error: any) {
      console.error("Error checking default template:", error);
      // Don't show error toast - this is a background check
    }
  };

  // Load form builder templates from API
  const loadFormBuilderTemplates = async () => {
    if (!effectiveEventId) return;

    try {
      setIsLoadingFormData(true);
      const response = await getRegistrationFormTemplates(effectiveEventId);
      const templates = response?.data?.data || [];

      console.log("Loaded form builder templates from API:", templates);
      console.log(
        "Templates with default flag:",
        templates.map((t: any) => ({
          id: t.id,
          name: t.attributes?.name,
          default: t.attributes?.default,
        }))
      );

      // Transform API templates to component format
      const transformedTemplates = templates.map(
        transformApiTemplateToComponent
      );

      // Validate and ensure data structure is correct
      const validatedTemplates = transformedTemplates.map((t: any) => ({
        ...t,
        data:
          t.data ||
          (t.formBuilderData
            ? convertFormBuilderToFieldsForValidation(t.formBuilderData)
            : []),
      }));

      setFormBuilderTemplates(validatedTemplates);

      // Check which system has the default template based on API's default: true/false flag
      // This ensures UI reflects the API state
      await checkAndSetDefaultTemplate();
    } catch (error: any) {
      console.error("Error loading form builder templates:", error);
      showNotification(
        "Failed to load form templates. Please try again.",
        "error"
      );
      setFormBuilderTemplates([]);
    } finally {
      setIsLoadingFormData(false);
    }
  };

  useEffect(() => {
    const initializeTemplates = async () => {
      await Promise.all([
        getCreateTemplateApiData(),
        loadFormBuilderTemplates(),
      ]);
      // After both are loaded, check which system has the default
      await checkAndSetDefaultTemplate();
    };

    if (effectiveEventId) {
      initializeTemplates();
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
        while (compressed.length > maxSizeKB * 1024 && quality > 0.1) {
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
    theme?: FormTheme,
    templateName?: string
  ) => {
    try {
      // Convert File to base64 string if needed
      let normalizedBannerImage: string | null = null;
      if (bannerImage) {
        if (bannerImage instanceof File) {
          // Convert File to base64 string
          normalizedBannerImage = await new Promise<string>(
            (resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () =>
                reject(new Error("Failed to read banner image"));
              reader.readAsDataURL(bannerImage);
            }
          );

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
          templateName?.trim() ||
          editingFormBuilderTemplate?.title ||
          "Custom Form Builder Template",
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
      showNotification(
        error?.message || "Failed to save form. Please try again.",
        "error"
      );
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
      showNotification(
        "Legacy form templates cannot be edited. Please create a new Custom Form Template.",
        "info"
      );
    }
  };

  const handleSaveFormBuilderTemplate = async (
    template: CustomFormTemplate
  ) => {
    try {
      if (!effectiveEventId) {
        showNotification("Event ID not found", "error");
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
      if (
        normalizedBannerImage &&
        normalizedBannerImage.length > 5 * 1024 * 1024
      ) {
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

      // Prepare form template data for API
      // Always use the complete formBuilderData.formData (CustomFormField[]) which contains ALL properties
      // This includes fieldStyle, layoutProps, conditions, bootstrapClass, etc.
      const fields = Array.isArray(normalizedFormBuilderData?.formData)
        ? normalizedFormBuilderData.formData // Full CustomFormField[] with all properties
        : Array.isArray(template.formBuilderData?.formData)
          ? template.formBuilderData.formData // Full CustomFormField[] from formBuilderData
          : Array.isArray(template.data)
            ? template.data // Fallback to simplified FormField[] if formBuilderData doesn't exist
            : [];

      // Debug: Log fields being saved, especially check for title field
      console.log("💾 Saving form fields:", {
        totalFields: fields.length,
        hasTitleField: fields.some(
          (f) => f.name === "title" || f.label === "Title"
        ),
        titleField: fields.find(
          (f) => f.name === "title" || f.label === "Title"
        ),
        allFieldNames: fields.map((f) => ({
          name: f.name,
          label: f.label,
          type: f.type,
        })),
      });

      // Clean theme object - only include string values, exclude File objects and null
      const cleanTheme: any = {};
      if (normalizedTheme) {
        // Only include logo if it's a base64 string (not File or null)
        if (normalizedTheme.logo && typeof normalizedTheme.logo === "string") {
          cleanTheme.logo = normalizedTheme.logo;
        }
        // Only include formBackgroundImage if it's a base64 string (not File or null)
        if (
          normalizedTheme.formBackgroundImage &&
          typeof normalizedTheme.formBackgroundImage === "string"
        ) {
          cleanTheme.formBackgroundImage = normalizedTheme.formBackgroundImage;
        }
        // Include color properties
        cleanTheme.primaryColor =
          normalizedTheme.buttonBackgroundColor || "#3B82F6";
        cleanTheme.secondaryColor =
          normalizedTheme.buttonHoverBackgroundColor || "#10B981";

        // Include other string-based theme properties (exclude File objects)
        Object.keys(normalizedTheme).forEach((key) => {
          const value = normalizedTheme[key as keyof FormTheme];
          // Skip if it's a File, Blob, or null
          if (
            value != null &&
            !(value instanceof File) &&
            !(value instanceof Blob)
          ) {
            // Only include string, number, boolean values
            if (
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            ) {
              cleanTheme[key] = value;
            }
          }
        });
      }

      // Validate required fields
      if (!template.title || template.title.trim() === "") {
        throw new Error(
          "Template name is required. Please provide a name for your template."
        );
      }

      // Prepare API payload - match exact API spec
      // Include formBuilderData to preserve complete field structure with all properties
      const payload = {
        registration_form_template: {
          name: template.title.trim(),
          default: isEditFormBuilderMode
            ? false
            : confirmedTemplate === template.id,
          form_template_data: {
            fields: fields, // Complete CustomFormField[] with all properties (id, type, label, name, placeholder, required, fieldStyle, layoutProps, etc.)
            formBuilderData: {
              formData: fields, // Store complete field data with all properties
              bannerImage: normalizedBannerImage || null,
              theme: cleanTheme,
            },
            // Only include bannerImage if it's a base64 string (not null or empty)
            ...(normalizedBannerImage &&
            typeof normalizedBannerImage === "string" &&
            normalizedBannerImage.trim() !== ""
              ? { bannerImage: normalizedBannerImage }
              : {}),
            theme: cleanTheme,
          },
        },
      };

      // Log payload for debugging
      console.log(
        "Saving template with payload:",
        JSON.stringify(payload, null, 2)
      );
      console.log("Payload structure:", {
        name: payload.registration_form_template.name,
        default: payload.registration_form_template.default,
        fieldsCount: fields.length,
        hasBannerImage: !!normalizedBannerImage,
        bannerImageLength: normalizedBannerImage?.length || 0,
        themeKeys: Object.keys(cleanTheme),
        firstFieldSample:
          fields.length > 0
            ? {
                id: fields[0].id,
                type: fields[0].type,
                label: fields[0].label,
                name: fields[0].name,
                hasFieldStyle: !!fields[0].fieldStyle,
                hasLayoutProps: !!fields[0].layoutProps,
                hasOptions: !!fields[0].options,
                allKeys: Object.keys(fields[0] || {}),
              }
            : null,
      });

      // Validate payload before sending
      try {
        const testStringify = JSON.stringify(payload);
        if (testStringify.length > 10 * 1024 * 1024) {
          throw new Error(
            "Payload is too large (>10MB). Please reduce image sizes."
          );
        }
      } catch (stringifyError: any) {
        console.error("Error stringifying payload:", stringifyError);
        if (stringifyError.message?.includes("circular")) {
          throw new Error(
            "Form data contains circular references. Please check your form configuration."
          );
        }
        throw new Error(
          `Failed to prepare form data: ${stringifyError.message || "Unknown error"}`
        );
      }

      // Save to API - use UPDATE if editing, CREATE if new
      let response;
      if (isEditFormBuilderMode && editingFormBuilderTemplate?.id) {
        // Update existing template
        response = await updateRegistrationFormTemplate(
          effectiveEventId,
          editingFormBuilderTemplate.id,
          payload
        );
        console.log("Template updated successfully:", response);
      } else {
        // Create new template
        response = await createRegistrationFormTemplate(
          effectiveEventId,
          payload
        );
        console.log("Template created successfully:", response);
      }

      // Reload templates from API to get the updated list
      await loadFormBuilderTemplates();

      // If this is a new template or it's being set as default, update confirmed template
      if (!isEditFormBuilderMode || confirmedTemplate === template.id) {
        const savedTemplate = response?.data?.data;
        if (savedTemplate) {
          setConfirmedTemplate(savedTemplate.id.toString());
        }
      }

      showNotification(
        `Form Builder template ${
          isEditFormBuilderMode ? "updated" : "saved"
        } successfully!`,
        "success"
      );
    } catch (error: any) {
      console.error("Error saving form builder template:", error);

      // Extract detailed error message
      let errorMessage = "Failed to save template. Please try again.";

      if (error?.response) {
        // API returned an error response
        const apiError = error.response.data;

        // Log full error details for debugging
        console.error("API Error Response (Full):", {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: apiError,
          dataStringified: JSON.stringify(apiError, null, 2),
        });

        // Handle validation errors (422)
        if (error.response.status === 422) {
          // Format validation errors - handle different error response structures
          const validationErrors: string[] = [];

          // Check for errors object
          if (apiError?.errors) {
            Object.keys(apiError.errors).forEach((field) => {
              const fieldErrors = apiError.errors[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((err: any) => {
                  const errorText =
                    typeof err === "string" ? err : JSON.stringify(err);
                  validationErrors.push(`${field}: ${errorText}`);
                });
              } else if (typeof fieldErrors === "string") {
                validationErrors.push(`${field}: ${fieldErrors}`);
              } else {
                validationErrors.push(
                  `${field}: ${JSON.stringify(fieldErrors)}`
                );
              }
            });
          }

          // Check for error array
          if (apiError?.error && Array.isArray(apiError.error)) {
            apiError.error.forEach((err: any) => {
              const errorText =
                typeof err === "string" ? err : JSON.stringify(err);
              validationErrors.push(errorText);
            });
          }

          // Check for single error message
          if (apiError?.error && typeof apiError.error === "string") {
            validationErrors.push(apiError.error);
          }

          // Check for message
          if (apiError?.message) {
            validationErrors.push(apiError.message);
          }

          // If we have validation errors, format them
          if (validationErrors.length > 0) {
            errorMessage = `Validation failed:\n${validationErrors.join("\n")}`;
          } else {
            // Fallback: try to stringify the entire error object
            errorMessage = `Validation failed: ${JSON.stringify(apiError, null, 2)}`;
          }
        } else if (apiError?.error) {
          // Handle error field (could be string, object, or array)
          if (typeof apiError.error === "string") {
            errorMessage = `API Error: ${apiError.error}`;
          } else if (Array.isArray(apiError.error)) {
            errorMessage = `API Error: ${apiError.error.join(", ")}`;
          } else {
            errorMessage = `API Error: ${JSON.stringify(apiError.error)}`;
          }
        } else if (apiError?.message) {
          errorMessage = `API Error: ${apiError.message}`;
        } else if (typeof apiError === "string") {
          errorMessage = `API Error: ${apiError}`;
        } else {
          // Last resort: stringify the entire error object
          errorMessage = `API Error (${error.response.status}): ${JSON.stringify(apiError, null, 2)}`;
        }
      } else if (error?.request) {
        // Request was made but no response received
        errorMessage =
          "Network error: No response from server. Please check your connection.";
        console.error("Network Error:", error.request);
      } else if (error?.message) {
        // Error in setting up the request or other error
        errorMessage = `Error: ${error.message}`;
      }

      showNotification(errorMessage, "error");
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

  const confirmDeleteFormBuilderTemplate = async () => {
    if (!deleteFormBuilderCandidate) {
      cancelDeleteFormBuilderTemplate();
      return;
    }

    const templateId = deleteFormBuilderCandidate.id;

    setIsDeletingFormBuilder(true);
    try {
      if (!effectiveEventId) {
        showNotification("Event ID not found", "error");
        setIsDeletingFormBuilder(false);
        cancelDeleteFormBuilderTemplate();
        return;
      }

      // Delete from API
      await deleteRegistrationFormTemplate(effectiveEventId, templateId);

      // Remove from local state
      const updatedTemplates = formBuilderTemplates.filter(
        (template) => template.id !== templateId
      );
      setFormBuilderTemplates(updatedTemplates);

      if (confirmedTemplate === templateId) {
        setConfirmedTemplate(null);
      }

      // Reload templates from API to ensure consistency
      await loadFormBuilderTemplates();

      showNotification("Template deleted successfully!", "success");
    } catch (error: any) {
      console.error("Error deleting template:", error);

      // Extract error message
      let errorMessage = "Failed to delete template. Please try again.";
      if (error?.response) {
        const apiError = error.response.data;
        if (apiError?.error) {
          errorMessage = `Error: ${apiError.error}`;
        } else if (apiError?.message) {
          errorMessage = `Error: ${apiError.message}`;
        }
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }

      showNotification(errorMessage, "error");
    } finally {
      setIsDeletingFormBuilder(false);
      cancelDeleteFormBuilderTemplate();
    }
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

      console.log("🔄 Setting custom template as default:", {
        templateId,
        eventId: effectiveEventId,
        templateName: template.title,
      });

      // Track that we just selected a custom template FIRST (before API call)
      setLastSelectedSystem("custom");

      // Use SET AS DEFAULT API - this sets custom template as default (default: true)
      // Backend should automatically unset any default template in the old system
      const response = await setRegistrationFormTemplateAsDefault(
        effectiveEventId,
        templateId
      );

      console.log("✅ Custom template set as default - API response:", {
        templateId,
        response: response?.data,
        updated_at: response?.data?.data?.attributes?.updated_at,
      });

      // Set confirmedTemplate immediately (optimistic update)
      setConfirmedTemplate(templateId);

      showNotification("Custom template applied successfully", "success");

      // Close modal
      setIsFormBuilderPreviewModalOpen(false);

      // Small delay to ensure React state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Reload both systems to get updated state (with default: true/false flags)
      await Promise.all([
        loadFormBuilderTemplates(), // This will call checkAndSetDefaultTemplate internally
        getCreateTemplateApiData(),
      ]);

      // Verify state is synced (API-based check) - this will use lastSelectedSystem
      await checkAndSetDefaultTemplate();

      // Final safeguard: ensure confirmedTemplate is set to custom template
      // This prevents it from being overwritten if both systems have default: true
      setConfirmedTemplate(templateId);
      console.log("✅ Final confirmedTemplate set to custom:", templateId);
    } catch (error: any) {
      console.error("Error applying template:", error);

      // Extract detailed error message
      let errorMessage = "Error applying template. Please try again.";

      if (error?.response) {
        const apiError = error.response.data;

        // Log full error details for debugging
        console.error("API Error Response (Full):", {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: apiError,
          dataStringified: JSON.stringify(apiError, null, 2),
        });

        // Handle validation errors (422)
        if (error.response.status === 422) {
          const validationErrors: string[] = [];

          // Check for errors object (Rails-style validation errors)
          if (apiError?.errors) {
            Object.keys(apiError.errors).forEach((field) => {
              const fieldErrors = apiError.errors[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((err: any) => {
                  const errorText =
                    typeof err === "string" ? err : JSON.stringify(err);
                  validationErrors.push(`${field}: ${errorText}`);
                });
              } else if (typeof fieldErrors === "string") {
                validationErrors.push(`${field}: ${fieldErrors}`);
              } else {
                validationErrors.push(
                  `${field}: ${JSON.stringify(fieldErrors)}`
                );
              }
            });
          }

          // Check for error array
          if (apiError?.error && Array.isArray(apiError.error)) {
            apiError.error.forEach((err: any) => {
              const errorText =
                typeof err === "string" ? err : JSON.stringify(err);
              validationErrors.push(errorText);
            });
          }

          // Check for single error message
          if (apiError?.error && typeof apiError.error === "string") {
            validationErrors.push(apiError.error);
          }

          // Check for message
          if (apiError?.message) {
            validationErrors.push(apiError.message);
          }

          // If we have validation errors, format them
          if (validationErrors.length > 0) {
            errorMessage = `Validation failed:\n${validationErrors.join("\n")}`;
          } else {
            // Fallback: show the full error object as JSON
            errorMessage = `Validation failed. Details:\n${JSON.stringify(apiError, null, 2)}`;
          }
        } else if (apiError?.error) {
          // Handle error field (could be string, object, or array)
          if (typeof apiError.error === "string") {
            errorMessage = `API Error: ${apiError.error}`;
          } else if (Array.isArray(apiError.error)) {
            errorMessage = `API Error: ${apiError.error.join(", ")}`;
          } else {
            errorMessage = `API Error: ${JSON.stringify(apiError.error)}`;
          }
        } else if (apiError?.message) {
          errorMessage = `API Error: ${apiError.message}`;
        } else {
          // Last resort: stringify the entire error object
          errorMessage = `API Error (${error.response.status}): ${JSON.stringify(apiError, null, 2)}`;
        }
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }

      showNotification(errorMessage, "error");
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

      // Track that we just selected a default template FIRST (before API call)
      setLastSelectedSystem("default");

      // Set default template via API - this sets old template system as default
      const response = await createTemplatePostApi(payload, effectiveEventId);

      console.log("✅ Default template set - API response:", {
        templateId,
        response: response?.data,
        updated_at: response?.data?.data?.attributes?.updated_at,
      });

      // Unset any custom templates that have default: true to ensure mutual exclusivity
      try {
        const customTemplatesResponse =
          await getRegistrationFormTemplates(effectiveEventId);
        const customTemplates = customTemplatesResponse?.data?.data || [];
        const defaultCustomTemplates = customTemplates.filter(
          (t: any) => t.attributes?.default === true
        );

        // Unset default: false for all custom templates that have default: true
        for (const customTemplate of defaultCustomTemplates) {
          try {
            await updateRegistrationFormTemplate(
              effectiveEventId,
              customTemplate.id,
              {
                registration_form_template: {
                  name: customTemplate.attributes?.name,
                  default: false, // Explicitly unset default
                  form_template_data:
                    customTemplate.attributes?.form_template_data || {},
                },
              }
            );
            console.log(
              `✅ Unset default for custom template: ${customTemplate.id}`
            );
          } catch (error) {
            console.error(
              `Failed to unset default for custom template ${customTemplate.id}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error("Error unsetting custom templates:", error);
        // Continue - not critical
      }

      // Set confirmedTemplate immediately (optimistic update)
      setConfirmedTemplate(templateId);

      showNotification("Default template applied successfully!", "success");

      // Close modal
      handleCloseModal();

      // Small delay to ensure React state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Reload both systems to get updated state (with default: true/false flags)
      await Promise.all([
        loadFormBuilderTemplates(), // This will call checkAndSetDefaultTemplate internally
        getCreateTemplateApiData(),
      ]);

      // Verify state is synced (API-based check) - this will use lastSelectedSystem
      await checkAndSetDefaultTemplate();

      // Final safeguard: ensure confirmedTemplate is set to default template
      // This prevents it from being overwritten if both systems have default: true
      setConfirmedTemplate(templateId);
      console.log("✅ Final confirmedTemplate set to default:", templateId);
    } catch (error: any) {
      console.error("Error applying default template:", error);
      showNotification("Error applying template. Please try again.", "error");
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
      showNotification("Failed to load form data", "error");
    } finally {
      setIsLoadingFormData(false);
    }
  };

  const handleNextClick = () => {
    if (!confirmedTemplate) {
      showNotification("Please select a template before proceeding", "warning");
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
        <div className="flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row gap-2 items-center">
            <ChevronLeft onClick={onPrevious} className="cursor-pointer" />
            <p className="text-neutral-900 text-md font-poppins font-normal">
              Choose a registration form template
            </p>
          </div>

          {/* Steps */}
          {currentStep !== undefined && totalSteps !== undefined && (
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, index) => index).map(
                (step) => (
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
                    {step < totalSteps - 1 && (
                      <div
                        className={`w-8 h-0.5 mx-1 ${
                          step < currentStep ? "bg-pink-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          )}
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
              className="border-2 border-dashed border-pink-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-pink-500 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square relative"
            >
              <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </div>
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-pink-600" size={32} />
              </div>
              <h3 className="text-lg font-medium mb-2 text-center text-pink-600">
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
                  theme={template.theme}
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

              // Ensure both IDs are strings for comparison
              const templateIdStr = String(template.id);
              const isSelected = confirmedTemplate === templateIdStr;

              // Debug log for selected state
              if (isSelected) {
                console.log("🎯 Template is selected:", {
                  templateId: templateIdStr,
                  confirmedTemplate,
                  match: confirmedTemplate === templateIdStr,
                });
              }

              return (
                <div
                  key={template.id}
                  className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col relative overflow-hidden ${
                    isSelected
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-500"
                  }`}
                >
                  {/* Edit/Delete buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFormBuilderTemplate(template);
                      }}
                      className="p-1.5 bg-white rounded-lg shadow-sm text-pink-500 hover:bg-pink-50 transition-colors"
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
                    <div
                      style={{ scale: 0.25 }}
                      className="transform pointer-events-none"
                    >
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

                  {/* Selected Indicator */}
                  {isSelected && (
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

            {/* Default Templates */}
            {defaultTemplates.map((tpl) => {
              const FormComponent = tpl.component;
              return (
                <div
                  key={tpl.id}
                  onClick={() => !isLoadingFormData && handleOpenModal(tpl.id)}
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
                  disabled={isDeletingFormBuilder}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFormBuilderTemplate}
                  disabled={isDeletingFormBuilder}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingFormBuilder ? "Deleting..." : "Delete"}
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
                initialTemplateName={
                  editingFormBuilderTemplate?.title ||
                  "Custom Form Builder Template"
                }
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      isLoading
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
                    className={`text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1 ${
                      isLoading ? "cursor-not-allowed opacity-50" : ""
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

        {notification && (
          <div className="fixed top-4 right-4 z-100 animate-slide-in">
            <div
              className={`px-6 py-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : notification.type === "error"
                    ? "bg-red-500 text-white"
                    : notification.type === "warning"
                      ? "bg-yellow-500 text-white"
                      : "bg-green-500 text-white"
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}
        <style>{`
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default AdvanceRegistration;
