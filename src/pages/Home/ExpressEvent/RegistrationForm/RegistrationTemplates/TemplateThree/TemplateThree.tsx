import React from "react";
import { Loader2 } from "lucide-react";
import Assets from "@/utils/Assets";
import TemplateForm from "./TemplateForm";

const TemplateThree = ({
  onUseTemplate,
  data,
  isLoading,
  eventId,
}: {
  onUseTemplate?: any;
  data: any;
  isLoading?: boolean;
  eventId?: string;
}) => {
  console.log(
    "onUse template TemplateThree-----+++++------",
    onUseTemplate,
    eventId,
    data
  );

  console.log("form data in template three ::::", data);

  // Handle the use template click
  const handleUseTemplate = () => {
    console.log("TemplateThree handleUseTemplate");
    if (onUseTemplate && !isLoading) {
      // Call the parent function with template data
      onUseTemplate("template-three", {
        name: "Event Registration Form Template Three",
        description:
          "A creative registration form template with unique styling for event attendee registration.",
        templateComponent: TemplateForm,
        fields: data || [], // Pass the form data as fields
      });
    }
  };
  return (
    <div className="flex flex-col md:flex-row gap-8 mt-4 max-h-[80vh]">
      {/* Left side (scrollable TemplateForm) */}
      <div className="w-full md:w-[70%] overflow-y-auto pr-2">
        {isLoading || !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
            <p className="text-slate-600 text-lg font-medium mb-2">
              Loading Template
            </p>
            <p className="text-slate-500 text-sm">
              Please wait while we prepare the form fields...
            </p>
          </div>
        ) : (
          <TemplateForm />
        )}
      </div>

      {/* Right side (fixed, always visible) */}
      <div className="w-full md:w-1/2 flex flex-col justify-between sticky top-0">
        {/* Top section */}
        <div>
          <h2 className="text-xl font-poppins font-semibold mb-2">
            Event Registration Form
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            A new guest's registration form is a form designed to streamline the
            process of collecting personal and contact information from new
            guests.
          </p>
        </div>

        {/* Bottom button */}
        <button
          onClick={handleUseTemplate}
          disabled={isLoading}
          className={`cursor-pointer p-3 rounded-lg text-sm font-poppins font-medium transition-colors flex items-center justify-center ${
            isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-slate-800 text-white hover:bg-slate-900"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            "Use Template →"
          )}
        </button>
      </div>
    </div>
  );
};

export default TemplateThree;
