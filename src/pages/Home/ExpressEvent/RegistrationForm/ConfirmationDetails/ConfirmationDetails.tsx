import React, { useState } from "react";
// import { ScanQrCode } from "lucide-react";

import {
  ChevronLeft,
  Check,
  MapPin,
  Info,
  QrCode,
  ScanQrCode,
} from "lucide-react";

const ConfirmationDetails = () => {
  const [confirmationMessage, setConfirmationMessage] = useState(true);
  const [userQRCode, setUserQRCode] = useState(false);
  const [location, setLocation] = useState(false);
  const [eventDetails, setEventDetails] = useState(false);

  const StatusCard = ({
    icon: Icon,
    title,
    enabled,
    onChange,
    showQR = false,
  }) => {
    const getStatusStyles = () => {
      if (enabled) {
        return {
          border: "border-blue-200",
          bg: "bg-white",
          iconBg: "bg-blue-500",
          iconColor: "text-white",
          titleColor: "text-blue-600",
          switchBg: "bg-blue-600",
        };
      }
      return {
        border: "border-gray-200",
        bg: "bg-gray-50",
        iconBg: "bg-gray-200",
        iconColor: "text-gray-500",
        titleColor: "text-gray-500",
        switchBg: "bg-gray-300",
      };
    };

    const styles = getStatusStyles();

    const Toggle = () => (
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
    );

    return (
      <div
        className={`p-6 rounded-2xl ${styles.border} ${styles.bg} border-2 h-64`}
      >
        {/* Header with Title and Toggle */}
        <div className="flex items-center justify-between mb-6">
          <span className={`text-sm font-medium ${styles.titleColor}`}>
            {title}
          </span>
          <Toggle />
        </div>

        {/* Icon Container */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div
            className={`w-20 h-20 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}
          >
            {title === "Registration Done" && enabled ? (
              <Check size={32} className={styles.iconColor} />
            ) : showQR ? (
              <div style={{}} className={styles.iconColor}></div>
            ) : (
              // <ScanQrCode />

              <Icon size={32} className={styles.iconColor} />
            )}
          </div>

          {/* Show QR Code visual when enabled */}
          {showQR && enabled && (
            <div className="mt-4">
              <div className="w-16 h-16 bg-gray-800 rounded-lg grid grid-cols-3 gap-1 p-1">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      [0, 2, 4, 6, 8].includes(i) ? "bg-white" : "bg-gray-600"
                    }`}
                  ></div>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-8 pt-6 max-w-full">
        <div className="flex items-center gap-3">
          <ChevronLeft className="cursor-pointer text-gray-600" size={20} />
          <h1 className="text-gray-900 text-lg font-medium">
            Confirmation details
          </h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {/* Step 1 - Completed */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#ff0080] bg-[#ff0080]">
            <Check size={16} color="white" />
          </div>

          {/* Connector */}
          <div className="w-16 h-1 bg-[#ff0080] rounded-full"></div>

          {/* Step 2 - Active */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#ff0080] bg-white">
            <span className="text-sm text-[#ff0080] font-medium">02</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-8 max-w-full">
        {/* Left Column - 2x2 Grid of Status Cards */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatusCard
              icon={Check}
              title="Confirmation message"
              enabled={confirmationMessage}
              onChange={setConfirmationMessage}
            />

            <StatusCard
              icon={ScanQrCode}
              title="User QR Code"
              enabled={userQRCode}
              onChange={setUserQRCode}
              // showQR={true}
            />

            <StatusCard
              icon={MapPin}
              title="Location"
              enabled={location}
              onChange={setLocation}
            />

            <StatusCard
              icon={Info}
              title="Event details"
              enabled={eventDetails}
              onChange={setEventDetails}
            />
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Browser Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Preview</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* URL Bar */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 border">
                https://figma.com
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  SCC Summit
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
                    since the 1500s, when an unknown printer took a galley of
                    type and scrambled it to make a type specimen book. It has
                    survived not only five centuries but also the leap into
                    electronic typesetting, remaining essentially unchanged and
                    the following below:
                  </p>
                </div>

                {/* Registration Done Status - Always shown */}
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

                {/* Dynamic Content Based on Toggles */}
                {confirmationMessage && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center">
                      <Check size={16} className="text-green-600 mr-2" />
                      <span className="text-sm text-green-800 font-medium">
                        Registration Confirmed Successfully!
                      </span>
                    </div>
                  </div>
                )}

                {userQRCode && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center items-center flex justify-center gap-3">
                    <ScanQrCode />
                    <span className="text-sm text-blue-800 font-medium">
                      Your Event QR Code
                    </span>
                  </div>
                )}

                {location && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-center">
                      <MapPin size={16} className="text-orange-600 mr-2" />
                      <span className="text-sm text-orange-800 font-medium">
                        Event Location: Main Conference Hall
                      </span>
                    </div>
                  </div>
                )}

                {eventDetails && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Info size={16} className="text-purple-600 mr-2" />
                      <span className="text-sm text-purple-800 font-medium">
                        Event Schedule
                      </span>
                    </div>
                    <div className="text-xs text-purple-600 text-center space-y-1">
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

      {/* Navigation */}
      {/* <div className="flex justify-between items-center mt-8 px-8 pb-6 max-w-full">
        <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          ← Previous
        </button>
        <button className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors">
          Next →
        </button>
      </div> */}
    </div>
  );
};

export default ConfirmationDetails;
