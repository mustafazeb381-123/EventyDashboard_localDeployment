import { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle, X } from "lucide-react";
import MainData from "./MainData/MianData";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import RegistrationForm from "./RegistrationForm/RegistrationForm";
import Badges from "./Badges/Badges";
import Areas from "./Areas/Areas";
import EmailConfirmation from "./Confirmation/EmailConfirmation";
import AdvanceAppManagement from "./component/AdvanceAppManagement";
import AdvanceEmail from "./component/AdvanceEmail";
import AdvanceEventContent from "./component/AdvanceEventContent";

export interface ToggleStates {
  confirmationMsg: boolean;
  userQRCode: boolean;
  location: boolean;
  eventDetails: boolean;
}

const ExpressEvent = () => {
  const location = useLocation();
  const planType = location?.state?.plan;
  const { id: routeEventId } = useParams();

  const {
    plan,
    eventData,
    isEditing,
    eventAttributes,
    chartData,
    onTimeRangeChange,
    eventId,
    stats,
    lastEdit,
    currentStep: initialStep,
  } = location.state || {};

  // Use route event ID if available, otherwise fallback to location state eventId
  const [createdEventId, setCreatedEventId] = useState<string | undefined>(
    () => (routeEventId as string) || (eventId as string) || undefined,
  );
  const finalEventId = createdEventId;

  const [currentStep, setCurrentStep] = useState<number>(
    Number(initialStep) || 0,
  );

  const navigation = useNavigate();

  const steps = [
    {
      id: "main-data",
      label: "Main Data",
      description: "Please provide your event info",
    },
    {
      id: "registration-form",
      label: "Registration Form",
      description: "Please provide your event Registration details",
    },
    plan === "advance"
      ? {
          id: "event-content",
          label: "Event Content",
          description: "Please provide event content details",
        }
      : {
          id: "badge",
          label: "Badge",
          description: "Please provide your name and email",
        },
    plan === "advance"
      ? {
          id: "Invitation-Management",
          label: "Email Management",
          description: "Manage invitations for the event",
        }
      : {
          id: "confirmation",
          label: "Email Management",
          description: "Confirm event details",
        },
    plan === "advance"
      ? {
          id: "Mobile-App-Management",
          label: "Mobile App Management",
          description: "Manage mobile app settings for event",
        }
      : {
          id: "areas",
          label: "Areas",
          description: "Define event areas",
        },
  ];

  const [toggleStates, setToggleStates] = useState<ToggleStates>({
    confirmationMsg: false,
    userQRCode: false,
    location: false,
    eventDetails: false,
  });

  // --- Step-based API fetchers ---
  const stepEventFetchers: Record<string, (eventId: string) => void> = {
    "main-data": (eventId) => {
      console.log("Fetching main data for event:", eventId);
      // fetchMainData(eventId);
    },
    "registration-form": (eventId) => {
      console.log("Fetching registration form for event:", eventId);
      // fetchRegistrationForm(eventId);
    },
    badge: (eventId) => {
      console.log("Fetching badge data for event:", eventId);
      // fetchBadgeData(eventId);
    },
    confirmation: (eventId) => {
      console.log("Fetching confirmation data for event:", eventId);
      // fetchConfirmation(eventId);
    },
    "event-content": (eventId) => {
      console.log("Fetching event content for event:", eventId);
      // fetchEventContent(eventId);
    },
    "Invitation-Management": (eventId) => {
      console.log("Fetching invitation management for event:", eventId);
      // fetchInvitation(eventId);
    },
    "Mobile-App-Management": (eventId) => {
      console.log("Fetching mobile app management for event:", eventId);
      // fetchMobileAppManagement(eventId);
    },
    areas: (eventId) => {
      console.log("Fetching areas for event:", eventId);
      // fetchAreas(eventId);
    },
  };

  // --- Fetch data whenever step or eventId changes ---
  useEffect(() => {
    if (!finalEventId) return;
    const step = steps[currentStep];
    console.log("steps---++----", step);
    if (step && stepEventFetchers[step.id]) {
      stepEventFetchers[step.id](finalEventId);
    }
  }, [currentStep, finalEventId]);

  // --- Navigation functions ---
  const handleNext = (nextEventId?: string | number) => {
    if (nextEventId) {
      setCreatedEventId(String(nextEventId));
    }
    setCurrentStep((prev: number) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev: number) => Math.max(prev - 1, 0));
  };

  const handleBackNavigation = () => {
    if (isEditing && finalEventId) {
      navigation(`/home/${finalEventId}`, { state: { eventId: finalEventId } });
    } else {
      navigation("/");
    }
  };

  // --- Steps navigation UI ---
  const StepsNavigation = () => (
    <div className="bg-[#F7FAFF]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBackNavigation}
            className="flex items-center gap-2 text-gray-800 hover:text-gray-600"
          >
            <div className="p-2 rounded-md cursor-pointer">
              <ChevronLeft size={20} />
            </div>
            <span className="text-sm font-poppins font-medium">
              {plan === "express" ? "Express" : "Advance"} Event
            </span>
          </Button>
        </div>
        <div className="col-auto">
          <Button
            onClick={() => navigation("/")}
            className="text-red-600 hover:text-red-900 flex items-center gap-2 text-sm font-poppins font-normal p-2 bg-red-50 rounded-md cursor-pointer"
          >
            <span>Cancel Creation</span>
            <X size={18} />
          </Button>
        </div>
      </div>
      <div className="px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500 font-poppins text-xs font-normal">
            Home
          </span>
          <ChevronLeft
            className="rotate-180 text-gray-400 cursor-pointer"
            size={14}
          />
          <span className="text-gray-800 text-xs font-normal font-poppins">
            Express Event
          </span>
        </div>
      </div>
      <div className="px-6 pb-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {steps.map((step, index) => {
            const isLocked = !finalEventId && !isEditing && index !== 0;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            let borderColor = "border-neutral-200";
            let textColor = "text-neutral-500";
            let iconColor = "text-neutral-500";
            let descriptionColor = "text-gray-500";

            if (isActive) {
              borderColor = "border-teal-500";
              textColor = "text-teal-600";
              iconColor = "text-teal-600";
            } else if (isCompleted) {
              borderColor = "border-green-500";
              textColor = "text-green-600";
              iconColor = "text-green-500";
            }

            if (isLocked) {
              borderColor = "border-neutral-200";
              textColor = "text-neutral-400";
              iconColor = "text-neutral-400";
              descriptionColor = "text-gray-400";
            }

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (isLocked) return;
                  setCurrentStep(index);
                }}
                className={`flex flex-col justify-between min-w-45 px-4 py-3 transition-all border-t-4 ${borderColor} ${
                  isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                <div
                  className={`flex items-center gap-2 font-medium text-xs font-poppins ${textColor}`}
                >
                  {isCompleted && (
                    <CheckCircle className={`w-4 h-4 ${iconColor}`} />
                  )}
                  {step.label}
                </div>
                <div
                  className={`text-xs font-normal font-poppins ${descriptionColor} leading-tight mt-1`}
                >
                  {step.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // --- Render step content ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <MainData
            plan={plan}
            eventData={eventData}
            isEditing={isEditing}
            eventAttributes={eventAttributes}
            eventId={finalEventId}
            stats={stats}
            chartData={chartData}
            onTimeRangeChange={onTimeRangeChange}
            lastEdit={lastEdit}
            onEventCreated={(id) => setCreatedEventId(id)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      case 1:
        return (
          <RegistrationForm
            plan={plan}
            toggleStates={toggleStates}
            setToggleStates={setToggleStates}
            eventId={finalEventId}
            onNext={(id?: string | number, _plan?: string) => handleNext(id)}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      case 2:
        return plan === "advance" ? (
          <AdvanceEventContent
            eventId={finalEventId}
            onComplete={handleNext}
            onPrevious={handlePrevious}
          />
        ) : (
          <Badges
            plan={plan}
            toggleStates={toggleStates}
            eventId={finalEventId}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      case 3:
        return plan === "advance" ? (
          <AdvanceEmail
            eventId={finalEventId}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        ) : (
          <EmailConfirmation
            eventId={finalEventId}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return plan === "advance" ? (
          <AdvanceAppManagement
            eventId={finalEventId}
            onComplete={handleNext}
            onPrevious={handlePrevious}
          />
        ) : (
          <Areas
            eventId={finalEventId}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      default:
        return (
          <MainData
            plan={planType}
            eventData={eventData}
            isEditing={isEditing}
            eventAttributes={eventAttributes}
            eventId={finalEventId}
            stats={stats}
            chartData={chartData}
            onTimeRangeChange={onTimeRangeChange}
            lastEdit={lastEdit}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] ">
      <StepsNavigation />
      <div className="bg-[#F7FAFF] min-h-[calc(100vh-140px)]">
        <div className="max-w-full mx-auto p-4 md:p-6 lg:p-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default ExpressEvent;
