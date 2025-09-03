import React, { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import Assets from "@/utils/Assets";

interface Badge {
  id: number;
  name: string;
  frontImg: string;
  backImg: string;
}

interface BadgesProps {
  onNext: (badgeId: number) => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

const Badges: React.FC<BadgesProps> = ({ onNext, onPrevious, currentStep, totalSteps }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null); // for template use
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);   // for modal preview

  const badges: Badge[] = [
    { id: 1, name: "Badge 1", frontImg: Assets.images.b1_front, backImg: Assets.images.b1_back },
    { id: 2, name: "Badge 2", frontImg: Assets.images.b2_front, backImg: Assets.images.b2_back },
    { id: 3, name: "Badge 3", frontImg: Assets.images.b3_front, backImg: Assets.images.b3_back },
    { id: 4, name: "Badge 4", frontImg: Assets.images.b4_front, backImg: Assets.images.b4_back },
    { id: 5, name: "Badge 5", frontImg: Assets.images.b5_front, backImg: Assets.images.b5_back },
    { id: 6, name: "Badge 6", frontImg: Assets.images.b6_front, backImg: Assets.images.b6_back },
    { id: 7, name: "Badge 7", frontImg: Assets.images.b7_front, backImg: Assets.images.b7_back },
    { id: 8, name: "Badge 8", frontImg: Assets.images.b8_front, backImg: Assets.images.b8_back },

    // Add more badges here
  ];

  // Open preview modal only
  const openBadgeModal = (badge: Badge) => {
    setPreviewBadge(badge);
    setOpenModal(true);
  };

  const closeModal = () => setOpenModal(false);

  const selectBadgeAndContinue = () => {
    if (selectedBadge) {
      onNext(selectedBadge.id);
    }
  };

  return (
    <div className="w-full mx-5 bg-white p-5 rounded-2xl">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <ChevronLeft />
          <p className="text-neutral-900 text-md font-poppins font-normal">Choose a Badge</p>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative group border-2 rounded-3xl p-4 transition-colors 
              ${selectedBadge?.id === badge.id ? "border-green-500" : "border-gray-200 hover:border-blue-500"}`}
          >
            {/* Badge Image */}
            <img
              src={badge.frontImg}
              alt={badge.name}
              className="w-full h-90 object-cover object-top rounded-xl"
            />

            {/* Preview Button Centered */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button
                onClick={() => openBadgeModal(badge)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg pointer-events-auto"
              >
                Preview
              </button>
            </div>


            {/* Checkbox to Select Badge */}
            <div className="mt-2 flex justify-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedBadge?.id === badge.id}
                  onChange={() => {
                    if (selectedBadge?.id === badge.id) {
                      setSelectedBadge(null); // deselect if already selected
                    } else {
                      setSelectedBadge(badge); // select if not selected
                    }
                  }}
                  className="w-4 h-4 accent-blue-500"
                />

                <span className="text-sm font-poppins">{badge.name}</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {openModal && previewBadge && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-poppins font-semibold">{previewBadge.name}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-800 bg-gray-200 rounded"
              >
                <X />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <img
                  src={previewBadge.frontImg}
                  alt={`${previewBadge.name} Front`}
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>
              <div className="flex-1">
                <img
                  src={previewBadge.backImg}
                  alt={`${previewBadge.name} Back`}
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg border text-slate-800 hover:bg-gray-50"
        >
          ← Previous
        </button>

        <button
          onClick={selectBadgeAndContinue}
          disabled={!selectedBadge}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white 
            ${selectedBadge ? "bg-slate-800 hover:bg-slate-900" : "bg-gray-400 cursor-not-allowed"}`}
        >
          Use Template →
        </button>
      </div>
    </div>
  );
};

export default Badges;
