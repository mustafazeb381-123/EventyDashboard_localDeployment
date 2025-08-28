import React, { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import Assets from "@/utils/Assets";
import TemplateOne from "./RegistrationTemplates/TemplateOne/TemplateOne";
import { X } from "lucide-react";



function Badges({ onNext, onPrevious, currentStep, totalSteps }) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const badges = [
    { id: "badge1", img: Assets.images.badge1 },

  ];

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


        </div>
      </div>
    );
  };

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

  return (

    <div className="w-full mx-5 bg-white p-5 rounded-2xl">

      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <ChevronLeft />
          <p className="text-neutral-900 text-md font-poppins font-normal">
            badges now you can start work
          </p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div key={badge.id} onClick={() => handleOpenModal(badge.id)}
            className="border-2 border-gray-200 rounded-3xl p-4 cursor-pointer hover:border-pink-500 transition-colors" >
            <img src={badge.img} alt={badge.id} className="w-full h-75 object-cover rounded-xl" />
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

        <button onClick={onPrevious} disabled={currentStep === 0}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border
            ${currentStep === 0 ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
              : "text-slate-800 border-gray-300 hover:bg-gray-50"}`} >
          ← Previous
        </button>

        <button onClick={onNext} disabled={currentStep === totalSteps - 1}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors
            ${currentStep === totalSteps - 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-900 text-white"}`} >
          {currentStep === totalSteps - 1 ? "Finish" : "Next →"}
        </button>

      </div>

    </div>

  );
}

export default Badges;
