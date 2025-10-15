// Updated TemplateForm.jsx
import { useRef, useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Info, XCircle } from "lucide-react";
import Assets from "@/utils/Assets";
import ReusableRegistrationForm from "../../components/ReusableRegistrationForm";
import {
  getEventbyId,
  updateEventById,
  updateRegistrationFieldToggleApi,
  getRegistrationFieldApi,
} from "@/apis/apiHelpers";

function TemplateFormTwo({
  data,
  eventId: propEventId,
  isUserRegistration = false,
}: {
  data?: any;
  eventId?: string;
  isUserRegistration?: boolean;
} = {}) {
  // Log all field attributes for debugging
  useMemo(() => {
    if (Array.isArray(data)) {
      console.log(`Template Two received ${data.length} fields:`, data);
    }
  }, [data]);

  // Banner state
  const [bannerUrl, setBannerUrl] = useState(null);
  const [formData, setFormData] = useState({ eventLogo: null });
  const [logoError, setLogoError] = useState("");
  const [toggleLoading, setToggleLoading] = useState({});
  const [eventData, setEventData] = useState<any>(null);
  const [apiFormData, setApiFormData] = useState<any[]>([]);
  const [isLoadingApiData, setIsLoadingApiData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch event and banner on mount and after upload
  const { id: routeId } = useParams();
  const effectiveEventId =
    (propEventId as string | undefined) ||
    (routeId as string | undefined) ||
    localStorage.getItem("create_eventId") ||
    undefined;

  useEffect(() => {
    const fetchBanner = async () => {
      if (!effectiveEventId) return;
      try {
        const response = await getEventbyId(effectiveEventId);
        setBannerUrl(response.data.data.registration_page_banner || null);
      } catch (error) {
        setBannerUrl(null);
      }
    };
    fetchBanner();
  }, [effectiveEventId]);

  // Default form fields when no data is provided (for preview)
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

  // Fetch form fields from API when no data is provided
  useEffect(() => {
    const fetchApiFormData = async () => {
      if (!effectiveEventId) return;
      if (data && Array.isArray(data) && data.length > 0) return; // Don't fetch if data is already provided

      setIsLoadingApiData(true);
      try {
        const response = await getRegistrationFieldApi(effectiveEventId);
        console.log(
          "TemplateTwo - getRegistrationFieldApi response:",
          response.data
        );
        setApiFormData(response.data.data || []);
      } catch (error) {
        console.error("TemplateTwo - Failed to get registration field:", error);
        setApiFormData([]);
      } finally {
        setIsLoadingApiData(false);
      }
    };

    fetchApiFormData();
  }, [effectiveEventId, data]);

  const formFields = useMemo((): any[] => {
    // Priority: 1. data prop, 2. apiFormData, 3. defaultFormFields
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
        // Add file-specific properties for image fields
        ...(attr.field === "image" && {
          accept: "image/jpeg,image/png,image/jpg",
          maxSize: 2 * 1024 * 1024, // 2MB
          allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
          hint: "Upload JPG, PNG (Max 2MB)"
        }),
      };
    });
  }, [data, apiFormData]);

  const [fieldActiveStates, setFieldActiveStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Update field active states when formFields change
  useEffect(() => {
    const newActiveStates = formFields.reduce((acc: any, field: any) => {
      // Default to active (true) if not specified, especially for default fields
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

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setLogoError("");
      if (file.size > 2 * 1024 * 1024) {
        setLogoError("File size exceeds the 2MB limit.");
        return;
      }
      const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        setLogoError("Invalid file type. Please upload SVG, PNG, or JPG.");
        return;
      }

      // Validate image dimensions for banner (900x300px)
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth !== 900 || img.naturalHeight !== 300) {
          setLogoError("Image must be exactly 900x300 pixels.");
          return;
        }
        setFormData((prev) => ({
          ...prev,
          eventLogo: file,
        }));
      };
      img.onerror = () => {
        setLogoError("Error loading image. Please try another file.");
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const removeImage = (e: any) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      eventLogo: null,
    }));
    setLogoError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload banner and refresh from API
  const updateBanner = async () => {
    if (!formData.eventLogo || !effectiveEventId) return;
    try {
      const payload = new FormData();
      payload.append("event[registration_page_banner]", formData.eventLogo);

      const response = await updateEventById(effectiveEventId, payload);
      console.log("Event banner updated:", response);

      // Fetch updated event/banner
      const eventResponse = await getEventbyId(effectiveEventId);
      console.log("Fetched event after banner update:", eventResponse);
      fetchEventData();
      setBannerUrl(eventResponse.data.data.eventLogo || null);
      setFormData({ eventLogo: null });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setLogoError("Failed to update banner.");
      console.error("Failed to update banner:", error);
    }
  };

  const handleFormSubmit = (formValues: any) => {
    console.log("Form submitted:", formValues);
    alert("Registration submitted successfully!");
  };

  const fetchEventData = async () => {
    if (!effectiveEventId) return;
    try {
      const response = await getEventbyId(effectiveEventId);
      console.log("Event data fetched in useEffect :: ", response.data.data);
      setEventData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch event data:", error);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [effectiveEventId]);

  return (
    <div className="w-full">
      {/* Event Cover Image Upload */}
      <div
        style={{
          width: "100%",
          backgroundImage: ` url(${formData.eventLogo
            ? URL.createObjectURL(formData.eventLogo)
            : eventData?.attributes?.registration_page_banner
              ? eventData.attributes.registration_page_banner
              : bannerUrl
                ? bannerUrl
                : Assets.images.uploadBackground2
            })`,
        }}
        className="w-full  h-[400px] flex items-center justify-center border rounded-3xl
        bg-gradient-to-t from-white/50 to-transparent
        border-gray-200  sm:p-5 bg-cover bg-center bg-no-repeat relative"
      >
        {/* Show upload button only if NO image exists */}
        {!formData.eventLogo &&
          !eventData?.attributes?.registration_page_banner &&
          !bannerUrl && (
            <button
              className="btn flex flex-row items-center gap-2 bg-indigo-950 py-3 px-5 rounded-xl cursor-pointer"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={Assets.icons.upload}
                style={{ height: 20, width: 20 }}
              />
              <span className="text-white">upload (900x300px)</span>
            </button>
          )}

        {/* Show Edit Banner button if a banner exists and no new image is selected */}
        {!formData.eventLogo &&
          (eventData?.attributes?.registration_page_banner || bannerUrl) && (
            <button
              className="absolute top-3 right-3 px-4 py-2 bg-pink-600 text-white rounded-lg"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Edit Banner
            </button>
          )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".svg,.png,.jpg,.jpeg"
        />

        {/* Remove button (only when a new image is selected before upload) */}
        {formData.eventLogo && (
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-3 right-3 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 transition-colors"
          >
            <XCircle size={20} />
          </button>
        )}
      </div>

      {/* Upload button (only when a new image is selected) */}
      {formData.eventLogo && (
        <button
          type="button"
          onClick={updateBanner}
          className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-lg"
        >
          Upload Banner
        </button>
      )}

      {logoError && (
        <p className="mt-2 flex items-center text-xs text-red-600">
          <Info size={14} className="mr-1 flex-shrink-0" />
          {logoError}
        </p>
      )}

      <div style={{ marginTop: 16 }} />

      {/* Event Information Display */}
      <div className="gap-3 flex flex-row items-center">
        <div style={{ padding: 32 }} className=" bg-neutral-50 rounded-2xl">
          <img
            src={eventData?.attributes?.logo_url || Assets.images.sccLogo}
            style={{ height: 67.12, width: 72 }}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-slate-800 text-md font-poppins font-medium">
            {eventData?.attributes?.name || "Event Name"}
          </p>

          <div className="flex flex-row items-center gap-3 ">
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

          <div className="flex flex-row items-center gap-3 ">
            <img
              src={Assets.icons.location}
              style={{ height: 20, width: 20 }}
              alt=""
            />
            <p className=" text-neutral-600 font-poppins font-normal text-xs">
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
      <div className="bg-white rounded-lg p-6 border border-gray-200">
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
            // @ts-ignore - Temporary ignore for form fields typing issue
            formFields={formFields.map((field) => ({
              ...field,
              active: fieldActiveStates[field.id] !== false, // Show as active by default, disable only if explicitly set to false
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
  );
}

export default TemplateFormTwo;
