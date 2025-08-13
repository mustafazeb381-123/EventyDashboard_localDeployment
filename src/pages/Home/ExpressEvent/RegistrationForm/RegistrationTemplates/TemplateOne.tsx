import React from 'react';
import { Upload } from 'lucide-react';

const TemplateOne = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8 mt-4">
      <div className="w-full md:w-1/2">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm font-poppins font-semibold mb-2">Add Registration header...</p>
          <div className="space-y-3">
            <input className="w-full border-b border-gray-300 p-2 text-sm" placeholder="Full Name" disabled />
            <input className="w-full border-b border-gray-300 p-2 text-sm" placeholder="Last Name" disabled />
            <input className="w-full border-b border-gray-300 p-2 text-sm" placeholder="Email" disabled />
            <div className="flex items-center space-x-2">
               <Upload size={16} />
               <p className="text-sm text-gray-400">Choose File (max 2MB, PDF/Doc/Img)</p>
            </div>
          </div>
        </div>
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

export default TemplateOne;