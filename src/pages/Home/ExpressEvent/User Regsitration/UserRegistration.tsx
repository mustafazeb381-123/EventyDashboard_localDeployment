import {
  getEventbyId,
  getRegistrationTemplateData,
  getRegistrationFieldApi,
  getDefaultRegistrationFormTemplate,
} from "@/apis/apiHelpers";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

// Import user registration templates (without admin functionality)
import TemplateFormOne from "./TemplateFormOne";
import TemplateFormTwo from "./TemplateFormTwo";
import TemplateFormThree from "./TemplateFormThree";
import TemplateFormFour from "./TemplateFormFour";
import TemplateFormFive from "./TemplateFormFive";
import TemplateFormSix from "./TemplateFormSix";
import TemplateFormSeven from "./TemplateFormSeven";

// Import custom form builder template form
import { FormBuilderTemplateForm } from "@/components/AdvanceEventComponent/AdvanceRegistration";

interface TemplateData {
  id: string;
  type: string;
  attributes: {
    name: string;
    default: boolean;
    event_id: number;
    event_registration_fields: {
      data: Array<{
        id: string;
        type: string;
        attributes: {
          active: boolean;
          custom: boolean;
          field: string;
          field_options: any;
          full_width: boolean;
          id: number;
          name: string;
          order: number;
          required: boolean;
          validation_type: string;
        };
      }>;
    };
  };
}

interface EventData {
  data: {
    id: string;
    type: string;
    attributes: any;
  };
}

function UserRegistration() {
  const { id: routeId } = useParams();
  const { i18n } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  console.log("routeId", routeId);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [registrationFields, setRegistrationFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customFormBuilderTemplate, setCustomFormBuilderTemplate] =
    useState<any>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    console.log("🔄 Changing language to:", langCode);
    i18n
      .changeLanguage(langCode)
      .then(() => {
        console.log("✅ Language changed successfully to:", langCode);
        // Force a small delay to ensure all components update
        setTimeout(() => {
          console.log(
            "🔄 Language change complete, current language:",
            i18n.language,
          );
        }, 100);
      })
      .catch((err) => {
        console.error("❌ Error changing language:", err);
      });
    setIsLangDropdownOpen(false);
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    };

    if (isLangDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangDropdownOpen]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Use primary language: single = only that language; dual = open form in primary by default
  useEffect(() => {
    const fd = customFormBuilderTemplate?.formBuilderData;
    if (!fd) return;
    const primary = fd.primaryLanguage ?? "en";
    if (fd.languageMode === "single") {
      if (i18n.language !== primary) i18n.changeLanguage(primary);
      return;
    }
    if (fd.languageMode === "dual") {
      // By default show the form in the chosen primary (Arabic or English)
      if (i18n.language !== primary) i18n.changeLanguage(primary);
    }
  }, [
    customFormBuilderTemplate?.formBuilderData?.languageMode,
    customFormBuilderTemplate?.formBuilderData?.primaryLanguage,
    customFormBuilderTemplate,
  ]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info",
  ) => {
    setNotification({ message, type });
  };

  // Get effective event ID
  const effectiveEventId = (routeId as string | undefined) || undefined;

  const getTemplateData = async () => {
    if (!effectiveEventId) {
      const errorMsg = "No event ID found";
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      // First, try to get the default template (which could be custom or old system)
      const defaultTemplateResponse =
        await getDefaultRegistrationFormTemplate(effectiveEventId);
      console.log(
        "📋 Default template response:",
        defaultTemplateResponse?.data,
      );

      const defaultTemplate = defaultTemplateResponse?.data?.data;

      if (defaultTemplate) {
        const formTemplateData =
          defaultTemplate.attributes?.form_template_data || {};
        const hasFormBuilderData = !!formTemplateData.formBuilderData;
        const hasFieldsArray =
          Array.isArray(formTemplateData.fields) &&
          formTemplateData.fields.length > 0;

        // Check if fields array contains custom form builder fields
        const hasCustomFields =
          hasFieldsArray &&
          formTemplateData.fields.some(
            (field: any) =>
              field.name &&
              (field.type === "heading" ||
                field.type === "container" ||
                field.containerType ||
                field.fieldStyle),
          );

        // Check if template name indicates it's not a default template
        const templateName = defaultTemplate.attributes?.name || "";
        const isCustomName =
          !templateName.startsWith("template-") && templateName !== "";

        // Determine if it's custom
        const isCustom =
          hasFormBuilderData ||
          hasCustomFields ||
          (hasFieldsArray && isCustomName);

        console.log("🔍 Template detection:", {
          id: defaultTemplate.id,
          name: templateName,
          hasFormBuilderData,
          hasFieldsArray,
          hasCustomFields,
          isCustomName,
          isCustom,
        });

        if (isCustom) {
          // It's a custom form builder template
          console.log("✅ Custom form builder template detected");

          // Merge logo into theme - logo can be in theme or in attributes
          const themeData = formTemplateData.theme || {};
          const logoFromAttributes = defaultTemplate.attributes?.logo || null;
          const logoFromTheme = themeData.logo || null;

          // Banner can be stored either on attributes (older) or inside form_template_data (newer/custom builder)
          const bannerFromTemplateData =
            formTemplateData.bannerImage ||
            formTemplateData.banner_image ||
            null;
          const bannerFromAttributes =
            defaultTemplate.attributes?.banner_image || null;
          const finalBannerImage =
            bannerFromTemplateData || bannerFromAttributes || null;

          // Use logo from attributes (API response) if available, otherwise use theme logo
          const finalTheme = {
            ...themeData,
            logo: logoFromAttributes || logoFromTheme || null,
          };

          console.log("🎨 Logo setup for custom template:", {
            logoFromAttributes,
            logoFromTheme,
            finalLogo: finalTheme.logo,
            hasBannerImage: !!defaultTemplate.attributes?.banner_image,
            themeKeys: Object.keys(finalTheme),
          });

          // Transform form data to update "about" field placeholder
          const formDataArray =
            formTemplateData.formBuilderData?.formData ||
            formTemplateData.fields ||
            [];
          const transformedFormData = formDataArray
            .filter((field: any) => {
              // Remove paragraph fields with unwanted content
              if (field.type === "paragraph") {
                const content = String(field.content || "").toLowerCase();
                if (content.includes("urls are hyperlinked")) {
                  return false;
                }
              }

              // Remove fields with unwanted description
              const description = String(field.description || "").toLowerCase();
              if (description.includes("urls are hyperlinked")) {
                return false;
              }

              return true;
            })
            .map((field: any) => {
              // Update placeholder for "about" field
              if (field.name === "about" && field.type === "textarea") {
                const updatedField = { ...field };

                // Remove description completely
                delete updatedField.description;

                // Clear any defaultValue
                delete updatedField.defaultValue;

                // Set placeholder to "Description..."
                updatedField.placeholder = "Description...";

                return updatedField;
              }
              return field;
            });

          setCustomFormBuilderTemplate({
            formBuilderData: {
              ...(formTemplateData.formBuilderData || {}),
              formData: transformedFormData,
            },
            bannerImage: finalBannerImage,
            logo: logoFromAttributes || logoFromTheme || null,
            theme: finalTheme, // Theme now includes logo
          });
          setTemplateData(null); // Clear old template data
        } else {
          // It's an old system template, fetch it using the old API
          console.log("✅ Old system template detected, fetching details...");
          try {
            const oldTemplateResponse =
              await getRegistrationTemplateData(effectiveEventId);
            const templateInfo = oldTemplateResponse?.data?.data;
            if (templateInfo) {
              setTemplateData(templateInfo);
              setCustomFormBuilderTemplate(null);
            } else {
              setError("No template data found");
            }
          } catch (oldError) {
            console.log("error getting old template api", oldError);
            setError("Failed to fetch template data");
          }
        }
      } else {
        // Fallback: Try old system
        console.log("⚠️ No default template, trying old system...");
        const response = await getRegistrationTemplateData(effectiveEventId);
        console.log("response of get template api ", response);

        const templateInfo = response?.data?.data;
        if (templateInfo) {
          setTemplateData(templateInfo);
          setCustomFormBuilderTemplate(null);
        } else {
          setError("No template data found");
        }
      }
    } catch (error: any) {
      console.log("error getting template api", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch template data";
      setError(errorMsg);
    }
  };

  const getEventDataById = async () => {
    if (!effectiveEventId) return;

    try {
      const response = await getEventbyId(effectiveEventId);
      console.log(
        "response event data by id in user registration form ",
        response,
      );
      setEventData(response?.data);
    } catch (error: any) {
      console.log("error in event data by id in registration form ", error);
    }
  };

  const getAllRegistrationFields = async () => {
    if (!effectiveEventId) return;

    try {
      const response = await getRegistrationFieldApi(effectiveEventId);
      console.log("All registration fields from API:", response.data);
      const allFields = response.data.data || [];
      // Sort by order
      const sortedFields = [...allFields].sort((a: any, b: any) => {
        const orderA = a.attributes?.order ?? a.order ?? 999;
        const orderB = b.attributes?.order ?? b.order ?? 999;
        return orderA - orderB;
      });
      setRegistrationFields(sortedFields);
    } catch (error: any) {
      console.log("error fetching all registration fields:", error);
      setRegistrationFields([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          getTemplateData(),
          getEventDataById(),
          getAllRegistrationFields(),
        ]);
      } catch (err: any) {
        console.error("Error loading registration form:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [effectiveEventId]);

  // Function to render the appropriate template based on template name
  const renderTemplate = () => {
    if (!templateData || !templateData.attributes) return null;

    const templateName = templateData.attributes.name;

    // Use registrationFields from API (all active fields) instead of template data
    // Template data might only have fields selected when template was created
    // We want to show ALL active fields from the registration fields API
    // The API response already has the correct structure: { id, type, attributes }
    const formFields =
      registrationFields.length > 0
        ? registrationFields // Already in correct format from API
        : templateData.attributes.event_registration_fields?.data || [];

    console.log(
      "Using fields from:",
      registrationFields.length > 0 ? "API (all fields)" : "Template data",
    );
    console.log("Total fields available:", formFields.length);
    console.log(
      "All fields:",
      formFields.map((f: any) => ({
        id: f.id,
        name: f.attributes?.name || f.attributes?.field,
        active: f.attributes?.active,
        order: f.attributes?.order,
      })),
    );

    // Filter only active fields
    const activeFields = formFields.filter((field) => {
      const isActive = field.attributes?.active === true;
      console.log(
        `Field ${
          field.attributes?.name || field.attributes?.field || field.id
        }: active=${field.attributes?.active}, order=${field.attributes?.order}`,
      );
      return isActive;
    });

    // Sort active fields by order property
    const sortedActiveFields = [...activeFields].sort((a, b) => {
      const orderA = a.attributes.order ?? 999;
      const orderB = b.attributes.order ?? 999;
      return orderA - orderB;
    });

    console.log("Template name:", templateName);
    console.log("Active fields (sorted by order):", sortedActiveFields);
    console.log("Total fields:", formFields.length);
    console.log("Active fields count:", sortedActiveFields.length);
    console.log(
      "Active fields details:",
      sortedActiveFields.map((f: any) => ({
        id: f.id,
        field: f.attributes?.field,
        name: f.attributes?.name,
        order: f.attributes?.order,
        active: f.attributes?.active,
      })),
    );

    // Process active fields into the format expected by the templates
    const processedFields = sortedActiveFields.map((field, index) => {
      console.log(`Processing field ${index + 1}:`, {
        id: field.id,
        field: field.attributes?.field,
        name: field.attributes?.name,
        order: field.attributes?.order,
      });
      const fieldName =
        field.attributes.field || field.attributes.name || "field_" + field.id;
      const validationType = field.attributes.validation_type;

      // Map validation types to input types
      let inputType = "text";
      if (fieldName === "image") {
        inputType = "file";
      } else if (validationType === "email") {
        inputType = "email";
      } else if (validationType === "numeric") {
        inputType = "tel"; // Use tel for phone numbers
      } else if (
        validationType === "alphanumeric" ||
        validationType === "alphabetic"
      ) {
        inputType = "text";
      }

      return {
        id: field.id,
        name: fieldName,
        type: inputType,
        label: field.attributes.name || "Field",
        placeholder:
          fieldName === "image"
            ? ""
            : `Enter ${field.attributes.name || "value"}`,
        required: !!field.attributes.required,
        fullWidth: !!field.attributes.full_width,
        order: field.attributes.order ?? 999, // Preserve order for reference
        // Add file-specific properties for image fields
        ...(fieldName === "image" && {
          accept: "image/jpeg,image/png,image/jpg",
          maxSize: 2 * 1024 * 1024, // 2MB
          allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
          hint: "Upload JPG, PNG (Max 2MB)",
        }),
      };
    });

    console.log("Final processedFields count:", processedFields.length);
    console.log(
      "Final processedFields:",
      processedFields.map((f: any) => ({
        id: f.id,
        name: f.name,
        label: f.label,
        order: f.order,
      })),
    );

    const commonProps = {
      eventData: eventData?.data,
      formFields: processedFields,
    };

    // Show message if no active fields
    if (sortedActiveFields.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
            <p className="font-medium">No active form fields</p>
            <p className="text-sm mt-1">
              All form fields are currently disabled. Please contact the event
              organizer.
            </p>
          </div>
        </div>
      );
    }

    switch (templateName) {
      case "template-one":
        return <TemplateFormOne {...commonProps} />;
      case "template-two":
        return <TemplateFormTwo {...commonProps} />;
      case "template-three":
        return <TemplateFormThree {...commonProps} />;
      case "template-four":
        return <TemplateFormFour {...commonProps} />;
      case "template-five":
        return <TemplateFormFive {...commonProps} />;
      case "template-six":
        return <TemplateFormSix {...commonProps} />;
      case "template-seven":
        return <TemplateFormSeven {...commonProps} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-500">Unknown template: {templateName}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            Loading registration form...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we prepare your form
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium">Error loading registration form</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If we have a custom form builder template, render it
  if (customFormBuilderTemplate) {
    console.log("🎨 Rendering custom form builder template:", {
      customFormBuilderTemplate,
      effectiveEventId,
      eventData,
      routeId,
    });

    // Ensure eventId is passed correctly - prioritize routeId from URL params
    const eventIdToPass = routeId || effectiveEventId;

    console.log("🔍 Event ID resolution for custom template:", {
      routeId,
      effectiveEventId,
      eventIdToPass,
      eventDataId: eventData?.data?.id,
      eventDataAttributesId: eventData?.data?.attributes?.id,
    });

    if (!eventIdToPass) {
      return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-medium">Error: Event ID not found</p>
              <p className="text-sm mt-1">
                Please check the URL and try again.
              </p>
              <p className="text-xs mt-2 text-gray-600">
                Expected URL format: /register/[eventId]
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Use the actual event ID from eventData - match the pattern used by default templates
    // Default templates use eventData?.id where eventData is the data part of the response
    // So we need to use eventData?.data?.id (since eventData here is the full response)
    // The EventData interface has: { data: { id: string, ... } }
    // CRITICAL: Always use eventData ID, not route ID, as route ID might not match database ID
    const actualEventId = eventData?.data?.id;

    if (!actualEventId) {
      console.error(
        "❌ CRITICAL: No event ID found in eventData. Cannot render form.",
        {
          eventData,
          eventDataData: eventData?.data,
          routeId,
          eventIdToPass,
        },
      );
      return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-medium">Error: Event ID not found</p>
              <p className="text-sm mt-1">
                The event data could not be loaded. Please check the URL and try
                again.
              </p>
              <p className="text-xs mt-2 text-gray-600">
                Expected URL format: /register/[eventId]
              </p>
            </div>
          </div>
        </div>
      );
    }

    console.log("🔍 Final Event ID resolution for custom template:", {
      routeId,
      eventIdToPass,
      eventDataId: eventData?.data?.id,
      eventDataAttributesId: eventData?.data?.attributes?.id,
      actualEventId,
      actualEventIdType: typeof actualEventId,
      eventDataStructure: eventData ? Object.keys(eventData) : null,
      eventDataDataStructure: eventData?.data
        ? Object.keys(eventData.data)
        : null,
      warning:
        actualEventId !== eventIdToPass
          ? `⚠️ Using eventData ID (${actualEventId}) instead of route ID (${eventIdToPass})`
          : "✅ Event ID matches route ID",
    });

    // Pass eventData.data to match the structure expected by default templates
    // Default templates receive eventData where eventData.id is the event ID
    const eventDataForForm = eventData?.data || eventData;

    console.log("🎨 Passing theme to FormBuilderTemplateForm:", {
      hasTheme: !!customFormBuilderTemplate.theme,
      hasLogo: !!customFormBuilderTemplate.theme?.logo,
      logo: customFormBuilderTemplate.theme?.logo,
      hasBannerImage: !!customFormBuilderTemplate.bannerImage,
      themeKeys: customFormBuilderTemplate.theme
        ? Object.keys(customFormBuilderTemplate.theme)
        : [],
    });

    // Log registration readiness
    console.log("🔍 Custom Form Registration Readiness:", {
      hasFormBuilderData: !!customFormBuilderTemplate.formBuilderData,
      hasFields: !!(
        customFormBuilderTemplate.formBuilderData?.formData?.length > 0
      ),
      eventId: actualEventId,
      eventIdType: typeof actualEventId,
      hasEventData: !!eventDataForForm,
      isUserRegistration: true,
    });

    const formLanguageMode =
      customFormBuilderTemplate?.formBuilderData?.languageMode ?? "dual";
    const isDualLanguage = formLanguageMode === "dual";

    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 p-6">
        {/* Notification Toast - Only shows on submit */}
        {notification && (
          <div
            className="fixed top-4 right-4 z-[9999] animate-slide-in"
            style={{ position: "fixed" }}
          >
            <div
              className={`px-6 py-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : notification.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}

        {/* Language Switcher – only when form is dual language */}
        {isDualLanguage && (
          <div className="w-full max-w-4xl mx-auto mb-4 flex justify-end">
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors border border-gray-200"
                title="Change Language"
              >
                <Globe size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {currentLanguage.flag} {currentLanguage.name}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-600 transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-2 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50 min-w-[160px] border border-gray-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                        i18n.language === lang.code
                          ? "bg-blue-50 text-blue-600"
                          : ""
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium flex-1">
                        {lang.name}
                      </span>
                      {i18n.language === lang.code && (
                        <span className="text-blue-600 rtl:order-first">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl mx-auto">
          <FormBuilderTemplateForm
            isUserRegistration={true}
            formBuilderData={customFormBuilderTemplate.formBuilderData}
            bannerImage={customFormBuilderTemplate.bannerImage}
            theme={customFormBuilderTemplate.theme}
            eventId={actualEventId} // Use actual event ID from API response (NOT route ID)
            eventData={eventDataForForm} // Pass the data part to match default template structure
            onRegistrationSuccess={(message) =>
              showNotification(message, "success")
            }
            onRegistrationError={(message) =>
              showNotification(message, "error")
            }
          />
        </div>
      </div>
    );
  }

  if (!templateData && !customFormBuilderTemplate) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600">
            No registration template found for this event.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Notification Toast - Only shows on submit */}
      {notification && (
        <div
          className="fixed top-4 right-4 z-[9999] animate-slide-in"
          style={{ position: "fixed" }}
        >
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Language Switcher */}
      <div className="w-full max-w-4xl mx-auto mb-4 flex justify-end">
        <div className="relative" ref={langDropdownRef}>
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors border border-gray-200"
            title="Change Language"
          >
            <Globe size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {currentLanguage.flag} {currentLanguage.name}
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isLangDropdownOpen && (
            <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-2 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50 min-w-[160px] border border-gray-200">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                    i18n.language === lang.code
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium flex-1">
                    {lang.name}
                  </span>
                  {i18n.language === lang.code && (
                    <span className="text-blue-600 rtl:order-first">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registration Form Template - No extra banner, templates handle their own event info */}
      <div className="w-full max-w-4xl mx-auto">{renderTemplate()}</div>

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
}

export default UserRegistration;
