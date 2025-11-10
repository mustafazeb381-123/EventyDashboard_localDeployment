import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import Assets from "@/utils/Assets";
import ReusableRegistrationForm from "../../components/ReusableRegistrationForm";
import {
  getEventbyId,
  updateRegistrationFieldToggleApi,
  getRegistrationFieldApi,
} from "@/apis/apiHelpers";

function TemplateFormFour({
  data,
  eventId: propEventId,
  isUserRegistration = false,
}: {
  data?: any;
  eventId?: string;
  isUserRegistration?: boolean;
} = {}) {
  // Log field attributes
  useMemo(() => {
    if (Array.isArray(data)) {
      console.log(`Template Four received ${data.length} fields:`, data);
    }
  }, [data]);

  // States
  const [toggleLoading, setToggleLoading] = useState({});
  const [eventData, setEventData] = useState<any>(null);
  const [apiFormData, setApiFormData] = useState<any[]>([]);
  const [isLoadingApiData, setIsLoadingApiData] = useState(false);

  // Get event ID
  const { id: routeId } = useParams();
  const effectiveEventId =
    (propEventId as string | undefined) ||
    (routeId as string | undefined) ||
    localStorage.getItem("create_eventId") ||
    undefined;

  // Default form fields
  const defaultFormFields = [
    {
      id: 1,
      name: "fullName",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      active: true,
    },
    {
      id: 2,
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email",
      required: true,
      active: true,
    },
    {
      id: 3,
      name: "phoneNumber",
      type: "tel",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      required: true,
      active: true,
    },
    {
      id: 4,
      name: "company",
      type: "text",
      label: "Company",
      placeholder: "Enter your company name",
      required: false,
      active: true,
    },
  ];

  // Fetch form fields
  useEffect(() => {
    const fetchApiFormData = async () => {
      if (!effectiveEventId) return;
      if (data && Array.isArray(data) && data.length > 0) return;

      setIsLoadingApiData(true);
      try {
        const response = await getRegistrationFieldApi(effectiveEventId);
        console.log("TemplateFour - getRegistrationFieldApi response:", response.data);
        setApiFormData(response.data.data || []);
      } catch (error) {
        console.error("TemplateFour - Failed to get registration field:", error);
        setApiFormData([]);
      } finally {
        setIsLoadingApiData(false);
      }
    };
    fetchApiFormData();
  }, [effectiveEventId, data]);

  const formFields = useMemo((): any[] => {
    let sourceData = data;
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      sourceData = apiFormData;
    }
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      return defaultFormFields;
    }

    return sourceData.map((field: any) => {
      const attr = field.attributes || {};
      return {
        id: field.id,
        name: attr.field || attr.name || "field_" + field.id,
        type:
          attr.field === "image"
            ? "file"
            : attr.validation_type === "email"
              ? "email"
              : attr.validation_type === "alphabetic"
                ? "text"
                : "text",
        label: attr.name || "Field",
        placeholder: attr.field === "image" ? "" : `Enter ${attr.name || "value"}`,
        required: !!attr.required,
        fullWidth: !!attr.full_width,
        active: attr.active,
        ...(attr.field === "image" && {
          accept: "image/jpeg,image/png,image/jpg",
          maxSize: 2 * 1024 * 1024,
          allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
          hint: "Upload JPG, PNG (Max 2MB)",
        }),
      };
    });
  }, [data, apiFormData]);

  const [fieldActiveStates, setFieldActiveStates] = useState<{ [key: string]: boolean }>({});

  // Sync field active states
  useEffect(() => {
    const newActiveStates = formFields.reduce((acc: any, field: any) => {
      acc[field.id] = field.active !== false;
      return acc;
    }, {});
    setFieldActiveStates(newActiveStates);
  }, [formFields]);

  const handleToggleField = async (fieldId: any, setLoading: any) => {
    if (!effectiveEventId) return;
    setLoading((prev: any) => ({ ...prev, [fieldId]: true }));
    const newActive = !fieldActiveStates[fieldId];
    try {
      await updateRegistrationFieldToggleApi(
        { active: newActive },
        effectiveEventId,
        fieldId
      );
      setFieldActiveStates((prev: any) => ({
        ...prev,
        [fieldId]: newActive,
      }));
    } catch (error) {
      console.error("Failed to toggle field:", error);
    }
    setLoading((prev: any) => ({ ...prev, [fieldId]: false }));
  };

  const fetchEventData = async () => {
    if (!effectiveEventId) return;
    try {
      const response = await getEventbyId(effectiveEventId);
      console.log("Event data fetched:", response.data.data);
      setEventData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch event data:", error);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [effectiveEventId]);

  const handleFormSubmit = (formValues: any) => {
    console.log("Form submitted:", formValues);
    alert("Registration submitted successfully!");
  };

  return (
    <div
      style={{
        backgroundImage: `url(${Assets.images.background4})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
      className="min-h-screen w-full p-4"
    >
      {/* Content */}
      <div className="w-full mx-auto">
        {/* Event Info */}
        <div className="gap-3 flex flex-row items-center">
          <div style={{ padding: 32 }} className="bg-neutral-50 rounded-2xl">
            <img
              src={eventData?.attributes?.logo_url || Assets.images.sccLogo}
              style={{ height: 67.12, width: 72 }}
              alt="Event Logo"
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-slate-800 text-md font-poppins font-medium">
              {eventData?.attributes?.name || "Event Name"}
            </p>

            <div className="flex flex-row items-center gap-3">
              <img
                src={Assets.icons.clock}
                style={{ height: 20, width: 20 }}
                alt=""
              />
              <p className="text-neutral-600 font-poppins font-normal text-xs">
                {eventData?.attributes?.event_date_from} -{" "}
                {eventData?.attributes?.event_date_to}
              </p>
            </div>

            <div className="flex flex-row items-center gap-3">
              <img
                src={Assets.icons.location}
                style={{ height: 20, width: 20 }}
                alt=""
              />
              <p className="text-neutral-600 font-poppins font-normal text-xs">
                {eventData?.attributes?.location || "Location"}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }} />

        <p className="text-slate-800 text-xs font-poppins font-medium">
          About{" "}
          <span className="text-neutral-600 text-xs font-normal">
            {eventData?.attributes?.about || "Event description"}
          </span>
        </p>

        <div style={{ marginTop: 24 }} />

        {/* Registration Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Please fill name and contact information of attendees.
          </h3>

          {isLoadingApiData ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Loading form fields...</p>
              </div>
            </div>
          ) : formFields.length > 0 ? (
            <ReusableRegistrationForm
              // @ts-ignore
              formFields={formFields.map((field) => ({
                ...field,
                active: fieldActiveStates[field.id] !== false,
              }))}
              onToggleField={(fieldId: any) =>
                handleToggleField(fieldId, setToggleLoading)
              }
              toggleLoading={toggleLoading}
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
    </div>
  );
}

export default TemplateFormFour;
