import React, { useEffect, useState, useRef } from "react";
import Assets from "../../../../utils/Assets";
import { Clock, Edit, MapPin, Loader2, Share2 } from "lucide-react";
import RegistrationChart from "./components/RegsitrationChart";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  getEventbyId,
  updateEventById,
  getEventUserMetrics,
} from "@/apis/apiHelpers";
import { toast, ToastContainer } from "react-toastify";

type HomeSummaryProps = {
  chartData?: Array<Record<string, any>>;
  onTimeRangeChange?: (range: string) => void;
};

function HomeSummary({ chartData, onTimeRangeChange }: HomeSummaryProps) {
  const [eventData, setEventData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const eventId = location.state?.eventId || paramId;

  // Fetch event data
  const getEventDataById = async (id: string | number) => {
    try {
      const response = await getEventbyId(id);
      setEventData(response.data.data);
    } catch (error) {
      console.error("Error fetching event by ID:", error);
    }
  };

  // Fetch metrics data
  const fetchEventMetrics = async (id: string | number) => {
    try {
      const response = await getEventUserMetrics(id);
      console.log("Metrics response:", response.data);
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error("Error fetching event metrics:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      getEventDataById(eventId);
      fetchEventMetrics(eventId);
    }
  }, [eventId]);

  if (!eventData) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="absolute inset-0 h-12 w-12 border-2 border-blue-100 rounded-full"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium mt-6">
            Loading event details...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we fetch your event information
          </p>
        </div>
      </div>
    );
  }

  const {
    name,
    event_type,
    event_date_from,
    event_date_to,
    event_time_from,
    event_time_to,
    about,
    location: eventLocation,
    logo_url,
    primary_color,
    secondary_color,
    registration_page_banner,
    require_approval,
  } = eventData.attributes;

  // Define stats config (label + icon + key) using real metrics data
  const stats = [
    {
      label: "Total Registrations",
      value: metrics?.total_registration || 0,
      icon: Assets.icons.totalRegistration,
    },
    {
      label: "Today Registrations",
      value: metrics?.todays_registration || 0,
      icon: Assets.icons.todayRegistration,
    },
    {
      label: "Approved Registrations",
      value: metrics?.approved_registration || 0,
      icon: Assets.icons.approvedRegistration,
    },
    {
      label: "Pending Users",
      value: metrics?.pending_users || 0,
      icon: Assets.icons.pendingUsers,
    },
  ];

  // Default chart data if none provided
  const defaultChartData = [
    { month: "Jan", registered: 45 },
    { month: "Feb", registered: 120 },
    { month: "Mar", registered: 155 },
    { month: "Apr", registered: 60 },
    { month: "May", registered: 85 },
    { month: "Jun", registered: 200 },
  ];

  const handleTimeRangeChange = (newRange: string) => {
    // Call parent callback if provided
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };

  // Format time nicely
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Direct image upload function
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files && files[0];
    if (!file || !eventId) return;

    // File size validation
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        `File size is ${fileSizeInMB}MB. Maximum allowed size is 2MB.`
      );
      return;
    }

    // File type validation
    const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload SVG, PNG, or JPG.");
      return;
    }

    // Image dimension validation for non-SVG files
    if (file.type !== "image/svg+xml") {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      const dimensionValidation = await new Promise<boolean>((resolve) => {
        img.onload = function () {
          URL.revokeObjectURL(objectUrl);
          if (img.width > 400 || img.height > 400) {
            toast.error(
              `Image dimensions are ${img.width}x${img.height}px. Maximum allowed dimensions are 400x400px.`
            );
            resolve(false);
            return;
          }
          resolve(true);
        };

        img.onerror = function () {
          URL.revokeObjectURL(objectUrl);
          toast.error("Failed to load image. Please try a different file.");
          resolve(false);
        };

        img.src = objectUrl;
      });

      if (!dimensionValidation) {
        return;
      }
    }

    // Direct upload
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("event[logo]", file);

      const response = await updateEventById(eventId, fd);
      console.log("Logo updated successfully:", response.data);

      // Update the event data with new logo URL
      setEventData((prev: any) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          logo_url: response?.data?.data?.attributes?.logo_url,
        },
      }));

      toast.success("Logo updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error updating logo");
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* edit event details */}

        <div className="p-4 sm:p-6 lg:p-[24px] bg-white rounded-2xl flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-0">
          {/* logo and event name */}
          <div className="gap-3 flex flex-col sm:flex-row items-center w-full lg:w-auto">
            <div className="relative h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] lg:h-[200px] lg:w-[200px] bg-neutral-50 items-center justify-center flex rounded-2xl flex-shrink-0">
              {/* Upload Loading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <div className="absolute inset-0 h-8 w-8 border-2 border-blue-100 rounded-full"></div>
                  </div>
                  <p className="text-blue-600 text-xs font-medium mt-3">
                    Uploading...
                  </p>
                </div>
              )}

              {/* Edit button - directly triggers file selection */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`h-[36px] w-[36px] sm:h-[40px] sm:w-[40px] lg:h-[44px] lg:w-[44px] flex items-center justify-center absolute top-2 right-2 rounded-xl bg-white drop-shadow-2xl transition-all duration-200 z-20 ${
                  isUploading
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-pointer hover:bg-gray-50 hover:scale-105"
                }`}
              >
                {isUploading ? (
                  <div className="relative">
                    <Loader2
                      size={16}
                      className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-spin text-blue-600"
                    />
                    <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border border-blue-100 rounded-full"></div>
                  </div>
                ) : (
                  <Edit
                    size={16}
                    className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600"
                  />
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".svg,.png,.jpg,.jpeg"
                disabled={isUploading}
              />

              {/* Current logo display */}
              {eventData?.attributes?.logo_url ? (
                <img
                  src={eventData.attributes.logo_url}
                  alt="Event Logo"
                  className={`h-[80px] w-[74px] sm:h-[100px] sm:w-[93px] lg:h-[120px] lg:w-[111.8px] rounded-2xl transition-opacity duration-200 ${
                    isUploading ? "opacity-50" : "opacity-100"
                  }`}
                />
              ) : (
                <div
                  className={`h-[80px] w-[74px] sm:h-[100px] sm:w-[93px] lg:h-[120px] lg:w-[111.8px] bg-gray-300 flex items-center justify-center rounded-2xl text-gray-500 text-xs font-medium transition-opacity duration-200 ${
                    isUploading ? "opacity-50" : "opacity-100"
                  }`}
                >
                  No Logo
                </div>
              )}
            </div>

            {/* text detail part */}
            <div className="items-center text-center sm:text-left w-full sm:w-auto">
              {/* express or advance event */}
              <div className="p-3 lg:p-[12px] bg-emerald-50 rounded-3xl items-center flex gap-2 justify-center sm:justify-start w-fit mx-auto sm:mx-0">
                <img
                  src={Assets.icons.expressDot}
                  className="h-[8px] w-[8px]"
                  alt=""
                />
                <p className="text-emerald-500 text-xs sm:text-sm">
                  {event_type}
                </p>
              </div>

              {/* event name */}
              <p className="mt-4 lg:mt-[16px] text-sm sm:text-base lg:text-lg text-slate-800 font-medium">
                {name}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-[16px]">
                <Clock
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  {event_date_from} {formatTime(event_time_from)} to{" "}
                  {event_date_to} {formatTime(event_time_to)}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-[16px]">
                <MapPin
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  {eventLocation}
                </p>
              </div>

              <p className="mt-4 lg:mt-[23px] text-neutral-500 text-xs sm:text-sm font-normal">
                Last edit: Before 3hr
              </p>
            </div>
          </div>

          {/* edit button and share button */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div
              onClick={() => {
                const registrationUrl = `${window.location.origin}/register/${eventId}`;
                navigator.clipboard
                  .writeText(registrationUrl)
                  .then(() => {
                    toast.success("Registration link copied to clipboard!");
                  })
                  .catch(() => {
                    toast.error("Failed to copy link");
                  });
              }}
              className="rounded-2xl bg-green-50 py-2 px-4 lg:py-[10px] lg:px-[16px] flex items-center gap-2 cursor-pointer hover:bg-green-100 transition-colors justify-center flex-shrink-0"
            >
              <Share2 size={16} className="lg:w-5 lg:h-5 text-green-600" />
              <p className="text-green-700 text-xs sm:text-sm font-normal">
                Share Registration
              </p>
            </div>
            <div
              onClick={() =>
                navigate("/express-event", {
                  state: {
                    // Event type and basic info
                    plan: event_type,
                    eventData: eventData,
                    isEditing: true,

                    // All event attributes
                    eventAttributes: {
                      name,
                      event_type,
                      event_date_from,
                      event_date_to,
                      event_time_from,
                      event_time_to,
                      about,
                      location: eventLocation,
                      logo_url,
                      primary_color,
                      secondary_color,
                      registration_page_banner,
                      require_approval,
                    },

                    // Component props
                    chartData,
                    onTimeRangeChange,

                    // Event ID for reference
                    eventId,

                    // Stats data
                    stats,

                    // Additional metadata
                    lastEdit: "Before 3hr",
                    currentStep: 0, // Start from first step when editing
                  },
                })
              }
              className="rounded-2xl bg-[#F2F6FF] py-2 px-4 lg:py-[10px] lg:px-[16px] flex items-center gap-2 cursor-pointer hover:bg-[#E8F1FF] transition-colors justify-center flex-shrink-0"
            >
              <Edit size={16} className="lg:w-5 lg:h-5" />
              <p className="text-[#202242] text-xs sm:text-sm font-normal">
                Edit Event
              </p>
            </div>
          </div>
        </div>

        {/* registration and user counters - Responsive Grid */}
        <div className="mt-6 lg:mt-[24px] gap-3 sm:gap-4 lg:gap-3 grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {stats.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="bg-white flex items-center gap-3 p-4 lg:p-[16px] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 lg:p-4 bg-neutral-50 rounded-xl flex-shrink-0">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>
              <div className="justify-between flex flex-col min-w-0 flex-1">
                <p className="text-xs font-normal sm:text-sm text-[#656C95] line-clamp-2">
                  {item.label}
                </p>
                <p className="mt-1 text-sm sm:text-base lg:text-lg font-medium text-[#202242]">
                  {item.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Registrations Activity Chart */}
        <div className="mt-6 lg:mt-[24px]">
          <RegistrationChart
            data={chartData || defaultChartData}
            title="Registrations Activity"
            legend="Registered"
            highlightDataKey="Mar"
            highlightValue={155}
            onTimeRangeChange={handleTimeRangeChange}
            height="320px"
            className="shadow-sm hover:shadow-md transition-shadow"
          />
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default HomeSummary;
