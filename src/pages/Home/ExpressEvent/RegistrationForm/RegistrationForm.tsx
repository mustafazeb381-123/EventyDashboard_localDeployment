import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  getEventbyId,
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

        {/* Render correct template with skeleton loader */}
        {isLoadingFormData || !formData || formData.length === 0 ? (
          <div className="space-y-6 py-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-1/3" />
            </div>
          </div>
        ) : (
          <>
            {selectedTemplate === "template-one" && (
              <TemplateOne
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-two" && (
              <TemplateTwo
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-three" && (
              <TemplateThree
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-four" && (
              <TemplateFour
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-five" && (
              <TemplateFive
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-six" && (
              <TemplateSix
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-seven" && (
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
  const effectiveEventId =
    (routeId as string | undefined) || (eventId as string | undefined);

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
  const [eventData, setEventData] = useState<any>(null);
  const [isLoadingEventData, setIsLoadingEventData] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => {
    setNotification({ message, type });
  };

  // Fetch event data once and cache it - memoized to prevent unnecessary calls
  const fetchEventData = useCallback(async () => {
    if (!effectiveEventId) return;

    const cacheKey = `event_meta_${effectiveEventId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setEventData(parsed);
        setIsLoadingEventData(false);
        return;
      } catch (err) {
        // Cache corrupted, fetch fresh data
      }
    }

    setIsLoadingEventData(true);
    try {
      const response = await getEventbyId(effectiveEventId);
      const data = response.data.data;
      setEventData(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      setEventData(null);
    } finally {
      setIsLoadingEventData(false);
    }
  }, [effectiveEventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Memoize API call function
  const getCreateTemplateApiData = useCallback(async () => {
    try {
      if (!effectiveEventId) {
        return;
      }

      const result = await getRegistrationTemplateData(effectiveEventId);
      const responseData = result?.data?.data;

      if (!responseData) {
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
      showNotification("Failed to fetch template data", "error");
      setGetTemplatesData([]);
    }
  }, [effectiveEventId]);

  useEffect(() => {
    getCreateTemplateApiData();
  }, [getCreateTemplateApiData]);

  // Memoize getFieldAPi function
  const getFieldAPi = useCallback(async (id: string) => {
    setIsLoadingFormData(true);
    try {
      const response = await getRegistrationFieldApi(id);
      setFormData(response.data.data);
    } catch (error) {
      showNotification("Failed to load form data", "error");
    } finally {
      setIsLoadingFormData(false);
    }
  }, []);

  useEffect(() => {
    if (effectiveEventId) {
      getFieldAPi(effectiveEventId);
    }
  }, [effectiveEventId, getFieldAPi]);

  // Memoize getTemplateData to prevent unnecessary recalculations
  const getTemplateData = useCallback(
    (templateId: string) => {
      if (templateId === selectedTemplateName) {
        return getTemplatesData.length > 0 ? getTemplatesData : formData;
      }
      return formData;
    },
    [selectedTemplateName, getTemplatesData, formData],
  );

  // Memoize skeleton component - created once with animated shimmer
  const skeletonComponent = useMemo(
    () => (
      <div className="space-y-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-1/3" />
      </div>
    ),
    [],
  );

  // Memoize template component factory
  const getTemplateComponent = useCallback(
    (templateId: string, isPreview: boolean = true) => {
      // Show skeleton only while data is loading
      if (isLoadingFormData) {
        return skeletonComponent;
      }

      const templateData = getTemplateData(templateId);

      // Render actual template component
      switch (templateId) {
        case "template-one":
          return (
            <TemplateFormOne
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-two":
          return (
            <TemplateFormTwo
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-three":
          return (
            <TemplateFormThree
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-four":
          return (
            <TemplateFormFour
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-five":
          return (
            <TemplateFormFive
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-six":
          return (
            <TemplateFormSix
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-seven":
          return (
            <TemplateFormSeven
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        default:
          return skeletonComponent;
      }
    },
    [
      isLoadingFormData,
      getTemplateData,
      eventData,
      effectiveEventId,
      skeletonComponent,
    ],
  );

  // Memoize templates array to prevent recreation on every render
  const templates = useMemo(
    () => [
      {
        id: "template-one",
        component: getTemplateComponent("template-one", true),
      },
      {
        id: "template-two",
        component: getTemplateComponent("template-two", true),
      },
      {
        id: "template-three",
        component: getTemplateComponent("template-three", true),
      },
      {
        id: "template-four",
        component: getTemplateComponent("template-four", true),
      },
      {
        id: "template-five",
        component: getTemplateComponent("template-five", true),
      },
      {
        id: "template-six",
        component: getTemplateComponent("template-six", true),
      },
      {
        id: "template-seven",
        component: getTemplateComponent("template-seven", true),
      },
    ],
    [getTemplateComponent],
  );

  // Memoize handlers to prevent unnecessary re-renders
  const handleOpenModal = useCallback((id: string) => {
    setSelectedTemplate(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!isLoading) {
      setSelectedTemplate(null);
      setIsModalOpen(false);
    }
  }, [isLoading]);

  // Memoize handleUseTemplate to prevent unnecessary re-renders
  const handleUseTemplate = useCallback(
    async (templateId: string) => {
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
          showNotification(
            "Authentication failed. Please login again.",
            "error",
          );
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
    },
    [effectiveEventId, formData, handleCloseModal],
  );

  // Memoize toggle handler
  const handleToggleStatesChange = useCallback((toggleStates: ToggleStates) => {
    setConfirmationToggleStates(toggleStates);
  }, []);

  // Memoize update confirmation details - must be defined before handleConfirmationNext
  const updateTheconfirmationDetails = useCallback(async () => {
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
  }, [effectiveEventId, confirmationToggleStates]);

  // Memoize confirmation next handler
  const handleConfirmationNext = useCallback(async () => {
    try {
      setIsLoading(true);
      await updateTheconfirmationDetails();

      // Pass the eventId to parent
      if (effectiveEventId && onNext) {
        onNext(effectiveEventId, plan);
      } else {
        showNotification("Cannot proceed without event ID", "error");
      }
    } catch (error) {
      console.error("Failed to update confirmation details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveEventId, plan, onNext, updateTheconfirmationDetails]);

  const handleConfirmationPrevious = useCallback(() => {
    setInternalStep(0);
    setConfirmedTemplate(null);
    setSelectedTemplateData(null);
  }, []);

  const handlePreviousClick = useCallback(() => {
    if (internalStep === 1) {
      setInternalStep(0);
      setConfirmedTemplate(null);
      setSelectedTemplateData(null);
    }
    if (onPrevious) onPrevious();
  }, [internalStep, onPrevious]);

  // In RegistrationForm.tsx - UPDATE the handleNextClick function:

  const handleNextClick = useCallback(() => {
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
      if (onNext) onNext(effectiveEventId, plan);
    }
  }, [confirmedTemplate, effectiveEventId, plan, onNext]);

  const isStep1Active = internalStep === 0;
  const isStep1Completed = internalStep > 0;
  const isStep2Active = internalStep === 1;

  return (
    <>
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
              {/* Loading State for Form Data with Skeleton */}
              {isLoadingFormData ? (
                <div className="mt-16 space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                      <div
                        key={index}
                        className="border-2 rounded-3xl p-4 border-gray-200"
                      >
                        <div className="w-full h-48 overflow-hidden rounded-xl bg-gray-50 space-y-3 p-4">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-8 w-1/2 mt-4" />
                        </div>
                      </div>
                    ))}
                  </div>
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
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : confirmedTemplate ? (
                "Next →"
              ) : (
                "Configure Template"
              )}
            </button>
          </div>

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
