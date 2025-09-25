import React, { useState } from "react";
import { ChevronLeft, X, Eye } from "lucide-react";
import ConfirmationDetails from "./ConfirmationDetails/ConfirmationDetails";
import Assets from "@/utils/Assets"; // 👈 make sure your template preview images are here
import { postRegistrationTemplateApi } from "@/apis/apiHelpers";
import { toast } from "react-toastify";

// 👇 Match the ToggleStates interface from ConfirmationDetails
interface ToggleStates {
  confirmationMsg: boolean;
  userQRCode: boolean;
  location: boolean;
  eventDetails: boolean;
}

type TemplateId = 1 | 2;

interface Template {
  id: TemplateId;
  name: string;
  img: string;
}

interface ModalProps {
  template: Template | null;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ template, onClose }) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto w-full md:w-3/4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-poppins font-semibold">
            {template.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1"
          >
            <X />
          </button>
        </div>

        {/* Template preview */}
        <div className="flex flex-col sm:flex-row gap-4">
          <img
            src={template.img}
            alt={`${template.name} Front`}
            className="flex-1  w-full object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

interface RegistrationFormProps {
  onNext?: () => void; // Go to Badges
  onPrevious?: () => void; // Go back to Main Data
  toggleStates: ToggleStates;
  setToggleStates: (states: ToggleStates) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onNext,
  onPrevious,
  toggleStates,
  setToggleStates,
}) => {
  const [internalStep, setInternalStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const templates: Template[] = [
    { id: 1, name: "Temp 1", img: Assets.images.temp1 },
    { id: 2, name: "Temp 2", img: Assets.images.temp2 },
  ];

  /** Step navigation */
  const handleStepNext = () => {
    if (internalStep === 0) {
      if (!selectedTemplate) {
        alert("Please select a template before proceeding");
        return;
      }
      setInternalStep(1);
    }
  };

  const handleStepPrevious = () => {
    if (internalStep === 1) setInternalStep(0);
  };

  const postRegistrationTemplate = async () => {
    const savedEventId = localStorage.getItem("create_eventId");
    const data = {
      registration_template: {
        name: selectedTemplate?.name,
        default: false,
        content: "html content here",
      },
    };
    try {
      const response = await postRegistrationTemplateApi(data, savedEventId);

      console.log("Registration Template API Response:", response.data);
      toast.success("Registration template created successfully!");
      return response;
    } catch (error) {
      console.error("Failed to create registration template:", error);
      toast.error("Failed to create registration template.");
    }
  };



// const createRegistrationField = async () => {
//   const savedEventId = localStorage.getItem("create_eventId");
//   if (!savedEventId) { toast.error("Event ID not found."); return; }

//   const payload = {
//     event_registration_field: {
//       field: "custom_field_1",
//       name: "Custom Field 1",
//       order: 1,
//       active: true,
//       custom: true,
//       required: false,
//       full_width: true,
//       validation_type: "none",
//       max_companion: null,
//       field_options: [],
//     },
//   };

//   const res = await postEventRegistrationFieldApi(payload, savedEventId);
//   toast.success("Registration field created.");
//   return res;
// };

  return (
    <div className="w-full mx-5 bg-white p-5 rounded-2xl">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div onClick={onPrevious} className="flex flex-row gap-2 items-center">
          <ChevronLeft />
          <p className="text-neutral-900 text-md font-poppins font-normal">
            Choose a registration form template
          </p>
        </div>
      </div>

      {/* Step Content */}
      {internalStep === 0 ? (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {templates.map((temp) => (
            <div
              key={temp.id}
              className={`relative group border-2 rounded-3xl p-4 transition-colors cursor-pointer ${
                selectedTemplate?.id === temp.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-[#2E3166E5]"
              }`}
              onClick={() =>
                setSelectedTemplate(
                  selectedTemplate?.id === temp.id ? null : temp
                )
              }
            >
              <img
                src={temp.img}
                alt={temp.name}
                className="w-full h-50 object-cover object-top rounded-xl"
              />

              {/* Preview Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(temp);
                  }}
                  className="flex items-center gap-2 bg-[#2E3166E5] text-white px-4 py-2 rounded-full text-sm hover:opacity-90 transition-colors"
                >
                  <Eye size={16} />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <ConfirmationDetails
            onToggleStatesChange={setToggleStates}
            toggleStates={toggleStates}
          />

          {/* Debug Info */}
          <div className="text-xs py-2 flex flex-wrap gap-2 items-center">
            <h6>Temp: {selectedTemplate?.id}</h6>
            <h6>
              Msg:{" "}
              <span
                className={
                  toggleStates.confirmationMsg
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {toggleStates.confirmationMsg ? "ON" : "OFF"}
              </span>
            </h6>
            <h6>
              Qr:{" "}
              <span
                className={
                  toggleStates.userQRCode ? "text-green-600" : "text-red-600"
                }
              >
                {toggleStates.userQRCode ? "ON" : "OFF"}
              </span>
            </h6>
            <h6>
              Location:{" "}
              <span
                className={
                  toggleStates.location ? "text-green-600" : "text-red-600"
                }
              >
                {toggleStates.location ? "ON" : "OFF"}
              </span>
            </h6>
            <h6>
              Details:{" "}
              <span
                className={
                  toggleStates.eventDetails ? "text-green-600" : "text-red-600"
                }
              >
                {toggleStates.eventDetails ? "ON" : "OFF"}
              </span>
            </h6>
          </div>
        </div>
      )}

      {/* Modal */}
      {previewTemplate && (
        <Modal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* Step Navigation */}
      {internalStep === 0 && (
        <div className="flex justify-end gap-4 mt-6 sm:mt-8">
          <button
            onClick={handleStepNext}
            disabled={!selectedTemplate}
            className={`w-full sm:w-auto p-2 text-sm rounded-lg text-white ${
              !selectedTemplate
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900"
            }`}
          >
            Step 2 →
          </button>
        </div>
      )}

      {internalStep === 1 && (
        <div className="flex justify-start gap-4 mt-6 sm:mt-8">
          <button
            onClick={handleStepPrevious}
            className="w-full sm:w-auto p-2 text-sm rounded-lg border text-slate-800 border-gray-300 hover:bg-gray-50"
          >
            ← Step 1
          </button>
        </div>
      )}

      {/* Stage Navigation */}
      <div className="flex justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg border text-slate-800 border-gray-300 hover:bg-gray-50"
        >
          ← Main Data
        </button>

        <button
          onClick={onNext}
          disabled={internalStep < 1}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white ${
            internalStep < 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-900"
          }`}
        >
          Badges →
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
