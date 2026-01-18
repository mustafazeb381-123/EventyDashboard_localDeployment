import AdvanceBadge from "@/components/AdvanceEventComponent/AdvanceBadge";
import AdvanceConfirmation from "@/components/AdvanceEventComponent/AdvanceConfirmation";
import AdvanceRegistration from "@/components/AdvanceEventComponent/AdvanceRegistration";
import AdvanceTicket from "@/components/AdvanceEventComponent/AdvanceTickt";
import AdvanceAgenda from "@/components/AdvanceEventContent/AdvanceAgenda";
import AdvanceArea from "@/components/AdvanceEventContent/AdvanceArea";
import AdvanceExhibitors from "@/components/AdvanceEventContent/AdvanceExhibitors";
import AdvancePartners from "@/components/AdvanceEventContent/AdvancePartners";
import AdvanceSpeaker from "@/components/AdvanceEventContent/AdvanceSpeaker";
import React, { useState } from "react";

interface AdvanceEventProps {
  onComplete?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  plan?: string;
}

const AdvanceEventContent: React.FC<AdvanceEventProps> = ({
  onComplete,
  onPrevious,
  eventId,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { component: AdvanceSpeaker, name: "Advance Speaker" },
    { component: AdvanceExhibitors, name: "Advance Exhibitor" },
    { component: AdvancePartners, name: "Advance Partner" },
    { component: AdvanceAgenda, name: "Advance Agenda" },
    { component: AdvanceArea, name: "Advance Area" },
  ];

  const handleNext = (nextEventId?: string | number) => {
    // Use nextEventId if provided, otherwise fall back to eventId from props
    const effectiveEventId = nextEventId || eventId;

    console.log("AdvanceEventContent - handleNext called", {
      currentStep,
      totalSteps: steps.length,
      nextEventId,
      eventId,
      effectiveEventId,
    });

    if (currentStep < steps.length - 1) {
      // Move to next step within AdvanceEventContent
      setCurrentStep(currentStep + 1);
    } else {
      // Last step completed - return to main ExpressEvent stepper
      console.log("🎯 AdvanceEvent - Last step completed, calling onComplete");
      if (onComplete) {
        // Pass eventId back to ExpressEvent to continue to next main step
        onComplete(effectiveEventId);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // First step - go back to main ExpressEvent stepper
      if (onPrevious) {
        onPrevious();
      }
    }
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="w-full">
      <CurrentComponent
        onNext={handleNext}
        onPrevious={handlePrevious}
        eventId={eventId}
        currentStep={currentStep}
        totalSteps={steps.length}
      />
    </div>
  );
};

export default AdvanceEventContent;
