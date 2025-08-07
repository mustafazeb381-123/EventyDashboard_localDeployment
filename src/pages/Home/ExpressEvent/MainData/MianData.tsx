"use client";

import React, { useState, useRef } from 'react';
import "react-day-picker/dist/style.css";
import {
  ChevronLeft,
  Upload,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Info,
  XCircle,
  ChevronDownIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TimePicker } from '@/components/ui/TimePicker';

const MainData = ({ onNext, onPrevious, currentStep, totalSteps }) => {
  const [newGuestType, setNewGuestType] = useState('');
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    dateFrom: undefined,
    dateTo: undefined,
    timeFrom: '09:00',
    timeTo: '17:00',
    location: '',
    requireApproval: false,
    guestTypes: [],
    eventLogo: null,
  });
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);

  const [openDateFrom, setOpenDateFrom] = useState(false);
  const [openDateTo, setOpenDateTo] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoError('');
      if (file.size > 2 * 1024 * 1024) {
        setLogoError('File size exceeds the 2MB limit.');
        return;
      }
      const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        setLogoError('Invalid file type. Please upload SVG, PNG, or JPG.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        eventLogo: file,
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      setLogoError('');
      if (file.size > 2 * 1024 * 1024) {
        setLogoError('File size exceeds the 2MB limit.');
        return;
      }
      const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        setLogoError('Invalid file type. Please upload SVG, PNG, or JPG.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        eventLogo: file,
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      eventLogo: null,
    }));
    setLogoError('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const addGuestType = () => {
    if (!newGuestType.trim()) return;
    setFormData((prev) => ({
      ...prev,
      guestTypes: [...prev.guestTypes, newGuestType.trim()],
    }));
    setNewGuestType('');
  };

  const removeGuestType = (index) => {
    setFormData((prev) => ({
      ...prev,
      guestTypes: prev.guestTypes.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-3xl">
      <h2 className="text-md  md:text-2xl font-poppins font-normal mb-6 md:mb-8 text-neutral-900">Enter event Main data</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Event Logo */}
        <div className='border-1 rounded-2xl border-gray-200 p-5'>
          <label className="block text-xs font-normal text-neutral-700 mb-2">Event Logo</label>
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors cursor-pointer h-100 flex flex-col justify-center
              ${logoError ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".svg,.png,.jpg,.jpeg"
            />
            {formData.eventLogo ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(formData.eventLogo)}
                    alt="Event Logo Preview"
                    className="max-h-36 max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto mb-3 md:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-poppins text-neutral-500 mb-1">
                  <span className="font-medium font-poppins text-sm  text-[#202242]">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs font-poppins font-normal text-neutral-500">SVG, PNG or JPG (max. 800x400px)</p>
              </>
            )}
          </div>
          {logoError && (
            <p className="mt-2 flex items-center font-poppins text-xs text-red-600">
              <Info size={14} className="mr-1" />
              {logoError}
            </p>
                  )}
                  
                   <div className="flex flex-row p-4 mt-4 rounded-2xl bg-gray-100 items-center justify-between   ">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Require approval</label>
              <Info size={14} className="text-gray-400" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  formData.requireApproval ? 'bg-teal-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    formData.requireApproval ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-4 md:space-y-6 border-1 border-gray-200 p-6 rounded-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
            <input
              type="text"
              placeholder="Event name"
              value={formData.eventName}
              onChange={(e) => handleInputChange('eventName', e.target.value)}
              className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Enter a description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block  text-sm font-medium text-gray-700 mb-2">Date From</Label>
              <Popover open={openDateFrom} onOpenChange={setOpenDateFrom}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full px-4 py-2.5 md:py-6 border border-gray-300 rounded-lg text-sm justify-between text-black",
                      !formData.dateFrom && "text-muted-foreground"
                    )}
                  >
                    {formData.dateFrom ? formData.dateFrom.toLocaleDateString() : "Select date"}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-white shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateFrom}
                    onSelect={(date) => {
                      handleInputChange('dateFrom', date);
                      setOpenDateFrom(false);
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">To</Label>
              <Popover open={openDateTo} onOpenChange={setOpenDateTo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full px-4 py-2.5 md:py-6 border border-gray-300 rounded-lg text-sm justify-between text-black",
                      !formData.dateTo && "text-muted-foreground"
                    )}
                  >
                    {formData.dateTo ? formData.dateTo.toLocaleDateString() : "Select date"}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-white shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateTo}
                    onSelect={(date) => {
                      handleInputChange('dateTo', date);
                      setOpenDateTo(false);
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

         <div className="grid grid-cols-2 gap-4">
  <div>
    <Label className="block text-sm font-medium text-gray-700 mb-2">Time From</Label>
    <div className="relative">
      <Input
        type="time"
        value={formData.timeFrom}
        onChange={(e) => handleInputChange('timeFrom', e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 md:py-3 border border-gray-300 rounded-lg text-sm"
      />
      {/* <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
    </div>
  </div>
  <div>
    <Label className="block text-sm font-medium text-gray-700 mb-2">To</Label>
    <div className="relative">
      <Input
        type="time"
        value={formData.timeTo}
        onChange={(e) => handleInputChange('timeTo', e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 md:py-3 border border-gray-300 rounded-lg text-sm"
      />
      {/* <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
    </div>
  </div>
</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Event location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg pr-10 text-sm"
              />
              <MapPin className="absolute right-3 top-2.5 md:top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        
        {/* Guest Types */}
<div className="space-y-4 md:space-y-6 border-1 border-gray-200 p-6 rounded-2xl overflow-hidden">
  <div>
    <div className="flex items-center gap-2 mb-2">
      <label className="block text-sm font-medium text-gray-700">Add Guest Types</label>
      <Info size={14} className="text-gray-400" />
    </div>
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        value={newGuestType}
        onChange={(e) => setNewGuestType(e.target.value)}
        placeholder="e.g. Speaker, VIP"
        className="flex-1 px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg text-sm"
      />
      <button
        onClick={addGuestType}
        className="px-4 py-2.5 md:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
      >
        <Plus size={16} />
        Add
      </button>
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">Types</label>
    <div className="space-y-2 max-h-100 overflow-y-auto pr-2">
      {formData.guestTypes.map((type, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-50 px-4 py-2.5 md:py-3 rounded-lg border"
        >
          <span className="text-sm text-gray-700">{type}</span>
          <button
            onClick={() => removeGuestType(index)}
            className="text-red-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>

 
</div>
      </div>

      <div className="flex justify-between mt-6 md:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-colors border
            ${currentStep === 0 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-slate-800 border-gray-300 hover:bg-gray-50'}`}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className={`px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-colors
            ${currentStep === totalSteps - 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next →'}
        </button>
          </div>
          
          
        <div className="mt-8 md:mt-12 flex justify-end">
  <button className="text-gray-500 hover:text-gray-700 shadow-2xl shadow-black-100 text-sm flex items-center gap-1 p-6 bg-white-200 rounded-2xl">
    Can't find what you're looking for?
    <ChevronLeft className="rotate-90" size={14} />
  </button>
</div>

      {/* <div className="mt-8 md:mt-12 flex flex-row justify-around items-end p-6 ">
        <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mx-auto p-6 bg-gray-200 rounded-2xl">
          Can't find what you're looking for?
          <ChevronLeft className="rotate-90" size={14} />
        </button>
      </div> */}
    </div>
  );
};

export default MainData;