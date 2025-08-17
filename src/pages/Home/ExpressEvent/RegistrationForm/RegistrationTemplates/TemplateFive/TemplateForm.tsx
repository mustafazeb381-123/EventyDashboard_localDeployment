import React from 'react';
import { Upload } from 'lucide-react';
import Assets from '@/utils/Assets';

const TemplateFive = () => {


    const selectTamplate = () => {

        
    }
  return (
    <div className="flex flex-col md:flex-row gap-8 mt-4">
      <div className="w-full md:w-1/2">
        <img src={Assets.images.templateFive} />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-poppins font-semibold mb-2">Event Registration Form</h2>
          <p className="text-sm text-gray-500 mb-6">A new guest's registration form is a form designed to streamline the process of collecting personal and contact information from new guests.</p>
        </div>
        <button className="bg-slate-800 text-white p-3 rounded-lg text-sm font-poppins font-medium hover:bg-slate-900 transition-colors">
          Use Template →
        </button>
      </div>
    </div>
  );
};

export default TemplateFive;