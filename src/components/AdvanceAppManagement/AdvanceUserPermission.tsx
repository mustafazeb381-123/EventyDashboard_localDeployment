import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  Check,
} from "lucide-react";

// ADD PROPS INTERFACE
interface AdvanceAppVisulizationProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

// UPDATE COMPONENT TO ACCEPT PROPS
export default function AdvanceUserPermission({ 
  onNext, 
  onPrevious, 
  eventId, 
  currentStep, 
  totalSteps 
}: AdvanceAppVisulizationProps) {
  const [activeTab, setActiveTab] = useState("general");

  const permissionSections = [
    {
      title: "Q & A Permissions",
      permissions: ["VIP", "Type A", "Type B"]
    },
    {
      title: "Chat Permissions",
      permissions: ["VIP", "Type A", "Type B"]
    },
    {
      title: "Meetings Permissions",
      permissions: ["VIP", "Type A", "Type B"]
    },
    {
      title: "Polls Permissions",
      permissions: ["VIP", "Type A", "Type B"]
    }
  ];

  const [permissions, setPermissions] = useState({
    qna_VIP: true,
    qna_TypeA: true,
    qna_TypeB: true,
    chat_VIP: true,
    chat_TypeA: true,
    chat_TypeB: true,
    meetings_VIP: true,
    meetings_TypeA: true,
    meetings_TypeB: true,
    polls_VIP: true,
    polls_TypeA: true,
    polls_TypeB: true,
  });

  const tabs = [
    { id: "general", label: "General Caption", removable: true },
    { id: "snow", label: "Snow v2 API" },
  ];

  const handlePermissionToggle = (section: string, type: string) => {
    const key = `${section}_${type}`;
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Step Indicator */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft 
              className="text-gray-500 cursor-pointer" 
              size={20} 
              onClick={onPrevious}
            />
            <h1 className="text-2xl font-semibold text-gray-800">Advanced Event</h1>
          </div>

          {/* Step Indicator - USE DYNAMIC STEPS */}
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

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>›</span>
          <span className="text-gray-700">Advanced Event</span>
        </div>
      </div>

      {/* Tabs */}
      {/* <div className="bg-white border-b">
        <div className="px-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative group ${
                activeTab === tab.id
                  ? "text-red-500"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {tab.removable && (
                <X className="inline-block ml-2 w-3.5 h-3.5 text-red-400" />
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
          ))}
        </div>
      </div> */}

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {permissionSections.map((section, idx) => {
              const sectionKey = section.title.split(' ')[0].toLowerCase();
              return (
                <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.permissions.map((perm) => {
                      const permKey = perm.replace(' ', '');
                      const stateKey = `${sectionKey}_${permKey}`;
                      return (
                        <div
                          key={perm}
                          className="flex items-center justify-between py-2"
                        >
                          <label className="text-sm text-gray-600">
                            {perm}
                          </label>
                          <button
                            onClick={() => handlePermissionToggle(sectionKey, permKey)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              permissions[stateKey] ? "bg-indigo-900" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                                permissions[stateKey] ? "right-0.5" : "left-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <button 
              onClick={() => onNext(eventId)}
              className="bg-indigo-950 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-900 transition-colors flex items-center gap-2"
            >
              Next
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}