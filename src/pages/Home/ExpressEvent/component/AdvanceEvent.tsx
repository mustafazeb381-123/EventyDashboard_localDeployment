import AdvanceBadge from "@/components/AdvanceEventComponent/AdvanceBadge";
import AdvanceConfirmation from "@/components/AdvanceEventComponent/AdvanceConfirmation";
import AdvanceRegistration from "@/components/AdvanceEventComponent/AdvanceRegistration";
import AdvanceTicket from "@/components/AdvanceEventComponent/AdvanceTickt";
import AdvancePayment from "@/components/AdvanceEventComponent/AdvancePayment";
import React, { useState } from "react";

interface AdvanceEventProps {
  onComplete?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
}

const AdvanceEvent: React.FC<AdvanceEventProps> = ({
  onComplete,
  onPrevious,
  eventId,
}) => {
  console.log('event id__________', eventId)
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    // { component: AdvanceTicket, name: "Advance Ticket" },
    { component: AdvanceRegistration, name: "Advance Registration" },
    { component: AdvanceConfirmation, name: "Advance Confirmation" },
    { component: AdvanceBadge, name: "Advance Badge" },
    { component: AdvancePayment, name: "Payment" },
  ];

  // UPDATED: Handle next with eventId parameter
  // In AdvanceEvent.tsx - UPDATE the handleNext function:

  const handleNext = (nextEventId?: string | number) => {
    console.log("AdvanceEvent - handleNext called", {
      currentStep,
      totalSteps: steps.length,
      nextEventId,
      eventId,
    });

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // When we're on the last step (AdvanceBadge), call onComplete
      console.log("🎯 AdvanceEvent - Last step completed, calling onComplete");
      if (onComplete) {
        onComplete(nextEventId || eventId);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      if (onPrevious) {
        onPrevious();
      }
    }
  };

  const CurrentComponent = steps[currentStep].component;
  const onStepClick = (step: number) => {
    if (step >= 0 && step < steps.length) setCurrentStep(step);
  };

  return (
    <div className="w-full">
      <CurrentComponent
        onNext={handleNext} // UPDATED: Pass the updated handleNext
        onPrevious={handlePrevious}
        eventId={eventId}
        currentStep={currentStep}
        totalSteps={steps.length}
        onStepClick={onStepClick}
      />
    </div>
  );
};

export default AdvanceEvent;
