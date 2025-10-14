import React, { useEffect, useState } from "react";
import { ChevronLeft, Eye } from "lucide-react";
import Assets from "@/utils/Assets";
import type { ToggleStates } from "../ExpressEvent";
import { getEventbyId, postBadgesApi } from "@/apis/apiHelpers";
import { toast, ToastContainer } from "react-toastify";
import Badge1 from "./components/Badge1";
import Badge2 from "./components/Badge2";
import Badge3 from "./components/Badge3";
import Badge4 from "./components/Badge4";

const CardHeader: React.FC<{ color?: string }> = ({ color = "#4D4D4D" }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full rounded-t-xl"
    preserveAspectRatio="none"
  >
    <path
      d="M111.273 56.0935C64.6585 45.6916 29.5725 53.1215 0 66V0H204V47.6729C172.322 62.3346 125.307 59.2252 111.273 56.0935Z"
      fill={color}
    />
    <path
      d="M106 64.6191C56.4 55.4191 14.6667 74.7858 0 85.6191V89.6191C40 63.6191 87.3333 62.1191 106 64.6191Z"
      fill={color}
    />
    <path
      d="M107 61.6188C60.5 51.1189 17.3333 65.9522 0 74.6188V80.1187C39.5 55.1189 89.5 58.7806 107 61.6188Z"
      fill={color}
    />
    <path
      d="M119.5 62.5C165.5 68 189 60.5 204 54.5V58.5C170.5 68.5 133.5 66 119.5 62.5Z"
      fill={color}
    />
    <path
      d="M119 65.5C157 73.5 191.5 67.5 204 62.5V67.5C164 76 130 68.5 119 65.5Z"
      fill={color}
    />
  </svg>
);

const CardHeader2: React.FC<{ color?: string }> = ({ color = "#4D4D4D" }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 106"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path d="M204 26V13L154.5 38.5L162.5 46L204 26Z" fill={color} />
    <path d="M0 106V0H204L0 106Z" fill={color} />
  </svg>
);

const CardFooter: React.FC<{ color?: string }> = ({ color = "#4D4D4D" }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full rounded-b-xl"
    preserveAspectRatio="none"
  >
    <path
      d="M129 22.6273C166.5 23.0083 194.5 8.33636 204 0V8.33636C166.5 27.5 150.5 25.5 129 22.6273Z"
      fill={color}
    />
    <path
      d="M0 20.4307V28C51.5 4.56204 91.5 17.1777 98 18.4392C57.6 1.28214 16 14.6544 0 20.4307Z"
      fill={color}
    />
    <path
      d="M0 33.6364V41H204V14C172.078 29.7091 147.138 29.953 126.688 26.2717C59.8521 14.2401 35.912 15.2273 0 33.6364Z"
      fill={color}
    />
  </svg>
);

const CardFooter2: React.FC<{ color?: string }> = ({ color = "#4D4D4D" }) => (
  <svg width="100%" height="100%" viewBox="0 0 204 54" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path d="M89.4059 9L0 54H54.5792L105 28.7802L89.4059 9Z" fill={color} />
    <path d="M204 0L106 54H204V0Z" fill={color} />
  </svg>
);

interface Badge {
  id: number;
  name: string;
  frontImg: string;
  backImg: string;
  userImg?: string;
  squareUserImg?: string;
  qrImg: string;
  cardHeader: string;
  cardFooter: string;
}

interface BadgesProps {
  toggleStates: ToggleStates;
  onNext: (eventId?: string | number) => void; // Updated to match ExpressEvent signature
  onPrevious: () => void;
  currentStep: number;
  totalSteps?: number;
  eventId?: string;
}

const Badges: React.FC<BadgesProps> = ({
  onNext,
  onPrevious,
  currentStep,
  eventId,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeBadgeId, setActiveBadgeId] = useState<number | null>(null);
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);
  
  // Use eventId from props first, then fall back to localStorage
  const effectiveEventId = eventId || localStorage.getItem("create_eventId");
  
  console.log('Badges - Received eventId:', eventId);
  console.log('Badges - Effective eventId:', effectiveEventId);
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const badges: Badge[] = [
    {
      id: 1,
      name: "Badge 1",
      frontImg: Assets.images.b1_front,
      backImg: Assets.images.b1_back,
      userImg: Assets.images.user_img,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header,
      cardFooter: Assets.images.card_footer,
    },
    {
      id: 2,
      name: "Badge 2",
      frontImg: Assets.images.b2_front,
      backImg: Assets.images.b2_back,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header,
      cardFooter: Assets.images.card_footer,
    },
    {
      id: 3,
      name: "Badge 3",
      frontImg: Assets.images.b3_front,
      backImg: Assets.images.b3_back,
      squareUserImg: Assets.images.square_user_img,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header2,
      cardFooter: Assets.images.card_footer2,
    },
    {
      id: 4,
      name: "Badge 4",
      frontImg: Assets.images.b4_front,
      backImg: Assets.images.b4_back,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header2,
      cardFooter: Assets.images.card_footer2,
    },
  ];

  const openBadgeModal = (badge: Badge) => {
    setPreviewBadge(badge);
    setOpenModal(true);
  };

  const closeModal = () => setOpenModal(false);

  const handleBadgeApiSelection = async (badgeId: number, badgeName: string) => {
    if (!effectiveEventId) {
      throw new Error("Event ID not found");
    }

    const data = {
      badge: {
        name: badgeName,
        event_id: effectiveEventId,
        default: true,
        badge_background: badgeId,
      },
    };

    const response = await postBadgesApi(data, parseInt(effectiveEventId, 10));
    return response;
  };

  const selectBadgeAndContinue = async () => {
    if (!selectedBadge) return toast.error("Please select a badge first!");
    setLoading(true);
    try {
      const response = await handleBadgeApiSelection(selectedBadge.id, selectedBadge.name);
      toast.success("Badge template selected!");
      setActiveBadgeId(selectedBadge.id);

      // Save active badge to localStorage so it persists between reloads
      localStorage.setItem("active_badge_id", selectedBadge.id.toString());

      setTimeout(() => {
        // FIX: Pass the eventId instead of badgeId to onNext
        if (effectiveEventId && onNext) {
          console.log('Badges - Sending eventId to ExpressEvent:', effectiveEventId);
          onNext(effectiveEventId); // Pass eventId instead of badgeId
        } else {
          console.error('Badges - No eventId available to send');
          onNext(); // Fallback without eventId
        }
      }, 1000);
    } catch (error) {
      toast.error("Failed to select badge.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Fetch event data + restore previously active badge
  useEffect(() => {
    (async () => {
      if (!effectiveEventId) {
        console.warn('Badges - No eventId available');
        return;
      }
      
      try {
        const response = await getEventbyId(effectiveEventId);
        const eventData = response?.data?.data;
        setEvent(eventData);

        // Try from API first, then from localStorage
        const activeBadge =
          eventData?.attributes?.active_badge_id ||
          parseInt(localStorage.getItem("active_badge_id") || "0", 10);

        if (activeBadge) {
          setActiveBadgeId(activeBadge);
          const found = badges.find((b) => b.id === activeBadge);
          if (found) setSelectedBadge(found);
        }
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      }
    })();
  }, [effectiveEventId]);

  return (
    <div className="w-full mx-5 bg-white p-5 rounded-2xl">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <ChevronLeft />
          <p className="text-neutral-900 text-md font-poppins font-normal">
            Choose a Badge
          </p>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge) => {
          const isActive = selectedBadge?.id === badge.id || activeBadgeId === badge.id;
          return (
            <div
              key={badge.id}
              className={`relative group border-2 rounded-3xl p-4 transition-colors cursor-pointer ${
                isActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-blue-500"
              }`}
              onClick={() => setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)}
            >
              {/* Badge Preview */}
              {badge.id === 1 && (
                <div 
                  className="flex flex-col h-125 w-full rounded-xl border-1 overflow-hidden"
                  style={{ backgroundColor: event?.attributes?.secondary_color || "white" }}
                >
                  <div
                    className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                    style={{ height: "33%" }}
                  >
                    <div className="absolute inset-0">
                      <CardHeader color={event?.attributes?.primary_color || "#4D4D4D"} />
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                      {event?.attributes?.logo_url && (
                        <img
                          src={event.attributes.logo_url}
                          alt="Logo"
                          className="w-4 h-4 mb-3"
                        />
                      )}
                      <h6 className="font-semibold mb-3 text-white text-xs">
                        Company Name
                      </h6>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center items-center">
                    <img
                      src={badge.userImg}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <h2 className="text-xs font-bold text-gray-900 mt-1">
                      User Name
                    </h2>
                    <p className="text-gray-600 text-xs">User Title</p>
                  </div>
                  <div
                    className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                    style={{ height: "15%" }}
                  >
                    <div className="absolute inset-0">
                      <CardFooter color={event?.attributes?.primary_color || "#4D4D4D"} />
                    </div>
                  </div>
                </div>
              )}

              {badge.id === 2 && (
                <div 
                  className="flex flex-col h-125 w-full rounded-xl border-1 overflow-hidden"
                  style={{ backgroundColor: event?.attributes?.secondary_color || "white" }}
                >
                  <div
                    className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                    style={{ height: "33%" }}
                  >
                    <div className="absolute inset-0">
                      <CardHeader color={event?.attributes?.primary_color || "#4D4D4D"} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-evenly items-center">
                    <div className="text-center">
                      <h2 className="text-xs font-bold text-gray-900">
                        User Name
                      </h2>
                      <p className="text-gray-600 text-xs">User Title</p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                      {event?.attributes?.logo_url && (
                        <img
                          src={event.attributes.logo_url}
                          alt="Logo"
                          className="w-4 h-4 mb-3"
                        />
                      )}
                      <h6 className="font-semibold mb-3 text-black text-xs">
                        Company Name
                      </h6>
                    </div>
                  </div>
                  <div
                    className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                    style={{ height: "15%" }}
                  >
                    <div className="absolute inset-0">
                      <CardFooter color={event?.attributes?.primary_color || "#4D4D4D"} />
                    </div>
                  </div>
                </div>
              )}

              {badge.id === 3 && (
                <div 
                  className="flex flex-col h-125 w-full rounded-xl border-1 overflow-hidden"
                  style={{ backgroundColor: event?.attributes?.secondary_color || "white" }}
                >
                  <div
                    className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                    style={{ height: "33%" }}
                  >
                    <div className="absolute inset-0">
                      <CardHeader2 color={event?.attributes?.primary_color || "#4D4D4D"} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center items-center">
                    <img
                      src={badge.squareUserImg}
                      className="w-16 object-cover"
                    />
                    <h2 className="text-xs font-bold text-gray-900 mt-1">
                      User Name
                    </h2>
                    <p className="text-gray-600 text-xs">User Title</p>
                  </div>
                  <div
                    className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                    style={{ height: "15%" }}
                  >
                    <div className="absolute inset-0">
                      <CardFooter2 color={event?.attributes?.primary_color || "#4D4D4D"} />
                    </div>
                  </div>
                </div>
              )}

              {badge.id === 4 && (
                <div 
                  className="flex flex-col h-125 w-full rounded-xl border-1 overflow-hidden"
                  style={{ backgroundColor: event?.attributes?.secondary_color || "white" }}
                >
                  <div
                    className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                    style={{ height: "33%" }}
                  >
                    <div className="absolute inset-0">
                      <CardHeader2 color={event?.attributes?.primary_color || "#4D4D4D"} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-evenly items-center">
                    <div className="text-center">
                      <h2 className="text-xs font-bold text-gray-900">
                        User Name
                      </h2>
                      <p className="text-gray-600 text-xs">User Title</p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                      {event?.attributes?.logo_url && (
                        <img
                          src={event.attributes.logo_url}
                          alt="Logo"
                          className="w-4 h-4 mb-3"
                        />
                      )}
                      <h6 className="font-semibold mb-3 text-black text-xs">
                        Company Name
                      </h6>
                    </div>
                  </div>
                  <div
                    className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                    style={{ height: "15%" }}
                  >
                    <div className="absolute inset-0">
                      <CardFooter2 color={event?.attributes?.primary_color || "#4D4D4D"} />
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openBadgeModal(badge);
                  }}
                  className="flex items-center gap-2 bg-[#2E3166E5] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-colors"
                >
                  <Eye size={16} />
                  Preview
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {openModal && previewBadge && (
        <>
          {previewBadge.id === 1 && (
            <Badge1
              badge={previewBadge}
              event={event}
              onClose={closeModal}
              CardHeader={CardHeader}
              CardFooter={CardFooter}
            />
          )}
          {previewBadge.id === 2 && (
            <Badge2
              badge={previewBadge}
              event={event}
              onClose={closeModal}
              CardHeader={CardHeader}
              CardFooter={CardFooter}
            />
          )}
          {previewBadge.id === 3 && (
            <Badge3
              badge={previewBadge}
              event={event}
              onClose={closeModal}
              CardHeader={CardHeader2}
              CardFooter={CardFooter2}
            />
          )}
          {previewBadge.id === 4 && (
            <Badge4
              badge={previewBadge}
              event={event}
              onClose={closeModal}
              CardHeader={CardHeader2}
              CardFooter={CardFooter2}
            />
          )}
        </>
      )}

      {/* Bottom Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg border text-slate-800 hover:bg-gray-50"
        >
          ← Previous
        </button>

        <button
          onClick={selectBadgeAndContinue}
          disabled={!selectedBadge || loading}
          className={`cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg text-white flex items-center justify-center ${
            selectedBadge && !loading
              ? "bg-slate-800 hover:bg-slate-900"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Loading...
            </span>
          ) : (
            "Use Template →"
          )}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Badges;