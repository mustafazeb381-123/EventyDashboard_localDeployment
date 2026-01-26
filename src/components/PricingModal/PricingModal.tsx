import React, { useEffect, useState } from "react";
import { X, Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
}
const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    console.log("selected plan in the pricing modal :", selectedPlan);
    // Reset to step 1 when modal opens with a new plan
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [selectedPlan, isOpen]);

  if (!isOpen) return null;

  const plans = [
    {
      id: "express",
      name: "Express",
      registrations: "300 registrations",
      features: [
        "Up to 300 Registration",
        "Automatic Badge Generation",
        "Badge Printing",
        "Email confirmations",
        "Automatic QR Code Generation",
        "Attendance Reports",
      ],
      buttonText: 'Get started',
      buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
    },
    {
      id: "advanced",
      name: "Advanced",
      registrations: "300 registrations",
      isPopular: true,
      features: [
        "Up to 300 Registration",
        "Landing Page",
        "Automatic Badge Generation",
        "Automatic QR Code Generation",
        "Attendance Reports",
      ],
      buttonText: 'Get started',
      buttonClass: 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer'
 
    },
    {
      id: "full",
      name: "Full Package",
      registrations: "300 registrations",
      features: [
        "Up to 300 Registration",
        "Landing Page",
        "Automatic Badge Generation",
        "Automatic QR Code Generation",
        "Attendance Reports",
      ],
      buttonText: 'Get started',
      buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
    },
    {
      id: "unlimited",
      name: "Unlimited",
      registrations: "Unlimited registrations",
      features: [
        "Up to 300 Registration",
        "Landing Page",
        "Automatic Badge Generation",
        "Automatic QR Code Generation",
        "Attendance Reports",
      ],
      buttonText: 'Contact Us',
      buttonClass: 'bg-white hover:bg-gray-50 text-slate-800 border border-slate-800 cursor-pointer'
    }
  ];

  // const handlePlanSelect = (planId) => {
  //   setCurrentPlan(planId);
  //   console.log(`Plan selected: ${planId}`);
  // };

  const handleGetStarted = (plan: any) => {
    console.log(`Get started with plan: ${plan.name}`);
  
    if (plan.id === "express") {
      console.log("navigating to express-event express");
      navigate("/express-event", { state: { plan: plan.id } });
    } else {
      console.log("navigating to express event advance");
      navigate("/express-event", { state: { plan: plan.id } });
    }
    onClose();
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="fixed bg-black/50 shadow-xl inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h2 className="text-2xl font-semibold text-slate-800">
                Choose Your Plan
              </h2>
              <span
                className={`${
                  selectedPlan === "express" ? "bg-green-100" : "bg-sky-100"
                } ${
                  selectedPlan === "express" ? "text-green-700" : "text-sky-700"
                } px-3 py-1 rounded-full text-sm font-medium`}
              >
                {selectedPlan === "express" ? "Express Event" : "Advance Event"}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>Choose Now,</span>
              <span className="text-pink-500 font-medium">Pay Later</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                // onClick={() => handlePlanSelect(plan.id)}
                className={`relative border rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col h-full ${
                  plan.isPopular
                    ? "border-pink-200 bg-pink-50"
                    : selectedPlan === plan.id
                    ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{plan.registrations}</p>
                </div>

                {/* Features */}
                <div className="flex-grow mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    What's included
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-slate-800 rounded-full p-1 mt-0.5 flex-shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button at bottom */}
                <div className="mt-auto">
                  {currentStep === 1 && selectedPlan === plan.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-slate-800 hover:bg-slate-700 text-white cursor-pointer flex items-center justify-center gap-2"
                    >
                      Next
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetStarted(plan);
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.buttonClass || 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'}`}
                    >
                      {plan.buttonText || 'Get started'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
