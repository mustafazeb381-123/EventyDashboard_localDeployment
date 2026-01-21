import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { createEventUser } from "@/apis/apiHelpers";
import { getAllBadges } from "@/apis/badgeService";

// Image compression utility
const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob from canvas"));
              return;
            }

            // Get file extension from original file
            const extension = file.name.split(".").pop() || "jpg";
            const compressedFile = new File(
              [blob],
              `${file.name.split(".")[0]}_compressed.${extension}`,
              {
                type: file.type,
                lastModified: Date.now(),
              }
            );

            console.log(
              `📸 Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(
                compressedFile.size / 1024
              ).toFixed(2)}KB`
            );
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => {
        reject(new Error("Could not load image"));
      };
      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };

    reader.readAsDataURL(file);
  });
};

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
  eventId: string;
  tenantUuid?: string;
}

const RegistrationFormPreview = ({
  formFields = [],
  submitButtonText = "Register",
  eventId,
  tenantUuid,
}: RegistrationFormPreviewProps) => {
  const { t, i18n } = useTranslation("registration");
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en");

  // Listen to language changes to force re-render
  useEffect(() => {
    // Update immediately when component mounts
    const initialLang = i18n.language || "en";
    setCurrentLanguage(initialLang);
    console.log("🌐 RegistrationFormPreview initialized with language:", initialLang);
    
    const handleLanguageChange = (lng: string) => {
      console.log("🌐 Language changed to:", lng);
      setCurrentLanguage(lng);
      // Force a small delay to ensure i18n is ready
      setTimeout(() => {
        setCurrentLanguage(lng);
      }, 100);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);
  
  // Helper function to get translated field label
  // Use useCallback to ensure it updates when language changes
  const getTranslatedLabel = useCallback((field: FormField): string => {
    // Normalize field name and label
    const fieldName = field.name.toLowerCase().trim();
    const fieldLabel = field.label.toLowerCase().trim();
    
    // Try multiple possible field name variations
    const possibleNames = [
      fieldName.replace(/[^a-z0-9]/g, "_"),
      fieldName.replace(/[^a-z0-9]/g, ""),
      fieldName.replace(/\s+/g, "_"),
      fieldName.replace(/\s+/g, ""),
      fieldLabel.replace(/[^a-z0-9]/g, "_"),
      fieldLabel.replace(/[^a-z0-9]/g, ""),
      fieldLabel.replace(/\s+/g, "_"),
      fieldLabel.replace(/\s+/g, ""),
      // Also try exact label match (for cases like "First name", "Last name")
      fieldLabel,
    ];
    
    // Remove duplicates and empty strings
    const uniqueNames = [...new Set(possibleNames)].filter(n => n);
    
    for (const name of uniqueNames) {
      const translationKey = `registrationForm.fieldLabels.${name}`;
      const translated = t(translationKey);
      // Check if translation exists (not the same as key and not empty)
      if (translated && translated !== translationKey && translated.trim() !== "") {
        console.log(`✅ Found translation for ${field.label}: ${translated} (key: ${translationKey}, lang: ${currentLanguage})`);
        return translated;
      }
    }
    console.log(`⚠️ No translation found for ${field.label} (field: ${field.name}, lang: ${currentLanguage}, tried keys: ${uniqueNames.join(", ")})`);
    // Fallback to original label
    return field.label;
  }, [currentLanguage, t]);

  // Helper function to get translated placeholder
  // Use useCallback to ensure it updates when language changes
  const getTranslatedPlaceholder = useCallback((field: FormField): string | undefined => {
    if (!field.placeholder) return undefined;
    
    // Normalize field name and label
    const fieldName = field.name.toLowerCase().trim();
    const fieldLabel = field.label.toLowerCase().trim();
    
    // Try multiple possible field name variations
    const possibleNames = [
      fieldName.replace(/[^a-z0-9]/g, "_"),
      fieldName.replace(/[^a-z0-9]/g, ""),
      fieldName.replace(/\s+/g, "_"),
      fieldName.replace(/\s+/g, ""),
      fieldLabel.replace(/[^a-z0-9]/g, "_"),
      fieldLabel.replace(/[^a-z0-9]/g, ""),
      fieldLabel.replace(/\s+/g, "_"),
      fieldLabel.replace(/\s+/g, ""),
      // Also try exact label match (for cases like "First name", "Last name")
      fieldLabel,
    ];
    
    // Remove duplicates and empty strings
    const uniqueNames = [...new Set(possibleNames)].filter(n => n);
    
    for (const name of uniqueNames) {
      const translationKey = `registrationForm.fieldPlaceholders.${name}`;
      const translated = t(translationKey);
      // Check if translation exists (not the same as key and not empty)
      if (translated && translated !== translationKey && translated.trim() !== "") {
        return translated;
      }
    }
    // Fallback to original placeholder
    return field.placeholder;
  }, [currentLanguage, t]);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [defaultBadgeName, setDefaultBadgeName] = useState<string | null>(null);

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

  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    setNotification({ message, type });
  };

  // Refs for file inputs
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});

  // Fetch default badge on component mount
  useEffect(() => {
    const fetchDefaultBadge = async () => {
      if (!eventId) return;

      try {
        const badges = await getAllBadges(eventId);
        const defaultBadge = badges.find(
          (badge: any) => badge.attributes?.default || badge.default
        );

        if (defaultBadge) {
          // Get the badge name from attributes
          const badgeName = defaultBadge.attributes?.name;
          setDefaultBadgeName(badgeName);
          console.log("✅ Default badge found:", badgeName);
        } else {
          console.warn("⚠️ No default badge found for this event");
        }
      } catch (error) {
        console.error("❌ Error fetching default badge:", error);
      }
    };

    fetchDefaultBadge();
  }, [eventId]);

  const handleSubmit = async () => {
    try {
      // ✅ VALIDATION: Check required fields
      const requiredFields = formFields.filter((field) => field.required);
      const missingFields = requiredFields.filter(
        (field) => !formData[field.name]
      );

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((f) => f.label).join(", ");
        showNotification(`${t("registrationForm.requiredFields")}: ${fieldNames}`, "error");
        return;
      }

      setLoading(true);

      console.log("📤 Sending data:", {
        eventId,
        tenantUuid,
        formData,
        defaultBadgeName,
      });

      const formDataToSend = new FormData();
      console.log("formData", formData);

      // Append tenant_uuid if provided
      if (tenantUuid) formDataToSend.append("tenant_uuid", tenantUuid);

      // Append user data
      formDataToSend.append("event_user[name]", formData.name);

      // ✅ Automatically send default badge NAME as user_type
      if (defaultBadgeName) {
        formDataToSend.append("event_user[user_type]", defaultBadgeName);
        console.log(
          "✅ Sending default badge name as user_type:",
          defaultBadgeName
        );
      } else {
        console.warn(
          "⚠️ No default badge name available, user_type will not be sent"
        );
      }

      formDataToSend.append("event_user[phone_number]", formData.phone_number);
      formDataToSend.append("event_user[email]", formData.email);
      if (formData.position)
        formDataToSend.append("event_user[position]", formData.position);
      if (formData.organization)
        formDataToSend.append(
          "event_user[organization]",
          formData.organization
        );

      // Append image if provided
      if (formData.image)
        formDataToSend.append("event_user[image]", formData.image);

      const response = await createEventUser(eventId, formDataToSend);

      showNotification(t("registrationForm.registrationSuccess"), "success");
      console.log("✅ User created:", response);

      // Reset form data and errors
      setFormData({});
      setFieldErrors({});

      // Clear all file inputs
      Object.values(fileInputRefs.current).forEach((input) => {
        if (input) input.value = "";
      });
    } catch (error: any) {
      console.error("❌ Error creating event user:", error?.response);
      console.log("error", error?.response);

      // Handle 422 validation errors
      if (error?.response?.status === 422) {
        const errorData = error.response?.data?.data?.errors?.errors || [];
        const errors: Record<string, string> = {};
        const errorMessages: string[] = [];

        // Map API field names to form field names (snake_case to camelCase or direct mapping)
        const fieldNameMap: Record<string, string> = {
          email: "email",
          phone_number: "phone_number",
          name: "name",
          position: "position",
          organization: "organization",
        };

        errorData.forEach(
          (err: { field: string; message: string; code?: string }) => {
            // Use field name mapping or fallback to the field name from API
            const formFieldName = fieldNameMap[err.field] || err.field;

            // Format user-friendly error messages
            let errorMessage = err.message;
            if (err.code === "taken") {
              // Customize message based on field
              const fieldLabel =
                err.field === "email"
                  ? t("registrationForm.emailTaken")
                  : err.field === "phone_number"
                  ? t("registrationForm.phoneTaken")
                  : err.field === "name"
                  ? t("registrationForm.nameTaken")
                  : err.field === "position"
                  ? t("registrationForm.positionTaken")
                  : err.field === "organization"
                  ? t("registrationForm.organizationTaken")
                  : `${err.field} ${t("registrationForm.fieldTaken")}`;
              errorMessage = fieldLabel;
            }

            errors[formFieldName] = errorMessage;
            errorMessages.push(errorMessage);
          }
        );

        setFieldErrors(errors);

        // Show toast with all validation errors
        if (errorMessages.length > 0) {
          const errorSummary =
            errorMessages.length === 1
              ? errorMessages[0]
              : `${t("registrationForm.validationFailed")}: ${errorMessages.join(", ")}`;
          showNotification(errorSummary, "error");
        } else {
          showNotification(
            error.response?.data?.data?.message ||
              t("registrationForm.validationFailed"),
            "error"
          );
        }
      } else {
        // Handle other errors
        showNotification(
          error.response?.data?.message ||
            error.response?.data?.data?.message ||
            error.message ||
            t("registrationForm.registrationFailed"),
          "error"
        );
        setFieldErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const renderField = (field: FormField & { translatedLabel?: string; translatedPlaceholder?: string }) => {
    const hasError = fieldErrors[field.name];
    const commonInputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors bg-white ${
      hasError
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    }`;

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <div>
            <input
              type={field.type}
              placeholder={field.translatedPlaceholder || getTranslatedPlaceholder(field)}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={commonInputClasses}
              dir={currentLanguage === "ar" ? "rtl" : "ltr"}
            />
            {fieldErrors[field.name] && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors[field.name]}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div>
            <textarea
              placeholder={field.translatedPlaceholder || getTranslatedPlaceholder(field)}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              rows={field.rows || 3}
              className={commonInputClasses}
              dir={currentLanguage === "ar" ? "rtl" : "ltr"}
            />
            {fieldErrors[field.name] && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors[field.name]}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div>
            <select
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={commonInputClasses}
              dir={currentLanguage === "ar" ? "rtl" : "ltr"}
            >
            <option value="">
              {(field.translatedPlaceholder || getTranslatedPlaceholder(field)) || `${t("registrationForm.selectField")} ${field.translatedLabel || getTranslatedLabel(field)}`}
            </option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors[field.name] && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors[field.name]}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div>
            <input
              type="file"
              accept={field.accept}
              ref={(el) => {
                if (el) fileInputRefs.current[field.name] = el;
              }}
              onChange={async (e) => {
                const files = e.target.files;
                if (files && files[0]) {
                  const file = files[0];

                  // Check if it's an image file
                  if (file.type.startsWith("image/")) {
                    try {
                      showNotification(t("registrationForm.compressingImage"), "info");
                      const compressedFile = await compressImage(file);
                      handleInputChange(field.name, compressedFile);
                      showNotification(t("registrationForm.imageCompressed"), "success");
                    } catch (error) {
                      console.error("Error compressing image:", error);
                      showNotification(
                        t("registrationForm.compressionError"),
                        "warning"
                      );
                      // Fallback to original file if compression fails
                      handleInputChange(field.name, file);
                    }
                  } else {
                    // Non-image file, use as is
                    handleInputChange(field.name, file);
                  }
                }
              }}
              className={`w-full text-sm border rounded-lg py-2 px-3 transition-colors text-gray-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer ${
                fieldErrors[field.name] ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors[field.name] && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors[field.name]}
              </p>
            )}
            {field.hint && !fieldErrors[field.name] && (
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
            <label className="text-sm text-gray-700" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
              {field.checkboxLabel}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Force re-render when language changes by using currentLanguage in the key
  // Use useMemo to recalculate translations when language changes
  const translatedFields = useMemo(() => {
    console.log("🔄 Recalculating translations for language:", currentLanguage, "i18n.language:", i18n.language);
    return formFields.map((field) => {
      const translatedLabel = getTranslatedLabel(field);
      const translatedPlaceholder = getTranslatedPlaceholder(field);
      console.log(`Field: ${field.name}, Label: "${field.label}" -> "${translatedLabel}", Placeholder: "${field.placeholder}" -> "${translatedPlaceholder}"`);
      return {
        ...field,
        translatedLabel,
        translatedPlaceholder,
      };
    });
  }, [formFields, currentLanguage, getTranslatedLabel, getTranslatedPlaceholder, i18n.language]);

  return (
    <div className="space-y-6" key={`form-${currentLanguage}-${formFields.length}`}>
      {translatedFields.map((field) => (
        <div key={`${field.name}-${currentLanguage}`} className={field.fullWidth ? "w-full" : ""}>
          {field.type !== "checkbox" && (
            <label className="block text-sm font-medium text-gray-700 mb-2" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
              {field.translatedLabel}
              {field.required && <span className="text-red-500 ml-1 rtl:mr-1 rtl:ml-0">*</span>}
            </label>
          )}
          {renderField(field)}
        </div>
      ))}

      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("registrationForm.submitting") : submitButtonText}
      </button>

      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : notification.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white"
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
  );
};

export default RegistrationFormPreview;
