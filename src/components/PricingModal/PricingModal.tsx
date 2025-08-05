import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Check } from 'lucide-react';

const PricingModal = ({ isOpen, onClose, selectedPlan = 'express' }) => {
  const [currentPlan, setCurrentPlan] = useState(selectedPlan);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'express',
      name: 'Express',
      registrations: '300 registrations',
      features: [
        'Up to 300 Registration',
        'Automatic Badge Generation',
        'Badge Printing',
        'Email confirmations',
        'Automatic QR Code Generation',
        'Attendance Reports'
      ],
      buttonText: 'Get started',
      buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      registrations: '300 registrations',
      isPopular: true,
      features: [
        'Up to 300 Registration',
        'Landing Page',
        'Automatic Badge Generation',
        'Automatic QR Code Generation',
        'Attendance Reports'
      ],
      buttonText: 'Get started',
      buttonClass: 'bg-pink-500 hover:bg-pink-600 text-white'
    },
    {
      id: 'full',
      name: 'Full Package',
      registrations: '300 registrations',
      features: [
        'Up to 300 Registration',
        'Landing Page',
        'Automatic Badge Generation',
        'Automatic QR Code Generation',
        'Attendance Reports'
      ],
      buttonText: 'Get started',
      buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white'
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      registrations: 'Unlimited registrations',
      features: [
        'Up to 300 Registration',
        'Landing Page',
        'Automatic Badge Generation',
        'Automatic QR Code Generation',
        'Attendance Reports'
      ],
      buttonText: 'Contact Us',
      buttonClass: 'bg-white hover:bg-gray-50 text-slate-800 border border-slate-800'
    }
  ];

  const handlePlanSelect = (planId) => {
    setCurrentPlan(planId);
  };

  const handleGetStarted = (plan) => {
    console.log(`Selected plan: ${plan.name}`);
    // Add your logic here for handling plan selection
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-800">Choose Your Plan</h2>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Express Event
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Payment Options */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Choose Now,</span>
            <span className="text-pink-500 font-medium">Pay Later</span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-xl p-6 transition-all duration-200 ${
                  plan.isPopular 
                    ? 'border-pink-200 bg-pink-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
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
                  <p className="text-gray-600 text-sm">
                    {plan.registrations}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    What's included
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-slate-800 rounded-full p-1 mt-0.5">
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleGetStarted(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.buttonClass}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal