import React, { useState } from "react";
import {
  ChevronLeft,
  Check,
  MapPin,
  Info,
  QrCode,
  Calendar,
} from "lucide-react";

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
  const staticEventData = {
    name: "SCC Summit",
    date: "June 01, 2025 – June 04, 2025",
    location: "Riyadh",
    description:
      "Lorem ipsum dolor sit amet consectetur. Penatibus sit nisl montes non odio vestibulum euismod eget id. Ac quam vulputate sed eget montes tincidunt. Imperdiet sagittis eu imperdiet facilisi leo aliquet amet neque in. Ultrices lacus condimentum vel eu augue elit sodales iaculis.",
  };

  const [toggleStates, setToggleStates] = useState<ToggleStates>({
    confirmationMsg: true,
    userQRCode: true,
    location: true,
    eventDetails: true,
  });

  const handleNext = () => onNext(eventId);
  const handleBack = () => onPrevious?.();

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
          <ChevronLeft
            className="text-gray-500 cursor-pointer"
            size={20}
            onClick={handleBack}
          />
          <h2 className="text-xl font-semibold text-gray-900">
            Advance Confirmation
          </h2>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, index) => index).map((step) => (
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

        {/* Right: Preview */}
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
                  https://www.figma.com
                </div>
              </div>
            </div>

            {/* Event Preview */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {staticEventData.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar size={14} className="text-gray-500" />
                    <span>{staticEventData.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={14} className="text-gray-500" />
                    <span>{staticEventData.location}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-1">
                  About (Description)
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {staticEventData.description}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <Check size={28} className="text-blue-600" />
                </div>
                <p className="text-blue-600 font-medium text-sm">
                  Registration Done
                </p>
              </div>
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
    </div>
  );
};

export default AdvanceConfirmation;
