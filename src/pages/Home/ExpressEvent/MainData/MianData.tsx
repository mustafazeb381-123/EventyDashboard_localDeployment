import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  MapPin,
  Plus,
  Trash2,
  Info,
  XCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { eventPostAPi, getShowEventData } from "../../../../apis/apiHelpers";

type MainDataProps = {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
  plan: any;
  eventData?: any;
  isEditing?: boolean;
  eventAttributes?: any;
  eventId?: string | number;
  stats?: any[];
  chartData?: any[];
  onTimeRangeChange?: (range: string) => void;
  lastEdit?: string;
};


type MainFormData = {
  eventName: string;
  description: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  timeFrom: string; // HH:MM
  timeTo: string; // HH:MM
  location: string;
  requireApproval: boolean;
  guestTypes: string[];
  eventLogo: File | null;
};

const MainData = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  plan,
  eventData,
  isEditing,
  eventAttributes,
  eventId,
  stats,
  chartData,
  onTimeRangeChange,
  lastEdit,
}: MainDataProps) => {
  console.log("selected plans  in main data :", plan);
  console.log("event data for editing:", eventData);
  console.log("is editing mode:", isEditing);
  console.log("event attributes:", eventAttributes);
  console.log("event ID:", eventId);
  console.log("stats:", stats);
  console.log("chart data:", chartData);
  console.log("last edit:", lastEdit);
  const [newGuestType, setNewGuestType] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEventData, setShowEventData] = useState<boolean>(false);
  const [formData, setFormData] = useState<MainFormData>({
    eventName: "",
    description: "",
    dateFrom: undefined,
    dateTo: undefined,
    timeFrom: "09:00",
    timeTo: "17:00",
    location: "",
    requireApproval: false,
    guestTypes: [],
    eventLogo: null,
  });
  const [logoError, setLogoError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = <K extends keyof MainFormData>(
    field: K,
    value: MainFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[String(field)]) {
      setValidationErrors((prev) => ({
        ...prev,
        [String(field)]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.eventName.trim()) {
      errors.eventName = "Event name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.dateFrom) {
      errors.dateFrom = "Start date is required";
    }

    if (!formData.dateTo) {
      errors.dateTo = "End date is required";
    }

    if (
      formData.dateFrom &&
      formData.dateTo &&
      formData.dateFrom > formData.dateTo
    ) {
      errors.dateTo = "End date must be after start date";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    if (formData.guestTypes.length === 0) {
      errors.guestTypes = "At least one guest type is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files && files[0];
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      eventLogo: null,
    }));
    setLogoError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addGuestType = () => {
    if (!newGuestType.trim()) return;
    setFormData((prev) => ({
      ...prev,
      guestTypes: [...prev.guestTypes, newGuestType.trim()],
    }));
    setNewGuestType("");

    // Clear validation error when guest type is added
    if (validationErrors.guestTypes) {
      setValidationErrors((prev) => ({
        ...prev,
        guestTypes: "",
      }));
    }
  };

  const removeGuestType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      guestTypes: prev.guestTypes.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addGuestType();
    }
  };

  // Function to manually populate form with event data
  const populateFormWithEventData = () => {
    if (isEditing && (eventData || eventAttributes)) {
      const attributes = eventAttributes || eventData?.attributes;
      
      // Format time from ISO string to HH:MM format
      const formatTimeFromISO = (isoString: string) => {
        if (!isoString) return "09:00";
        const date = new Date(isoString);
        return date.toTimeString().slice(0, 5);
      };
      
      setFormData({
        eventName: attributes.name || "",
        description: attributes.about || "",
        dateFrom: attributes.event_date_from ? new Date(attributes.event_date_from) : undefined,
        dateTo: attributes.event_date_to ? new Date(attributes.event_date_to) : undefined,
        timeFrom: formatTimeFromISO(attributes.event_time_from) || "09:00",
        timeTo: formatTimeFromISO(attributes.event_time_to) || "17:00",
        location: attributes.location || "",
        requireApproval: attributes.require_approval || false,
        guestTypes: [], // You might need to fetch badges separately
        eventLogo: null, // You might need to handle existing logo
      });
      
      setShowEventData(true);
      
      console.log("Form manually populated with event data");
    }
  };

  const handleNext = async () => {
    // Validate the form first
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to save the data for the current step
      await handleEventPostApiCall();

      // If the API call is successful, move to the next screen
      onNext();
    } catch (error) {
      // The API call failed. The user will remain on the current screen,
      // and the error is already handled by the toast in the API helper.
    } finally {
      setIsLoading(false);
    }
  };
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleEventPostApiCall = async () => {
    const fd = new FormData();

    fd.append("event[name]", formData.eventName);
    fd.append("event[about]", formData.description);
    fd.append("event[location]", formData.location);
    fd.append("event[require_approval]", String(formData.requireApproval));
    fd.append("event[primary_color]", "#ff0000");
    fd.append("event[secondary_color]", "#00ff00");
    fd.append("event[event_type]", plan);
    if (formData.dateFrom)
      fd.append(
        "event[event_date_from]",
        formData.dateFrom.toISOString().split("T")[0]
      );
    if (formData.dateTo)
      fd.append(
        "event[event_date_to]",
        formData.dateTo.toISOString().split("T")[0]
      );
    fd.append("event[event_time_from]", formData.timeFrom || "");
    fd.append("event[event_time_to]", formData.timeTo || "");

    // 👇 Attach file correctly
    if (formData.eventLogo) {
      fd.append("event[logo]", formData.eventLogo);
    }

    // Guest types
    // formData.guestTypes.forEach((type, index) => {
    //   fd.append(`event[badges_attributes][${index}][name]`, type);
    //   fd.append(
    //     `event[badges_attributes][${index}][default]`,
    //     String(index === 0)
    //   );
    // });
    formData.guestTypes.forEach((type, index) => {
      fd.append(`event[badges_attributes][][name]`, type);
      fd.append(`event[badges_attributes][][default]`, String(index === 0));
    });

    fd.append("event[registration_template]", "form");
    fd.append("locale", "en");

    try {
      const response = await eventPostAPi(fd);
      console.log("response----++++++++---------", response.data);
      console.log("event id in create event ---------", response.data.data.id);
      localStorage.setItem("create_eventId", response.data.data.id);

      toast.success("Event created successfully");
      return response;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error saving event data");
      throw error;
    }
  };


  // Populate form with existing event data when editing
  useEffect(() => {
    if (isEditing && (eventData || eventAttributes)) {
      const attributes = eventAttributes || eventData?.attributes;
      
      // Format time from ISO string to HH:MM format
      const formatTimeFromISO = (isoString: string) => {
        if (!isoString) return "09:00";
        const date = new Date(isoString);
        return date.toTimeString().slice(0, 5);
      };
      
      // Set flag to show event data
      setShowEventData(true);
      
      setFormData({
        eventName: attributes.name || "",
        description: attributes.about || "",
        dateFrom: attributes.event_date_from ? new Date(attributes.event_date_from) : undefined,
        dateTo: attributes.event_date_to ? new Date(attributes.event_date_to) : undefined,
        timeFrom: formatTimeFromISO(attributes.event_time_from) || "09:00",
        timeTo: formatTimeFromISO(attributes.event_time_to) || "17:00",
        location: attributes.location || "",
        requireApproval: attributes.require_approval || false,
        guestTypes: [], 
        eventLogo: null, 
      });
      
      console.log("Form populated with event data:", {
        name: attributes.name,
        about: attributes.about,
        event_date_from: attributes.event_date_from,
        event_date_to: attributes.event_date_to,
        event_time_from: attributes.event_time_from,
        event_time_to: attributes.event_time_to,
        location: attributes.location,
        require_approval: attributes.require_approval,
        event_type: attributes.event_type,
        logo_url: attributes.logo_url,
        primary_color: attributes.primary_color,
        secondary_color: attributes.secondary_color,
        registration_page_banner: attributes.registration_page_banner
      });
    } else {
      // If not editing, don't show event data
      setShowEventData(false);
    }
  }, [isEditing, eventData, eventAttributes]);

  useEffect(()=>{

const fetchGetShowEventApi = async ()=>{
 const response = await getShowEventData()
 console.log("Show event data:", response);
}

fetchGetShowEventApi()

  })



  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-normal mb-4 sm:mb-6 lg:mb-8 text-neutral-900"></h2>
      
      {/* Event Data Flag Indicator */}
      {showEventData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-medium text-blue-800">Editing Existing Event</p>
            </div>
            <button
              onClick={() => setShowEventData(false)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Hide Event Data
            </button>
          </div>
          <p className="text-xs text-blue-600">
            Event data has been loaded from the database. You can modify the fields below.
          </p>
        </div>
      )}
      
      {/* Show Event Data Button (when hidden) */}
      {!showEventData && isEditing && (eventData || eventAttributes) && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <p className="text-sm font-medium text-gray-700">Event Data Available</p>
            </div>
            <button
              onClick={populateFormWithEventData}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Show Event Data
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Click to load existing event data into the form fields.
          </p>
        </div>
      )}

      {/* Mobile-First Responsive Grid */}
      <div className="w-full space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 xl:gap-8">
        {/* Event Logo Section */}
        <div className="w-full border rounded-2xl border-gray-200 p-4 sm:p-5">
          <label className="block text-xs font-normal text-neutral-700 mb-2">
            Event Logo
          </label>
          <div
            className={`
              border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors cursor-pointer min-h-[200px] sm:min-h-[240px] flex flex-col justify-center
              ${
                logoError
                  ? "border-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".svg,.png,.jpg,.jpeg"
            />
            {formData.eventLogo ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(formData.eventLogo)}
                    alt="Event Logo Preview"
                    className="max-h-24 sm:max-h-32 lg:max-h-36 max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 mb-1">
                  <span className="font-medium text-[#202242]">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-neutral-500">
                  SVG, PNG or JPG (max. 800x400px)
                </p>
              </>
            )}
          </div>
          {logoError && (
            <p className="mt-2 flex items-center text-xs text-red-600">
              <Info size={14} className="mr-1 flex-shrink-0" />
              {logoError}
            </p>
          )}

          {/* Require Approval Toggle */}
          <div className="flex flex-col sm:flex-row p-3 sm:p-4 mt-4 rounded-2xl bg-gray-100 items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <label className="text-sm font-medium text-gray-700">
                Require approval
              </label>
              <Info size={14} className="text-gray-400 flex-shrink-0" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) =>
                  handleInputChange("requireApproval", e.target.checked)
                }
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  formData.requireApproval ? "bg-teal-500" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    formData.requireApproval
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  } mt-0.5`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="w-full space-y-4 sm:space-y-6 border border-gray-200 p-4 sm:p-6 rounded-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Event name"
              value={formData.eventName}
              onChange={(e) => handleInputChange("eventName", e.target.value)}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors ${
                validationErrors.eventName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {validationErrors.eventName && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.eventName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter a description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none transition-colors ${
                validationErrors.description
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={
                  formData.dateFrom
                    ? formData.dateFrom.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "dateFrom",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  validationErrors.dateFrom
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.dateFrom && (
                <p className="mt-1 text-xs text-red-600">
                  {validationErrors.dateFrom}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={
                  formData.dateTo
                    ? formData.dateTo.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "dateTo",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  validationErrors.dateTo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.dateTo && (
                <p className="mt-1 text-xs text-red-600">
                  {validationErrors.dateTo}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time From
              </label>
              <input
                type="time"
                value={formData.timeFrom}
                onChange={(e) => handleInputChange("timeFrom", e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="time"
                value={formData.timeTo}
                onChange={(e) => handleInputChange("timeTo", e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Event location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg pr-10 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  validationErrors.location
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <MapPin className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400" />
            </div>
            {validationErrors.location && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.location}
              </p>
            )}
          </div>
        </div>

        {/* Guest Types Section */}
        <div className="w-full space-y-4 sm:space-y-6 border border-gray-200 p-4 sm:p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Guest Types <span className="text-red-500">*</span>
              </label>
              <Info size={14} className="text-gray-400 flex-shrink-0" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                value={newGuestType}
                onChange={(e) => setNewGuestType(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. Speaker, VIP"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
              <button
                onClick={addGuestType}
                className="px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-700 flex-shrink-0 transition-colors"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            {validationErrors.guestTypes && (
              <p className="mb-2 text-xs text-red-600">
                {validationErrors.guestTypes}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Types
            </label>
            <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
              {formData.guestTypes.map((type, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border"
                >
                  <span className="text-sm text-gray-700 truncate pr-2">
                    {type}
                  </span>
                  <button
                    onClick={() => removeGuestType(index)}
                    className="text-red-400 hover:text-red-500 flex-shrink-0 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {formData.guestTypes.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No guest types added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0 || isLoading}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border
            ${
              currentStep === 0 || isLoading
                ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
                : "text-slate-800 border-gray-300 hover:bg-gray-50"
            }`}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isLoading}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${
              isLoading
                ? "bg-slate-600 cursor-not-allowed text-white"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {currentStep === totalSteps - 1 ? "Creating..." : "Loading..."}
            </>
          ) : currentStep === totalSteps - 1 ? (
            "Create Event"
          ) : (
            "Next →"
          )}
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-6 sm:mt-8 lg:mt-12 flex justify-center sm:justify-end">
        <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 p-4 sm:p-6 bg-gray-50 rounded-2xl transition-colors">
          <span className="text-center sm:text-left">
            Can't find what you're looking for?
          </span>
          <ChevronLeft className="rotate-90 flex-shrink-0" size={14} />
        </button>
      </div>
    </div>
  );
};

export default MainData;
