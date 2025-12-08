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
import Assets from "@/utils/Assets";
import { toast, ToastContainer } from "react-toastify";
import { getEventbyId, postBadgesApi } from "@/apis/apiHelpers";
import type { ToggleStates } from "../ExpressEvent";

// -------------------- TYPES --------------------
interface BadgeTemplate {
  id: string;
  name: string;
  type: "existing" | "custom";
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

interface Badge {
  id: number;
  name: string;
  frontImg: string;
  backImg: string;
  userImg?: string;
  squareUserImg?: string;
  qrImg: string;
  cardHeader: string;
  cardFooter: string;
}

interface BadgesProps {
  toggleStates: ToggleStates;
  onNext: (eventId?: string | number, plan?: string) => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps?: number;
  eventId?: string;
  plan?: string;
}

// -------------------- CUSTOM BADGE BUILDER MODAL --------------------
interface CustomBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: BadgeTemplate) => void;
  template?: BadgeTemplate | null;
  isEditMode?: boolean;
}

const CustomBadgeModal: React.FC<CustomBadgeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
  isEditMode = false,
}) => {
  const [editingTemplate, setEditingTemplate] = useState<BadgeTemplate | null>(null);

  const defaultTemplate: BadgeTemplate = {
    id: "",
    name: "New Custom Badge",
    type: "custom",
    width: 3.5,
    height: 5.5,
    hasBackground: true,
    bgColor: "#1a1a1a",
    bgImage: null,
    hasPersonalPhoto: false,
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
    hasCompany: false,
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
    hasQrCode: false,
    qrCodeSize: { width: 120, height: 120 },
    qrCodePosition: { x: 200, y: 400 },
  };

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setEditingTemplate({ ...template });
    } else {
      setEditingTemplate({ ...defaultTemplate, id: `custom-badge-${Date.now()}` });
    }
  }, [template]);

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (editingTemplate.name.trim() === "") {
      toast.warning("Please enter a template name");
      return;
    }

    onSave(editingTemplate);
    onClose();
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

  const renderCustomBadgePreview = (template: BadgeTemplate) => {
    const previewWidth = template.width * 40;
    
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div
          className="relative rounded-lg shadow-md overflow-hidden border-2 border-gray-200"
          style={{
            width: `${previewWidth}px`,
            height: `${template.height * 40}px`,
            backgroundColor: template.hasBackground ? template.bgColor : "transparent",
            backgroundImage:
              template.hasBackground && template.bgImage
                ? `url(${template.bgImage})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {template.hasPersonalPhoto && template.photoSize && (
            <div
              className="absolute rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
              style={{
                width: `${(template.photoSize.width || 200) * 0.2}px`,
                height: `${(template.photoSize.height || 200) * 0.2}px`,
                left:
                  template.photoAlignment === "left"
                    ? `${(template.photoPosition?.x || 200) * 0.2}px`
                    : template.photoAlignment === "right"
                    ? `auto`
                    : "50%",
                right: template.photoAlignment === "right" ? `${(template.photoPosition?.x || 200) * 0.2}px` : "auto",
                transform:
                  template.photoAlignment === "center" ? "translateX(-50%)" : "none",
                top: `${(template.photoPosition?.y || 60) * 0.2}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            </div>
          )}

          {template.hasName && template.nameText && (
            <div
              className="absolute"
              style={{
                top: `${(template.nameText.position?.y || 280) * 0.2}px`,
                left: template.nameText.alignment === "left" ? 
                  `${(template.nameText.position?.x || 200) * 0.2}px` : 
                  template.nameText.alignment === "right" ? 
                  "auto" : 
                  "50%",
                right: template.nameText.alignment === "right" ? 
                  `${(template.nameText.position?.x || 200) * 0.2}px` : 
                  "auto",
                transform: template.nameText.alignment === "center" ? 
                  `translateX(-${(template.nameText.position?.x || 200) * 0.2}px)` : 
                  "none",
                textAlign: template.nameText.alignment || "center",
              }}
            >
              <div
                className="font-bold px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.nameText.size || 24) * 0.2}px`,
                  color: template.nameText.color || "#ffffff",
                }}
              >
                Name
              </div>
            </div>
          )}

          {template.hasCompany && template.companyText && (
            <div
              className="absolute"
              style={{
                top: `${(template.companyText.position?.y || 315) * 0.2}px`,
                left: template.companyText.alignment === "left" ? 
                  `${(template.companyText.position?.x || 200) * 0.2}px` : 
                  template.companyText.alignment === "right" ? 
                  "auto" : 
                  "50%",
                right: template.companyText.alignment === "right" ? 
                  `${(template.companyText.position?.x || 200) * 0.2}px` : 
                  "auto",
                transform: template.companyText.alignment === "center" ? 
                  `translateX(-${(template.companyText.position?.x || 200) * 0.2}px)` : 
                  "none",
                textAlign: template.companyText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.companyText.size || 18) * 0.2}px`,
                  color: template.companyText.color || "#cccccc",
                }}
              >
                Company
              </div>
            </div>
          )}

          {template.hasTitle && template.titleText && (
            <div
              className="absolute"
              style={{
                top: `${(template.titleText.position?.y || 350) * 0.2}px`,
                left: template.titleText.alignment === "left" ? 
                  `${(template.titleText.position?.x || 200) * 0.2}px` : 
                  template.titleText.alignment === "right" ? 
                  "auto" : 
                  "50%",
                right: template.titleText.alignment === "right" ? 
                  `${(template.titleText.position?.x || 200) * 0.2}px` : 
                  "auto",
                transform: template.titleText.alignment === "center" ? 
                  `translateX(-${(template.titleText.position?.x || 200) * 0.2}px)` : 
                  "none",
                textAlign: template.titleText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.titleText.size || 16) * 0.2}px`,
                  color: template.titleText.color || "#999999",
                }}
              >
                Title
              </div>
            </div>
          )}

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
    );
  };

  const ToggleSwitch = ({ checked, onChange, label }: { 
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

  // Position input component
  const PositionInput = ({ 
    label, 
    value, 
    onChange,
    type = "y"
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    type?: "x" | "y";
  }) => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {type === "x" ? "X Position (px)" : "Y Position (px)"}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
    </div>
  );

  // Alignment buttons component
  const AlignmentButtons = ({ 
    value, 
    onChange 
  }: { 
    value: "left" | "center" | "right"; 
    onChange: (value: "left" | "center" | "right") => void;
  }) => (
    <div>
      <label className="block text-sm text-gray-600 mb-2">
        Alignment
      </label>
      <div className="flex gap-2">
        {["left", "center", "right"].map((align) => (
          <button
            key={align}
            type="button"
            onClick={() => onChange(align as "left" | "center" | "right")}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
              value === align
                ? "border-pink-500 bg-pink-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {align === "left" && <AlignLeft size={16} className="mx-auto" />}
            {align === "center" && <AlignCenter size={16} className="mx-auto" />}
            {align === "right" && <AlignRight size={16} className="mx-auto" />}
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen || !editingTemplate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditMode ? "Edit Custom Badge" : "Create Custom Badge Template"}
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
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
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
                        width: parseFloat(e.target.value) || 3.5,
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
                        height: parseFloat(e.target.value) || 5.5,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

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
                  </div>
                </>
              )}

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
                              ...editingTemplate.photoSize,
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
                              ...editingTemplate.photoSize,
                              height: parseInt(e.target.value) || 200,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <AlignmentButtons
                    value={editingTemplate.photoAlignment}
                    onChange={(alignment) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        photoAlignment: alignment,
                      })
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <PositionInput
                      label="X Position"
                      type="x"
                      value={editingTemplate.photoPosition?.x || 200}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          photoPosition: {
                            ...editingTemplate.photoPosition,
                            x: value,
                          },
                        })
                      }
                    />
                    <PositionInput
                      label="Y Position"
                      value={editingTemplate.photoPosition?.y || 60}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          photoPosition: {
                            ...editingTemplate.photoPosition,
                            y: value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

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
                <div className="space-y-4 ml-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Size (px)</label>
                      <input
                        type="number"
                        value={editingTemplate.nameText?.size || 24}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            nameText: {
                              ...editingTemplate.nameText,
                              size: parseInt(e.target.value) || 24,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={editingTemplate.nameText?.color || "#ffffff"}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            nameText: {
                              ...editingTemplate.nameText,
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  <AlignmentButtons
                    value={editingTemplate.nameText?.alignment || "center"}
                    onChange={(alignment) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        nameText: {
                          ...editingTemplate.nameText,
                          alignment: alignment,
                        },
                      })
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <PositionInput
                      label="X Position"
                      type="x"
                      value={editingTemplate.nameText?.position?.x || 200}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          nameText: {
                            ...editingTemplate.nameText,
                            position: {
                              ...editingTemplate.nameText?.position,
                              x: value,
                            },
                          },
                        })
                      }
                    />
                    <PositionInput
                      label="Y Position"
                      value={editingTemplate.nameText?.position?.y || 280}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          nameText: {
                            ...editingTemplate.nameText,
                            position: {
                              ...editingTemplate.nameText?.position,
                              y: value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

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
                <div className="space-y-4 ml-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Size (px)</label>
                      <input
                        type="number"
                        value={editingTemplate.companyText?.size || 18}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            companyText: {
                              ...editingTemplate.companyText,
                              size: parseInt(e.target.value) || 18,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={editingTemplate.companyText?.color || "#cccccc"}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            companyText: {
                              ...editingTemplate.companyText,
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  <AlignmentButtons
                    value={editingTemplate.companyText?.alignment || "center"}
                    onChange={(alignment) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        companyText: {
                          ...editingTemplate.companyText,
                          alignment: alignment,
                        },
                      })
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <PositionInput
                      label="X Position"
                      type="x"
                      value={editingTemplate.companyText?.position?.x || 200}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          companyText: {
                            ...editingTemplate.companyText,
                            position: {
                              ...editingTemplate.companyText?.position,
                              x: value,
                            },
                          },
                        })
                      }
                    />
                    <PositionInput
                      label="Y Position"
                      value={editingTemplate.companyText?.position?.y || 315}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          companyText: {
                            ...editingTemplate.companyText,
                            position: {
                              ...editingTemplate.companyText?.position,
                              y: value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

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
                <div className="space-y-4 ml-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Size (px)</label>
                      <input
                        type="number"
                        value={editingTemplate.titleText?.size || 16}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            titleText: {
                              ...editingTemplate.titleText,
                              size: parseInt(e.target.value) || 16,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={editingTemplate.titleText?.color || "#999999"}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            titleText: {
                              ...editingTemplate.titleText,
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  <AlignmentButtons
                    value={editingTemplate.titleText?.alignment || "center"}
                    onChange={(alignment) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        titleText: {
                          ...editingTemplate.titleText,
                          alignment: alignment,
                        },
                      })
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <PositionInput
                      label="X Position"
                      type="x"
                      value={editingTemplate.titleText?.position?.x || 200}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          titleText: {
                            ...editingTemplate.titleText,
                            position: {
                              ...editingTemplate.titleText?.position,
                              x: value,
                            },
                          },
                        })
                      }
                    />
                    <PositionInput
                      label="Y Position"
                      value={editingTemplate.titleText?.position?.y || 350}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          titleText: {
                            ...editingTemplate.titleText,
                            position: {
                              ...editingTemplate.titleText?.position,
                              y: value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

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
                              ...editingTemplate.qrCodeSize,
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
                              ...editingTemplate.qrCodeSize,
                              height: parseInt(e.target.value) || 120,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <PositionInput
                      label="X Position"
                      type="x"
                      value={editingTemplate.qrCodePosition?.x || 200}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          qrCodePosition: {
                            ...editingTemplate.qrCodePosition,
                            x: value,
                          },
                        })
                      }
                    />
                    <PositionInput
                      label="Y Position"
                      value={editingTemplate.qrCodePosition?.y || 400}
                      onChange={(value) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          qrCodePosition: {
                            ...editingTemplate.qrCodePosition,
                            y: value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-96 border-l border-gray-200 p-6 overflow-auto bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-4 text-center">
              Badge Preview
            </h4>
            {renderCustomBadgePreview(editingTemplate)}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3 bg-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTemplate}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- SVG COMPONENTS --------------------
export const CardHeader: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full rounded-t-xl"
    preserveAspectRatio="none"
  >
    <path
      d="M111.273 56.0935C64.6585 45.6916 29.5725 53.1215 0 66V0H204V47.6729C172.322 62.3346 125.307 59.2252 111.273 56.0935Z"
      fill={color}
    />
    <path
      d="M106 64.6191C56.4 55.4191 14.6667 74.7858 0 85.6191V89.6191C40 63.6191 87.3333 62.1191 106 64.6191Z"
      fill={color}
    />
    <path
      d="M107 61.6188C60.5 51.1189 17.3333 65.9522 0 74.6188V80.1187C39.5 55.1189 89.5 58.7806 107 61.6188Z"
      fill={color}
    />
    <path
      d="M119.5 62.5C165.5 68 189 60.5 204 54.5V58.5C170.5 68.5 133.5 66 119.5 62.5Z"
      fill={color}
    />
    <path
      d="M119 65.5C157 73.5 191.5 67.5 204 62.5V67.5C164 76 130 68.5 119 65.5Z"
      fill={color}
    />
  </svg>
);

export const CardHeader2: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 106"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path d="M204 26V13L154.5 38.5L162.5 46L204 26Z" fill={color} />
    <path d="M0 106V0H204L0 106Z" fill={color} />
  </svg>
);

export const CardFooter: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full rounded-b-xl"
    preserveAspectRatio="none"
  >
    <path
      d="M129 22.6273C166.5 23.0083 194.5 8.33636 204 0V8.33636C166.5 27.5 150.5 25.5 129 22.6273Z"
      fill={color}
    />
    <path
      d="M0 20.4307V28C51.5 4.56204 91.5 17.1777 98 18.4392C57.6 1.28214 16 14.6544 0 20.4307Z"
      fill={color}
    />
    <path
      d="M0 33.6364V41H204V14C172.078 29.7091 147.138 29.953 126.688 26.2717C59.8521 14.2401 35.912 15.2273 0 33.6364Z"
      fill={color}
    />
  </svg>
);

export const CardFooter2: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path d="M89.4059 9L0 54H54.5792L105 28.7802L89.4059 9Z" fill={color} />
    <path d="M204 0L106 54H204V0Z" fill={color} />
  </svg>
);

// -------------------- PREVIEW MODAL COMPONENTS --------------------
interface BadgePreviewProps {
  badge: Badge;
  event: any;
  onClose: () => void;
  CardHeader: React.FC<{ color?: string }>;
  CardFooter: React.FC<{ color?: string }>;
}

const Badge1Preview: React.FC<BadgePreviewProps> = ({ badge, event, onClose, CardHeader, CardFooter }) => {
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = event?.attributes?.secondary_color || "white";
  const logoUrl = event?.attributes?.logo_url;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Preview - {badge.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Front Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Front Side</h3>
              <div
                className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden mx-auto shadow-lg"
                style={{
                  backgroundColor: secondaryColor,
                  maxWidth: "350px"
                }}
              >
                <div
                  className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                  style={{ height: "33%" }}
                >
                  <div className="absolute inset-0">
                    <CardHeader color={primaryColor} />
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-8 h-8 mb-3 rounded-full bg-white p-1"
                      />
                    )}
                    <h6 className="font-semibold mb-3 text-white text-lg">
                      Company Name
                    </h6>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-center items-center p-6">
                  <img
                    src={badge.userImg}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    alt="User"
                  />
                  <h2 className="text-2xl font-bold text-gray-900 mt-4">
                    John Doe
                  </h2>
                  <p className="text-gray-600 text-lg mt-1">Software Engineer</p>
                </div>

                <div
                  className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                  style={{ height: "15%" }}
                >
                  <div className="absolute inset-0">
                    <CardFooter color={primaryColor} />
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Back Side</h3>
              <div
                className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden mx-auto shadow-lg bg-gray-100"
                style={{
                  maxWidth: "350px"
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h3>
                    <p className="text-gray-600">
                      This is the back side of the badge
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-inner">
                    <div className="flex justify-center mb-4">
                      <img
                        src={badge.qrImg}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-center text-gray-500 text-sm">
                      Scan QR code for event details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              This is a preview of the badge template. Actual badges will be printed with attendee information.
            </p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const Badge2Preview: React.FC<BadgePreviewProps> = ({ badge, event, onClose, CardHeader, CardFooter }) => {
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = event?.attributes?.secondary_color || "white";
  const logoUrl = event?.attributes?.logo_url;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Preview - {badge.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Front Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Front Side</h3>
              <div
                className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden mx-auto shadow-lg"
                style={{
                  backgroundColor: secondaryColor,
                  maxWidth: "350px"
                }}
              >
                <div
                  className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                  style={{ height: "33%" }}
                >
                  <div className="absolute inset-0">
                    <CardHeader color={primaryColor} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-evenly items-center p-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      John Doe
                    </h2>
                    <p className="text-gray-600 text-lg mt-1">Software Engineer</p>
                  </div>
                  <div className="relative z-10 flex items-center gap-3">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-8 h-8 mb-3"
                      />
                    )}
                    <h6 className="font-semibold mb-3 text-black text-lg">
                      Company Name
                    </h6>
                  </div>
                </div>

                <div
                  className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                  style={{ height: "15%" }}
                >
                  <div className="absolute inset-0">
                    <CardFooter color={primaryColor} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-white font-medium text-lg">#Event2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Back Side</h3>
              <div
                className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden mx-auto shadow-lg bg-gray-100"
                style={{
                  maxWidth: "350px"
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h3>
                    <p className="text-gray-600">
                      This is the back side of the badge
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-inner">
                    <div className="flex justify-center mb-4">
                      <img
                        src={badge.qrImg}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-center text-gray-500 text-sm">
                      Scan QR code for event details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              This is a preview of the badge template. Actual badges will be printed with attendee information.
            </p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const Badge3Preview: React.FC<BadgePreviewProps> = ({ badge, event, onClose, CardHeader, CardFooter }) => {
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = event?.attributes?.secondary_color || "white";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Preview - {badge.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Front Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Front Side</h3>
              <div
                className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden mx-auto shadow-lg"
                style={{
                  backgroundColor: secondaryColor,
                  maxWidth: "350px"
                }}
              >
                <div
                  className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                  style={{ height: "33%" }}
                >
                  <div className="absolute inset-0">
                    <CardHeader color={primaryColor} />
                  </div>
                  <div className="relative z-10">
                    <h6 className="font-semibold text-white text-xl">Conference 2024</h6>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-center items-center p-6">
                  <img
                    src={badge.squareUserImg}
                    className="w-32 h-32 object-cover rounded-lg border-4 border-white shadow-lg"
                    alt="User"
                  />
                  <h2 className="text-2xl font-bold text-gray-900 mt-4">
                    John Doe
                  </h2>
                  <p className="text-gray-600 text-lg mt-1">Software Engineer</p>
                </div>

                <div
                  className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                  style={{ height: "15%" }}
                >
                  <div className="absolute inset-0">
                    <CardFooter color={primaryColor} />
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Back Side</h3>
              <div
                className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden mx-auto shadow-lg bg-gray-100"
                style={{
                  maxWidth: "350px"
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h3>
                    <p className="text-gray-600">
                      This is the back side of the badge
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-inner">
                    <div className="flex justify-center mb-4">
                      <img
                        src={badge.qrImg}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-center text-gray-500 text-sm">
                      Scan QR code for event details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              This is a preview of the badge template. Actual badges will be printed with attendee information.
            </p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const Badge4Preview: React.FC<BadgePreviewProps> = ({ badge, event, onClose, CardHeader, CardFooter }) => {
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = event?.attributes?.secondary_color || "white";
  const logoUrl = event?.attributes?.logo_url;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Preview - {badge.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Front Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Front Side</h3>
              <div
                className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden mx-auto shadow-lg"
                style={{
                  backgroundColor: secondaryColor,
                  maxWidth: "350px"
                }}
              >
                <div
                  className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                  style={{ height: "33%" }}
                >
                  <div className="absolute inset-0">
                    <CardHeader color={primaryColor} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-evenly items-center p-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      John Doe
                    </h2>
                    <p className="text-gray-600 text-lg mt-1">Software Engineer</p>
                  </div>
                  <div className="relative z-10 flex items-center gap-3">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-8 h-8 mb-3"
                      />
                    )}
                    <h6 className="font-semibold mb-3 text-black text-lg">
                      Company Name
                    </h6>
                  </div>
                </div>

                <div
                  className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                  style={{ height: "15%" }}
                >
                  <div className="absolute inset-0">
                    <CardFooter color={primaryColor} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-white font-bold text-xl">VIP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Back Side</h3>
              <div
                className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden mx-auto shadow-lg bg-gray-100"
                style={{
                  maxWidth: "350px"
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h3>
                    <p className="text-gray-600">
                      This is the back side of the badge
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-inner">
                    <div className="flex justify-center mb-4">
                      <img
                        src={badge.qrImg}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-center text-gray-500 text-sm">
                      Scan QR code for event details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              This is a preview of the badge template. Actual badges will be printed with attendee information.
            </p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Badge Preview Modal
interface CustomBadgePreviewProps {
  template: BadgeTemplate;
  onClose: () => void;
}

const CustomBadgePreview: React.FC<CustomBadgePreviewProps> = ({ template, onClose }) => {
  const previewWidth = template.width * 80;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Preview - {template.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Front Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Front Side</h3>
              <div className="flex justify-center">
                <div
                  className="relative rounded-2xl shadow-xl overflow-hidden border-4 border-gray-300"
                  style={{
                    width: `${previewWidth}px`,
                    height: `${template.height * 80}px`,
                    backgroundColor: template.hasBackground ? template.bgColor : "transparent",
                    backgroundImage:
                      template.hasBackground && template.bgImage
                        ? `url(${template.bgImage})`
                        : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {template.hasPersonalPhoto && template.photoSize && (
                    <div
                      className="absolute rounded-full bg-gray-300 border-4 border-white flex items-center justify-center overflow-hidden"
                      style={{
                        width: `${(template.photoSize.width || 200) * 0.4}px`,
                        height: `${(template.photoSize.height || 200) * 0.4}px`,
                        left:
                          template.photoAlignment === "left"
                            ? `${(template.photoPosition?.x || 200) * 0.4}px`
                            : template.photoAlignment === "right"
                            ? "auto"
                            : "50%",
                        right: template.photoAlignment === "right" ? `${(template.photoPosition?.x || 200) * 0.4}px` : "auto",
                        transform:
                          template.photoAlignment === "center" ? "translateX(-50%)" : "none",
                        top: `${(template.photoPosition?.y || 60) * 0.4}px`,
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                        <span className="text-gray-500">Photo</span>
                      </div>
                    </div>
                  )}

                  {template.hasName && template.nameText && (
                    <div
                      className="absolute"
                      style={{
                        top: `${(template.nameText.position?.y || 280) * 0.4}px`,
                        left: template.nameText.alignment === "left" ? 
                          `${(template.nameText.position?.x || 200) * 0.4}px` : 
                          template.nameText.alignment === "right" ? 
                          "auto" : 
                          "50%",
                        right: template.nameText.alignment === "right" ? 
                          `${(template.nameText.position?.x || 200) * 0.4}px` : 
                          "auto",
                        transform: template.nameText.alignment === "center" ? 
                          `translateX(-${(template.nameText.position?.x || 200) * 0.4}px)` : 
                          "none",
                        textAlign: template.nameText.alignment || "center",
                      }}
                    >
                      <div
                        className="font-bold px-4 whitespace-nowrap"
                        style={{
                          fontSize: `${(template.nameText.size || 24) * 0.4}px`,
                          color: template.nameText.color || "#ffffff",
                        }}
                      >
                        John Doe
                      </div>
                    </div>
                  )}

                  {template.hasCompany && template.companyText && (
                    <div
                      className="absolute"
                      style={{
                        top: `${(template.companyText.position?.y || 315) * 0.4}px`,
                        left: template.companyText.alignment === "left" ? 
                          `${(template.companyText.position?.x || 200) * 0.4}px` : 
                          template.companyText.alignment === "right" ? 
                          "auto" : 
                          "50%",
                        right: template.companyText.alignment === "right" ? 
                          `${(template.companyText.position?.x || 200) * 0.4}px` : 
                          "auto",
                        transform: template.companyText.alignment === "center" ? 
                          `translateX(-${(template.companyText.position?.x || 200) * 0.4}px)` : 
                          "none",
                        textAlign: template.companyText.alignment || "center",
                      }}
                    >
                      <div
                        className="px-4 whitespace-nowrap"
                        style={{
                          fontSize: `${(template.companyText.size || 18) * 0.4}px`,
                          color: template.companyText.color || "#cccccc",
                        }}
                      >
                        Tech Company
                      </div>
                    </div>
                  )}

                  {template.hasTitle && template.titleText && (
                    <div
                      className="absolute"
                      style={{
                        top: `${(template.titleText.position?.y || 350) * 0.4}px`,
                        left: template.titleText.alignment === "left" ? 
                          `${(template.titleText.position?.x || 200) * 0.4}px` : 
                          template.titleText.alignment === "right" ? 
                          "auto" : 
                          "50%",
                        right: template.titleText.alignment === "right" ? 
                          `${(template.titleText.position?.x || 200) * 0.4}px` : 
                          "auto",
                        transform: template.titleText.alignment === "center" ? 
                          `translateX(-${(template.titleText.position?.x || 200) * 0.4}px)` : 
                          "none",
                        textAlign: template.titleText.alignment || "center",
                      }}
                    >
                      <div
                        className="px-4 whitespace-nowrap"
                        style={{
                          fontSize: `${(template.titleText.size || 16) * 0.4}px`,
                          color: template.titleText.color || "#999999",
                        }}
                      >
                        Software Engineer
                      </div>
                    </div>
                  )}

                  {template.hasQrCode && template.qrCodeSize && (
                    <div
                      className="absolute bg-white border-4 border-gray-400 flex items-center justify-center overflow-hidden rounded-lg"
                      style={{
                        width: `${(template.qrCodeSize.width || 120) * 0.4}px`,
                        height: `${(template.qrCodeSize.height || 120) * 0.4}px`,
                        left: `${(template.qrCodePosition?.x || 200) * 0.4}px`,
                        top: `${(template.qrCodePosition?.y || 400) * 0.4}px`,
                      }}
                    >
                      <QrCode
                        size={(template.qrCodeSize.width || 120) * 0.2}
                        className="text-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Back Side</h3>
              <div className="flex justify-center">
                <div
                  className="relative rounded-2xl shadow-xl overflow-hidden border-4 border-gray-300 bg-gray-100"
                  style={{
                    width: `${previewWidth}px`,
                    height: `${template.height * 80}px`,
                  }}
                >
                  <div className="h-full flex flex-col items-center justify-center p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Additional Information</h3>
                      <p className="text-gray-600">
                        This is the back side of the badge
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-inner">
                      <div className="flex justify-center mb-3">
                        <div className="bg-gray-200 p-4 rounded-lg">
                          <QrCode size={80} className="text-gray-400" />
                        </div>
                      </div>
                      <p className="text-center text-gray-500 text-sm">
                        Scan QR code for event details
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              This is a preview of your custom badge template. Actual badges will be printed with attendee information.
            </p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- MAIN BADGES COMPONENT --------------------
const Badges: React.FC<BadgesProps> = ({
  toggleStates,
  onNext,
  onPrevious,
  currentStep,
  eventId,
  plan,
}) => {
  console.log(plan, currentStep, eventId);
  
  // State for custom templates
  const [customTemplates, setCustomTemplates] = useState<BadgeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BadgeTemplate | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomTemplate, setEditingCustomTemplate] = useState<BadgeTemplate | null>(null);
  const [isEditCustomMode, setIsEditCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);
  
  // Preview state
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<BadgeTemplate | null>(null);
  
  // Original badge state
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeBadgeId, setActiveBadgeId] = useState<number | null>(null);

  const effectiveEventId = eventId || localStorage.getItem("create_eventId");

  console.log("Badges - Received eventId:", eventId);
  console.log("Badges - Effective eventId:", effectiveEventId);

  const badges: Badge[] = [
    {
      id: 1,
      name: "Badge 1",
      frontImg: Assets.images.b1_front,
      backImg: Assets.images.b1_back,
      userImg: Assets.images.user_img,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header,
      cardFooter: Assets.images.card_footer,
    },
    {
      id: 2,
      name: "Badge 2",
      frontImg: Assets.images.b2_front,
      backImg: Assets.images.b2_back,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header,
      cardFooter: Assets.images.card_footer,
    },
    {
      id: 3,
      name: "Badge 3",
      frontImg: Assets.images.b3_front,
      backImg: Assets.images.b3_back,
      squareUserImg: Assets.images.square_user_img,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header2,
      cardFooter: Assets.images.card_footer2,
    },
    {
      id: 4,
      name: "Badge 4",
      frontImg: Assets.images.b4_front,
      backImg: Assets.images.b4_back,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header2,
      cardFooter: Assets.images.card_footer2,
    },
  ];

  // Existing badge templates (Badge1-4 as BadgeTemplate objects)
  const existingBadges: BadgeTemplate[] = [
    {
      id: "existing-1",
      name: "Badge 1",
      type: "existing",
      width: 3.5,
      height: 5.5,
      hasBackground: true,
      bgColor: "#2563eb",
      bgImage: null,
      hasPersonalPhoto: true,
      photoSize: { width: 120, height: 120 },
      photoAlignment: "center",
      photoPosition: { x: 200, y: 100 },
      hasName: true,
      nameText: {
        size: 18,
        color: "#000000",
        alignment: "center",
        position: { x: 200, y: 240 },
      },
      hasCompany: true,
      companyText: {
        size: 14,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasTitle: true,
      titleText: {
        size: 12,
        color: "#999999",
        alignment: "center",
        position: { x: 200, y: 295 },
      },
      hasQrCode: false,
      qrCodeSize: { width: 100, height: 100 },
      qrCodePosition: { x: 150, y: 350 },
    },
    {
      id: "existing-2",
      name: "Badge 2",
      type: "existing",
      width: 3.5,
      height: 5.5,
      hasBackground: true,
      bgColor: "#000000",
      bgImage: null,
      hasPersonalPhoto: false,
      photoSize: { width: 0, height: 0 },
      photoAlignment: "center",
      photoPosition: { x: 0, y: 0 },
      hasName: true,
      nameText: {
        size: 20,
        color: "#FFFFFF",
        alignment: "center",
        position: { x: 200, y: 180 },
      },
      hasCompany: true,
      companyText: {
        size: 16,
        color: "#CCCCCC",
        alignment: "center",
        position: { x: 200, y: 220 },
      },
      hasTitle: true,
      titleText: {
        size: 14,
        color: "#999999",
        alignment: "center",
        position: { x: 200, y: 250 },
      },
      hasQrCode: false,
      qrCodeSize: { width: 100, height: 100 },
      qrCodePosition: { x: 150, y: 320 },
    },
    {
      id: "existing-3",
      name: "Badge 3",
      type: "existing",
      width: 3.5,
      height: 5.5,
      hasBackground: true,
      bgColor: "#FFFFFF",
      bgImage: null,
      hasPersonalPhoto: true,
      photoSize: { width: 100, height: 100 },
      photoAlignment: "center",
      photoPosition: { x: 200, y: 120 },
      hasName: true,
      nameText: {
        size: 18,
        color: "#000000",
        alignment: "center",
        position: { x: 200, y: 240 },
      },
      hasCompany: false,
      companyText: {
        size: 14,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasTitle: true,
      titleText: {
        size: 12,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasQrCode: false,
      qrCodeSize: { width: 100, height: 100 },
      qrCodePosition: { x: 150, y: 330 },
    },
    {
      id: "existing-4",
      name: "Badge 4",
      type: "existing",
      width: 3.5,
      height: 5.5,
      hasBackground: true,
      bgColor: "#000000",
      bgImage: null,
      hasPersonalPhoto: false,
      photoSize: { width: 0, height: 0 },
      photoAlignment: "center",
      photoPosition: { x: 0, y: 0 },
      hasName: true,
      nameText: {
        size: 18,
        color: "#FFFFFF",
        alignment: "center",
        position: { x: 200, y: 170 },
      },
      hasCompany: true,
      companyText: {
        size: 14,
        color: "#CCCCCC",
        alignment: "center",
        position: { x: 200, y: 210 },
      },
      hasTitle: true,
      titleText: {
        size: 12,
        color: "#999999",
        alignment: "center",
        position: { x: 200, y: 240 },
      },
      hasQrCode: false,
      qrCodeSize: { width: 100, height: 100 },
      qrCodePosition: { x: 150, y: 300 },
    },
  ];

  // Load custom templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customBadgeTemplates");
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading templates:", error);
      }
    }

    // Load event data
    if (effectiveEventId) {
      getEventbyId(effectiveEventId)
        .then((response) => {
          const eventData = response?.data?.data;
          console.log("response of get badge api", eventData);
          setEvent(eventData);

          const activeBadge =
            eventData?.attributes?.active_badge_id ||
            parseInt(localStorage.getItem("active_badge_id") || "0", 10);

          if (activeBadge) {
            setActiveBadgeId(activeBadge);
            // Try to find if it's an existing badge
            const foundBadge = badges.find((b) => b.id === activeBadge);
            if (foundBadge) {
              setSelectedBadge(foundBadge);
            } else {
              // Check if it's a custom template
              const foundTemplate = customTemplates.find(t => t.id === `custom-${activeBadge}`);
              if (foundTemplate) {
                setSelectedTemplate(foundTemplate);
              }
            }
          }
        })
        .catch((error) => {
          console.error("Failed to fetch event data:", error);
        });
    }
  }, [effectiveEventId]);

  // Save templates to localStorage
  const saveTemplates = (newTemplates: BadgeTemplate[]) => {
    localStorage.setItem("customBadgeTemplates", JSON.stringify(newTemplates));
    setCustomTemplates(newTemplates);
  };

  // -------------------- CUSTOM TEMPLATE FUNCTIONS --------------------
  const handleCreateNewTemplate = () => {
    setEditingCustomTemplate(null);
    setIsEditCustomMode(false);
    setIsCustomModalOpen(true);
  };

  const handleEditCustomTemplate = (template: BadgeTemplate) => {
    setEditingCustomTemplate(template);
    setIsEditCustomMode(true);
    setIsCustomModalOpen(true);
  };

  const handleSaveCustomTemplate = (template: BadgeTemplate) => {
    let updatedTemplates: BadgeTemplate[];

    if (isEditCustomMode && editingCustomTemplate) {
      // Update existing template
      updatedTemplates = customTemplates.map((t) =>
        t.id === editingCustomTemplate.id
          ? { ...template, updatedAt: new Date().toISOString() }
          : t
      );
    } else {
      // Create new template
      updatedTemplates = [...customTemplates, template];
      setSelectedTemplate(template);
      setSelectedBadge(null); // Clear any selected existing badge
    }

    saveTemplates(updatedTemplates);
    toast.success(`Template ${isEditCustomMode ? 'updated' : 'created'} successfully!`);
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = customTemplates.filter(
        (template) => template.id !== templateId
      );
      saveTemplates(updatedTemplates);

      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
      toast.success("Template deleted successfully!");
    }
  };

  const handleSelectTemplate = (template: BadgeTemplate) => {
    setSelectedTemplate(template);
    setSelectedBadge(null); // Clear existing badge selection
    toast.success("Template selected!");
  };

  const handlePreviewBadge = (badge: Badge) => {
    setPreviewBadge(badge);
    setPreviewTemplate(null);
  };

  const handlePreviewTemplate = (template: BadgeTemplate) => {
    setPreviewTemplate(template);
    setPreviewBadge(null);
  };

  const closePreview = () => {
    setPreviewBadge(null);
    setPreviewTemplate(null);
  };

  // -------------------- EXISTING BADGE FUNCTIONS --------------------
  const handleSelectExistingBadge = (badge: Badge) => {
    setSelectedBadge(selectedBadge?.id === badge.id ? null : badge);
    setSelectedTemplate(null); // Clear custom template selection
  };

  // -------------------- RENDER FUNCTIONS --------------------
  const renderExistingBadgePreview = (badge: Badge) => {
    const primaryColor = event?.attributes?.primary_color || "#2563eb";
    const secondaryColor = event?.attributes?.secondary_color || "white";
    const logoUrl = event?.attributes?.logo_url;

    return (
      <div
        className="flex flex-col h-full w-full rounded-xl border overflow-hidden"
        style={{ backgroundColor: secondaryColor }}
      >
        {/* Header Section */}
        <div
          className="relative w-full rounded-t-xl overflow-hidden"
          style={{ height: "33%" }}
        >
          <div className="absolute inset-0">
            {badge.id === 1 || badge.id === 2 ? (
              <CardHeader color={primaryColor} />
            ) : (
              <CardHeader2 color={primaryColor} />
            )}
          </div>
          
          {/* Header content for different badges */}
          {badge.id === 1 && (
            <div className="relative z-10 flex items-center justify-center gap-2 h-full">
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-4 h-4" />}
              <h6 className="font-semibold text-white text-xs">Company Name</h6>
            </div>
          )}
          {badge.id === 3 && (
            <div className="relative z-10 flex items-center justify-center h-full">
              <h6 className="font-semibold text-white text-xs">Conference 2024</h6>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-center items-center p-4">
          {/* Photo - only for badges that have it enabled */}
          {(badge.id === 1 || badge.id === 3) && (
            <div className="w-12 h-12 rounded-full bg-gray-300 mb-2 flex items-center justify-center overflow-hidden">
              {badge.id === 1 ? (
                <img src={badge.userImg} className="w-full h-full object-cover" />
              ) : (
                <img src={badge.squareUserImg} className="w-full h-full object-cover" />
              )}
            </div>
          )}

          {/* Name - always show for all badges */}
          <h2 className={`text-xs font-bold ${badge.id === 2 || badge.id === 4 ? "text-white" : "text-gray-900"} mb-1`}>
            John Doe
          </h2>

          {/* Title */}
          <p className={`text-xs ${badge.id === 2 || badge.id === 4 ? "text-gray-300" : "text-gray-600"}`}>
            Software Engineer
          </p>

          {/* Company with logo - for badges 2 and 4 */}
          {(badge.id === 2 || badge.id === 4) && (
            <div className="flex items-center gap-1 mt-2">
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-3 h-3" />}
              <span className={`text-xs font-medium ${badge.id === 2 || badge.id === 4 ? "text-white" : "text-black"}`}>
                Tech Corp
              </span>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div
          className="relative w-full rounded-b-xl overflow-hidden"
          style={{ height: 70 }}
        >
          <div className="absolute inset-0">
            {badge.id === 1 || badge.id === 2 ? (
              <CardFooter color={primaryColor} />
            ) : (
              <CardFooter2 color={primaryColor} />
            )}
          </div>
          
          {/* Footer content */}
          {badge.id === 2 && (
            <div className="relative z-10 flex items-center justify-center h-full">
              <span className="text-white text-xs">#Event2024</span>
            </div>
          )}
          {badge.id === 4 && (
            <div className="relative z-10 flex items-center justify-center h-full">
              <span className="text-white text-xs">VIP</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCustomBadgePreview = (template: BadgeTemplate) => {
    const previewWidth = template.width * 40;
    
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div
          className="relative rounded-lg shadow-md overflow-hidden border-2 border-gray-200"
          style={{
            width: `${previewWidth}px`,
            height: `${template.height * 40}px`,
            backgroundColor: template.hasBackground ? template.bgColor : "transparent",
            backgroundImage:
              template.hasBackground && template.bgImage
                ? `url(${template.bgImage})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {template.hasPersonalPhoto && template.photoSize && (
            <div
              className="absolute rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
              style={{
                width: `${(template.photoSize.width || 200) * 0.2}px`,
                height: `${(template.photoSize.height || 200) * 0.2}px`,
                left:
                  template.photoAlignment === "left"
                    ? `${(template.photoPosition?.x || 200) * 0.2}px`
                    : template.photoAlignment === "right"
                    ? "auto"
                    : "50%",
                right: template.photoAlignment === "right" ? `${(template.photoPosition?.x || 200) * 0.2}px` : "auto",
                transform:
                  template.photoAlignment === "center" ? "translateX(-50%)" : "none",
                top: `${(template.photoPosition?.y || 60) * 0.2}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            </div>
          )}

          {template.hasName && template.nameText && (
            <div
              className="absolute"
              style={{
                top: `${(template.nameText.position?.y || 280) * 0.2}px`,
                left: template.nameText.alignment === "left" ? 
                  `${(template.nameText.position?.x || 200) * 0.2}px` : 
                  template.nameText.alignment === "right" ? 
                  "auto" : 
                  "50%",
                right: template.nameText.alignment === "right" ? 
                  `${(template.nameText.position?.x || 200) * 0.2}px` : 
                  "auto",
                transform: template.nameText.alignment === "center" ? 
                  `translateX(-${(template.nameText.position?.x || 200) * 0.2}px)` : 
                  "none",
                textAlign: template.nameText.alignment || "center",
              }}
            >
              <div
                className="font-bold px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.nameText.size || 24) * 0.2}px`,
                  color: template.nameText.color || "#ffffff",
                }}
              >
                Name
              </div>
            </div>
          )}

          {template.hasCompany && template.companyText && (
            <div
              className="absolute"
              style={{
                top: `${(template.companyText.position?.y || 315) * 0.2}px`,
                left: template.companyText.alignment === "left" ? 
                  `${(template.companyText.position?.x || 200) * 0.2}px` : 
                  template.companyText.alignment === "right" ? 
                  "auto" : 
                  "50%",
                right: template.companyText.alignment === "right" ? 
                  `${(template.companyText.position?.x || 200) * 0.2}px` : 
                  "auto",
                transform: template.companyText.alignment === "center" ? 
                  `translateX(-${(template.companyText.position?.x || 200) * 0.2}px)` : 
                  "none",
                textAlign: template.companyText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.companyText.size || 18) * 0.2}px`,
                  color: template.companyText.color || "#cccccc",
                }}
              >
                Company
              </div>
            </div>
          )}

          {template.hasTitle && template.titleText && (
            <div
              className="absolute"
              style={{
                top: `${(template.titleText.position?.y || 350) * 0.2}px`,
                left: template.titleText.alignment === "left" ? 
                  `${(template.titleText.position?.x || 200) * 0.2}px` : 
                  template.titleText.alignment === "right" ? 
                  "auto" : 
                  "50%",
                right: template.titleText.alignment === "right" ? 
                  `${(template.titleText.position?.x || 200) * 0.2}px` : 
                  "auto",
                transform: template.titleText.alignment === "center" ? 
                  `translateX(-${(template.titleText.position?.x || 200) * 0.2}px)` : 
                  "none",
                textAlign: template.titleText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.titleText.size || 16) * 0.2}px`,
                  color: template.titleText.color || "#999999",
                }}
              >
                Title
              </div>
            </div>
          )}

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
    );
  };

  // -------------------- API INTEGRATION --------------------
  const handleBadgeApiSelection = async (badgeId: number, badgeName: string) => {
    if (!effectiveEventId) {
      throw new Error("Event ID not found");
    }

    const data = {
      badge_template: {
        name: badgeName,
        event_id: effectiveEventId,
        default: true,
      },
    };

    const response = await postBadgesApi(data, parseInt(effectiveEventId, 10));
    console.log("Response of post badge api:", response.data);
    return response;
  };

  const handleCustomBadgeApiSelection = async (template: BadgeTemplate) => {
    if (!effectiveEventId) {
      throw new Error("Event ID not found");
    }

    const data = {
      badge_template: {
        name: template.name,
        event_id: effectiveEventId,
        default: true,
        template_data: template, // Include the full template data
      },
    };

    const response = await postBadgesApi(data, parseInt(effectiveEventId, 10));
    return response;
  };

  const selectBadgeAndContinue = async () => {
    if (!selectedBadge && !selectedTemplate) {
      toast.error("Please select a badge template first!");
      return;
    }

    setLoading(true);
    try {
      if (selectedBadge) {
        // Existing badge selected
        const response = await handleBadgeApiSelection(
          selectedBadge.id,
          selectedBadge.name
        );
        toast.success("Badge template selected!");
        setActiveBadgeId(selectedBadge.id);

        // Save only required data for PrintBadges
        localStorage.setItem("active_badge_id", selectedBadge.id.toString());
        localStorage.setItem("badge_qr_image", selectedBadge.qrImg);
        localStorage.setItem(
          "badge_header_color",
          event?.attributes?.primary_color || "#4D4D4D"
        );
        localStorage.setItem(
          "badge_footer_color",
          event?.attributes?.primary_color || "#4D4D4D"
        );
        localStorage.setItem(
          "badge_background_color",
          event?.attributes?.secondary_color || "white"
        );
      } else if (selectedTemplate) {
        // Custom template selected
        await handleCustomBadgeApiSelection(selectedTemplate);
        toast.success("Custom badge template selected!");

        // Save template data for PrintBadges
        localStorage.setItem("active_badge_template", JSON.stringify(selectedTemplate));
        localStorage.setItem("active_badge_id", selectedTemplate.id);
      }

      setTimeout(() => {
        if (effectiveEventId && onNext) {
          onNext(effectiveEventId, plan);
        } else {
          onNext();
        }
      }, 1000);
    } catch (error) {
      toast.error("Failed to select badge template.");
      console.error("Badge selection error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-5 bg-white p-5 rounded-2xl">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <ChevronLeft />
          <p className="text-neutral-900 text-md font-poppins font-normal">
            Choose a Badge Template
          </p>
        </div>
      </div>

      {/* Badge Templates Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Custom Badge Creation Card (First Position) */}
        <div
          onClick={handleCreateNewTemplate}
          className="border-2 border-dashed border-gray-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center min-h-[350px]"
        >
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-pink-500" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center text-pink-500">
            Create Custom Badge
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Design a custom badge template from scratch
          </p>
        </div>

        {/* Custom Templates */}
        {customTemplates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <div
              key={template.id}
              className={`border-2 rounded-3xl p-4 transition-colors flex flex-col min-h-[350px] ${
                isSelected
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200 hover:border-pink-500"
              }`}
            >
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="h-48 flex items-center justify-center">
                  {renderCustomBadgePreview(template)}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-900">
                    {template.name}
                  </span>
                  <div className="flex gap-2">
                    {isSelected && (
                      <div className="flex items-center">
                        <Check size={16} className="text-pink-500 mr-1" />
                        <span className="text-sm text-pink-500 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-1">
                    {template.hasPersonalPhoto && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                        Photo
                      </span>
                    )}
                    {template.hasQrCode && (
                      <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">
                        QR
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTemplate(template);
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCustomTemplate(template);
                      }}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomTemplate(template.id);
                      }}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Default Templates */}
        {badges.map((badge) => {
          const isActive = selectedBadge?.id === badge.id || activeBadgeId === badge.id;
          
          return (
            <div
              key={badge.id}
              className={`relative border-2 rounded-3xl p-4 transition-colors cursor-pointer flex flex-col min-h-[350px] ${
                isActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-blue-500"
              }`}
              onClick={() => handleSelectExistingBadge(badge)}
            >
              <div className="flex-1 h-48 flex items-center justify-center">
                {renderExistingBadgePreview(badge)}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-900">
                    {badge.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <div className="flex items-center">
                        <Check size={16} className="text-green-500 mr-1" />
                        <span className="text-sm text-green-500 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-1">
                    {(badge.id === 1 || badge.id === 3) && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                        Photo
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewBadge(badge);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Badge Builder Modal */}
      <CustomBadgeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustomTemplate}
        template={editingCustomTemplate}
        isEditMode={isEditCustomMode}
      />

      {/* Preview Modals */}
      {previewBadge && previewBadge.id === 1 && (
        <Badge1Preview
          badge={previewBadge}
          event={event}
          onClose={closePreview}
          CardHeader={CardHeader}
          CardFooter={CardFooter}
        />
      )}
      {previewBadge && previewBadge.id === 2 && (
        <Badge2Preview
          badge={previewBadge}
          event={event}
          onClose={closePreview}
          CardHeader={CardHeader}
          CardFooter={CardFooter}
        />
      )}
      {previewBadge && previewBadge.id === 3 && (
        <Badge3Preview
          badge={previewBadge}
          event={event}
          onClose={closePreview}
          CardHeader={CardHeader2}
          CardFooter={CardFooter2}
        />
      )}
      {previewBadge && previewBadge.id === 4 && (
        <Badge4Preview
          badge={previewBadge}
          event={event}
          onClose={closePreview}
          CardHeader={CardHeader2}
          CardFooter={CardFooter2}
        />
      )}
      {previewTemplate && (
        <CustomBadgePreview
          template={previewTemplate}
          onClose={closePreview}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg border text-slate-800 hover:bg-gray-50"
        >
          ← Previous
        </button>

        <button
          onClick={selectBadgeAndContinue}
          disabled={(!selectedBadge && !selectedTemplate) || loading}
          className={`cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg flex items-center justify-center ${
            (selectedBadge || selectedTemplate) && !loading
              ? "bg-slate-800 hover:bg-slate-900 text-white"
              : "bg-gray-400 cursor-not-allowed text-white"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </span>
          ) : (
            "Use Template →"
          )}
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Badges;