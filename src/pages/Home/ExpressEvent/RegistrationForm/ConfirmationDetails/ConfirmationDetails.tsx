import React, { useState, useEffect } from "react";
import { Check, MapPin, Info, QrCode, Calendar, Clock } from "lucide-react";
import { useParams } from "react-router-dom";
import { getEventbyId } from "@/apis/apiHelpers";
import { Skeleton } from "@/components/ui/skeleton";

interface ToggleStates {
  confirmationMsg: boolean;
  userQRCode: boolean;
  location: boolean;
  eventDetails: boolean;
}

interface ConfirmationDetailsProps {
  onToggleStatesChange?: (states: ToggleStates) => void;
  eventId?: string;
  selectedTemplateData?: any;
  onNext?: (eventId: string) => void; // Updated to accept eventId
  onPrevious?: () => void;
}

const ConfirmationDetails: React.FC<ConfirmationDetailsProps> = ({
  onToggleStatesChange,
  eventId: propEventId,
  onNext,
}) => {
  // Get effective event ID
  const { id: routeId } = useParams();
  const effectiveEventId =
    (propEventId as string | undefined) || (routeId as string | undefined);

  console.log("ConfirmationDetails - event id:", effectiveEventId);

  const [toggleStates, setToggleStates] = useState<ToggleStates>({
    confirmationMsg: false,
    userQRCode: false,
    location: false,
    eventDetails: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState<string>("");
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    onToggleStatesChange?.(toggleStates);
  }, [toggleStates, onToggleStatesChange]);

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

        console.log(
          "ConfirmationDetails - Fetched event data:",
          fetchedEventData,
        );

        // Store full event data
        setEventData(fetchedEventData);

        // Map API fields to toggle states
        const newToggleStates: ToggleStates = {
          confirmationMsg:
            fetchedEventData.attributes?.display_confirmation_message || false,
          userQRCode: fetchedEventData.attributes?.print_qr || false,
          location: fetchedEventData.attributes?.display_location || false,
          eventDetails:
            fetchedEventData.attributes?.display_event_details || false,
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

  const updateToggle = (key: keyof ToggleStates, value: boolean) => {
    setToggleStates((prev) => ({ ...prev, [key]: value }));
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
    return (
      <div
        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 h-64 cursor-pointer ${
          enabled
            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg shadow-blue-100/50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }`}
        onClick={() => onChange(!enabled)}
      >
        <div className="flex items-center justify-between mb-6">
          <span
            className={`text-sm font-semibold font-poppins transition-colors ${
              enabled ? "text-blue-700" : "text-gray-600"
            }`}
          >
            {title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(!enabled);
            }}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              enabled
                ? "bg-blue-600 focus:ring-blue-500"
                : "bg-gray-300 focus:ring-gray-400"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 -mt-2">
          <div
            className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
              enabled
                ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200 scale-110"
                : "bg-gray-100 group-hover:bg-gray-200"
            }`}
          >
            {showQR && enabled ? (
              <div className="w-20 h-20 bg-white rounded-xl p-2 shadow-inner">
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
              <Icon
                size={40}
                className={enabled ? "text-white" : "text-gray-400"}
              />
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
    <div className="w-full bg-white min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-8 max-w-full">
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
                    <Skeleton className="h-7 w-12 rounded-full" />
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <Skeleton className="w-24 h-24 rounded-2xl mb-4" />
                    <Skeleton className="h-6 w-16 rounded-full" />
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

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Browser Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500 font-medium ml-2">
                  Preview
                </span>
              </div>
              <div className="w-8 h-6 bg-white border border-gray-300 rounded text-xs text-gray-400 flex items-center justify-center">
                🔒
              </div>
            </div>

            {/* URL Bar */}
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <div className="bg-white rounded-lg px-3 py-1.5 text-xs text-gray-500 border border-gray-200 font-mono flex items-center gap-2">
                <span className="text-blue-500">https://</span>
                <span>
                  eventy.com/registration/
                  {eventName?.toLowerCase().replace(/\s+/g, "-") || "event"}
                </span>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-8 bg-white">
              <div className="text-center mb-8">
                <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                  <Calendar className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">
                  {eventName || "Event Name"}
                </h2>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {eventData?.attributes?.event_date_from
                        ? formatDate(eventData.attributes.event_date_from)
                        : ""}
                      {eventData?.attributes?.event_date_to &&
                      eventData.attributes.event_date_to !==
                        eventData.attributes.event_date_from
                        ? ` - ${formatDate(eventData.attributes.event_date_to)}`
                        : ""}
                    </span>
                  </div>
                  {eventData?.attributes?.event_time_from && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-gray-400" />
                      <span>
                        {formatTime(eventData.attributes.event_time_from)}
                        {eventData?.attributes?.event_time_to
                          ? ` - ${formatTime(eventData.attributes.event_time_to)}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {/* About Section */}
                {eventData?.attributes?.about && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2 font-poppins">
                      About Event
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {eventData.attributes.about}
                    </p>
                  </div>
                )}

                {/* Success Badge */}
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check size={32} className="text-white" strokeWidth={3} />
                    </div>
                    <p className="text-green-600 font-semibold text-lg font-poppins">
                      Registration Complete!
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Your registration has been confirmed
                    </p>
                  </div>
                </div>

                {/* Confirmation Message */}
                {toggleStates.confirmationMsg && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={20} className="text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800 font-poppins">
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
                  <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-center shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <QrCode size={20} className="text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800 font-poppins">
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

                {/* Location */}
                {toggleStates.location && eventData?.attributes?.location && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin
                        size={20}
                        className="text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-800 font-poppins">
                        Event Location
                      </p>
                      <p className="text-xs text-orange-600 mt-0.5">
                        {eventData.attributes.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* Event Details */}
                {toggleStates.eventDetails && (
                  <div className="mt-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Info size={18} className="text-purple-600" />
                      <span className="text-sm font-semibold text-purple-800 font-poppins">
                        Event Details
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {eventData?.attributes?.event_date_from && (
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                          <Calendar size={16} className="text-purple-500" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-purple-900">
                              <span className="font-semibold">
                                Start Date:{" "}
                              </span>
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
                                <span className="font-semibold">
                                  End Date:{" "}
                                </span>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {/* <div className="flex justify-between items-center mt-8 px-8 py-4 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        
        <button
          onClick={handleNextClick}
          disabled={!effectiveEventId}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default ConfirmationDetails;
