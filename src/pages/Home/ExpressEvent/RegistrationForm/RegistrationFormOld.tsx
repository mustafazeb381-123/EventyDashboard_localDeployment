import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Check, Loader2 } from "lucide-react";
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
  getRegistrationTemplateData,
  postRegistrationTemplateFieldApi,
  updateEventById,
} from "@/apis/apiHelpers";
// import AdvacedTicket from "@/components/AdvanceTicket/AdvanceTickt";
import AdvanceEvent from "../component/AdvanceEvent";

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
  isLoadingFormData: boolean;
  eventId?: string;
  plan?: string;
};

// Modal Component
const Modal = ({
  selectedTemplate,
  onClose,
  onUseTemplate,
  formData,
  isLoading,
  isLoadingFormData,
  eventId,
  plan,
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
          <>
            {isLoadingFormData || !formData || formData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Loading template...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Preparing template data for preview
                </p>
              </div>
            ) : (
              <TemplateOne
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
          </>
        )}
        {selectedTemplate === "template-two" && (
          <>
            {isLoadingFormData || !formData || formData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Loading template...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Preparing template data for preview
                </p>
              </div>
            ) : (
              <TemplateTwo
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
          </>
        )}
        {selectedTemplate === "template-three" && (
          <>
            {isLoadingFormData || !formData || formData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Loading template...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Preparing template data for preview
                </p>
              </div>
            ) : (
              <TemplateThree
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
          </>
        )}
        {selectedTemplate === "template-four" && (
          <>
            {isLoadingFormData || !formData || formData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Loading template...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Preparing template data for preview
                </p>
              </div>
            ) : (
              <TemplateFour
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
          </>
        )}
        {selectedTemplate === "template-five" && (
          <>
            {isLoadingFormData || !formData || formData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Loading template...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Preparing template data for preview
                </p>
              </div>
            ) : (
              <TemplateFive
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
          </>
        )}
        {selectedTemplate === "template-six" && (
          <>
            {isLoadingFormData || !formData || formData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Loading template...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Preparing template data for preview
                </p>
              </div>
            ) : (
              <TemplateSix
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
          </>
        )}
        {selectedTemplate === "template-seven" && (
          <>
            {isLoadingFormData || !formData || formData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Loading template...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Preparing template data for preview
                </p>
              </div>
            ) : (
              <TemplateSeven
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
          </>
        )}

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
  onNext: (eventId?: string | number, plan: string) => void;
  onPrevious: () => void;
  currentStep: any;
  totalSteps: any;
  eventId?: string;
  plan?: string;
  toggleStates?: ToggleStates;
  setToggleStates?: React.Dispatch<React.SetStateAction<ToggleStates>>;
};

const RegistrationForm = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  eventId,
  plan,
}: RegistrationFormProps) => {
  const { id: routeId } = useParams();
  console.log("RegistrationForm - received plan:", plan);
  console.log("RegistrationForm - plan type:", typeof plan);
  console.log("RegistrationForm - plan value:", plan);
  const effectiveEventId =
    (routeId as string | undefined) || (eventId as string | undefined);

  console.log("RegistrationForm - effective event id:", effectiveEventId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [confirmedTemplate, setConfirmedTemplate] = useState<string | null>(
    null,
  );
  const [selectedTemplateData, setSelectedTemplateData] = useState<any | null>(
    null,
  );
  const [internalStep, setInternalStep] = useState<number>(0);
  const [formData, setFormData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [confirmationToggleStates, setConfirmationToggleStates] =
    useState<ToggleStates>({
      confirmationMsg: true,
      userQRCode: false,
      location: false,
      eventDetails: false,
    });

  const [getTemplatesData, setGetTemplatesData] = useState<any[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<
    string | null
  >(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  // Notification handler
  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => {
    setNotification({ message, type });
  };

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getCreateTemplateApiData = async () => {
    try {
      if (!effectiveEventId) {
        console.warn("No event ID available");
        return;
      }

      const result = await getRegistrationTemplateData(effectiveEventId);
      const responseData = result?.data?.data;

      if (!responseData) {
        console.warn("No data found in response");
        setGetTemplatesData([]);
        return;
      }

      const registrationFields =
        responseData.attributes?.event_registration_fields?.data || [];
      const templateData = registrationFields.map((item: any) => ({
        id: item.id,
        type: item.type,
        attributes: item.attributes,
      }));

      const nameOfTemplate = responseData.attributes?.name;
      setSelectedTemplateName(nameOfTemplate);
      setConfirmedTemplate(nameOfTemplate);
      setGetTemplatesData(templateData);
    } catch (error) {
      console.error("Failed to fetch template data:", error);
      showNotification("Failed to fetch template data", "error");
      setGetTemplatesData([]);
    }
  };

  useEffect(() => {
    getCreateTemplateApiData();
  }, []);

  useEffect(() => {
    console.log("RegistrationForm - event id:", effectiveEventId);
    if (effectiveEventId) {
      getFieldAPi(effectiveEventId);
    }
  }, [selectedTemplate, effectiveEventId]);

  const getTemplateData = (templateId: string) => {
    if (templateId === selectedTemplateName) {
      return getTemplatesData.length > 0 ? getTemplatesData : formData;
    }
    return formData;
  };

  const templates = [
    {
      id: "template-one",
      component: isLoadingFormData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600 mb-2" />
          <p className="text-slate-600 text-sm">Loading template data...</p>
        </div>
      ) : (
        <TemplateFormOne
          data={getTemplateData("template-one")}
          eventId={effectiveEventId}
        />
      ),
    },
    {
      id: "template-two",
      component: isLoadingFormData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600 mb-2" />
          <p className="text-slate-600 text-sm">Loading template data...</p>
        </div>
      ) : (
        <TemplateFormTwo
          data={getTemplateData("template-two")}
          eventId={effectiveEventId}
        />
      ),
    },
    {
      id: "template-three",
      component: isLoadingFormData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600 mb-2" />
          <p className="text-slate-600 text-sm">Loading template data...</p>
        </div>
      ) : (
        <TemplateFormThree
          data={getTemplateData("template-three")}
          eventId={effectiveEventId}
        />
      ),
    },
    {
      id: "template-four",
      component: isLoadingFormData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600 mb-2" />
          <p className="text-slate-600 text-sm">Loading template data...</p>
        </div>
      ) : (
        <TemplateFormFour
          data={getTemplateData("template-four")}
          eventId={effectiveEventId}
        />
      ),
    },
    {
      id: "template-five",
      component: isLoadingFormData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600 mb-2" />
          <p className="text-slate-600 text-sm">Loading template data...</p>
        </div>
      ) : (
        <TemplateFormFive
          data={getTemplateData("template-five")}
          eventId={effectiveEventId}
        />
      ),
    },
    {
      id: "template-six",
      component: isLoadingFormData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600 mb-2" />
          <p className="text-slate-600 text-sm">Loading template data...</p>
        </div>
      ) : (
        <TemplateFormSix
          data={getTemplateData("template-six")}
          eventId={effectiveEventId}
        />
      ),
    },
    {
      id: "template-seven",
      component: isLoadingFormData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600 mb-2" />
          <p className="text-slate-600 text-sm">Loading template data...</p>
        </div>
      ) : (
        <TemplateFormSeven
          data={getTemplateData("template-seven")}
          eventId={effectiveEventId}
        />
      ),
    },
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

  const handleUseTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      const savedEventId = effectiveEventId;
      if (!savedEventId) {
        throw new Error("Event ID not found");
      }

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
          event_registration_fields_ids: formData
            .filter((item) => item.attributes?.active === true)
            .map((item) => item.id),
          default: true,
        },
      };

      const response = await createTemplatePostApi(payload, savedEventId);
      showNotification("Event template added successfully!", "success");
      setSelectedTemplateData(templateData);
      setConfirmedTemplate(templateId);
      setTimeout(() => {
        setInternalStep(1);
        handleCloseModal();
      }, 1000);
    } catch (error: any) {
      console.error("Error creating template:", error);
      if (error.response?.status === 400) {
        showNotification("Invalid template data. Please try again.", "error");
      } else if (error.response?.status === 401) {
        showNotification("Authentication failed. Please login again.", "error");
      } else if (error.response?.status === 500) {
        showNotification("Server error. Please try again later.", "error");
      } else {
        showNotification(
          error.message || "Error adding template. Please try again.",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatesChange = (toggleStates: ToggleStates) => {
    setConfirmationToggleStates(toggleStates);
  };

  const handleConfirmationNext = async () => {
    try {
      setIsLoading(true);
      await updateTheconfirmationDetails();

      // Pass the eventId to parent
      if (effectiveEventId && onNext) {
        console.log(
          "RegistrationForm - Sending eventId to ExpressEvent:",
          effectiveEventId,
        );
        onNext(effectiveEventId, plan); // ADD plan parameter here
      } else {
        showNotification("Cannot proceed without event ID", "error");
      }
    } catch (error) {
      console.error("Failed to update confirmation details:", error);
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
    setIsLoadingFormData(true);
    try {
      const response = await getRegistrationFieldApi(id);
      setFormData(response.data.data);
    } catch (error) {
      console.error("Failed to get registration field:", error);
      showNotification("Failed to load form data", "error");
    } finally {
      setIsLoadingFormData(false);
    }
  };

  // In RegistrationForm.tsx - UPDATE the handleNextClick function:

  const handleNextClick = () => {
    if (internalStep === 0) {
      if (!confirmedTemplate) {
        showNotification(
          "Please select a template before proceeding",
          "warning",
        );
        return;
      } else {
        setInternalStep(1);
      }
    } else {
      if (onNext) onNext(effectiveEventId, plan); // ADD parameters here
    }
  };

  const isStep1Active = internalStep === 0;
  const isStep1Completed = internalStep > 0;
  const isStep2Active = internalStep === 1;

  const updateTheconfirmationDetails = async () => {
    const formData = new FormData();
    const id = effectiveEventId;

    if (!id) {
      showNotification("Event ID not found", "error");
      throw new Error("Event ID not found");
    }

    formData.append(
      `event[print_qr]`,
      String(confirmationToggleStates.userQRCode),
    );
    formData.append(
      `event[display_confirmation]`,
      String(confirmationToggleStates.confirmationMsg),
    );
    formData.append(
      `event[display_event_details]`,
      String(confirmationToggleStates.eventDetails),
    );
    formData.append(
      `event[display_location]`,
      String(confirmationToggleStates.location),
    );

    try {
      const response = await updateEventById(id, formData);
      showNotification("Confirmation Details Updated Successfully", "success");
    } catch (error) {
      console.log("Error in confirmation details:", error);
      showNotification("Error in Confirmation data", "error");
      throw error;
    }
  };

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                  ? "bg-red-500 text-white"
                  : notification.type === "warning"
                    ? "bg-yellow-500 text-white"
                    : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {plan === "advance" ? (
        <AdvanceEvent
          onComplete={(eventId) => {
            console.log(
              "🔄 Advanced flow completed, moving to main Badge step",
            );
            if (onNext) {
              onNext(eventId, plan);
            }
          }}
          onPrevious={onPrevious}
          eventId={effectiveEventId}
        />
      ) : (
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
              {/* Loading State for Form Data */}
              {isLoadingFormData ? (
                <div className="mt-16 flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
                  <p className="text-slate-600 text-lg font-medium">
                    Loading templates...
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Please wait while we prepare your registration forms
                  </p>
                </div>
              ) : (
                /* Template Grid */
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() =>
                        !isLoadingFormData && handleOpenModal(tpl.id)
                      }
                      className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors ${
                        confirmedTemplate === tpl.id
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-pink-500"
                      } ${
                        isLoadingFormData ? "cursor-not-allowed opacity-75" : ""
                      }`}
                    >
                      {/* Render the template preview */}
                      <div className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50 relative">
                        {isLoadingFormData && (
                          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                          </div>
                        )}
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
              )}
            </>
          ) : (
            /* Confirmation Step */
            <div className="mt-8">
              <ConfirmationDetails
                selectedTemplateData={selectedTemplateData}
                onNext={handleConfirmationNext}
                onPrevious={handleConfirmationPrevious}
                onToggleStatesChange={handleToggleStatesChange}
                eventId={effectiveEventId}
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
              isLoadingFormData={isLoadingFormData}
              eventId={effectiveEventId}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
            <button
              onClick={onPrevious}
              disabled={isLoading || isLoadingFormData}
              className={`cursor-pointer w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border text-slate-800 border-gray-300 hover:bg-gray-50 ${
                isLoading || isLoadingFormData
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              ← Previous
            </button>

            <button
              onClick={
                internalStep === 1 ? handleConfirmationNext : handleNextClick
              }
              disabled={!confirmedTemplate || isLoading || isLoadingFormData}
              className={`cursor-pointer w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center
                ${
                  !confirmedTemplate || isLoading || isLoadingFormData
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "bg-slate-800 hover:bg-slate-900 text-white"
                }`}
            >
              {isLoading || isLoadingFormData ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : confirmedTemplate ? (
                "Next →"
              ) : (
                "Configure Template"
              )}
            </button>
          </div>

          <style>{`
            @keyframes slide-in {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slide-in {
              animation: slide-in 0.3s ease-out;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default RegistrationForm;
