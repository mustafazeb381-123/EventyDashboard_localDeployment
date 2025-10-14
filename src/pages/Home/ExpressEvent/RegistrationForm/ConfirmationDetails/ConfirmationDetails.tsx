import React, { useState, useEffect } from "react";
import { ChevronLeft, Check, MapPin, Info, QrCode } from "lucide-react";
import { ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";
import { getEventbyId } from "@/apis/apiHelpers";

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
  onPrevious,
}) => {
  // Get effective event ID
  const { id: routeId } = useParams();
  const effectiveEventId =
    (propEventId as string | undefined) ||
    (routeId as string | undefined) ||
    localStorage.getItem("create_eventId") ||
    undefined;
    
  console.log('ConfirmationDetails - event id:', effectiveEventId);

  const [toggleStates, setToggleStates] = useState<ToggleStates>({
    confirmationMsg: false,
    userQRCode: false,
    location: false,
    eventDetails: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState<string>("");

  useEffect(() => {
    onToggleStatesChange?.(toggleStates);
  }, [toggleStates, onToggleStatesChange]);

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
        const eventData = response.data.data;

        console.log("ConfirmationDetails - Fetched event data:", eventData);

        // Map API fields to toggle states
        const newToggleStates: ToggleStates = {
          confirmationMsg:
            eventData.attributes?.display_confirmation_message || false,
          userQRCode: eventData.attributes?.print_qr || false,
          location: eventData.attributes?.display_location || false,
          eventDetails: eventData.attributes?.display_event_details || false,
        };

        setEventName(eventData.attributes?.name || "");
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

  const handleNextClick = () => {
    if (effectiveEventId && onNext) {
      console.log('ConfirmationDetails - Sending eventId to parent:', effectiveEventId);
      onNext(effectiveEventId);
    } else {
      console.error('ConfirmationDetails - No eventId available to send');
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
              <div className={`${styles.iconColor}`}></div>
            ) : (
              <Icon size={32} className={styles.iconColor} />
            )}
          </div>

          {showQR && enabled && (
            <div className="mt-4">
              <div className="w-16 h-16 bg-gray-800 rounded-lg grid grid-cols-3 gap-1 p-1">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      [0, 2, 4, 6, 8].includes(i) ? "bg-white" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
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
                  className="p-6 rounded-2xl bg-gray-100 border-2 h-64 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
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

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Preview</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 border">
                https://www.eventy.com/registration/
                {eventName}
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {eventName || "Event Name"}
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                  📅 June 23, 2024 - June 05, 2025
                </p>
                <p className="text-sm text-gray-500">🎫 2 Guest</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    About (Description)
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Lorem Ipsum has been the industry standard dummy text ever
                    since the 1500s...
                  </p>
                </div>

                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                      <Check size={24} className="text-blue-600" />
                    </div>
                    <p className="text-blue-600 font-medium">
                      Registration Done
                    </p>
                  </div>
                </div>

                {toggleStates.confirmationMsg && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex justify-center items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                      Registration Confirmed Successfully!
                    </span>
                  </div>
                )}

                {toggleStates.userQRCode && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center flex justify-center items-center gap-3">
                    <QrCode />
                    <span className="text-sm text-blue-800 font-medium">
                      Your Event QR Code
                    </span>
                  </div>
                )}

                {toggleStates.location && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex justify-center items-center gap-2">
                    <MapPin size={16} className="text-orange-600" />
                    <span className="text-sm text-orange-800 font-medium">
                      Event Location: Main Conference Hall
                    </span>
                  </div>
                )}

                {toggleStates.eventDetails && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                    <div className="flex justify-center items-center mb-2 gap-2">
                      <Info size={16} className="text-purple-600" />
                      <span className="text-sm text-purple-800 font-medium">
                        Event Schedule
                      </span>
                    </div>
                    <div className="text-xs text-purple-600 space-y-1">
                      <p>9:00 AM - Registration & Welcome</p>
                      <p>10:00 AM - Opening Keynote</p>
                      <p>12:00 PM - Networking Lunch</p>
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

      <ToastContainer />
    </div>
  );
};

export default ConfirmationDetails;