import React from "react";

function Badges({ onNext, onPrevious, currentStep, totalSteps }) {
  return (
    <div>
      <h1>badges now you can start work</h1>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border
            ${
              currentStep === 0
                ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
                : "text-slate-800 border-gray-300 hover:bg-gray-50"
            }`}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors
            ${
              currentStep === totalSteps - 1
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
        >
          {currentStep === totalSteps - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export default Badges;
