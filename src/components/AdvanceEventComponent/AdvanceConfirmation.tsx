import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';

interface AdvanceConfirmationProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

const AdvanceConfirmation: React.FC<AdvanceConfirmationProps> = ({ onNext, onPrevious, eventId, currentStep, totalSteps }) => {
  const handleNext = () => {
    onNext(eventId);
  };

  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Advance Confirmation</h2>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === currentStep 
                  ? "border-pink-500 bg-white text-pink-500" 
                  : step < currentStep 
                  ? "bg-pink-500 border-pink-500 text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}>
                {step < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{step + 1}</span>
                )}
              </div>
              {step < 3 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  step < currentStep ? "bg-pink-500" : "bg-gray-300"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-gray-100 rounded-2xl p-8 max-w-md w-full text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Confirmation Settings
          </h3>
          <p className="text-gray-600 mb-6">
            Set up confirmation emails, notifications, and post-registration communication for your attendees.
          </p>
          <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg">
            <p className="text-sm">
              Configure automatic confirmations, reminders, and follow-up messages.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </span>

        <button
          onClick={handleNext}
          className="cursor-pointer px-6 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default AdvanceConfirmation;