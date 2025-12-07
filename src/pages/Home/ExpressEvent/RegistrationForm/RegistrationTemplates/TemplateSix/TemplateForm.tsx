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

interface TemplateFormSixProps {
  data?: any[];
  eventId?: string;
  isUserRegistration?: boolean;
  eventData?: any;
}

interface FormField {
  id: number | string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  active?: boolean;
  accept?: string;
  maxSize?: number;
  allowedTypes?: string[];
  hint?: string;
}

const TemplateFormSix: React.FC<TemplateFormSixProps> = ({
  data,
  eventId: propEventId,
  isUserRegistration = false,
  eventData: propEventData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ eventLogo: File | null }>({
    eventLogo: null,
  });
  const [logoError, setLogoError] = useState("");
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [apiFormData, setApiFormData] = useState<any[]>([]);
  const [isLoadingApiData, setIsLoadingApiData] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [fieldActiveStates, setFieldActiveStates] = useState<
    Record<string, boolean>
  >({});

  const { id: routeId } = useParams();
  const effectiveEventId =
    propEventId ||
    routeId ||
    localStorage.getItem("create_eventId") ||
    undefined;

  // Fetch event and banner
  useEffect(() => {
    if (!effectiveEventId) return;

    // Use event data from prop if available - skip API call
    if (propEventData) {
      setBannerUrl(
        propEventData?.attributes?.registration_page_banner ||
          propEventData?.registration_page_banner ||
          null
      );
      setEventData(propEventData);
      return;
    }

    const cacheKey = `event_meta_${effectiveEventId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setEventData(parsed);
        setBannerUrl(
          parsed?.attributes?.registration_page_banner ||
            parsed?.registration_page_banner ||
            null
        );
        return;
      } catch (err) {
        console.warn("TemplateSix - failed to parse cached event", err);
      }
    }

    const fetchEvent = async () => {
      try {
        const response = await getEventbyId(effectiveEventId);
        setBannerUrl(
          response.data.data?.attributes?.registration_page_banner ||
            response.data.data?.registration_page_banner ||
            null
        );
        setEventData(response.data.data);
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data.data));
      } catch (error) {
        setBannerUrl(null);
      }
    };
    fetchEvent();
  }, [effectiveEventId, propEventData]);

  // Default form fields
  const defaultFormFields: FormField[] = [
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
      name: "idNumber",
      type: "text",
      label: "ID Number",
      placeholder: "Enter your ID number",
      required: true,
      active: true,
    },
    {
      id: 5,
      name: "position",
      type: "text",
      label: "Position",
      placeholder: "Enter your position/title",
      required: true,
      active: true,
    },
    {
      id: 6,
      name: "company",
      type: "text",
      label: "Company",
      placeholder: "Enter your company name",
      required: false,
      active: true,
    },
    {
      id: 7,
      name: "profilePic",
      type: "file",
      label: "Upload Profile Picture",
      accept: ".png,.jpg,.jpeg",
      maxSize: 2 * 1024 * 1024,
      allowedTypes: ["image/png", "image/jpeg"],
      hint: "PNG or JPG (max. 2MB)",
      required: false,
      active: true,
    },
  ];

  // Fetch API form data if no `data` prop
  useEffect(() => {
    if (!effectiveEventId) return;
    const fetchApiFormData = async () => {
      setIsLoadingApiData(true);
      try {
        const response = await getRegistrationFieldApi(effectiveEventId);
        setApiFormData(response.data.data || []);
      } catch (error) {
        setApiFormData([]);
      } finally {
        setIsLoadingApiData(false);
      }
    };
    fetchApiFormData();
  }, [effectiveEventId, data]);

  // Compute final form fields: data prop > API > default
  const formFields: FormField[] = useMemo(() => {
    let sourceData = data?.length
      ? data
      : apiFormData?.length
      ? apiFormData
      : defaultFormFields;
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
            : "text",
        label: attr.name || "Field",
        placeholder:
          attr.field === "image" ? "" : `Enter ${attr.name || "value"}`,
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

  // Update field active states
  useEffect(() => {
    const newStates: Record<string, boolean> = {};
    formFields.forEach((field) => {
      newStates[field.id.toString()] = field.active !== false;
    });
    setFieldActiveStates(newStates);
  }, [formFields]);

  // Toggle field active
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

  // Banner file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError("");

    if (file.size > 2 * 1024 * 1024)
      return setLogoError("File size exceeds 2MB.");
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type))
      return setLogoError("Invalid file type.");

    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth !== 900 || img.naturalHeight !== 300)
        return setLogoError("Image must be 900x300 px.");
      setFormData((prev) => ({ ...prev, eventLogo: file }));
    };
    img.src = URL.createObjectURL(file);
  };

  const removeImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFormData({ eventLogo: null });
    setLogoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadBanner = async () => {
    if (!formData.eventLogo || !effectiveEventId) return;
    try {
      const uploadData = new FormData();
      uploadData.append("registration_page_banner", formData.eventLogo);
      await updateEventById(effectiveEventId, uploadData);
      const response = await getEventbyId(effectiveEventId);
      setBannerUrl(response.data.data.registration_page_banner || null);
      setFormData({ eventLogo: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setLogoError("Failed to upload banner.");
    }
  };

  const handleFormSubmit = (values: any) => {
    console.log("Form submitted:", values);
    alert("Registration submitted successfully!");
  };

  return (
    <div className="w-full flex flex-row p-4">
      {/* Left: Banner & Event Info */}
      <div className="w-[30%] mr-3 flex flex-col items-center">
        <div
          style={{
            width: "100%",
            backgroundImage: `url(${
              formData.eventLogo
                ? URL.createObjectURL(formData.eventLogo)
                : eventData?.attributes?.registration_page_banner ||
                  bannerUrl ||
                  Assets.images.uploadBackground3
            })`,
          }}
          className="w-full h-[300px] flex items-center justify-center rounded-2xl bg-cover bg-center cursor-pointer relative"
          onClick={() => fileInputRef.current?.click()}
        >
          {/* No image */}
          {!formData.eventLogo &&
            !eventData?.attributes?.registration_page_banner &&
            !bannerUrl && (
              <button className="btn bg-indigo-950 py-3 px-5 rounded-xl flex items-center gap-2">
                <img src={Assets.icons.upload} className="h-5 w-5" />
                <span className="text-white">Choose Image (900x300px)</span>
              </button>
            )}
          {/* Edit existing */}
          {!formData.eventLogo &&
            (eventData?.attributes?.registration_page_banner || bannerUrl) && (
              <button
                className="absolute top-3 right-3 px-4 py-2 bg-pink-600 text-white rounded-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                Edit Banner
              </button>
            )}
          {/* Upload new */}
          {formData.eventLogo && (
            <button
              className="absolute bottom-3 right-3 px-4 py-2 bg-green-600 text-white rounded-lg"
              onClick={handleUploadBanner}
            >
              Upload Banner
            </button>
          )}
          {/* Remove */}
          {formData.eventLogo && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 left-3 p-1 bg-white rounded-full shadow-md text-red-500"
            >
              <XCircle size={20} />
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".svg,.png,.jpg,.jpeg"
          />
        </div>

        {logoError && (
          <p className="mt-2 text-xs text-red-600 flex items-center">
            <Info size={14} className="mr-1" />
            {logoError}
          </p>
        )}

        {/* Event Info */}
        <div className="w-full mt-4">
          <div className="flex gap-3 items-center">
            <div className="bg-neutral-50 rounded-2xl p-8">
              <img
                src={eventData?.attributes?.logo_url || Assets.images.sccLogo}
                style={{ height: 67, width: 72 }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-slate-800 font-medium">
                {eventData?.attributes?.name || "Event Name"}
              </p>
              <p className="text-neutral-600 text-xs">
                {eventData?.attributes?.event_date_from} -{" "}
                {eventData?.attributes?.event_date_to}
              </p>
              <p className="text-neutral-600 text-xs">
                {eventData?.attributes?.location || "Location"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-800">
            About{" "}
            <span className="text-neutral-600">
              {eventData?.attributes?.about || "Event description"}
            </span>
          </p>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 w-[70%]">
        <h3 className="text-lg font-semibold mb-6 text-gray-900">
          Please fill name and contact information of attendees.
        </h3>

        {isLoadingApiData ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <p className="text-neutral-200">Loading form fields...</p>
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
            <p className="text-neutral-200">No form fields available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateFormSix;
