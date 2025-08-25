import React, { useState } from "react";
import { ChevronLeft, Check, X } from "lucide-react";
import TemplateOne from "../RegistrationTemplates/TemplateOne/TemplateOne";
import TemplateTwo from "../RegistrationTemplates/TemplateTwo/TemplateTwo";
import Assets from "@/utils/Assets";
import TemplateThree from "../RegistrationTemplates/TemplateThree/TemplateThree";
import TemplateFour from "../RegistrationTemplates/TemplateFour/TemplateFour";
import TemplateFive from "../RegistrationTemplates/TemplateFive/TemplateFive";
import TemplateSix from "../RegistrationTemplates/TemplateSix/TemplateSix";
import TemplateSeven from "../RegistrationTemplates/TemplateSeven/TemplateSeven";

// Confirmation Details Component
const ConfirmationDetails = ({ selectedTemplateData, onNext, onPrevious }) => {
  const [confirmationMessage, setConfirmationMessage] = useState(true);
  const [userQRCode, setUserQRCode] = useState(false);

  return (
    <div className="w-full mx-5 bg-white p-5 rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="cursor-pointer" onClick={onPrevious} />
          <p className="text-neutral-900 text-md font-normal">
            Confirmation details
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {/* Step 1 - Completed */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#ff0080] bg-[#ff0080]">
            <Check size={18} color="white" />
          </div>

          {/* Connector */}
          <div className="w-16 h-1 bg-[#ff0080] rounded-full"></div>

          {/* Step 2 - Active */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#ff0080] bg-white">
            <p className="text-sm text-[#ff0080]">02</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Configuration Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Confirmation message</span>
              <button
                onClick={() => setConfirmationMessage(!confirmationMessage)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  confirmationMessage ? "bg-[#ff0080]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    confirmationMessage ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">User QR Code</span>
              <button
                onClick={() => setUserQRCode(!userQRCode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  userQRCode ? "bg-[#ff0080]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userQRCode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Registration Done */}
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <Check size={24} className="text-blue-500" />
              </div>
              <p className="text-sm text-blue-500 font-medium">
                Registration Done
              </p>
            </div>

            {/* Location */}
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Location</p>
            </div>

            {/* Event details */}
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-lg">!</span>
              </div>
              <p className="text-sm text-gray-500">Event details</p>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Preview</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Preview Content - This is a mini version of your selected template */}
            <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] max-h-[400px] overflow-y-auto">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check size={24} className="text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">
                  {selectedTemplateData?.name || "Template Name"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedTemplateData?.description || "Template description"}
                </p>

                {/* Mini form preview */}
                <div className="text-left space-y-3 mt-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="h-6 bg-gray-200 rounded text-xs flex items-center px-2">
                      Enter your full name
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="h-6 bg-gray-200 rounded text-xs flex items-center px-2">
                      Enter your email
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <div className="h-6 bg-gray-200 rounded text-xs flex items-center px-2">
                      Enter your phone
                    </div>
                  </div>
                </div>
              </div>

              {confirmationMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center">
                    <Check size={16} className="text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      Registration Done
                    </span>
                  </div>
                </div>
              )}

              {userQRCode && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <div className="w-12 h-12 mx-auto bg-blue-200 rounded mb-2"></div>
                  <span className="text-xs text-blue-800">QR Code</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg text-slate-800 hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ConfirmationDetails;
