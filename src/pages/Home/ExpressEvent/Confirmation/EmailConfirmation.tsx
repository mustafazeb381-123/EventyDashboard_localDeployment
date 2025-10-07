import React, { useState } from "react";
import { Check, ChevronLeft, X } from "lucide-react";
import Assets from "@/utils/Assets";
import ThanksTemplateOne from "./Templates/ThanksEmailTemplates/ThanksTemplateOne";
import ThanksTemplateTwo from "./Templates/ThanksEmailTemplates/ThanksTemplateTwo";
import ConfirmationTemplateOne from "./Templates/ConfirmationEmailTemplates/ConfirmationTemplateOne";
import ReminderTemplateOne from "./Templates/ReminderEmailTemplate/ReminderTemplateOne";
import ReminderTemplateTwo from "./Templates/ReminderEmailTemplate/ReminderTemplateTwo";
import RejectionTemplateOne from "./Templates/RejectionEmailTemplate/RejectionTemplateOne";
import RejectionTemplateTwo from "./Templates/RejectionEmailTemplate/RejectionTemplateTwo";

// Modal Component to preview template
const TemplateModal = ({ template, onClose, onSelect }) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="mb-6">
          {template.component}
          {/* <img
            src={template.img}
            alt={template.title}
            className="w-full rounded-lg mb-4 shadow-sm"
            loading="lazy"
          /> */}
          <p className="text-gray-600">
            {template.description || "Preview of template content..."}
          </p>
        </div>
        <button
          onClick={() => onSelect(template.id)}
          className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          Choose this template
        </button>
      </div>
    </div>
  );
};

// Main Email Confirmation Component
const EmailConfirmation = ({ onNext, onPrevious, currentStep, totalSteps }) => {
  const flows = [
    {
      id: "thanks",
      label: "Thanks Email",
      templates: [
        {
          id: "tpl1",
          title: "Thanks Template 1",
          component: <ThanksTemplateOne />,
        },
        {
          id: "tpl2",
          title: "Thanks Template 2",
          component: <ThanksTemplateTwo />,
        },
      ],
    },
    {
      id: "confirmation",
      label: "Confirmation Email",
      templates: [
        {
          id: "tpl3",
          title: "Confirmation Template 1",
          component: <ConfirmationTemplateOne />,
        },
      ],
    },
    {
      id: "reminder",
      label: "Reminder Email",
      templates: [
        {
          id: "tpl5",
          title: "Reminder Template 1",
          component: <ReminderTemplateOne />,
        },
        {
          id: "tpl6",
          title: "Reminder Template 2",
          component: <ReminderTemplateTwo />,
        },
      ],
    },
    {
      id: "rejection",
      label: "Rejection Email",
      templates: [
        {
          id: "tpl7",
          title: "Rejection Template 1",
          component: <RejectionTemplateOne />,
        },
        {
          id: "tpl8",
          title: "Rejection Template 2",
          component: <RejectionTemplateTwo />,
        },
      ],
    },
  ];

  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState({});
  const [modalTemplate, setModalTemplate] = useState(null);

  const currentFlow = flows[currentFlowIndex];

  const handleOpenModal = (template) => setModalTemplate(template);
  const handleCloseModal = () => setModalTemplate(null);

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplates({
      ...selectedTemplates,
      [currentFlow.id]: templateId,
    });
    setModalTemplate(null);
  };

  const handleNext = () => {
    if (!selectedTemplates[currentFlow.id]) {
      alert("Please select a template before proceeding");
      return;
    }
    if (currentFlowIndex < flows.length - 1) {
      setCurrentFlowIndex(currentFlowIndex + 1);
    } else {
      if (onNext) onNext();
      // alert(
      //   "All templates selected:\n" + JSON.stringify(selectedTemplates, null, 2)
      // );
    }
  };

  const handleBack = () => {
    if (currentFlowIndex > 0) setCurrentFlowIndex(currentFlowIndex - 1);
  };

  const handleStepClick = (index) => {
    // Allow navigation to completed steps or current step
    if (index <= currentFlowIndex || selectedTemplates[flows[index].id]) {
      setCurrentFlowIndex(index);
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            {currentFlow.label}
          </h2>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2">
          {flows.map((flow, index) => {
            const isCompleted = selectedTemplates[flow.id];
            const isActive = index === currentFlowIndex;

            return (
              <div key={flow.id} className="flex items-center">
                {/* Step Circle */}
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={index > currentFlowIndex && !isCompleted}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? "bg-pink-500 border-pink-500 cursor-pointer"
                      : isActive
                      ? "border-pink-500 bg-white cursor-pointer"
                      : "border-gray-300 bg-white cursor-not-allowed"
                  }`}
                  aria-label={`Step ${index + 1}: ${flow.label}`}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-pink-500" : "text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </button>

                {/* Connector Line */}
                {index !== flows.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      selectedTemplates[flow.id] ? "bg-pink-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentFlow.templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => handleOpenModal(tpl)}
            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTemplates[currentFlow.id] === tpl.id
                ? "border-pink-500 bg-pink-50 shadow-md"
                : "border-gray-200 hover:border-pink-300"
            }`}
          >
            <div className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50">
              <div className="transform scale-20 top-5 pointer-events-none">
                <div className="w-[1800px]  ">
                  {" "}
                  {/* or whatever your form's real width is */}
                  {tpl.component}
                </div>
              </div>
            </div>
            {/* <img
              src={tpl.img}
              alt={tpl.title}
              className="w-full h-48 object-cover rounded-lg mb-3"
              loading="lazy"
            /> */}
            {/* <h3 className="text-base font-medium text-gray-900 mb-1">
              {tpl.title}
            </h3> */}
            {selectedTemplates[currentFlow.id] === tpl.id && (
              <div className="flex items-center text-pink-500 mt-2">
                <Check size={16} className="mr-1" />
                <span className="text-sm font-medium">Selected</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalTemplate && (
        <TemplateModal
          template={modalTemplate}
          onClose={handleCloseModal}
          onSelect={handleSelectTemplate}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          disabled={currentFlowIndex === 0}
          className={`cursor-pointer px-6 py-2 border rounded-lg transition-colors ${
            currentFlowIndex === 0
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentFlowIndex + 1} of {flows.length}
        </span>

        <button
          onClick={handleNext}
          className={`cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium ${
            selectedTemplates[currentFlow.id]
              ? "bg-pink-500 hover:bg-pink-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {currentFlowIndex === flows.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmation;
