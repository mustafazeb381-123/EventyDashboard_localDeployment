import React, { useEffect, useState } from "react";
import { ChevronLeft, X, Eye } from "lucide-react";
import Assets from "@/utils/Assets";
import type { ToggleStates } from "../ExpressEvent";
import { postBadgesApi } from "@/apis/apiHelpers";
import { toast } from "react-toastify";

interface Badge {
  id: number;
  name: string;
  frontImg: string;
  backImg: string;
}

interface BadgesProps {
  toggleStates: ToggleStates; // All toggles from RegistrationForm
  onNext: (badgeId: number) => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

const Badges: React.FC<BadgesProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  toggleStates,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);

  const badges: Badge[] = [
    {
      id: 1,
      name: "Badge 1",
      frontImg: Assets.images.b1_front,
      backImg: Assets.images.b1_back,
    },
    {
      id: 2,
      name: "Badge 2",
      frontImg: Assets.images.b2_front,
      backImg: Assets.images.b2_back,
    },
    {
      id: 3,
      name: "Badge 3",
      frontImg: Assets.images.b3_front,
      backImg: Assets.images.b3_back,
    },
    {
      id: 4,
      name: "Badge 4",
      frontImg: Assets.images.b4_front,
      backImg: Assets.images.b4_back,
    },
    {
      id: 5,
      name: "Badge 5",
      frontImg: Assets.images.b5_front,
      backImg: Assets.images.b5_back,
    },
    {
      id: 6,
      name: "Badge 6",
      frontImg: Assets.images.b6_front,
      backImg: Assets.images.b6_back,
    },
    {
      id: 7,
      name: "Badge 7",
      frontImg: Assets.images.b7_front,
      backImg: Assets.images.b7_back,
    },
    {
      id: 8,
      name: "Badge 8",
      frontImg: Assets.images.b8_front,
      backImg: Assets.images.b8_back,
    },
  ];

  const openBadgeModal = (badge: Badge) => {
    setPreviewBadge(badge);
    setOpenModal(true);
  };

  const closeModal = () => setOpenModal(false);

  const [loading, setLoading] = useState(false);

  const selectBadgeAndContinue = async () => {
    if (!selectedBadge) return;

    setLoading(true);
    try {
      await handleBadgeApiSelection(selectedBadge.id, selectedBadge.name);
      onNext(selectedBadge.id); // Only go next if API succeeds
    } catch (error) {
      console.error("Failed to proceed:", error);
      // You could also show a toast or inline error here
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeApiSelection = async (
    badgeId: number,
    badgeName: string
  ) => {
    const savedEventId = localStorage.getItem("create_eventId");
    console.log("saved event id-------+++++++-------", savedEventId);

    const data = {
      badge: {
        name: badgeName,
        event_id: savedEventId,
        default: false,
      },
    };

    try {
      const response = await postBadgesApi(data, savedEventId);
      console.log("Badge API Response:", response.data);
      toast.success("Badge selected successfully!");
      return response;
    } catch (error) {
      console.error("Failed to select badge:", error);
      toast.error("Failed to select badge.");
    }
  };

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
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative group border-2 rounded-3xl p-4 transition-colors cursor-pointer ${
              selectedBadge?.id === badge.id
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-blue-500"
            }`}
            onClick={() =>
              setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)
            }
          >
            <img
              src={badge.frontImg}
              alt={badge.name}
              className="w-full  object-cover rounded-xl object-top"
            />

            {/* Preview Button Overlay */}
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
        ))}
      </div>

      {/* Preview Modal */}
      {openModal && previewBadge && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto w-full md:w-3/4">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-poppins font-semibold">
                {previewBadge.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1"
              >
                <X />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src={previewBadge.frontImg}
                alt={`${previewBadge.name} Front`}
                className="flex-1 max-h-[70vh] w-full object-contain"
              />
              <img
                src={previewBadge.backImg}
                alt={`${previewBadge.name} Back`}
                className="flex-1 max-h-[70vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Display ConfirmationMessage toggle */}
      <div className="text-xs py-2 flex flex-wrap gap-2 items-center">
        <h6>
          Msg:{" "}
          <span
            className={
              toggleStates.confirmationMsg ? "text-green-600" : "text-red-600"
            }
          >
            {toggleStates.confirmationMsg ? "ON" : "OFF"}
          </span>
        </h6>
        <h6>
          Qr:{" "}
          <span
            className={
              toggleStates.userQRCode ? "text-green-600" : "text-red-600"
            }
          >
            {toggleStates.userQRCode ? "ON" : "OFF"}
          </span>
        </h6>
        <h6>
          Location:{" "}
          <span
            className={
              toggleStates.location ? "text-green-600" : "text-red-600"
            }
          >
            {toggleStates.location ? "ON" : "OFF"}
          </span>
        </h6>
        <h6>
          Details:{" "}
          <span
            className={
              toggleStates.eventDetails ? "text-green-600" : "text-red-600"
            }
          >
            {toggleStates.eventDetails ? "ON" : "OFF"}
          </span>
        </h6>
      </div>

      {/* Navigation Buttons */}
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
          className={`cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg text-white flex items-center justify-center
    ${
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
    </div>
  );
};

export default Badges;
