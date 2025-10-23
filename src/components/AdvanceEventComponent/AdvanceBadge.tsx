import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Check,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  QrCode,
} from "lucide-react";

interface BadgeTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  hasBackground: boolean;
  bgColor: string;
  bgImage: string | null;
  hasPersonalPhoto: boolean;
  photoSize: { width: number; height: number };
  photoAlignment: "left" | "center" | "right";
  photoPosition: { x: number; y: number };
  hasName: boolean;
  nameText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasCompany: boolean;
  companyText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasTitle: boolean;
  titleText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasQrCode: boolean;
  qrCodeSize: { width: number; height: number };
  qrCodePosition: { x: number; y: number };
}

interface AdvanceBadgeProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

const AdvanceBadge: React.FC<AdvanceBadgeProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [templates, setTemplates] = useState<BadgeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<BadgeTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BadgeTemplate | null>(
    null
  );
  const [showTemplateMenu, setShowTemplateMenu] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingTemplate, setReviewingTemplate] =
    useState<BadgeTemplate | null>(null);

  const defaultTemplate: BadgeTemplate = {
    id: "",
    name: "New Template",
    width: 3.5,
    height: 5.5,
    hasBackground: true,
    bgColor: "#1a1a1a",
    bgImage: null,
    hasPersonalPhoto: false, // Changed to false by default
    photoSize: { width: 200, height: 200 },
    photoAlignment: "center",
    photoPosition: { x: 200, y: 60 },
    hasName: true,
    nameText: {
      size: 24,
      color: "#ffffff",
      alignment: "center",
      position: { x: 200, y: 280 },
    },
    hasCompany: false, // Added default value
    companyText: {
      size: 18,
      color: "#cccccc",
      alignment: "center",
      position: { x: 200, y: 315 },
    },
    hasTitle: true,
    titleText: {
      size: 16,
      color: "#999999",
      alignment: "center",
      position: { x: 200, y: 350 },
    },
    hasQrCode: false, // Added default value
    qrCodeSize: { width: 120, height: 120 },
    qrCodePosition: { x: 200, y: 400 },
  };

  useEffect(() => {
    const saved = localStorage.getItem("badgeTemplates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTemplates(parsed);
        if (parsed.length > 0) {
          setSelectedTemplate(parsed[0]);
        }
      } catch (error) {
        console.error("Error loading templates:", error);
        setTemplates([]);
      }
    }
  }, []);

  const saveTemplates = (newTemplates: BadgeTemplate[]) => {
    try {
      localStorage.setItem("badgeTemplates", JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error("Error saving templates:", error);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate({ ...defaultTemplate, id: Date.now().toString() });
    setShowModal(true);
  };

  const handleEdit = (template: BadgeTemplate) => {
    setEditingTemplate({ ...template });
    setShowModal(true);
    setShowTemplateMenu(null);
    setIsReviewModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const newTemplates = templates.filter((t) => t.id !== id);
      saveTemplates(newTemplates);
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(newTemplates[0] || null);
      }
      setShowTemplateMenu(null);
      setIsReviewModalOpen(false);
    }
  };

  const handleSave = () => {
    if (!editingTemplate) return;

    const existingIndex = templates.findIndex(
      (t) => t.id === editingTemplate.id
    );
    let newTemplates;

    if (existingIndex >= 0) {
      newTemplates = [...templates];
      newTemplates[existingIndex] = editingTemplate;
    } else {
      newTemplates = [...templates, editingTemplate];
    }

    saveTemplates(newTemplates);
    setSelectedTemplate(editingTemplate);
    setShowModal(false);
    setEditingTemplate(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingTemplate) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingTemplate({
          ...editingTemplate,
          bgImage: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewTemplate = (template: BadgeTemplate) => {
    setReviewingTemplate(template);
    setIsReviewModalOpen(true);
  };

  const handleSelectTemplate = (template: BadgeTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateMenu(null);
  };

  const renderTemplatePreview = (template: BadgeTemplate) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
        {/* Template Header */}
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-medium text-gray-900 text-sm truncate flex-1">
            {template.name}
          </h4>
        </div>

        {/* Badge Preview Content */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="relative rounded-lg shadow-md overflow-hidden border-2 border-gray-200"
            style={{
              width: `${template.width * 40}px`,
              height: `${template.height * 40}px`,
              backgroundColor: template.hasBackground
                ? template.bgColor
                : "transparent",
              backgroundImage:
                template.hasBackground && template.bgImage
                  ? `url(${template.bgImage})`
                  : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Personal Photo */}
            {template.hasPersonalPhoto && template.photoSize && (
              <div
                className="absolute rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
                style={{
                  width: `${(template.photoSize.width || 200) * 0.2}px`,
                  height: `${(template.photoSize.height || 200) * 0.2}px`,
                  left:
                    template.photoAlignment === "left"
                      ? "10px"
                      : template.photoAlignment === "right"
                      ? "auto"
                      : "50%",
                  right: template.photoAlignment === "right" ? "10px" : "auto",
                  transform:
                    template.photoAlignment === "center"
                      ? "translateX(-50%)"
                      : "none",
                  top: `${(template.photoPosition?.y || 60) * 0.2}px`,
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
              </div>
            )}

            {/* Name Text */}
            {template.hasName && template.nameText && (
              <div
                className="absolute left-0 right-0"
                style={{
                  top: `${(template.nameText.position?.y || 280) * 0.2}px`,
                  textAlign: template.nameText.alignment || "center",
                }}
              >
                <div
                  className="font-bold px-2"
                  style={{
                    fontSize: `${(template.nameText.size || 24) * 0.2}px`,
                    color: template.nameText.color || "#ffffff",
                  }}
                >
                  Name
                </div>
              </div>
            )}

            {/* Company Text */}
            {template.hasCompany && template.companyText && (
              <div
                className="absolute left-0 right-0"
                style={{
                  top: `${(template.companyText.position?.y || 315) * 0.2}px`,
                  textAlign: template.companyText.alignment || "center",
                }}
              >
                <div
                  className="px-2"
                  style={{
                    fontSize: `${(template.companyText.size || 18) * 0.2}px`,
                    color: template.companyText.color || "#cccccc",
                  }}
                >
                  Company
                </div>
              </div>
            )}

            {/* Title Text */}
            {template.hasTitle && template.titleText && (
              <div
                className="absolute left-0 right-0"
                style={{
                  top: `${(template.titleText.position?.y || 350) * 0.2}px`,
                  textAlign: template.titleText.alignment || "center",
                }}
              >
                <div
                  className="px-2"
                  style={{
                    fontSize: `${(template.titleText.size || 16) * 0.2}px`,
                    color: template.titleText.color || "#999999",
                  }}
                >
                  Title
                </div>
              </div>
            )}

            {/* QR Code */}
            {template.hasQrCode && template.qrCodeSize && (
              <div
                className="absolute bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden"
                style={{
                  width: `${(template.qrCodeSize.width || 120) * 0.2}px`,
                  height: `${(template.qrCodeSize.height || 120) * 0.2}px`,
                  left: `${(template.qrCodePosition?.x || 200) * 0.2}px`,
                  top: `${(template.qrCodePosition?.y || 400) * 0.2}px`,
                }}
              >
                <QrCode
                  size={(template.qrCodeSize.width || 120) * 0.1}
                  className="text-gray-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Template Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              {template.width}" × {template.height}"
            </span>
            <div className="flex gap-1">
              {template.hasPersonalPhoto && (
                <span className="bg-blue-100 text-blue-600 px-1 rounded">
                  Photo
                </span>
              )}
              {template.hasQrCode && (
                <span className="bg-green-100 text-green-600 px-1 rounded">
                  QR
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFullBadgePreview = (template: BadgeTemplate) => {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div
          className="relative rounded-xl shadow-lg overflow-hidden border-4 border-white"
          style={{
            width: `${template.width * 72}px`,
            height: `${template.height * 72}px`,
            backgroundColor: template.hasBackground
              ? template.bgColor
              : "transparent",
            backgroundImage:
              template.hasBackground && template.bgImage
                ? `url(${template.bgImage})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Personal Photo */}
          {template.hasPersonalPhoto && template.photoSize && (
            <div
              className="absolute rounded-full bg-gray-300 border-4 border-white flex items-center justify-center overflow-hidden"
              style={{
                width: `${template.photoSize.width || 200}px`,
                height: `${template.photoSize.height || 200}px`,
                left:
                  template.photoAlignment === "left"
                    ? "20px"
                    : template.photoAlignment === "right"
                    ? "auto"
                    : "50%",
                right: template.photoAlignment === "right" ? "20px" : "auto",
                transform:
                  template.photoAlignment === "center"
                    ? "translateX(-50%)"
                    : "none",
                top: `${template.photoPosition?.y || 60}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                <span className="text-white text-sm">Photo</span>
              </div>
            </div>
          )}

          {/* Name Text */}
          {template.hasName && template.nameText && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${template.nameText.position?.y || 280}px`,
                textAlign: template.nameText.alignment || "center",
              }}
            >
              <div
                className="font-bold px-4"
                style={{
                  fontSize: `${template.nameText.size || 24}px`,
                  color: template.nameText.color || "#ffffff",
                }}
              >
                John Doe
              </div>
            </div>
          )}

          {/* Company Text */}
          {template.hasCompany && template.companyText && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${template.companyText.position?.y || 315}px`,
                textAlign: template.companyText.alignment || "center",
              }}
            >
              <div
                className="px-4"
                style={{
                  fontSize: `${template.companyText.size || 18}px`,
                  color: template.companyText.color || "#cccccc",
                }}
              >
                Tech Corp Inc.
              </div>
            </div>
          )}

          {/* Title Text */}
          {template.hasTitle && template.titleText && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${template.titleText.position?.y || 350}px`,
                textAlign: template.titleText.alignment || "center",
              }}
            >
              <div
                className="px-4"
                style={{
                  fontSize: `${template.titleText.size || 16}px`,
                  color: template.titleText.color || "#999999",
                }}
              >
                Software Engineer
              </div>
            </div>
          )}

          {/* QR Code */}
          {template.hasQrCode && template.qrCodeSize && (
            <div
              className="absolute bg-white border-4 border-gray-300 flex items-center justify-center overflow-hidden"
              style={{
                width: `${template.qrCodeSize.width || 120}px`,
                height: `${template.qrCodeSize.height || 120}px`,
                left: `${template.qrCodePosition?.x || 200}px`,
                top: `${template.qrCodePosition?.y || 400}px`,
              }}
            >
              <QrCode
                size={(template.qrCodeSize.width || 120) * 0.6}
                className="text-gray-400"
              />
            </div>
          )}
        </div>

        {/* Badge Specifications */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-semibold">Size</div>
            <div>
              {template.width}" × {template.height}"
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Elements</div>
            <div>
              {[
                template.hasPersonalPhoto && "Photo",
                template.hasName && "Name",
                template.hasCompany && "Company",
                template.hasTitle && "Title",
                template.hasQrCode && "QR",
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Background</div>
            <div>{template.hasBackground ? "Yes" : "No"}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderBadgePreviewInModal = (template: BadgeTemplate) => {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div
          className="relative rounded-xl shadow-lg overflow-hidden border-4 border-white mb-4"
          style={{
            width: `${template.width * 80}px`,
            height: `${template.height * 80}px`,
            backgroundColor: template.hasBackground
              ? template.bgColor
              : "transparent",
            backgroundImage:
              template.hasBackground && template.bgImage
                ? `url(${template.bgImage})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Personal Photo */}
          {template.hasPersonalPhoto && template.photoSize && (
            <div
              className="absolute rounded-full bg-gray-300 border-4 border-white flex items-center justify-center overflow-hidden"
              style={{
                width: `${template.photoSize.width || 200}px`,
                height: `${template.photoSize.height || 200}px`,
                left:
                  template.photoAlignment === "left"
                    ? "20px"
                    : template.photoAlignment === "right"
                    ? "auto"
                    : "50%",
                right: template.photoAlignment === "right" ? "20px" : "auto",
                transform:
                  template.photoAlignment === "center"
                    ? "translateX(-50%)"
                    : "none",
                top: `${template.photoPosition?.y || 60}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                <span className="text-white text-sm">Photo</span>
              </div>
            </div>
          )}

          {/* Name Text */}
          {template.hasName && template.nameText && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${template.nameText.position?.y || 280}px`,
                textAlign: template.nameText.alignment || "center",
              }}
            >
              <div
                className="font-bold px-4"
                style={{
                  fontSize: `${template.nameText.size || 24}px`,
                  color: template.nameText.color || "#ffffff",
                }}
              >
                Name Here
              </div>
            </div>
          )}

          {/* Company Text */}
          {template.hasCompany && template.companyText && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${template.companyText.position?.y || 315}px`,
                textAlign: template.companyText.alignment || "center",
              }}
            >
              <div
                className="px-4"
                style={{
                  fontSize: `${template.companyText.size || 18}px`,
                  color: template.companyText.color || "#cccccc",
                }}
              >
                Company Here
              </div>
            </div>
          )}

          {/* Title Text */}
          {template.hasTitle && template.titleText && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${template.titleText.position?.y || 350}px`,
                textAlign: template.titleText.alignment || "center",
              }}
            >
              <div
                className="px-4"
                style={{
                  fontSize: `${template.titleText.size || 16}px`,
                  color: template.titleText.color || "#999999",
                }}
              >
                Title Here
              </div>
            </div>
          )}

          {/* QR Code */}
          {template.hasQrCode && template.qrCodeSize && (
            <div
              className="absolute bg-white border-4 border-gray-300 flex items-center justify-center overflow-hidden"
              style={{
                width: `${template.qrCodeSize.width || 120}px`,
                height: `${template.qrCodeSize.height || 120}px`,
                left: `${template.qrCodePosition?.x || 200}px`,
                top: `${template.qrCodePosition?.y || 400}px`,
              }}
            >
              <QrCode
                size={(template.qrCodeSize.width || 120) * 0.6}
                className="text-gray-400"
              />
            </div>
          )}
        </div>

        {/* Badge Info */}
        <div className="text-center">
          <h4 className="font-semibold text-gray-800">{template.name}</h4>
          <p className="text-sm text-gray-600">
            {template.width}" × {template.height}" •{" "}
            {[
              template.hasPersonalPhoto && "Photo",
              template.hasName && "Name",
              template.hasCompany && "Company",
              template.hasTitle && "Title",
              template.hasQrCode && "QR",
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>
      </div>
    );
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between mb-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
      </label>
    </div>
  );

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Advance Badge</h2>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === currentStep
                    ? "border-pink-500 bg-white text-pink-500"
                    : step < currentStep
                    ? "bg-pink-500 border-pink-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{step + 1}</span>
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    step < currentStep ? "bg-pink-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Template Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Create New Template Card */}
        <div
          onClick={handleCreateNew}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
        >
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-pink-500" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center text-pink-500">
            Create New Template
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Design a custom badge template from scratch
          </p>
        </div>

        {/* Existing Templates */}
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border-2 rounded-2xl p-4 transition-all duration-200 hover:shadow-md aspect-square flex flex-col relative cursor-pointer ${
              selectedTemplate?.id === template.id
                ? "border-pink-500 bg-pink-50 shadow-md"
                : "border-gray-200 hover:border-pink-300"
            }`}
            onClick={() => handleReviewTemplate(template)}
          >
            {/* Template Content */}
            <div className="flex-1">{renderTemplatePreview(template)}</div>
          </div>
        ))}
      </div>

      {/* Create/Edit Template Modal with Preview */}
      {showModal && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {templates.find((t) => t.id === editingTemplate.id)
                    ? "Edit Template"
                    : "Create Template"}
                </h3>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Template name"
                />
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTemplate(null);
                }}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Split Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Side - Form Controls */}
              <div className="flex-1 overflow-auto p-6">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Badge Configuration
                </h4>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (inches)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingTemplate.width}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            width: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (inches)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingTemplate.height}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            height: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  {/* Badge Background Toggle - Default open */}
                  <ToggleSwitch
                    checked={editingTemplate.hasBackground}
                    onChange={(checked) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        hasBackground: checked,
                      })
                    }
                    label="Badge Background"
                  />

                  {editingTemplate.hasBackground && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={editingTemplate.bgColor}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                bgColor: e.target.value,
                              })
                            }
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingTemplate.bgColor}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                bgColor: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Image
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer inline-flex items-center gap-2">
                            <Upload size={16} />
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          {editingTemplate.bgImage && (
                            <button
                              onClick={() =>
                                setEditingTemplate({
                                  ...editingTemplate,
                                  bgImage: null,
                                })
                              }
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {!editingTemplate.bgImage && (
                          <p className="text-xs text-gray-500 mt-2">
                            No background image uploaded. Badge will use
                            background color only.
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Personal Photo Toggle - Default closed */}
                  <ToggleSwitch
                    checked={editingTemplate.hasPersonalPhoto}
                    onChange={(checked) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        hasPersonalPhoto: checked,
                      })
                    }
                    label="Personal Photo"
                  />

                  {editingTemplate.hasPersonalPhoto && (
                    <div className="space-y-4 ml-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Width (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.photoSize?.width || 200}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                photoSize: {
                                  ...(editingTemplate.photoSize || {
                                    width: 200,
                                    height: 200,
                                  }),
                                  width: parseInt(e.target.value) || 200,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Height (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.photoSize?.height || 200}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                photoSize: {
                                  ...(editingTemplate.photoSize || {
                                    width: 200,
                                    height: 200,
                                  }),
                                  height: parseInt(e.target.value) || 200,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Alignment
                        </label>
                        <div className="flex gap-2">
                          {(["left", "center", "right"] as const).map(
                            (align) => (
                              <button
                                key={align}
                                onClick={() =>
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    photoAlignment: align,
                                  })
                                }
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                  editingTemplate.photoAlignment === align
                                    ? "border-pink-500 bg-pink-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                {align === "left" && (
                                  <AlignLeft size={16} className="mx-auto" />
                                )}
                                {align === "center" && (
                                  <AlignCenter size={16} className="mx-auto" />
                                )}
                                {align === "right" && (
                                  <AlignRight size={16} className="mx-auto" />
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Y Position (px)
                        </label>
                        <input
                          type="number"
                          value={editingTemplate.photoPosition?.y || 60}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              photoPosition: {
                                ...(editingTemplate.photoPosition || {
                                  x: 200,
                                  y: 60,
                                }),
                                y: parseInt(e.target.value) || 60,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Name Text Toggle */}
                  <ToggleSwitch
                    checked={editingTemplate.hasName}
                    onChange={(checked) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        hasName: checked,
                      })
                    }
                    label="Name Text"
                  />

                  {editingTemplate.hasName && (
                    <div className="space-y-3 ml-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Size (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.nameText?.size || 24}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                nameText: {
                                  ...(editingTemplate.nameText || {
                                    size: 24,
                                    color: "#ffffff",
                                    alignment: "center",
                                    position: { x: 200, y: 280 },
                                  }),
                                  size: parseInt(e.target.value) || 24,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Color
                          </label>
                          <input
                            type="color"
                            value={editingTemplate.nameText?.color || "#ffffff"}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                nameText: {
                                  ...(editingTemplate.nameText || {
                                    size: 24,
                                    color: "#ffffff",
                                    alignment: "center",
                                    position: { x: 200, y: 280 },
                                  }),
                                  color: e.target.value,
                                },
                              })
                            }
                            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Alignment
                        </label>
                        <div className="flex gap-2">
                          {(["left", "center", "right"] as const).map(
                            (align) => (
                              <button
                                key={align}
                                onClick={() =>
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    nameText: {
                                      ...(editingTemplate.nameText || {
                                        size: 24,
                                        color: "#ffffff",
                                        alignment: "center",
                                        position: { x: 200, y: 280 },
                                      }),
                                      alignment: align,
                                    },
                                  })
                                }
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                  editingTemplate.nameText?.alignment === align
                                    ? "border-pink-500 bg-pink-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                {align === "left" && (
                                  <AlignLeft size={16} className="mx-auto" />
                                )}
                                {align === "center" && (
                                  <AlignCenter size={16} className="mx-auto" />
                                )}
                                {align === "right" && (
                                  <AlignRight size={16} className="mx-auto" />
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Y Position (px)
                        </label>
                        <input
                          type="number"
                          value={editingTemplate.nameText?.position?.y || 280}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              nameText: {
                                ...(editingTemplate.nameText || {
                                  size: 24,
                                  color: "#ffffff",
                                  alignment: "center",
                                  position: { x: 200, y: 280 },
                                }),
                                position: {
                                  ...(editingTemplate.nameText?.position || {
                                    x: 200,
                                    y: 280,
                                  }),
                                  y: parseInt(e.target.value) || 280,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Company Text Toggle */}
                  <ToggleSwitch
                    checked={editingTemplate.hasCompany}
                    onChange={(checked) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        hasCompany: checked,
                      })
                    }
                    label="Company Text"
                  />

                  {editingTemplate.hasCompany && (
                    <div className="space-y-3 ml-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Size (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.companyText?.size || 18}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                companyText: {
                                  ...(editingTemplate.companyText || {
                                    size: 18,
                                    color: "#cccccc",
                                    alignment: "center",
                                    position: { x: 200, y: 315 },
                                  }),
                                  size: parseInt(e.target.value) || 18,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Color
                          </label>
                          <input
                            type="color"
                            value={
                              editingTemplate.companyText?.color || "#cccccc"
                            }
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                companyText: {
                                  ...(editingTemplate.companyText || {
                                    size: 18,
                                    color: "#cccccc",
                                    alignment: "center",
                                    position: { x: 200, y: 315 },
                                  }),
                                  color: e.target.value,
                                },
                              })
                            }
                            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Alignment
                        </label>
                        <div className="flex gap-2">
                          {(["left", "center", "right"] as const).map(
                            (align) => (
                              <button
                                key={align}
                                onClick={() =>
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    companyText: {
                                      ...(editingTemplate.companyText || {
                                        size: 18,
                                        color: "#cccccc",
                                        alignment: "center",
                                        position: { x: 200, y: 315 },
                                      }),
                                      alignment: align,
                                    },
                                  })
                                }
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                  editingTemplate.companyText?.alignment ===
                                  align
                                    ? "border-pink-500 bg-pink-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                {align === "left" && (
                                  <AlignLeft size={16} className="mx-auto" />
                                )}
                                {align === "center" && (
                                  <AlignCenter size={16} className="mx-auto" />
                                )}
                                {align === "right" && (
                                  <AlignRight size={16} className="mx-auto" />
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Y Position (px)
                        </label>
                        <input
                          type="number"
                          value={
                            editingTemplate.companyText?.position?.y || 315
                          }
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              companyText: {
                                ...(editingTemplate.companyText || {
                                  size: 18,
                                  color: "#cccccc",
                                  alignment: "center",
                                  position: { x: 200, y: 315 },
                                }),
                                position: {
                                  ...(editingTemplate.companyText?.position || {
                                    x: 200,
                                    y: 315,
                                  }),
                                  y: parseInt(e.target.value) || 315,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Title Text Toggle */}
                  <ToggleSwitch
                    checked={editingTemplate.hasTitle}
                    onChange={(checked) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        hasTitle: checked,
                      })
                    }
                    label="Title Text"
                  />

                  {editingTemplate.hasTitle && (
                    <div className="space-y-3 ml-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Size (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.titleText?.size || 16}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                titleText: {
                                  ...(editingTemplate.titleText || {
                                    size: 16,
                                    color: "#999999",
                                    alignment: "center",
                                    position: { x: 200, y: 350 },
                                  }),
                                  size: parseInt(e.target.value) || 16,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Color
                          </label>
                          <input
                            type="color"
                            value={
                              editingTemplate.titleText?.color || "#999999"
                            }
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                titleText: {
                                  ...(editingTemplate.titleText || {
                                    size: 16,
                                    color: "#999999",
                                    alignment: "center",
                                    position: { x: 200, y: 350 },
                                  }),
                                  color: e.target.value,
                                },
                              })
                            }
                            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Alignment
                        </label>
                        <div className="flex gap-2">
                          {(["left", "center", "right"] as const).map(
                            (align) => (
                              <button
                                key={align}
                                onClick={() =>
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    titleText: {
                                      ...(editingTemplate.titleText || {
                                        size: 16,
                                        color: "#999999",
                                        alignment: "center",
                                        position: { x: 200, y: 350 },
                                      }),
                                      alignment: align,
                                    },
                                  })
                                }
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                  editingTemplate.titleText?.alignment === align
                                    ? "border-pink-500 bg-pink-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                {align === "left" && (
                                  <AlignLeft size={16} className="mx-auto" />
                                )}
                                {align === "center" && (
                                  <AlignCenter size={16} className="mx-auto" />
                                )}
                                {align === "right" && (
                                  <AlignRight size={16} className="mx-auto" />
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Y Position (px)
                        </label>
                        <input
                          type="number"
                          value={editingTemplate.titleText?.position?.y || 350}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              titleText: {
                                ...(editingTemplate.titleText || {
                                  size: 16,
                                  color: "#999999",
                                  alignment: "center",
                                  position: { x: 200, y: 350 },
                                }),
                                position: {
                                  ...(editingTemplate.titleText?.position || {
                                    x: 200,
                                    y: 350,
                                  }),
                                  y: parseInt(e.target.value) || 350,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* QR Code Toggle */}
                  <ToggleSwitch
                    checked={editingTemplate.hasQrCode}
                    onChange={(checked) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        hasQrCode: checked,
                      })
                    }
                    label="QR Code"
                  />

                  {editingTemplate.hasQrCode && (
                    <div className="space-y-4 ml-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Width (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.qrCodeSize?.width || 120}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                qrCodeSize: {
                                  ...(editingTemplate.qrCodeSize || {
                                    width: 120,
                                    height: 120,
                                  }),
                                  width: parseInt(e.target.value) || 120,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Height (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.qrCodeSize?.height || 120}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                qrCodeSize: {
                                  ...(editingTemplate.qrCodeSize || {
                                    width: 120,
                                    height: 120,
                                  }),
                                  height: parseInt(e.target.value) || 120,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            X Position (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.qrCodePosition?.x || 200}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                qrCodePosition: {
                                  ...(editingTemplate.qrCodePosition || {
                                    x: 200,
                                    y: 400,
                                  }),
                                  x: parseInt(e.target.value) || 200,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Y Position (px)
                          </label>
                          <input
                            type="number"
                            value={editingTemplate.qrCodePosition?.y || 400}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                qrCodePosition: {
                                  ...(editingTemplate.qrCodePosition || {
                                    x: 200,
                                    y: 400,
                                  }),
                                  y: parseInt(e.target.value) || 400,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Badge Preview */}
              <div className="w-96 border-l border-gray-200 p-6 overflow-auto bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-4 text-center">
                  Badge Preview
                </h4>
                {renderBadgePreviewInModal(editingTemplate)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-100">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTemplate(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Template Modal */}
      {isReviewModalOpen && reviewingTemplate && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[80vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Review Template: {reviewingTemplate.name}
                </h3>
                <span className="text-sm text-gray-500">
                  {reviewingTemplate.width}" × {reviewingTemplate.height}" •{" "}
                  {[
                    reviewingTemplate.hasPersonalPhoto && "Photo",
                    reviewingTemplate.hasName && "Name",
                    reviewingTemplate.hasCompany && "Company",
                    reviewingTemplate.hasTitle && "Title",
                    reviewingTemplate.hasQrCode && "QR",
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-2xl mx-auto">
                {renderFullBadgePreview(reviewingTemplate)}
              </div>
            </div>

            {/* Modal Footer with Edit/Delete Actions */}
            <div className="p-4 border-t flex justify-between items-center bg-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(reviewingTemplate.id)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(reviewingTemplate)}
                  className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
              <button
                onClick={() => {
                  handleSelectTemplate(reviewingTemplate);
                  setIsReviewModalOpen(false);
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Choose Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={() => onPrevious && onPrevious()}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </span>

        <button
          onClick={() => onNext()}
          className="cursor-pointer px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-800 transition-colors font-medium"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default AdvanceBadge;
