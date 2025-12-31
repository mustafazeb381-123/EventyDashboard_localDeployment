import {
  getEventbyId,
  getRegistrationTemplateData,
  getRegistrationFieldApi,
} from "@/apis/apiHelpers";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Import user registration templates (without admin functionality)
import TemplateFormOne from "./TemplateFormOne";
import TemplateFormTwo from "./TemplateFormTwo";
import TemplateFormThree from "./TemplateFormThree";
import TemplateFormFour from "./TemplateFormFour";
import TemplateFormFive from "./TemplateFormFive";
import TemplateFormSix from "./TemplateFormSix";
import TemplateFormSeven from "./TemplateFormSeven";

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
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [registrationFields, setRegistrationFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get effective event ID
  const effectiveEventId =
    (routeId as string | undefined) ||
    localStorage.getItem("edit_eventId") ||
    localStorage.getItem("create_eventId") ||
    undefined;

  const getTemplateData = async () => {
    if (!effectiveEventId) {
      setError("No event ID found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await getRegistrationTemplateData(effectiveEventId);
      console.log("response of get template api ", response);

      const templateInfo = response?.data?.data;
      if (templateInfo) {
        setTemplateData(templateInfo);
      } else {
        setError("No template data found");
      }
    } catch (error) {
      console.log("error getting template api", error);
      setError("Failed to fetch template data");
    }
  };

  const getEventDataById = async () => {
    if (!effectiveEventId) return;

    try {
      const response = await getEventbyId(effectiveEventId);
      console.log(
        "response event data by id in user registration form ",
        response
      );
      setEventData(response?.data);
    } catch (error) {
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
    } catch (error) {
      console.log("error fetching all registration fields:", error);
      setRegistrationFields([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        getTemplateData(),
        getEventDataById(),
        getAllRegistrationFields(),
      ]);
      setIsLoading(false);
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
      registrationFields.length > 0 ? "API (all fields)" : "Template data"
    );
    console.log("Total fields available:", formFields.length);
    console.log(
      "All fields:",
      formFields.map((f: any) => ({
        id: f.id,
        name: f.attributes?.name || f.attributes?.field,
        active: f.attributes?.active,
        order: f.attributes?.order,
      }))
    );

    // Filter only active fields
    const activeFields = formFields.filter((field) => {
      const isActive = field.attributes?.active === true;
      console.log(
        `Field ${
          field.attributes?.name || field.attributes?.field || field.id
        }: active=${field.attributes?.active}, order=${field.attributes?.order}`
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
      }))
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
      }))
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium">Error loading registration form</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!templateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600">
            No registration template found for this event.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Registration Form Template - No extra banner, templates handle their own event info */}
      <div className="w-full max-w-4xl mx-auto">{renderTemplate()}</div>
    </div>
  );
}

export default UserRegistration;
