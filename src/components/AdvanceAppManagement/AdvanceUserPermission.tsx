import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Check,
} from "lucide-react";
import { updateAppHideSectionsApi, getEventbyId } from "@/apis/apiHelpers";

// ADD PROPS INTERFACE
interface AdvanceAppVisulizationProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  onStepChange?: (step: number) => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

// UPDATE COMPONENT TO ACCEPT PROPS
export default function AdvanceUserPermission({ 
  onNext, 
  onPrevious, 
  onStepChange, 
  eventId, 
  currentStep, 
  totalSteps 
}: AdvanceAppVisulizationProps) {
  const STEP_NAMES = ["App Visualization", "App Sections", "Admin Management"];

  // App Sections Visibility state
  const [appSections, setAppSections] = useState({
    networking: true,
    speakers: true,
    exhibitors: true,
    gallery: true,
    messaging: true,
    agenda: true,
    floor_plan: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // App sections configuration
  const appSectionsConfig = [
    { key: "networking", label: "Networking" },
    { key: "speakers", label: "Speakers" },
    { key: "exhibitors", label: "Exhibitors" },
    { key: "gallery", label: "Gallery" },
    { key: "messaging", label: "Messaging" },
    { key: "agenda", label: "Agenda" },
    { key: "floor_plan", label: "Floor_plan" },
  ];

  // Load existing hide_app_sections from event data
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        const response = await getEventbyId(eventId);
        const eventData = response.data?.data;
        const hideAppSections = eventData?.attributes?.hide_app_sections || [];
        
        console.log("📥 Loading event data:", {
          eventId,
          hideAppSections,
          hideAppSectionsLength: hideAppSections.length
        });
        
        // Initialize all sections as visible (true)
        const newSections = {
          networking: true,
          speakers: true,
          exhibitors: true,
          gallery: true,
          messaging: true,
          agenda: true,
          floor_plan: true,
        };
        
        // Set sections to false (hidden) if they're in hide_app_sections
        hideAppSections.forEach((section: string) => {
          const sectionKey = section.toLowerCase();
          if (sectionKey in newSections) {
            newSections[sectionKey as keyof typeof newSections] = false;
            console.log(`  ✓ Section "${section}" (${sectionKey}) is hidden`);
          } else {
            console.log(`  ⚠ Section "${section}" (${sectionKey}) not found in component, ignoring`);
          }
        });
        
        console.log("📊 Final sections state:", newSections);
        setAppSections(newSections);
      } catch (error) {
        console.error("❌ Error fetching event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Save app sections visibility to API
  const saveAppSections = async (sectionsToSave: typeof appSections) => {
    if (!eventId) return;
    
    setIsSaving(true);
    try {
      // Get all sections that are hidden (unchecked = false)
      const hideAppSections = Object.entries(sectionsToSave)
        .filter(([_, isVisible]) => !isVisible)
        .map(([key, _]) => key);
      
      console.log("💾 Saving app sections visibility:", {
        eventId,
        hideAppSections,
        hideAppSectionsLength: hideAppSections.length,
        allSections: sectionsToSave
      });
      
      await updateAppHideSectionsApi(eventId, hideAppSections);
      console.log("✅ App sections visibility updated successfully");
      console.log("📤 API payload sent:", { hide_app_sections: hideAppSections });
    } catch (error) {
      console.error("❌ Error updating app sections visibility:", error);
      throw error; // Re-throw to let handleAppSectionToggle handle the revert
    } finally {
      setIsSaving(false);
    }
  };

  // Handle app section toggle - save immediately
  const handleAppSectionToggle = async (sectionKey: string) => {
    // Store previous state for potential rollback
    const previousSections = { ...appSections };
    
    const updatedSections = {
      ...appSections,
      [sectionKey]: !appSections[sectionKey as keyof typeof appSections],
    };
    
    // Update UI immediately (optimistic update)
    setAppSections(updatedSections);
    
    // Save to API immediately
    try {
      await saveAppSections(updatedSections);
    } catch (error) {
      // Revert to previous state on error
      console.error("❌ Failed to save, reverting state");
      setAppSections(previousSections);
    }
  };

  // Handle Next button click - just proceed (already saved on toggle)
  const handleNext = () => {
    onNext(eventId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Step Indicator */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft 
              className="text-gray-500 cursor-pointer" 
              size={20} 
              onClick={onPrevious}
            />
            <h1 className="text-2xl font-semibold text-gray-800">Advanced Event</h1>
          </div>

          {/* Step Indicator - USE DYNAMIC STEPS */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }, (_, index) => index).map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onStepChange?.(step)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer transition-colors ${
                      step === currentStep
                        ? "border-pink-500 bg-white text-pink-500"
                        : step < currentStep
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "border-gray-300 bg-white text-gray-400 hover:border-gray-400"
                    } ${onStepChange ? "hover:opacity-90" : ""}`}
                  >
                    {step < currentStep ? (
                      <Check size={16} />
                    ) : (
                      <span className="text-sm font-medium">
                        {String(step + 1).padStart(2, "0")}
                      </span>
                    )}
                  </button>
                  <span
                    className={`text-xs mt-1 font-medium text-center whitespace-nowrap ${
                      step === currentStep
                        ? "text-pink-500"
                        : step < currentStep
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {STEP_NAMES[step] ?? `Step ${step + 1}`}
                  </span>
                </div>
                {step < totalSteps - 1 && (
                  <div
                    className={`w-12 h-0.5 self-start mt-4 flex-shrink-0 ${
                      step < currentStep ? "bg-pink-500" : "bg-gray-300"
                    }`}
                    aria-hidden
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>›</span>
          <span className="text-gray-700">Advanced Event</span>
        </div>
      </div>

      {/* Tabs */}
      {/* <div className="bg-white border-b">
        <div className="px-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative group ${
                activeTab === tab.id
                  ? "text-red-500"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {tab.removable && (
                <X className="inline-block ml-2 w-3.5 h-3.5 text-red-400" />
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
          ))}
        </div>
      </div> */}

      {/* Main Content */}
      <div className="py-6">
        <div className="">
          {/* App Sections Visibility */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                App Sections Visibility
              </h2>
              
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading sections...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {appSectionsConfig.map((section) => (
                      <div
                        key={section.key}
                        className="flex items-center justify-between py-2"
                      >
                        <label className="text-sm text-gray-700 cursor-pointer">
                          {section.label}
                        </label>
                        <button
                          onClick={() => handleAppSectionToggle(section.key)}
                          disabled={isSaving || isLoading}
                          className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            appSections[section.key as keyof typeof appSections]
                              ? "bg-indigo-900"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                              appSections[section.key as keyof typeof appSections]
                                ? "right-0.5"
                                : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Unchecked sections will be hidden in the app
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button 
              onClick={onPrevious}
              disabled={isSaving || isLoading}
              className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>←</span>
              Previous
            </button>
            <button 
              onClick={handleNext}
              disabled={isSaving || isLoading}
              className="bg-indigo-950 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-900 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Next"}
              {!isSaving && <span>→</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}