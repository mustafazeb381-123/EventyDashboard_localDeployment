import React, { useState } from "react";
import {
  Upload,
  X,
  Trash2,
  FileText,
  MapPin,
  Users,
  Calendar,
  Map,
  Home,
  ChevronLeft,
  Check,
  UserPlus,
} from "lucide-react";

// ADD PROPS INTERFACE
interface AdvanceAppVisulizationProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  onStepChange?: (step: number) => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

// UPDATE COMPONENT TO ACCEPT PROPS
export default function AdvanceAppVisulization({ 
  onNext, 
  onPrevious, 
  onStepChange, 
  eventId, 
  currentStep, 
  totalSteps 
}: AdvanceAppVisulizationProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [toggles, setToggles] = useState({
    homeBanner: true,
    exhibitors: false,
    exhibitors2: false,
    speakers: false,
    agenda: false,
    floorplan: false,
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  const tabs = [
    { id: "general", label: "General Caption", removable: true },
    { id: "snow", label: "Snow v2 API" },
  ];

  const imageTypes = [
    { key: "exhibitors", label: "Exhibitors Image", icon: Users },
    { key: "exhibitors2", label: "Exhibitors Image", icon: Users },
    { key: "speakers", label: "Speakers Image", icon: Users },
    { key: "agenda", label: "Agenda Image", icon: Calendar },
    { key: "floorplan", label: "Floorplan Image", icon: Map },
  ];

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUpload = () => {
    setUploadedFile({
      name: "Home page banner design.JPG",
      size: "200 KB",
    });
  };

  // UPDATE: Use props instead of hardcoded values
  // REMOVE: const currentStep = 0;
  // REMOVE: const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Step Indicator */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft 
              className="text-gray-500 cursor-pointer" 
              size={20} 
              onClick={onPrevious} // ADD: Make chevron clickable to go back
            />
            <h1 className="text-2xl font-semibold text-gray-800">Advanced Event</h1>
          </div>

          {/* Step Indicator - USE DYNAMIC STEPS */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, index) => index).map((step) => (
              <div key={step} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onStepChange?.(step)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer transition-colors ${
                    step === currentStep
                      ? "border-pink-500 bg-white text-pink-500"
                      : step < currentStep
                      ? "bg-pink-500 border-pink-500 text-white"
                      : "border-gray-300 bg-white text-gray-400 hover:border-gray-400"
                  }`}
                >
                  {step < currentStep ? (
                    <Check size={16} />
                  ) : (
                    <span className="text-sm font-medium">
                      {String(step + 1).padStart(2, "0")}
                    </span>
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

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>›</span>
          <span className="text-gray-700">Advanced Event</span>
        </div>
      </div>
  {/* Main Content */}
      <div className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* App Visualization */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  App Visualization
                </h2>

                {/* Home page banner */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Home page banner
                    </label>
                    <button
                      onClick={() => handleToggle("homeBanner")}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        toggles.homeBanner ? "bg-indigo-900" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                          toggles.homeBanner ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Upload Area */}
                  {!uploadedFile ? (
                    <div
                      onClick={handleFileUpload}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        <span className="text-indigo-600 font-medium">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        SVG, PNG or JPG (max. 800x400px)
                      </p>
                    </div>
                  ) : (
                    <div className="border border-green-400 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              {uploadedFile.size}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Image Sections */}
                {imageTypes.map((type) => (
                  <div key={type.key} className="mb-4">
                    <div className="flex items-center justify-between py-3">
                      <label className="text-sm font-medium text-gray-700">
                        {type.label}
                      </label>
                      <button
                        onClick={() => handleToggle(type.key)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          toggles[type.key] ? "bg-indigo-900" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                            toggles[type.key] ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Mobile Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Preview
                </span>
              </div>

              {/* Phone Frame */}
              <div className="relative mx-auto" style={{ width: "280px" }}>
                <div className="bg-black rounded-[3rem] p-2.5 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

                  {/* Screen */}
                  <div
                    className="bg-white rounded-[2.5rem] overflow-hidden relative"
                    style={{ height: "560px" }}
                  >
                    {/* Status Bar */}
                    <div className="bg-white px-6 pt-2 pb-1 flex justify-between items-center text-xs font-semibold">
                      <span>9:41</span>
                      <div className="flex gap-1 items-center">
                        <svg
                          className="w-4 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 12"
                        >
                          <rect width="4" height="12" rx="1" />
                          <rect x="6" width="4" height="9" rx="1" />
                          <rect x="12" width="4" height="6" rx="1" />
                        </svg>
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11.5 1A2.5 2.5 0 0114 3.5v9a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 012 12.5v-9A2.5 2.5 0 014.5 1h7z" />
                        </svg>
                        <svg
                          className="w-6 h-3"
                          fill="currentColor"
                          viewBox="0 0 24 12"
                        >
                          <rect
                            width="20"
                            height="12"
                            rx="2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <rect x="21" y="3.5" width="2" height="5" rx="1" />
                          <rect x="2" y="2" width="16" height="8" rx="1" />
                        </svg>
                      </div>
                    </div>

                    {/* Top Bar */}
                    <div className="bg-white px-4 py-2 flex items-center justify-between border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg"></div>
                        <span className="text-sm font-semibold">Home</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                        <div className="relative">
                          <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                          <span
                            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                            style={{ fontSize: "8px" }}
                          >
                            2
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* App Content - Scrollable */}
                    <div
                      className="px-4 py-3 bg-gray-50 overflow-y-auto"
                      style={{ height: "calc(100% - 100px)" }}
                    >
                      {/* Hero Video Section */}
                      <div
                        className="bg-gray-200 rounded-xl mb-4 relative overflow-hidden"
                        style={{ height: "160px" }}
                      >
                        <img
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%236b7280' width='400' height='300'/%3E%3C/svg%3E"
                          alt="Event"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-0 h-0 border-l-6 border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                        </div>
                      </div>

                      {/* Event Info Card */}
                      <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              eventx
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-sm text-gray-900 mb-0.5">
                              Vero Mumble Partnership
                            </h3>
                            <p className="text-xs text-gray-500">
                              Event · Varanasi
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>Mon, 05:30PM - May 26,2025</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">
                            Get Location/Venue
                          </p>
                          <h4 className="font-semibold text-sm text-gray-900 mb-2">
                            About
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Lorem ipsum dolor sit amet consectetur. Massa magna
                            morbi quam ultrices vitae amet donec. Magna
                            elementum nisi ut magna pharetra scelerisque mauris.
                            Sed id mauris turpis purus bibendum. Proin ut morbi
                            scelerisque venenatis.
                          </p>
                        </div>

                        <div className="mb-3">
                          <h4 className="font-semibold text-sm text-gray-900 mb-2">
                            Event Details
                          </h4>
                          <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="flex-1 h-16 bg-gray-200 rounded-lg"
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation with Icons and Labels */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-2 py-2 safe-area-bottom">
  <div className="flex justify-around items-center">
    {/* Home */}
    <div className="flex flex-col items-center gap-1 text-blue-600">
      <Home className="w-5 h-5" />
      <span className="text-xs font-medium">Home</span>
    </div>

    {/* Message */}
    <div className="flex flex-col items-center gap-1 text-gray-400">
      <Users className="w-5 h-5" />
      <span className="text-xs">Message</span>
    </div>

    {/* Network with two profile icons */}
    <div className="flex flex-col items-center gap-1 text-gray-400 relative">
      <div className="relative w-6 h-6">
        <Users className="w-5 h-5 absolute left-0 top-0" />
        <UserPlus className="w-4 h-4 absolute right-0 bottom-0 text-gray-500" />
      </div>
      <span className="text-xs">Network</span>
    </div>

    {/* Profile */}
    <div className="flex flex-col items-center gap-1 text-gray-400">
      <Map className="w-5 h-5" />
      <span className="text-xs">Profile</span>
    </div>
  </div>
</div>

                  </div>
                </div>
              </div>

              {/* Navigation Buttons - USE onNext PROP */}
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={onPrevious}
                  className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>←</span>
                  Previous
                </button>
                <button 
                  onClick={() => onNext(eventId)} // ADD: Call onNext when clicked
                  className="flex-1 bg-indigo-950 text-white py-3 rounded-lg font-medium hover:bg-indigo-900 transition-colors flex items-center justify-center gap-2"
                >
                  Next
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}