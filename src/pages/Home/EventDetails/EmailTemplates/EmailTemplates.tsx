import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";
import AdvanceEmail from "@/pages/Home/ExpressEvent/component/AdvanceEmail";

/**
 * Standalone wrapper for AdvanceEmail component
 * This allows the email templates screen to be accessed from the sidebar
 * without requiring the step-by-step navigation flow
 */
const EmailTemplates = () => {
  const { id: routeEventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigateTo = useWorkspaceNavigate();
  const eventIdFromQuery = searchParams.get("eventId");
  
  // Use route event ID if available, otherwise fallback to query param
  const eventId = routeEventId || eventIdFromQuery || undefined;

  // Handle navigation - since this is standalone, we don't need step navigation
  const handleNext = () => {
    if (eventId) {
      navigateTo(`home/${eventId}`);
    } else {
      navigateTo("");
    }
  };

  const handlePrevious = () => {
    if (eventId) {
      navigateTo(`home/${eventId}`);
    } else {
      navigateTo("");
    }
  };

  return (
    <div className="w-full">
      <AdvanceEmail
        eventId={eventId}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};

export default EmailTemplates;
