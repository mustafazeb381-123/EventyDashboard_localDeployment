import React, { useState, useRef } from "react";
import {
  Upload,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Info,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import { eventPostApi } from "@/apis/apiHelpers";
import { toast } from "react-toastify";

const MainData = ({ onNext, onPrevious, currentStep, totalSteps }) => {
  const [newGuestType, setNewGuestType] = useState("");
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    dateFrom: undefined,
    dateTo: undefined,
    timeFrom: "09:00",
    timeTo: "17:00",
    location: "",
    requireApproval: false,
    guestTypes: [],
    eventLogo: null,
  });
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef(null);

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoError("");
      if (file.size > 2 * 1024 * 1024) {
        setLogoError("File size exceeds the 2MB limit.");
        return;
      }
      const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        setLogoError("Invalid file type. Please upload SVG, PNG, or JPG.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        eventLogo: file,
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      setLogoError("");
      if (file.size > 2 * 1024 * 1024) {
        setLogoError("File size exceeds the 2MB limit.");
        return;
      }
      const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        setLogoError("Invalid file type. Please upload SVG, PNG, or JPG.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        eventLogo: file,
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      eventLogo: null,
    }));
    setLogoError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addGuestType = () => {
    if (!newGuestType.trim()) return;
    setFormData((prev) => ({
      ...prev,
      guestTypes: [...prev.guestTypes, newGuestType.trim()],
    }));
    setNewGuestType("");
  };

  const removeGuestType = (index) => {
    setFormData((prev) => ({
      ...prev,
      guestTypes: prev.guestTypes.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addGuestType();
    }
  };

  const handleEventPostApiCall = async () => {
    const formData = {};
    try {
      const response = await eventPostApi(formData);
      console.log("response of post api of event :", response);
      toast.success(response.data.message);
    } catch (error) {
      console.log("error of event api :", error);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-normal mb-4 sm:mb-6 lg:mb-8 text-neutral-900">
        Enter event Main data
      </h2>

      {/* Mobile-First Responsive Grid */}
      <div className="w-full space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 xl:gap-8">
        {/* Event Logo Section */}
        <div className="w-full border rounded-2xl border-gray-200 p-4 sm:p-5">
          <label className="block text-xs font-normal text-neutral-700 mb-2">
            Event Logo
          </label>
          <div
            className={`
              border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors cursor-pointer min-h-[200px] sm:min-h-[240px] flex flex-col justify-center
              ${
                logoError
                  ? "border-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".svg,.png,.jpg,.jpeg"
            />
            {formData.eventLogo ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(formData.eventLogo)}
                    alt="Event Logo Preview"
                    className="max-h-24 sm:max-h-32 lg:max-h-36 max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 mb-1">
                  <span className="font-medium text-[#202242]">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-neutral-500">
                  SVG, PNG or JPG (max. 800x400px)
                </p>
              </>
            )}
          </div>
          {logoError && (
            <p className="mt-2 flex items-center text-xs text-red-600">
              <Info size={14} className="mr-1 flex-shrink-0" />
              {logoError}
            </p>
          )}

          {/* Require Approval Toggle */}
          <div className="flex flex-col sm:flex-row p-3 sm:p-4 mt-4 rounded-2xl bg-gray-100 items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <label className="text-sm font-medium text-gray-700">
                Require approval
              </label>
              <Info size={14} className="text-gray-400 flex-shrink-0" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) =>
                  handleInputChange("requireApproval", e.target.checked)
                }
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  formData.requireApproval ? "bg-teal-500" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    formData.requireApproval
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  } mt-0.5`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="w-full space-y-4 sm:space-y-6 border border-gray-200 p-4 sm:p-6 rounded-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name
            </label>
            <input
              type="text"
              placeholder="Event name"
              value={formData.eventName}
              onChange={(e) => handleInputChange("eventName", e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter a description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={
                  formData.dateFrom
                    ? formData.dateFrom.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "dateFrom",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="date"
                value={
                  formData.dateTo
                    ? formData.dateTo.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "dateTo",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time From
              </label>
              <input
                type="time"
                value={formData.timeFrom}
                onChange={(e) => handleInputChange("timeFrom", e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="time"
                value={formData.timeTo}
                onChange={(e) => handleInputChange("timeTo", e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Event location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg pr-10 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
              <MapPin className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Guest Types Section */}
        <div className="w-full space-y-4 sm:space-y-6 border border-gray-200 p-4 sm:p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Guest Types
              </label>
              <Info size={14} className="text-gray-400 flex-shrink-0" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                value={newGuestType}
                onChange={(e) => setNewGuestType(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. Speaker, VIP"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
              <button
                onClick={addGuestType}
                className="px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-700 flex-shrink-0 transition-colors"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Types
            </label>
            <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
              {formData.guestTypes.map((type, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border"
                >
                  <span className="text-sm text-gray-700 truncate pr-2">
                    {type}
                  </span>
                  <button
                    onClick={() => removeGuestType(index)}
                    className="text-red-400 hover:text-red-500 flex-shrink-0 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {formData.guestTypes.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No guest types added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border
            ${
              currentStep === 0
                ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
                : "text-slate-800 border-gray-300 hover:bg-gray-50"
            }`}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors
            ${
              currentStep === totalSteps - 1
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
        >
          {currentStep === totalSteps - 1 ? "Finish" : "Next →"}
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-6 sm:mt-8 lg:mt-12 flex justify-center sm:justify-end">
        <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 p-4 sm:p-6 bg-gray-50 rounded-2xl transition-colors">
          <span className="text-center sm:text-left">
            Can't find what you're looking for?
          </span>
          <ChevronLeft className="rotate-90 flex-shrink-0" size={14} />
        </button>
      </div>
    </div>
  );
};

export default MainData;
