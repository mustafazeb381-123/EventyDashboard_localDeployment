import { useParams } from "react-router-dom";
import AdvanceEventContent from "@/pages/Home/ExpressEvent/component/AdvanceEventContent";

const SECTION_TO_STEP: Record<string, number> = {
  speakers: 0,
  exhibitors: 1,
  partners: 2,
  agenda: 3,
  area: 4,
};

/**
 * Event Content page used when navigating from the sidebar.
 * Renders the same AdvanceEventContent wizard (Speakers → Exhibitors → Partners → Agenda → Area)
 * at the step indicated by the URL section. The existing flow inside ExpressEvent is unchanged.
 */
function EventContentPage() {
  const { id, section } = useParams<{ id: string; section?: string }>();
  const step =
    section != null && SECTION_TO_STEP[section.toLowerCase()] !== undefined
      ? SECTION_TO_STEP[section.toLowerCase()]
      : 0;

  return (
    <div className="w-full">
      <AdvanceEventContent
        eventId={id}
        initialStep={step}
        onComplete={undefined}
        onPrevious={undefined}
      />
    </div>
  );
}

export default EventContentPage;
