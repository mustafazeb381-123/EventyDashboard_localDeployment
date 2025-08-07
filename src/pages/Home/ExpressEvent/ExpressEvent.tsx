import React, { useState } from 'react';
import { ChevronLeft, Upload, Calendar, Clock, MapPin, Plus, Trash2, Info, X } from 'lucide-react';
import MainData from './MainData/MianData'; // Assuming the path is correct
import { Button } from '@/components/ui/button';
import { CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';


const ExpressEvent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useNavigate()

  const steps = [
    { id: 'main-data', label: 'Main Data', description: 'Please provide your event info' },
    { id: 'registration-form', label: 'Registration Form', description: 'Please provide your event Registration details' },
    { id: 'badge', label: 'Badge', description: 'Please provide your name and email' },
    { id: 'confirmation', label: 'Confirmation', description: 'Please provide your name and email' },
    { id: 'areas', label: 'Areas', description: 'Please provide your name and email' }
  ];

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

 const StepsNavigation = () => (
  <div className="bg-[#F7FAFF]">
    {/* Header with back button and cancel */}
    
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <Button onClick={()=> navigation("/")} className="flex items-center gap-2 text-gray-800 hover:text-gray-600">
          <div className="p-2 bg-white rounded-md">
            <ChevronLeft size={20} />
          </div>
          <span className="text-sm font-poppins font-medium">Express Event</span>
        </Button>
       </div>

       {/* cancel button */}
       <div className='col-auto'>
      <Button onClick={()=> navigation("/")} className="text-red-600 hover:text-red-900 flex items-center gap-2 text-sm font-poppins font-normal p-2 bg-red-50 rounded-md">
        <span>Cancel Creation</span>
        <X size={18} />
      </Button>
       </div>
    </div>

    {/* Breadcrumb */}
    <div className="px-6 py-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-neutral-500  font-poppins text-xs font-normal">Home</span>
        <ChevronLeft className="rotate-180 text-gray-400" size={14} />
        <span className="text-gray-800 text-xs font-normal font-poppins">Express Event</span>
      </div>
    </div>

    {/* Steps Navigation with Gaps and Rounded Corners */}
    <div className="px-6 pb-4">
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          let bgColor = ' text-neutral-500'; // default gray
          let borderColor = "border-neutral-200"
          if (isActive) {
            bgColor
              = ' text-teal-600 border-teal-500';
            borderColor = " text-teal-600 border-teal-500"
          }
          else if (isCompleted) {
            bgColor = 'bg-green-50 text-green-600 border-green-500';
            borderColor = 'bg-green-50 text-green-600 border-green-500'
          }

          return (
            <div
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`flex flex-col justify-between  cursor-pointer min-w-[180px] px-4 py-3 transition-all border-t-4 ${bgColor} ${borderColor}`}
            >
              <div className="flex items-center gap-2 font-medium text-xs font-poppins">
                {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                {step.label}
              </div>
              <div className="text-xs font-normal font-poppins text-gray-500 leading-tight mt-1">{step.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);


  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <MainData onNext={handleNext} onPrevious={handlePrevious} currentStep={currentStep} totalSteps={steps.length} />;
      case 1:
        return (
          <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-xl font-semibold mb-8 text-gray-800">Registration Form</h2>
            <p className="text-gray-600">Registration form content will go here...</p>
            <div className="flex justify-between mt-6 md:mt-8">
              <button onClick={handlePrevious}>← Previous</button>
              <button onClick={handleNext}>Next →</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-xl font-semibold mb-8 text-gray-800">Badge Design</h2>
            <p className="text-gray-600">Badge design content will go here...</p>
            <div className="flex justify-between mt-6 md:mt-8">
              <button onClick={handlePrevious}>← Previous</button>
              <button onClick={handleNext}>Next →</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-xl fon-poppins font-semibold mb-8 text-gray-800">Confirmation Settings</h2>
            <p className="text-gray-600">Confirmation settings content will go here...</p>
            <div className="flex justify-between mt-6 md:mt-8">
              <button onClick={handlePrevious}>← Previous</button>
              <button onClick={handleNext}>Next →</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-xl font-semibold mb-8 text-gray-800">Event Areas</h2>
            <p className="text-gray-600">Event areas content will go here...</p>
            <div className="flex justify-between mt-6 md:mt-8">
              <button onClick={handlePrevious}>← Previous</button>
              <button onClick={handleNext}>Finish</button>
            </div>
          </div>
        );
      default:
        return <MainData onNext={handleNext} onPrevious={handlePrevious} currentStep={currentStep} totalSteps={steps.length} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] ">
      <StepsNavigation />
      <div className="bg-[#F7FAFF]  min-h-[calc(100vh-140px)]">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ExpressEvent;