import React, { useState, useEffect } from "react";
import { ChevronLeft, Check, MapPin, Info, QrCode } from "lucide-react";
import { ToastContainer } from "react-toastify";

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
}

const AdvanceConfirmation: React.FC<AdvanceConfirmationProps> = ({
  onNext,
  onPrevious,
  eventId,
  currentStep,
  totalSteps,
}) => {
  // Static event data
  const staticEventData = {
    name: "Annual Tech Conference 2024",
    date: "June 23, 2024 - June 25, 2024",
    location: "Main Conference Hall",
    description:
      "Join us for the biggest technology conference of the year featuring industry leaders, innovative workshops, and networking opportunities.",
    schedule: [
      "9:00 AM - Registration & Welcome",
      "10:00 AM - Opening Keynote",
      "12:00 PM - Networking Lunch",
      "2:00 PM - Technical Workshops",
      "5:00 PM - Closing Ceremony",
    ],
  };

  const [toggleStates, setToggleStates] = useState<ToggleStates>({
    confirmationMsg: true,
    userQRCode: true,
    location: true,
    eventDetails: true,
  });

  const handleNext = () => {
    onNext(eventId);
  };

  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

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
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            Advance Confirmation
          </h2>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === currentStep
                    ? "border-pink-500 bg-white text-pink-500"
                    : step < currentStep
                    ? "bg-pink-500 border-pink-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{step + 1}</span>
                )}
              </div>
              {step < 3 && (
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

      {/* Confirmation Details Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
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
                {staticEventData.name.toLowerCase().replace(/\s+/g, "-")}
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {staticEventData.name}
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                  📅 {staticEventData.date}
                </p>
                <p className="text-sm text-gray-500">🎫 2 Guest</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    About (Description)
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {staticEventData.description}
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
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="flex justify-center items-center mb-3 gap-2">
                      <QrCode size={20} className="text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">
                        Your Event QR Code
                      </span>
                    </div>
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg border border-blue-200">
                      <div className="w-full h-full bg-gray-800 rounded grid grid-cols-4 gap-1 p-1">
                        {[...Array(16)].map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-sm ${
                              [0, 2, 4, 6, 8, 10, 12, 14].includes(i)
                                ? "bg-white"
                                : "bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Scan this QR code for event access
                    </p>
                  </div>
                )}

                {toggleStates.location && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex justify-center items-center gap-2">
                    <MapPin size={16} className="text-orange-600" />
                    <span className="text-sm text-orange-800 font-medium">
                      Event Location: {staticEventData.location}
                    </span>
                  </div>
                )}

                {toggleStates.eventDetails && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex justify-center items-center mb-3 gap-2">
                      <Info size={16} className="text-purple-600" />
                      <span className="text-sm text-purple-800 font-medium">
                        Event Schedule
                      </span>
                    </div>
                    <div className="text-xs text-purple-600 space-y-2">
                      {staticEventData.schedule.map((item, index) => (
                        <p key={index} className="text-center">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
          className="cursor-pointer px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-800 transition-colors font-medium"
        >
          Next →
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdvanceConfirmation;
