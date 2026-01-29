import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Send, ArrowRightLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdvancePaymentProps {
  onNext: (eventId?: string | number, plan?: string) => void;
  onPrevious: () => void;
  currentStep?: number;
  totalSteps?: number;
  eventId?: string | number;
  plan?: string;
  onStepClick?: (step: number) => void;
  /** Called when user switches to Express (parent may navigate with plan: "express") */
  onConvertToExpress?: () => void;
}

const AdvancePayment: React.FC<AdvancePaymentProps> = ({
  onNext,
  onPrevious,
  currentStep = 0,
  totalSteps = 0,
  eventId,
  plan = "advance",
  onConvertToExpress,
}) => {
  const [publishing, setPublishing] = useState(false);
  const [showExpressModal, setShowExpressModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleNext = () => {
    onNext(eventId, plan);
  };

  const handlePublishEvent = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setNotification({ message: "Publish option will be available soon.", type: "success" });
    }, 800);
  };

  const handleSwitchToExpress = () => {
    setShowExpressModal(false);
    setNotification({ message: "Switch to Express may be available later.", type: "success" });
    onConvertToExpress?.();
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0 bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Settings</h2>
          <p className="text-gray-600">
            Configure payment options for your advance event. This section will be updated with payment integration details.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Payment Integration</h3>
                <p className="text-sm text-gray-500">Payment gateway configuration coming soon</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-600">
                This section will be configured with payment gateway settings once the company provides the integration details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Payment Methods</h4>
              <p className="text-sm text-gray-500">Configure accepted payment methods</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Pricing</h4>
              <p className="text-sm text-gray-500">Set event pricing and ticket costs</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button onClick={onPrevious} variant="outline" className="flex items-center gap-2">
            <ChevronLeft size={20} />
            Previous
          </Button>
          <span className="text-sm text-gray-500">Step {currentStep + 1} of {totalSteps}</span>
          <Button onClick={handleNext} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
            Next
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Sidebar: Publish & Event type */}
      <aside className="w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Publish & plan</h3>
          <div className="space-y-3">
            <Button
              onClick={handlePublishEvent}
              disabled={publishing}
              className="w-full justify-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              {publishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Publish event
            </Button>
            <p className="text-xs text-gray-500">
              Make your event live. Options will be updated when the feature is ready.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <ArrowRightLeft size={16} />
            Event type
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Currently: <span className="font-medium text-gray-700">Advance</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowExpressModal(true)}
          >
            Switch to Express
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Change event type to get different features and steps.
          </p>
        </div>
      </aside>

      {/* Switch to Express modal */}
      {showExpressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">Switch to Express?</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Switching to Express may not be supported yet. Contact support if you need this.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowExpressModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSwitchToExpress}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-2 rounded-lg shadow-lg text-sm ${
            notification.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AdvancePayment;
