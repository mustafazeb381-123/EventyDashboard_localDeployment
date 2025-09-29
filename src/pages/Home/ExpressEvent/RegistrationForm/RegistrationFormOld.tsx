import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import {
  createTemplatePostApi,
  getRegistrationFieldApi,
  postRegistrationTemplateFieldApi,
  updateEventById,
} from "@/apis/apiHelpers";
import { toast, ToastContainer } from "react-toastify";

type ToggleStates = {
  confirmationMsg: boolean;
  userQRCode: boolean;
  location: boolean;
  eventDetails: boolean;
};

type ModalProps = {
  selectedTemplate: string | null;
  onClose: () => void;
  onUseTemplate: (id: string) => void;
  formData: any;
  isLoading: boolean;
  eventId?: string;
};

// Modal Component
const Modal = ({
  selectedTemplate,
  onClose,
  onUseTemplate,
  formData,
  isLoading,
  eventId,
}: ModalProps) => {
  if (!selectedTemplate) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-40">
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
            eventId={eventId}
            isLoading={isLoading}
            onUseTemplate={(tid: string) => onUseTemplate(tid)}
          />
        )}
        {selectedTemplate === "template-two" && <TemplateTwo />}
        {selectedTemplate === "template-three" && <TemplateThree />}
        {selectedTemplate === "template-four" && <TemplateFour />}
        {selectedTemplate === "template-five" && <TemplateFive />}
        {selectedTemplate === "template-six" && <TemplateSix />}
        {selectedTemplate === "template-seven" && <TemplateSeven />}

        <div className="mt-6 flex justify-center">
          {/* <button
            onClick={() => selectedTemplate && onUseTemplate(selectedTemplate)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white ${
              isLoading ? "bg-gray-400" : "bg-slate-800 hover:bg-slate-900"
            }`}
          >
            {isLoading ? "Applying..." : "Use this template"}
          </button> */}
        </div>
      </div>
    </div>
  );
};

type RegistrationFormProps = {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: any;
  totalSteps: any;
  eventId?: string;
  toggleStates?: ToggleStates;
  setToggleStates?: React.Dispatch<React.SetStateAction<ToggleStates>>;
};

const RegistrationForm = ({ onNext, onPrevious, currentStep, totalSteps, eventId }: RegistrationFormProps) => {
  const { id: routeId } = useParams();
  const effectiveEventId =
    (routeId as string | undefined) ||
    (eventId as string | undefined) ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("create_eventId") as string | null) || undefined
      : undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [confirmedTemplate, setConfirmedTemplate] = useState<string | null>(null);
  const [selectedTemplateData, setSelectedTemplateData] = useState<any | null>(null);
  const [internalStep, setInternalStep] = useState<number>(0);
  const [formData, setFormData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationToggleStates, setConfirmationToggleStates] = useState<ToggleStates>({
    confirmationMsg: true,
    userQRCode: false,
    location: false,
    eventDetails: false,
  });

  console.log("confirmed template", confirmedTemplate);
  console.log("selected template data", selectedTemplateData);

  useEffect(() => {
    console.log("event id in reg form (effective) ---------", effectiveEventId);
    if (effectiveEventId) {
      getFieldAPi(effectiveEventId);
    }
    console.log("toggleStates in reg form");
  }, [selectedTemplate, effectiveEventId]);

  const templates = [
    { id: "template-one", component: <TemplateFormOne data={formData} eventId={effectiveEventId} /> },
    { id: "template-two", component: <TemplateFormTwo /> },
    { id: "template-three", component: <TemplateFormThree /> },
    { id: "template-four", component: <TemplateFormFour /> },
    { id: "template-five", component: <TemplateFormFive /> },
    { id: "template-six", component: <TemplateFormSix /> },
    { id: "template-seven", component: <TemplateFormSeven /> },
  ];

  const handleOpenModal = (id: string) => {
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
  const handleUseTemplate = async (templateId: string) => {
    setIsLoading(true);

    try {
      const savedEventId = effectiveEventId;

      if (!savedEventId) {
        throw new Error("Event ID not found");
      }

      // Create template data based on templateId
      let templateData: any = {};
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
      setTimeout(() => {
        setInternalStep(1); // Go to confirmation step
        handleCloseModal(); // Close modal on success
      }, 1000);
    } catch (error: any) {
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

  // Handler for receiving toggle states from ConfirmationDetails
  const handleToggleStatesChange = (toggleStates: ToggleStates) => {
    setConfirmationToggleStates(toggleStates);
    console.log("Updated toggle states:", toggleStates);
  };

  const handleConfirmationNext = async () => {
    try {
      setIsLoading(true);
      await updateTheconfirmationDetails();
      setTimeout(() => {
        if (onNext) onNext();
      }, 1000); // 300ms delay is enough
    } catch (error) {
      console.error("Failed to update confirmation details:", error);
      // Toast error is already handled in updateTheconfirmationDetails
    } finally {
      setIsLoading(false);
    }
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

  const getFieldAPi = async (id: string) => {
    try {
      const response = await getRegistrationFieldApi(id);
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

  const updateTheconfirmationDetails = async () => {
    const formData = new FormData();
    const id = effectiveEventId;

    if (!id) {
      toast.error("Event ID not found");
      throw new Error("Event ID not found");
    }

    // Use actual toggle states from ConfirmationDetails component
    formData.append(`event[print_qr]`, String(confirmationToggleStates.userQRCode));
    formData.append(
      `event[display_confirmation]`,
      String(confirmationToggleStates.confirmationMsg)
    );
    formData.append(
      `event[display_event_details]`,
      String(confirmationToggleStates.eventDetails)
    );
    formData.append(
      `event[display_location]`,
      String(confirmationToggleStates.location)
    );

    console.log("Updating confirmation details with:", {
      print_qr: confirmationToggleStates.userQRCode,
      display_confirmation: confirmationToggleStates.confirmationMsg,
      display_event_details: confirmationToggleStates.eventDetails,
      display_location: confirmationToggleStates.location,
    });

    try {
      const response = await updateEventById(id, formData);
      console.log(
        "Response of update api for qr, location, etc in confirmation details:",
        response
      );
      toast.success("Confirmation Details Updated Successfully");
    } catch (error) {
      console.log("Error in confirmation details:", error);
      toast.error("Error in Confirmation data");
      throw error; // Re-throw to handle in calling function
    }
  };

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
            onToggleStatesChange={handleToggleStatesChange}
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
          eventId={effectiveEventId}
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
          onClick={
            internalStep === 1 ? handleConfirmationNext : handleNextClick
          }
          disabled={!confirmedTemplate || isLoading}
          className={`cursor-pointer w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center
            ${
              !confirmedTemplate || isLoading
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
              Loading...
            </>
          ) : confirmedTemplate ? (
            "Next →"
          ) : (
            "Configure Template"
          )}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegistrationForm;
