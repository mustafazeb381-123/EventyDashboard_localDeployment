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
          {/* <div className="bg-gray-300 hover:bg-gray-50 rounded-2xl p-1"> */}

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800  bg-gray-200 rounded "
          >
            <X />
          </button>
          {/* </div> */}
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
    { id: "template-one", img: Assets.images.templateOne },
    { id: "template-two", img: Assets.images.templateTwo },
    { id: "template-three", img: Assets.images.templateThree },
    { id: "template-four", img: Assets.images.templateFour },
    { id: "template-five", img: Assets.images.templateFive },
    { id: "template-six", img: Assets.images.templateSix },
    { id: "template-seven", img: Assets.images.templateSeven },
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
    // You can call the parent onNext if needed
    if (onNext) onNext();
  };

  const handleConfirmationPrevious = () => {
    setInternalStep(0); // Go back to template selection
    setConfirmedTemplate(null);
    setSelectedTemplateData(null);
  };

  const isStep1Active = internalStep === 0;
  const isStep1Completed = internalStep > 0;
  const isStep2Active = internalStep === 1;

  // Show confirmation details if a template is selected
  if (internalStep === 1 && confirmedTemplate) {
    return (
      <ConfirmationDetails
        selectedTemplateData={selectedTemplateData}
        onNext={handleConfirmationNext}
        onPrevious={handleConfirmationPrevious}
      />
    );
  }

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
                ${
                  isStep1Completed || isStep1Active
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
                  className={`text-sm font-poppins ${
                    isStep1Active ? "text-[#ff0080]" : "text-gray-400"
                  }`}
                >
                  01
                </p>
              )}
            </div>
          </div>

          {/* Connector */}
          <div
            className={`flex-1 h-1 rounded-full ${
              isStep1Completed ? "bg-[#ff0080]" : "bg-gray-200"
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
                className={`text-sm font-poppins ${
                  isStep2Active ? "text-[#ff0080]" : "text-gray-400"
                }`}
              >
                02
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => handleOpenModal(tpl.id)}
            className="border-2 border-gray-200 rounded-3xl p-4 cursor-pointer hover:border-pink-500 transition-colors"
          >
            <img
              src={tpl.img}
              alt={tpl.id}
              className="w-full h-48 object-cover rounded-xl"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          selectedTemplate={selectedTemplate}
          onClose={handleCloseModal}
          onUseTemplate={handleUseTemplate}
        />
      )}

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
          disabled={!confirmedTemplate}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors
            ${
              !confirmedTemplate
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
