import React from "react";
import { Upload } from "lucide-react";
import Assets from "@/utils/Assets";
import { useNavigate, Navigate } from "react-router-dom";
import TemplateForm from "./TemplateForm";

const TemplateFive = () => {
  const navigation = useNavigate();

  const navigationHandle = () => {
    navigation("/");
  };
  return (
    <div className="flex flex-col md:flex-row gap-8 mt-4 max-h-[80vh]">
      {/* Left side (scrollable TemplateForm) */}
      <div className="w-full md:w-[70%] overflow-y-auto pr-2">
        <TemplateForm />
      </div>

      {/* Right side (fixed, always visible) */}
      <div className="w-full md:w-1/2 flex flex-col  justify-between sticky top-0">
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
          onClick={navigationHandle}
          className="cursor-pointer bg-slate-800 text-white p-3 rounded-lg text-sm font-poppins font-medium hover:bg-slate-900 transition-colors"
        >
          Use Template →
        </button>
      </div>
    </div>
  );
};

export default TemplateFive;
