import React, { useEffect, useState } from "react";
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
import { toast, ToastContainer } from "react-toastify";
import {
  createTemplatePostApi,
  getRegistrationFieldApi,
  postRegistrationTemplateFieldApi,
} from "@/apis/apiHelpers";

// Modal Component
const Modal = ({
  selectedTemplate,
  onClose,
  onUseTemplate,
  formData,
  isLoading,
}) => {
  if (!selectedTemplate) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-[80%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <X />
          </button>
        </div>

        {/* Render correct template with loading state */}
        {selectedTemplate === "template-one" && (
          <TemplateOne
            data={formData}
            onUseTemplate={() => onUseTemplate("template-one")}
            isLoading={isLoading}
          />
        )}
        {selectedTemplate === "template-two" && (
          <TemplateTwo
            onUseTemplate={() => onUseTemplate("template-two")}
            isLoading={isLoading}
          />
        )}
        {selectedTemplate === "template-three" && (
          <TemplateThree
            onUseTemplate={() => onUseTemplate("template-three")}
            isLoading={isLoading}
          />
        )}
        {selectedTemplate === "template-four" && (
          <TemplateFour
            onUseTemplate={() => onUseTemplate("template-four")}
            isLoading={isLoading}
          />
        )}
        {selectedTemplate === "template-five" && (
          <TemplateFive
            onUseTemplate={() => onUseTemplate("template-five")}
            isLoading={isLoading}
          />
        )}
        {selectedTemplate === "template-six" && (
          <TemplateSix
            onUseTemplate={() => onUseTemplate("template-six")}
            isLoading={isLoading}
          />
        )}
        {selectedTemplate === "template-seven" && (
          <TemplateSeven
            onUseTemplate={() => onUseTemplate("template-seven")}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

const RegistrationForm = ({ onNext, onPrevious, currentStep, totalSteps }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmedTemplate, setConfirmedTemplate] = useState(null);
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);
  const [internalStep, setInternalStep] = useState(0);
  const [formData, setFormData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log("confirmed template", confirmedTemplate);
  console.log("selected template data", selectedTemplateData);

  useEffect(() => {
    const eventId = localStorage.getItem("create_eventId");
    console.log("event id in reg form ---------", eventId);
    getFieldAPi();
    console.log("toggleStates in reg form");
  }, [selectedTemplate]);

  const templates = [
    { id: "template-one", component: <TemplateFormOne data={formData} /> },
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
    if (!isLoading) {
      setSelectedTemplate(null);
      setIsModalOpen(false);
    }
  };

  // The main handler for using a template
  const handleUseTemplate = async (templateId) => {
    setIsLoading(true);

    try {
      const savedEventId = localStorage.getItem("create_eventId");

      if (!savedEventId) {
        throw new Error("Event ID not found");
      }

      // Create template data based on templateId
      let templateData = {};
      switch (templateId) {
        case "template-one":
          templateData = {
            name: "Event Registration Form",
            description:
              "A new guest's registration form designed to streamline the process of collecting personal and contact information from new guests.",
            fields: formData || [],
            templateComponent: "TemplateFormOne",
          };
          break;
        case "template-two":
          templateData = {
            name: "Template Two",
            description: "Template Two description",
            fields: [],
            templateComponent: "TemplateFormTwo",
          };
          break;
        // Add other template cases here
        default:
          templateData = {
            name: `Template ${templateId}`,
            description: `Description for ${templateId}`,
            fields: formData || [],
            templateComponent: templateId,
          };
      }

      const payload = {
        registration_template: {
          name: templateId,
          content: JSON.stringify(templateData),
          default: false,
        },
      };

      const response = await createTemplatePostApi(payload, savedEventId);
      console.log("Template creation response:", response.data);

      // Success handling
      toast.success("Event template added successfully!");
      setSelectedTemplateData(templateData);
      setConfirmedTemplate(templateId);
      setInternalStep(1); // Go to confirmation step
      handleCloseModal(); // Close modal on success
    } catch (error) {
      console.error("Error creating template:", error);

      // Error handling with specific messages
      if (error.response?.status === 400) {
        toast.error("Invalid template data. Please try again.");
      } else if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login again.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          error.message || "Error adding template. Please try again."
        );
      }

      // Don't close modal on error - user can retry
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationNext = () => {
    console.log("Template confirmed with settings");
    if (onNext) onNext();
  };

  const handleConfirmationPrevious = () => {
    setInternalStep(0);
    setConfirmedTemplate(null);
    setSelectedTemplateData(null);
  };

  const handlePreviousClick = () => {
    if (internalStep === 1) {
      setInternalStep(0);
      setConfirmedTemplate(null);
      setSelectedTemplateData(null);
    }
    if (onPrevious) onPrevious();
  };

  const getFieldAPi = async () => {
    const eventId = localStorage.getItem("create_eventId");

    try {
      const response = await getRegistrationFieldApi(eventId);
      console.log("getFieldAPi response:", response.data);
      setFormData(response.data.data);
    } catch (error) {
      console.error("Failed to get registration field:", error);
      toast.error("Failed to load form data");
    }
  };

  const handleNextClick = () => {
    if (internalStep === 0) {
      if (!confirmedTemplate) {
        toast.warning("Please select a template before proceeding");
        return;
      } else {
        setInternalStep(1);
      }
    } else {
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

      {/* Main Content Area */}
      {internalStep === 0 ? (
        <>
          {/* Template Grid */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleOpenModal(tpl.id)}
                className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors ${
                  confirmedTemplate === tpl.id
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-pink-500"
                }`}
              >
                {/* Render the template preview */}
                <div className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50">
                  <div className="transform scale-[0.15] pointer-events-none">
                    <div className="w-[1200px]">{tpl.component}</div>
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
          formData={formData}
          selectedTemplate={selectedTemplate}
          onClose={handleCloseModal}
          onUseTemplate={handleUseTemplate}
          isLoading={isLoading}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className={`cursor-pointer w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border text-slate-800 border-gray-300 hover:bg-gray-50 ${
            isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={onNext}
          disabled={!confirmedTemplate || isLoading}
          className={`cursor-pointer w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors
            ${
              !confirmedTemplate || isLoading
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
        >
          {confirmedTemplate ? "Next →" : "Configure Template"}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegistrationForm;
