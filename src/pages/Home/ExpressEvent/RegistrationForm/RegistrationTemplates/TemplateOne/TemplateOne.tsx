import React from "react";
import { Upload } from "lucide-react";
import Assets from "@/utils/Assets";
import { useNavigate, Navigate } from "react-router-dom";
import TemplateForm from "./TemplateForm";

const TemplateOne = ({ onUseTemplate, data, isLoading, eventId }: { onUseTemplate?: any; data: any; isLoading?: boolean; eventId?: string }) => {
  console.log('onUse template-----+++++------', onUseTemplate, eventId, data)
  const navigation = useNavigate();

  console.log("form data in template one ::::", data);

  // Handle the use template click
  const handleUseTemplate = () => {
    console.log('fsdasfsdfsdfsd')
    if (onUseTemplate && !isLoading) {
      // Call the parent function with template data
      onUseTemplate("template-one", {
        name: "Event Registration Form",
        description:
          "A new guest's registration form is a form designed to streamline the process of collecting personal and contact information from new guests.",
        templateComponent: TemplateForm,
        // Add any additional template-specific data here
        fields: data || [], // Pass the form data as fields
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-4 max-h-[80vh]">
      {/* Left side (scrollable TemplateForm) */}
      <div className="w-full md:w-[70%] overflow-y-auto pr-2">
        <TemplateForm data={data} eventId={eventId} />
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
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
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

export default TemplateOne;
