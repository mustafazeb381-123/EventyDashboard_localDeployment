import React, { useState } from 'react';
import { ChevronLeft, Check, Upload } from 'lucide-react';

// Import the new template components
import TemplateOne from './RegistrationTemplates/TemplateOne';
import TemplateTwo from './RegistrationTemplates/TemplateTwo';

const Modal = ({ selectedTemplate, onClose,  }) => {
  if (!selectedTemplate) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        {/* Conditionally render the correct template component */}
        {selectedTemplate === 'template-one' && <TemplateOne />}
        {selectedTemplate === 'template-two' && <TemplateTwo />}

      </div>
    </div>
  );
};

// Main RegistrationForm Component
const RegistrationForm = ({ onNext, onPrevious, currentStep, totalSteps}) => {
    // const [currentStep, setCurrentStep] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const isStep1Active = currentStep === 1;
    const isStep1Completed = currentStep > 1;
    const isStep2Active = currentStep === 2;

    const handleOpenModal = (templateId) => {
        setSelectedTemplate(templateId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTemplate(null);
    };

    return (
        <div className='w-full mx-5 bg-white p-5 rounded-2xl'>
            <div className='flex flex-row justify-between items-center '>
                <div className='flex flex-row gap-2 items-center'>
                    <ChevronLeft />
                    <p className='text-neutral-900 text-md font-poppins font-normal'>
                        Choose a registration form template
                    </p>
                </div>

                {/* Steps div */}
                <div className='flex items-center gap-2'>
                    {/* Step 1 Indicator */}
                    <div className='flex items-center'>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                            ${isStep1Completed || isStep1Active ? 'border-[#ff0080]' : 'border-gray-200'}
                            ${isStep1Completed ? 'bg-[#ff0080]' : 'bg-transparent'}
                        `}>
                            {isStep1Completed ? (
                                <Check size={18} color="white" />
                            ) : (
                                <p className={`text-sm font-poppins ${isStep1Active ? 'text-[#ff0080]' : 'text-gray-400'}`}>01</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Connector Line (unchanged) */}
                    <div className={`flex-1 h-1 rounded-full 
                        ${isStep1Completed ? 'bg-[#ff0080]' : 'bg-gray-200'}
                    `}></div>

                    {/* Step 2 Indicator */}
                    <div className='flex items-center'>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                            ${isStep2Active ? 'border-[#ff0080]' : 'border-gray-200'}
                        `}>
                            <p className={`text-sm font-poppins 
                                ${isStep2Active ? 'text-[#ff0080]' : 'text-gray-400'}`}>02</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Previews */}
            <div className='mt-16 flex justify-center gap-8'>
                {/* Template One Preview */}
                <div 
                    onClick={() => handleOpenModal('template-one')} 
                    className="w-1/2 md:w-1/3 border-2 border-gray-200 rounded-3xl p-4 cursor-pointer hover:border-pink-500 transition-colors"
                >
                    <div className="bg-gray-100 p-4 rounded-xl">
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500">Event Registration Form</p>
                            <div className="w-full h-2 bg-pink-500 rounded-full"></div>
                        </div>
                    </div>
                    <p className="mt-4 font-poppins font-medium text-sm">Template One</p>
                </div>

                {/* Template Two Preview */}
                <div 
                    onClick={() => handleOpenModal('template-two')} 
                    className="w-1/2 md:w-1/3 border-2 border-gray-200 rounded-3xl p-4 cursor-pointer hover:border-pink-500 transition-colors"
                >
                    <div className="bg-gray-100 p-4 rounded-xl">
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500">Event Registration Form</p>
                            <div className="w-full h-2 bg-pink-500 rounded-full"></div>
                        </div>
                    </div>
                    <p className="mt-4 font-poppins font-medium text-sm">Template Two</p>
                </div>
            </div>

            {/* Conditionally render the Modal */}
            {isModalOpen && <Modal selectedTemplate={selectedTemplate} onClose={handleCloseModal} />}

             {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border
            ${currentStep === 0 
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200' 
              : 'text-slate-800 border-gray-300 hover:bg-gray-50'
            }`}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors
            ${currentStep === totalSteps - 1 
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
              : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next →'}
        </button>
      </div>
        </div>
    );
};

export default RegistrationForm;