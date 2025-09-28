import React, { useRef, useState, useMemo, useEffect } from "react";
import { Upload, Info, XCircle } from "lucide-react";
import Assets from "@/utils/Assets";
import ReusableRegistrationForm from "../../components/ReusableRegistrationForm";
import {
  getEventbyId,
  updateEventById,
  updateRegistrationFieldToggleApi,
} from "@/apis/apiHelpers";

function TemplateFormOne({ data }) {
  // Log all field attributes
  useMemo(() => {
    if (Array.isArray(data)) {
      data.forEach((field, idx) => {
        console.log(`Field in template form one ${idx}:`, field.attributes);
      });
    }
  }, [data]);

  // Banner state
  const [bannerUrl, setBannerUrl] = useState(null);
  const [formData, setFormData] = useState({ eventLogo: null });
  const [logoError, setLogoError] = useState("");
  const [toggleLoading, setToggleLoading] = useState({});
  const fileInputRef = useRef(null);

  // Fetch event and banner on mount and after upload
  useEffect(() => {
    const fetchBanner = async () => {
      const eventId = localStorage.getItem("create_eventId");
      try {
        const response = await getEventbyId(eventId);
        // Adjust this path based on your API response structure
        setBannerUrl(response.data.data.registration_page_banner || null);
      } catch (error) {
        setBannerUrl(null);
      }
    };
    fetchBanner();
  }, []);

  const formFields = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((field) => {
      const attr = field.attributes || {};
      return {
        id: field.id,
        name: attr.field || attr.name || "field_" + field.id,
        type:
          attr.validation_type === "email"
            ? "email"
            : attr.validation_type === "alphabetic"
            ? "text"
            : "text",
        label: attr.name || "Field",
        placeholder: `Enter ${attr.name || "value"}`,
        required: !!attr.required,
        fullWidth: !!attr.full_width,
        active: attr.active, // 👈 use directly
      };
    });
  }, [data]);

  const [fieldActiveStates, setFieldActiveStates] = useState(() =>
    formFields.reduce((acc, field) => {
      acc[field.id] = field.active;
      return acc;
    }, {})
  );

  const handleToggleField = async (fieldId, setLoading) => {
    setLoading((prev) => ({ ...prev, [fieldId]: true }));
    const eventId = localStorage.getItem("create_eventId");
    const newActive = !fieldActiveStates[fieldId];
    try {
      await updateRegistrationFieldToggleApi(
        { active: newActive },
        eventId,
        fieldId
      );
      setFieldActiveStates((prev) => ({
        ...prev,
        [fieldId]: newActive,
      }));
    } catch (error) {
      console.error("Failed to toggle field:", error);
    }
    setLoading((prev) => ({ ...prev, [fieldId]: false }));
  };

  const handleFileChange = (e) => {
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
      setFormData((prev) => ({
        ...prev,
        eventLogo: file,
      }));
    }
  };

  const removeImage = (e) => {
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
    const eventId = localStorage.getItem("create_eventId");
    if (!formData.eventLogo) return;
    try {
      // You may need to send FormData if your API expects file upload
      const payload = new FormData();
      payload.append("event[registration_page_banner]", formData.eventLogo);

      const response = await updateEventById(eventId, payload);
      console.log("Event banner updated:", response);

      // Fetch updated event/banner
      const eventResponse = await getEventbyId(eventId);
      console.log("Fetched event after banner update:", eventResponse);
      fetchEventData();
      setBannerUrl(eventResponse.data.data.eventLogo || null);
      setFormData({ eventLogo: null });

      setFormData({ eventLogo: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setLogoError("Failed to update banner.");
      console.error("Failed to update banner:", error);
    }
  };

  const handleFormSubmit = (formValues) => {
    console.log("Form submitted:", formValues);
    alert("Registration submitted successfully!");
  };
  const [eventData, setEventData] = useState("");
  const fetchEventData = async () => {
    const eventId = localStorage.getItem("create_eventId");
    try {
      const response = await getEventbyId(eventId);
      console.log("Event data fetched in useEffect :: ", response.data.data);
      setEventData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch event data:", error);
    }
  };
  useEffect(() => {
    fetchEventData();
  }, []);

  return (
    <div className="w-full p-4">
      {/* Event Cover Image Upload */}
      {/* Banner Upload Area */}
      <div
        style={{
          width: "100%",
          backgroundImage: `url(${
            formData.eventLogo
              ? URL.createObjectURL(formData.eventLogo)
              : eventData?.attributes?.registration_page_banner
              ? eventData.attributes.registration_page_banner
              : bannerUrl
              ? bannerUrl
              : Assets.images.uploadBackground
          })`,
        }}
        className="w-full h-[300px] flex items-center justify-center border rounded-2xl border-gray-200 p-4 sm:p-5 bg-cover bg-center bg-no-repeat relative"
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
              <span className="text-white">Choose Image</span>
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
      {/* ...rest of your component unchanged... */}

      <div style={{ marginTop: 16 }} />

      {/* Event Information Display */}
      <div className="gap-3 flex flex-row items-center">
        <div style={{ padding: 32 }} className=" bg-neutral-50 rounded-2xl">
          <img
            src={eventData.attributes?.logo_url}
            style={{ height: 67.12, width: 72 }}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-slate-800 text-md font-poppins font-medium">
            {eventData.attributes?.name}
          </p>

          <div className="flex flex-row items-center gap-3 ">
            <img
              src={Assets.icons.clock}
              style={{ height: 20, width: 20 }}
              alt=""
            />
            <p className="text-neutral-600 font-poppins font-normal text-xs">
              {" "}
              {eventData.attributes?.event_date_from} -{" "}
              {eventData.attributes?.event_date_to}
            </p>
          </div>

          <div className="flex flex-row items-center gap-3 ">
            <img
              src={Assets.icons.location}
              style={{ height: 20, width: 20 }}
              alt=""
            />
            <p className=" text-neutral-600 font-poppins font-normal text-xs">
              {eventData.attributes?.location}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }} />

      <p className="text-slate-800 text-xs font-poppins font-medium">
        About{" "}
        <span className="text-neutral-600 text-xs font-normal">
          {eventData.attributes?.about}
        </span>
      </p>

      <div style={{ marginTop: 24 }} />

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Please fill name and contact information of attendees.
        </h3>
        <ReusableRegistrationForm
          formFields={formFields.map((field) => ({
            ...field,
            active: fieldActiveStates[field.id],
          }))}
          onToggleField={(fieldId) =>
            handleToggleField(fieldId, setToggleLoading)
          }
          toggleLoading={toggleLoading}
          onSubmit={handleFormSubmit}
          submitButtonText="Register"
        />
      </div>
    </div>
  );
}

export default TemplateFormOne;
