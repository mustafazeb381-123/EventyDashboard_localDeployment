import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Check,
  MapPin,
  Info,
  QrCode,
  Calendar,
  Clock,
  Pencil,
  X,
  Loader2,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getEventbyId, updateEventById } from "@/apis/apiHelpers";
import { Skeleton } from "@/components/ui/skeleton";

interface ToggleStates {
  confirmationMsg: boolean;
  userQRCode: boolean;
  location: boolean;
  eventDetails: boolean;
}

interface AdvanceConfirmationProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const AdvanceConfirmation: React.FC<AdvanceConfirmationProps> = ({
  onNext,
  onPrevious,
  eventId: propEventId,
  currentStep,
  totalSteps,
  onStepClick,
}) => {
  // Get effective event ID
  const { id: routeId } = useParams();
  const effectiveEventId =
    (propEventId as string | undefined) ||
    (routeId as string | undefined) ||
    localStorage.getItem("create_eventId") ||
    undefined;

  console.log("AdvanceConfirmation - event id:", effectiveEventId);

  const [toggleStates, setToggleStates] = useState<ToggleStates>({
    confirmationMsg: false,
    userQRCode: false,
    location: false,
    eventDetails: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState<string>("");
  const [eventData, setEventData] = useState<any>(null);

  // Edit modals for Location and Event Details cards in preview (same as ConfirmationDetails)
  const [editModalType, setEditModalType] = useState<"location" | "eventDetails" | null>(null);
  const [modalLocation, setModalLocation] = useState("");
  const [modalDateFrom, setModalDateFrom] = useState("");
  const [modalDateTo, setModalDateTo] = useState("");
  const [modalTimeFrom, setModalTimeFrom] = useState("09:00");
  const [modalTimeTo, setModalTimeTo] = useState("17:00");
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [modalErrors, setModalErrors] = useState<{
    location?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  // Custom toast (same pattern as AdvancePartners / ConfirmationDetails)
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  // Helper function to format date from ISO string to readable format
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Helper function to format time from ISO string to HH:MM AM/PM
  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  // Fetch event data and set initial toggle states
  useEffect(() => {
    const fetchEventData = async () => {
      if (!effectiveEventId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getEventbyId(effectiveEventId);
        const fetchedEventData = response.data.data;

        console.log("AdvanceConfirmation - Fetched event data:", fetchedEventData);

        // Store full event data
        setEventData(fetchedEventData);

        // Map API fields to toggle states
        const newToggleStates: ToggleStates = {
          confirmationMsg:
            fetchedEventData.attributes?.display_confirmation_message || false,
          userQRCode: fetchedEventData.attributes?.print_qr || false,
          location: fetchedEventData.attributes?.display_location || false,
          eventDetails: fetchedEventData.attributes?.display_event_details || false,
        };

        setEventName(fetchedEventData.attributes?.name || "");
        setToggleStates(newToggleStates);
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [effectiveEventId]);

  const handleNext = () => onNext(effectiveEventId);
  const handleBack = () => onPrevious?.();

  const apiKeyMap: Record<keyof ToggleStates, string> = {
    confirmationMsg: "display_confirmation_message",
    userQRCode: "print_qr",
    location: "display_location",
    eventDetails: "display_event_details",
  };

  const updateToggle = async (key: keyof ToggleStates, value: boolean) => {
    setToggleStates((prev) => ({ ...prev, [key]: value }));
    if (effectiveEventId != null && effectiveEventId !== "") {
      try {
        const fd = new FormData();
        fd.append(`event[${apiKeyMap[key]}]`, value ? "true" : "false");
        await updateEventById(String(effectiveEventId), fd);
      } catch (err) {
        console.error("Failed to persist toggle:", err);
        setToggleStates((prev) => ({ ...prev, [key]: !value }));
        showNotification("Failed to save setting", "error");
      }
    }
  };

  const toDateInputValue = (isoString: string | undefined): string => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };
  const toTimeInputValue = (isoString: string | undefined): string => {
    if (!isoString) return "09:00";
    try {
      return new Date(isoString).toTimeString().slice(0, 5);
    } catch {
      return "09:00";
    }
  };

  const openLocationEditModal = () => {
    setModalLocation(eventData?.attributes?.location ?? "");
    setModalErrors({});
    setEditModalType("location");
  };

  const openEventDetailsEditModal = () => {
    setModalLocation(eventData?.attributes?.location ?? "");
    setModalDateFrom(toDateInputValue(eventData?.attributes?.event_date_from));
    setModalDateTo(toDateInputValue(eventData?.attributes?.event_date_to));
    setModalTimeFrom(toTimeInputValue(eventData?.attributes?.event_time_from));
    setModalTimeTo(toTimeInputValue(eventData?.attributes?.event_time_to));
    setModalErrors({});
    setEditModalType("eventDetails");
  };

  const closeEditModal = () => {
    setEditModalType(null);
    setModalErrors({});
  };

  const handleSaveLocationModal = async () => {
    if (!effectiveEventId) return;
    const trimmed = modalLocation.trim();
    if (!trimmed) {
      setModalErrors({ location: "Event location is required" });
      showNotification("Event location is required", "error");
      return;
    }
    setModalErrors({});
    setIsSavingModal(true);
    try {
      const fd = new FormData();
      fd.append("event[location]", trimmed);
      await updateEventById(String(effectiveEventId), fd);
      setEventData((prev: any) =>
        prev ? { ...prev, attributes: { ...prev.attributes, location: trimmed } } : prev
      );
      closeEditModal();
      showNotification("Event location updated", "success");
    } catch (err: any) {
      console.error("Failed to save location:", err);
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? "Failed to save location";
      showNotification(msg, "error");
    } finally {
      setIsSavingModal(false);
    }
  };

  const handleSaveEventDetailsModal = async () => {
    if (!effectiveEventId) return;
    const loc = modalLocation.trim();
    const from = modalDateFrom.trim();
    const to = modalDateTo.trim();
    const errors: { location?: string; dateFrom?: string; dateTo?: string } = {};
    if (!loc) errors.location = "Location is required";
    if (!from) errors.dateFrom = "Start date is required";
    if (!to) errors.dateTo = "End date is required";
    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      showNotification("Please fill in all required fields: Location, Start Date, End Date", "error");
      return;
    }
    setModalErrors({});
    setIsSavingModal(true);
    try {
      const fd = new FormData();
      fd.append("event[location]", loc);
      fd.append("event[event_date_from]", from);
      fd.append("event[event_date_to]", to);
      fd.append("event[event_time_from]", modalTimeFrom ? `${modalTimeFrom}:00` : "09:00:00");
      fd.append("event[event_time_to]", modalTimeTo ? `${modalTimeTo}:00` : "17:00:00");
      await updateEventById(String(effectiveEventId), fd);
      const fromDate = new Date(from).toISOString();
      const toDate = new Date(to).toISOString();
      const fromTime = modalTimeFrom ? `${modalTimeFrom}:00` : undefined;
      const toTime = modalTimeTo ? `${modalTimeTo}:00` : undefined;
      setEventData((prev: any) =>
        prev
          ? {
              ...prev,
              attributes: {
                ...prev.attributes,
                location: loc,
                event_date_from: fromDate,
                event_date_to: toDate,
                event_time_from: fromTime ?? prev.attributes?.event_time_from,
                event_time_to: toTime ?? prev.attributes?.event_time_to,
              },
            }
          : prev
      );
      closeEditModal();
      showNotification("Event details updated", "success");
    } catch (err: any) {
      console.error("Failed to save event details:", err);
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? "Failed to save event details";
      showNotification(msg, "error");
    } finally {
      setIsSavingModal(false);
    }
  };

  const StatusCard = ({
    icon: Icon,
    title,
    enabled,
    onChange,
    showQR = false,
  }: {
    icon: React.ComponentType<any>;
    title: string;
    enabled: boolean;
    onChange: (value: boolean) => void;
    showQR?: boolean;
  }) => {
    const styles = enabled
      ? {
          border: "border-blue-200",
          bg: "bg-white",
          iconBg: "bg-blue-500",
          iconColor: "text-white",
          titleColor: "text-blue-600",
          switchBg: "bg-blue-600",
        }
      : {
          border: "border-gray-200",
          bg: "bg-gray-50",
          iconBg: "bg-gray-200",
          iconColor: "text-gray-500",
          titleColor: "text-gray-500",
          switchBg: "bg-gray-300",
        };

    return (
      <div
        className={`p-6 rounded-2xl ${styles.border} ${styles.bg} border-2 h-64`}
      >
        <div className="flex items-center justify-between mb-6">
          <span className={`text-sm font-medium ${styles.titleColor}`}>
            {title}
          </span>
          <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${styles.switchBg}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center flex-1">
          <div
            className={`w-20 h-20 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}
          >
            {showQR && enabled ? (
              <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-inner">
                <div className="w-full h-full bg-gray-900 rounded-lg grid grid-cols-4 gap-0.5 p-1">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm transition-all ${
                        Math.random() > 0.5 ? "bg-white" : "bg-gray-900"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Icon size={32} className={styles.iconColor} />
            )}
          </div>
          {enabled && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      {/* Notification Toast (same as AdvancePartners / ConfirmationDetails) */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft
            className="text-gray-500 cursor-pointer"
            size={20}
            onClick={handleBack}
          />
          <h2 className="text-xl font-semibold text-gray-900">
            Advance Confirmation
          </h2>
        </div>

        {/* Steps - clickable to navigate */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, index) => index).map((step) => (
            <div key={step} className="flex items-center">
              <button
                type="button"
                onClick={() => onStepClick?.(step)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step === currentStep
                    ? "border-pink-500 bg-white text-pink-500"
                    : step < currentStep
                    ? "bg-pink-500 border-pink-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                } ${onStepClick ? "cursor-pointer hover:opacity-90" : ""}`}
              >
                {step < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{String(step + 1).padStart(2, "0")}</span>
                )}
              </button>
              {step < totalSteps - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    step < currentStep ? "bg-pink-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Toggles */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border-2 border-gray-200 h-64"
                >
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <Skeleton className="w-20 h-20 rounded-full mb-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <StatusCard
                icon={Check}
                title="Confirmation message"
                enabled={toggleStates.confirmationMsg}
                onChange={(val) => updateToggle("confirmationMsg", val)}
              />
              <StatusCard
                icon={QrCode}
                title="User QR Code"
                enabled={toggleStates.userQRCode}
                onChange={(val) => updateToggle("userQRCode", val)}
                showQR
              />
              <StatusCard
                icon={MapPin}
                title="Location"
                enabled={toggleStates.location}
                onChange={(val) => updateToggle("location", val)}
              />
              <StatusCard
                icon={Info}
                title="Event details"
                enabled={toggleStates.eventDetails}
                onChange={(val) => updateToggle("eventDetails", val)}
              />
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="bg-[#f5fdf8] rounded-2xl border border-green-100 shadow-sm p-6">
          <div className="bg-white rounded-2xl border overflow-hidden">
            {/* Browser Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-100 text-gray-500 text-xs rounded-md px-3 py-1 truncate border border-gray-200">
                  {isLoading
                    ? "Loading..."
                    : `https://eventy.com/registration/${eventName?.toLowerCase().replace(/\s+/g, "-") || "event"}`}
                </div>
              </div>
            </div>

            {/* Event Preview */}
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </div>
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <Skeleton className="w-20 h-20 rounded-full mb-3" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    {eventData?.attributes?.logo_url ? (
                      <img
                        src={eventData.attributes.logo_url}
                        alt="Event Logo"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Calendar size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {eventName || "Event Name"}
                      </h3>
                      {eventData?.attributes?.event_date_from && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={14} className="text-gray-500" />
                          <span>
                            {formatDate(eventData.attributes.event_date_from)}
                            {eventData?.attributes?.event_date_to &&
                            eventData.attributes.event_date_to !==
                              eventData.attributes.event_date_from
                              ? ` - ${formatDate(eventData.attributes.event_date_to)}`
                              : ""}
                          </span>
                        </div>
                      )}
                      {eventData?.attributes?.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin size={14} className="text-gray-500" />
                          <span>{eventData.attributes.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {eventData?.attributes?.about && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-1">
                        About (Description)
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {eventData.attributes.about}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                      <Check size={28} className="text-blue-600" />
                    </div>
                    <p className="text-blue-600 font-medium text-sm">
                      Registration Done
                    </p>
                  </div>

                  {/* Confirmation Message */}
                  {toggleStates.confirmationMsg && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={20} className="text-white" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-800">
                          Registration Confirmed Successfully!
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                          You will receive a confirmation email shortly
                        </p>
                      </div>
                    </div>
                  )}

                  {/* QR Code */}
                  {toggleStates.userQRCode && (
                    <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-center shadow-sm">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <QrCode size={20} className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">
                          Your Event QR Code
                        </span>
                      </div>
                      <div className="w-32 h-32 mx-auto bg-white rounded-xl p-3 shadow-inner border-2 border-blue-200">
                        <div className="w-full h-full bg-gray-900 rounded-lg grid grid-cols-4 gap-0.5 p-1">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-sm ${
                                Math.random() > 0.5 ? "bg-white" : "bg-gray-900"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-3">
                        Present this QR code at the event entrance
                      </p>
                    </div>
                  )}

                  {/* Location - with edit button */}
                  {toggleStates.location && (eventData?.attributes?.location != null || eventData) && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin
                            size={20}
                            className="text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-orange-800">
                            Event Location
                          </p>
                          <p className="text-xs text-orange-600 mt-0.5 truncate">
                            {eventData?.attributes?.location ?? "—"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={openLocationEditModal}
                        className="flex-shrink-0 p-2 rounded-lg text-orange-600 hover:bg-orange-100 transition-colors"
                        title="Edit location"
                        aria-label="Edit event location"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  )}

                  {/* Event Details - with edit button */}
                  {toggleStates.eventDetails && (
                    <div className="mt-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-sm">
                      <div className="flex items-center justify-center gap-2 mb-4 relative">
                        <Info size={18} className="text-purple-600" />
                        <span className="text-sm font-semibold text-purple-800">
                          Event Details
                        </span>
                        <button
                          type="button"
                          onClick={openEventDetailsEditModal}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
                          title="Edit event details"
                          aria-label="Edit event details"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {eventData?.attributes?.event_date_from && (
                          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                            <Calendar size={16} className="text-purple-500" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-purple-900">
                                <span className="font-semibold">Start Date: </span>
                                {formatDate(eventData.attributes.event_date_from)}
                              </p>
                            </div>
                          </div>
                        )}
                        {eventData?.attributes?.event_date_to &&
                          eventData.attributes.event_date_to !==
                            eventData.attributes.event_date_from && (
                            <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                              <Calendar size={16} className="text-purple-500" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-purple-900">
                                  <span className="font-semibold">End Date: </span>
                                  {formatDate(eventData.attributes.event_date_to)}
                                </p>
                              </div>
                            </div>
                          )}
                        {eventData?.attributes?.event_time_from && (
                          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                            <Clock size={16} className="text-purple-500" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-purple-900">
                                <span className="font-semibold">Time: </span>
                                {formatTime(eventData.attributes.event_time_from)}
                                {eventData?.attributes?.event_time_to
                                  ? ` - ${formatTime(eventData.attributes.event_time_to)}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        )}
                        {eventData?.attributes?.location && (
                          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                            <MapPin size={16} className="text-purple-500" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-purple-900">
                                <span className="font-semibold">Location: </span>
                                {eventData.attributes.location}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </span>

        <button
          onClick={handleNext}
          className="cursor-pointer px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors font-medium"
        >
          Next →
        </button>
      </div>

      {/* Edit Event Location Modal */}
      {editModalType === "location" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Event Location</h3>
              <button type="button" onClick={closeEditModal} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={modalLocation}
                  onChange={(e) => {
                    setModalLocation(e.target.value);
                    if (modalErrors.location) setModalErrors((p) => ({ ...p, location: undefined }));
                  }}
                  placeholder="Event location"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    modalErrors.location ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {modalErrors.location && (
                  <p className="mt-1 text-xs text-red-600">{modalErrors.location}</p>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeEditModal} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveLocationModal} disabled={isSavingModal} className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {isSavingModal ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Details Modal */}
      {editModalType === "eventDetails" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Event Details</h3>
              <button type="button" onClick={closeEditModal} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={modalDateFrom}
                  onChange={(e) => {
                    setModalDateFrom(e.target.value);
                    if (modalErrors.dateFrom) setModalErrors((p) => ({ ...p, dateFrom: undefined }));
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    modalErrors.dateFrom ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {modalErrors.dateFrom && (
                  <p className="mt-1 text-xs text-red-600">{modalErrors.dateFrom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={modalDateTo}
                  onChange={(e) => {
                    setModalDateTo(e.target.value);
                    if (modalErrors.dateTo) setModalErrors((p) => ({ ...p, dateTo: undefined }));
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    modalErrors.dateTo ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {modalErrors.dateTo && (
                  <p className="mt-1 text-xs text-red-600">{modalErrors.dateTo}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time From</label>
                  <input
                    type="time"
                    value={modalTimeFrom}
                    onChange={(e) => setModalTimeFrom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time To</label>
                  <input
                    type="time"
                    value={modalTimeTo}
                    onChange={(e) => setModalTimeTo(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={modalLocation}
                  onChange={(e) => {
                    setModalLocation(e.target.value);
                    if (modalErrors.location) setModalErrors((p) => ({ ...p, location: undefined }));
                  }}
                  placeholder="Event location"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    modalErrors.location ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {modalErrors.location && (
                  <p className="mt-1 text-xs text-red-600">{modalErrors.location}</p>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeEditModal} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveEventDetailsModal} disabled={isSavingModal} className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {isSavingModal ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save"}
                </button>
              </div>
            </div>
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

export default AdvanceConfirmation;
