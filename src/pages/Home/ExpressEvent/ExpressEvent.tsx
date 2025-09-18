import React, { useState } from "react";
import {
  ChevronLeft,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Info,
  X,
} from "lucide-react";
import MainData from "./MainData/MianData";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import RegistrationForm from "./RegistrationForm/RegistrationFormOld";
import Badges from "./Badges/Badges";
import Areas from "./Areas/Areas";
import EmailConfirmation from "./Confirmation/EmailConfirmation";

export interface ToggleStates {
  confirmationMsg: boolean;
  userQRCode: boolean;
  location: boolean;
  eventDetails: boolean;
}

const ExpressEvent = () => {
  // console.log("props of express event", props);

  const location = useLocation();

  const { plan } = location.state || {};
  console.log("selected plan in the express event", plan);
  const [currentStep, setCurrentStep] = useState(0);

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
    {
      id: "badge",
      label: "Badge",
      description: "Please provide your name and email",
    },
    {
      id: "confirmation",
      label: "Confirmation",
      description: "Please provide your name and email",
    },
    {
      id: "areas",
      label: "Areas",
      description: "Please provide your name and email",
    },
  ];

  const [selectedModal, setSelectedModal] = useState<number | null>(null);

  const [isRegistrationNextEnabled, setIsRegistrationNextEnabled] =
    useState(false);

  // 🔹 Match the ToggleStates interface

  const [toggleStates, setToggleStates] = useState<ToggleStates>({
    confirmationMsg: false,
    userQRCode: false,
    location: false,
    eventDetails: false,
  });

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const StepsNavigation = () => (
    <div className="bg-[#F7FAFF]">
      {/* Header with back button and cancel */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigation("/")}
            className="flex items-center gap-2 text-gray-800 hover:text-gray-600"
          >
            <div className="p-2 bg-white rounded-md cursor-pointer">
              <ChevronLeft size={20} />
            </div>
            <span className="text-sm font-poppins font-medium">
              Express Event
            </span>
          </Button>
        </div>

        {/* cancel button */}
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

      {/* Breadcrumb */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500 font-poppins text-xs font-normal">
            Home
          </span>
          <ChevronLeft className="rotate-180 text-gray-400 cursor-pointer" size={14} />
          <span className="text-gray-800 text-xs font-normal font-poppins">
            Express Event
          </span>
        </div>
      </div>

      {/* Steps Navigation with Gaps and Rounded Corners */}
      <div className="px-6 pb-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {steps.map((step, index) => {
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

            return (
              <div
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex flex-col justify-between cursor-pointer min-w-[180px] px-4 py-3 transition-all border-t-4 ${borderColor}`}
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <MainData
            plan={plan}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      case 1:
        return (
          <RegistrationForm
            toggleStates={toggleStates}
            setToggleStates={setToggleStates}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      case 2:
        return (
          <Badges
            toggleStates={toggleStates} // <-- pass toggles here
            onNext={(badgeId) => {
              setSelectedModal(badgeId); // save which badge was selected
              handleNext(); // go to next step
            }}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      case 3:
        return (
          <EmailConfirmation
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      case 4:
        return (
          <Areas
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        );
      default:
        return (
          <MainData
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
        {/* This wrapper div ensures all content is centered and has a max width */}
        <div className="max-w-full mx-auto p-4 md:p-6 lg:p-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default ExpressEvent;
