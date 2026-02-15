import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
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
  const [activePlan, setActivePlan] = useState<string>(selectedPlan || "");

  // Sync active plan when modal opens or selectedPlan changes (e.g. Express vs Advanced from Home)
  useEffect(() => {
    if (isOpen && selectedPlan) {
      setActivePlan(selectedPlan);
    }
  }, [isOpen, selectedPlan]);

  if (!isOpen) return null;

  const plans = [
    {
      id: "express",
      name: "Express",
      price: "$1000",
      features: [
        "Up to 400 Registrations",
        "Invitations & Email Confirmations",
        "Basic Attendance Reports",
        "Event Registration Form",
      ],
      buttonText: "Get started",
      buttonClass: "bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white",
      cardClass: "border-pink-200 bg-white",
    },
    {
      id: "advanced",
      name: "Advanced",
      subtitle: "/ with the app",
      price: "$2000",
      isPopular: true,
      features: [
        "Up to 400 Registrations",
        "Fully Customized Landing Page",
        "Badge Generation & Printing",
        "Custom Mobile App (iOS & Android)",
        "Advanced Reports & Full Branding",
        "Dedicated Support",
      ],
      buttonText: "Get started",
      buttonClass: "bg-white hover:bg-gray-50 text-[#1e3a5f]",
      cardClass: "bg-gradient-to-b from-[#1e3a5f] to-[#2d4f7f] text-white",
    },
    {
      id: "unlimited",
      name: "Unlimited",
      price: "$Custom",
      features: [
        "Enterprise / Custom Plan",
        "Advanced integrations (CRM, payment, APIs)",
        "On-site & remote technical support",
        "Custom reports & dashboards",
      ],
      buttonText: "Contact Us",
      buttonClass: "bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white",
      cardClass: "border-pink-200 bg-white",
    },
  ];

  const handleGetStarted = (plan: any) => {
    if (plan.id === "express") {
      navigate("/express-event", { state: { plan: "express" } });
    } else if (plan.id === "advanced") {
      // ExpressEvent page expects "advance" (no 'd'), not "advanced"
      navigate("/express-event", { state: { plan: "advance" } });
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative p-8 border-b">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-slate-800 mb-2">
              Choose Your Plan
            </h2>
            <div className="flex items-center justify-center gap-2 text-base">
              <span className="text-gray-600">Choose Now,</span>
              <span className="text-blue-500 font-medium">Pay Later</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isActive = activePlan === plan.id;
              return (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                onClick={() => setActivePlan(plan.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActivePlan(plan.id);
                  }
                }}
                className={`relative rounded-2xl p-8 transition-all duration-200 flex flex-col h-full cursor-pointer select-none ${
                  isActive
                    ? "bg-gradient-to-b from-[#1e3a5f] to-[#2d4f7f] text-white border-2 border-[#1e3a5f] shadow-xl"
                    : "border-2 border-pink-200 bg-white"
                } ${!isActive ? "hover:shadow-lg" : ""}`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-[#1e3a5f] px-6 py-1.5 rounded-full text-sm font-medium border-2 border-[#1e3a5f]">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <h3
                    className={`text-4xl font-bold mb-1 ${
                      isActive ? "text-white" : "text-[#1e3a5f]"
                    }`}
                  >
                    {plan.price}
                  </h3>
                </div>

                {/* Plan Name */}
                <div className="mb-6">
                  <h4
                    className={`text-2xl font-semibold ${
                      isActive ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {plan.name}
                    {plan.subtitle && (
                      <span className="text-base font-normal ml-1 opacity-90">
                        {plan.subtitle}
                      </span>
                    )}
                  </h4>
                </div>

                {/* Features */}
                <div className="flex-grow mb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div
                          className={`rounded-full p-1 mt-0.5 flex-shrink-0 ${
                            isActive ? "bg-white/20" : "bg-[#1e3a5f]"
                          }`}
                        >
                          <Check
                            size={14}
                            className="text-white"
                          />
                        </div>
                        <span
                          className={`text-sm leading-relaxed ${
                            isActive ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <div className="mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetStarted(plan);
                    }}
                    className={`w-full py-3.5 px-6 rounded-full font-semibold transition-all duration-200 ${
                      isActive ? "bg-white hover:bg-gray-50 text-[#1e3a5f]" : "bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;