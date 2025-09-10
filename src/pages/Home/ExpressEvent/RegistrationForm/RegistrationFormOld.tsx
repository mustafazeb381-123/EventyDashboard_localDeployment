import React, { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import TemplateOne from "./RegistrationTemplates/TemplateOne/TemplateOne";
import TemplateTwo from "./RegistrationTemplates/TemplateTwo/TemplateTwo";
import Assets from "@/utils/Assets";
import TemplateThree from "./RegistrationTemplates/TemplateThree/TemplateThree";
import TemplateFour from "./RegistrationTemplates/TemplateFour/TemplateFour";
import TemplateFive from "./RegistrationTemplates/TemplateFive/TemplateFive";
import TemplateSix from "./RegistrationTemplates/TemplateSix/TemplateSix";
import TemplateSeven from "./RegistrationTemplates/TemplateSeven/TemplateSeven";
import { X } from "lucide-react";
import ConfirmationDetails from "./ConfirmationDetails/ConfirmationDetails";
import TemplateFormOne from "./RegistrationTemplates/TemplateOne/TemplateForm";
import TemplateFormTwo from "./RegistrationTemplates/TemplateTwo/TemplateForm";
import TemplateFormThree from "./RegistrationTemplates/TemplateThree/TemplateForm";
import TemplateFormFour from "./RegistrationTemplates/TemplateFour/TemplateForm";
import TemplateFormFive from "./RegistrationTemplates/TemplateFive/TemplateForm";
import TemplateFormSix from "./RegistrationTemplates/TemplateSix/TemplateForm";
import TemplateFormSeven from "./RegistrationTemplates/TemplateSeven/TemplateForm";

// Modal Component
const Modal = ({ selectedTemplate, onClose, onUseTemplate }) => {
  if (!selectedTemplate) return null;
  const handleUseTemplate = (templateId, templateData) => {
    onUseTemplate(templateId, templateData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-[80] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 bg-gray-200 rounded"
          >
            <X />
          </button>
        </div>

        {/* Render correct template */}
        {selectedTemplate === "template-one" && (
          <TemplateOne onUseTemplate={handleUseTemplate} />
        )}
        {selectedTemplate === "template-two" && <TemplateTwo />}
        {selectedTemplate === "template-three" && <TemplateThree />}
        {selectedTemplate === "template-four" && <TemplateFour />}
        {selectedTemplate === "template-five" && <TemplateFive />}
        {selectedTemplate === "template-six" && <TemplateSix />}
        {selectedTemplate === "template-seven" && <TemplateSeven />}
      </div>
    </div>
  );
};

const RegistrationForm = ({ onNext, onPrevious, currentStep, totalSteps }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmedTemplate, setConfirmedTemplate] = useState(null);
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);
  const [internalStep, setInternalStep] = useState(0); // 0: selection, 1: confirmation

  const templates = [
    { id: "template-one", component: <TemplateFormOne /> },
    { id: "template-two", component: <TemplateFormTwo /> },
    { id: "template-three", component: <TemplateFormThree /> },
    { id: "template-four", component: <TemplateFormFour /> },
    { id: "template-five", component: <TemplateFormFive /> },
    { id: "template-six", component: <TemplateFormSix /> },
    { id: "template-seven", component: <TemplateFormSeven /> },
  ];

  const handleOpenModal = (id) => {
    setSelectedTemplate(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTemplate(null);
    setIsModalOpen(false);
  };

  const handleUseTemplate = (templateId, templateData) => {
    console.log("Selected template:", templateId, templateData);
    setConfirmedTemplate(templateId);
    setSelectedTemplateData(templateData);
    setInternalStep(1); // Go to confirmation step
  };

  const handleConfirmationNext = () => {
    // Here you can save the final configuration and proceed
    console.log("Template confirmed with settings");
    // Call the parent onNext to move to the next main step
    if (onNext) onNext();
  };

  const handleConfirmationPrevious = () => {
    setInternalStep(0); // Go back to template selection
    setConfirmedTemplate(null);
    setSelectedTemplateData(null);
  };

  // Fixed navigation handlers
  const handlePreviousClick = () => {
    // Always allow going to the previous main step
    // Reset internal state when going back to main flow
    if (internalStep === 1) {
      // Reset to template selection first, but don't stay there
      setInternalStep(0);
      setConfirmedTemplate(null);
      setSelectedTemplateData(null);
    }
    // Always go to previous main step
    if (onPrevious) onPrevious();
  };

  const handleNextClick = () => {
    if (internalStep === 0) {
      // If we're in template selection
      if (!confirmedTemplate) {
        // Require template selection - show message and don't proceed
        alert("Please select a template before proceeding");
        return;
      } else {
        // If template is confirmed, move to confirmation step
        setInternalStep(1);
      }
    } else {
      // If we're in confirmation step, proceed to next main step
      console.log(
        "Proceeding to next main step with template data:",
        selectedTemplateData
      );
      if (onNext) onNext();
    }
  };

  const isStep1Active = internalStep === 0;
  const isStep1Completed = internalStep > 0;
  const isStep2Active = internalStep === 1;

  // Don't render ConfirmationDetails here - handle it in the main flow
  // This was causing the navigation to break

  // Show template selection (default view)
  return (
    <div className="w-full mx-5 bg-white p-5 rounded-2xl">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <ChevronLeft />
          <p className="text-neutral-900 text-md font-poppins font-normal">
            Choose a registration form template
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {/* Step 1 */}
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${isStep1Completed || isStep1Active
                  ? "border-[#ff0080]"
                  : "border-gray-200"
                }
                ${isStep1Completed ? "bg-[#ff0080]" : "bg-transparent"}
              `}
            >
              {isStep1Completed ? (
                <Check size={18} color="white" />
              ) : (
                <p
                  className={`text-sm font-poppins ${isStep1Active ? "text-[#ff0080]" : "text-gray-400"
                    }`}
                >
                  01
                </p>
              )}
            </div>
          </div>

          {/* Connector */}
          <div
            className={`flex-1 h-1 rounded-full ${isStep1Completed ? "bg-[#ff0080]" : "bg-gray-200"
              }`}
          ></div>

          {/* Step 2 */}
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${isStep2Active ? "border-[#ff0080]" : "border-gray-200"}
              `}
            >
              <p
                className={`text-sm font-poppins ${isStep2Active ? "text-[#ff0080]" : "text-gray-400"
                  }`}
              >
                02
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {internalStep === 0 ? (
        <>
          {/* Template Grid */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleOpenModal(tpl.id)}
                className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors ${confirmedTemplate === tpl.id
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-pink-500"
                  }`}
              >
                {/* Render the actual template component */}
                <div className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50">
                  <div className="transform scale-15 pointer-events-none">
                    <div className="w-[1200px]  ">
                      {" "}
                      {/* or whatever your form's real width is */}
                      {tpl.component}
                    </div>
                  </div>
                </div>
                {confirmedTemplate === tpl.id && (
                  <div className="mt-2 flex items-center justify-center">
                    <Check size={16} className="text-pink-500 mr-1" />
                    <span className="text-sm text-pink-500 font-medium">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Confirmation Step */
        <div className="mt-8">
          <ConfirmationDetails
            selectedTemplateData={selectedTemplateData}
            onNext={handleConfirmationNext}
            onPrevious={handleConfirmationPrevious}
          />
        </div>
      )}

      {/* Modal - Only show when not in confirmation step */}
      {isModalOpen && internalStep === 0 && (
        <Modal
          selectedTemplate={selectedTemplate}
          onClose={handleCloseModal}
          onUseTemplate={handleUseTemplate}
        />
      )}

      {/* Navigation Buttons - Simplified and consistent */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={false}
          className="w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border text-slate-800 border-gray-300 hover:bg-gray-50"
        >
          ← Previous
        </button>

        <button
          onClick={onNext}
          disabled={!confirmedTemplate}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors
            ${!confirmedTemplate
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
        >
          {confirmedTemplate ? "Next →" : "Configure Template"}
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
