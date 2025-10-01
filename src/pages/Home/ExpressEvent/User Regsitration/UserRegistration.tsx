import { getEventbyId, getRegistrationTemplateData } from "@/apis/apiHelpers";
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([getTemplateData(), getEventDataById()]);
      setIsLoading(false);
    };

    fetchData();
  }, [effectiveEventId]);

  // Function to render the appropriate template based on template name
  const renderTemplate = () => {
    if (!templateData || !templateData.attributes) return null;

    const templateName = templateData.attributes.name;
    const formFields =
      templateData.attributes.event_registration_fields?.data || [];

    // Filter only active fields
    const activeFields = formFields.filter(
      (field) => field.attributes.active === true
    );

    console.log("Template name:", templateName);
    console.log("Active fields:", activeFields);
    console.log("Total fields:", formFields.length);
    console.log("Active fields count:", activeFields.length);

    // Process active fields into the format expected by the templates
    const processedFields = activeFields.map((field) => ({
      id: field.id,
      name:
        field.attributes.field || field.attributes.name || "field_" + field.id,
      type: field.attributes.validation_type === "email" ? "email" : "text",
      label: field.attributes.name || "Field",
      placeholder: `Enter ${field.attributes.name || "value"}`,
      required: !!field.attributes.required,
      fullWidth: !!field.attributes.full_width,
    }));

    const commonProps = {
      eventData: eventData?.data,
      formFields: processedFields,
    };

    // Show message if no active fields
    if (activeFields.length === 0) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            No registration template found for this event.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Registration Form Template - No extra banner, templates handle their own event info */}
      {renderTemplate()}
    </div>
  );
}

export default UserRegistration;
