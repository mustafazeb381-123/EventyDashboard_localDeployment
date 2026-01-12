import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  QrCode,
} from "lucide-react";
import { toast } from "react-toastify";

// -------------------- TYPES --------------------
export interface BadgeTemplate {
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
  qrCodeAlignment?: "left" | "center" | "right";
}

// -------------------- CUSTOM BADGE BUILDER MODAL --------------------
interface CustomBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: BadgeTemplate) => void;
  template?: BadgeTemplate | null;
  isEditMode?: boolean;
}

const AdvanceCustomBadgeModal: React.FC<CustomBadgeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
  isEditMode = false,
}) => {
  const [editingTemplate, setEditingTemplate] = useState<BadgeTemplate | null>(
    null
  );

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
    qrCodeAlignment: "center",
  };

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setEditingTemplate({ ...template });
    } else {
      setEditingTemplate({
        ...defaultTemplate,
        id: `custom-badge-${Date.now()}`,
      });
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
    const previewWidth = template.width * 80;

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div
          className="relative rounded-lg shadow-md overflow-hidden border-2 border-gray-200"
          style={{
            width: `${previewWidth}px`,
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
                right:
                  template.photoAlignment === "right"
                    ? `${(template.photoPosition?.x || 200) * 0.2}px`
                    : "auto",
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

          {template.hasName && template.nameText && (
            <div
              className="absolute"
              style={{
                top: `${(template.nameText.position?.y || 280) * 0.2}px`,
                left: "0",
                width: "100%",
                transform: "none",
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
                left: "0",
                width: "100%",
                transform: "none",
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
                left: "0",
                width: "100%",
                transform: "none",
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
                left:
                  template.qrCodeAlignment === "left"
                    ? `${(template.qrCodePosition?.x || 200) * 0.2}px`
                    : template.qrCodeAlignment === "right"
                      ? "auto"
                      : "50%",
                right:
                  template.qrCodeAlignment === "right"
                    ? `${(template.qrCodePosition?.x || 200) * 0.2}px`
                    : "auto",
                transform:
                  template.qrCodeAlignment === "center"
                    ? "translateX(-50%)"
                    : "none",
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

  // Generic numeric input component
  const BadgeNumberInput = ({
    label,
    value,
    onChange,
    step = 1,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    step?: number;
  }) => {
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
      // Only update local value if it's different from the current numeric value
      if (parseFloat(localValue) !== value && localValue !== "") {
        setLocalValue(value.toString());
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setLocalValue(newVal);

      const parsed = step % 1 === 0 ? parseInt(newVal) : parseFloat(newVal);
      if (!isNaN(parsed)) {
        onChange(parsed);
      } else if (newVal === "") {
        onChange(0);
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={localValue}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>
    );
  };


  // Alignment buttons component
  const AlignmentButtons = ({
    value,
    onChange,
  }: {
    value: "left" | "center" | "right";
    onChange: (value: "left" | "center" | "right") => void;
  }) => (
    <div>
      <label className="block text-sm text-gray-600 mb-2">Alignment</label>
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
            {align === "center" && (
              <AlignCenter size={16} className="mx-auto" />
            )}
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
              {isEditMode
                ? "Edit Custom Badge"
                : "Create Custom Badge Template"}
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
                <BadgeNumberInput
                  label="Width (inches)"
                  value={editingTemplate.width}
                  step={0.1}
                  onChange={(val) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      width: val,
                    })
                  }
                />
                <BadgeNumberInput
                  label="Height (inches)"
                  value={editingTemplate.height}
                  step={0.1}
                  onChange={(val) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      height: val,
                    })
                  }
                />
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
                    <div className="grid grid-cols-2 gap-4">
                      <BadgeNumberInput
                        label="Width (px)"
                        value={editingTemplate.photoSize?.width || 200}
                        onChange={(val) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            photoSize: {
                              ...editingTemplate.photoSize,
                              width: val,
                            },
                          })
                        }
                      />
                      <BadgeNumberInput
                        label="Height (px)"
                        value={editingTemplate.photoSize?.height || 200}
                        onChange={(val) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            photoSize: {
                              ...editingTemplate.photoSize,
                              height: val,
                            },
                          })
                        }
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
                    <BadgeNumberInput
                      label="X Position (px)"
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
                    <BadgeNumberInput
                      label="Y Position (px)"
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
                    <BadgeNumberInput
                      label="Size (px)"
                      value={editingTemplate.nameText?.size || 24}
                      onChange={(val) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          nameText: {
                            ...editingTemplate.nameText,
                            size: val,
                          },
                        })
                      }
                    />
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
                    <BadgeNumberInput
                      label="X Position (px)"
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
                    <BadgeNumberInput
                      label="Y Position (px)"
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
                    <BadgeNumberInput
                      label="Size (px)"
                      value={editingTemplate.companyText?.size || 18}
                      onChange={(val) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          companyText: {
                            ...editingTemplate.companyText,
                            size: val,
                          },
                        })
                      }
                    />
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Color
                      </label>
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
                    <BadgeNumberInput
                      label="X Position (px)"
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
                    <BadgeNumberInput
                      label="Y Position (px)"
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
                    <BadgeNumberInput
                      label="Size (px)"
                      value={editingTemplate.titleText?.size || 16}
                      onChange={(val) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          titleText: {
                            ...editingTemplate.titleText,
                            size: val,
                          },
                        })
                      }
                    />
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Color
                      </label>
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
                    <BadgeNumberInput
                      label="X Position (px)"
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
                    <BadgeNumberInput
                      label="Y Position (px)"
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
                    <BadgeNumberInput
                      label="Width (px)"
                      value={editingTemplate.qrCodeSize?.width || 120}
                      onChange={(val) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          qrCodeSize: {
                            ...editingTemplate.qrCodeSize,
                            width: val,
                          },
                        })
                      }
                    />
                    <BadgeNumberInput
                      label="Height (px)"
                      value={editingTemplate.qrCodeSize?.height || 120}
                      onChange={(val) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          qrCodeSize: {
                            ...editingTemplate.qrCodeSize,
                            height: val,
                          },
                        })
                      }
                    />
                  </div>

                  <AlignmentButtons
                    value={editingTemplate.qrCodeAlignment || "center"}
                    onChange={(alignment) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        qrCodeAlignment: alignment,
                      })
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <BadgeNumberInput
                      label="X Position (px)"
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
                    <BadgeNumberInput
                      label="Y Position (px)"
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

export default AdvanceCustomBadgeModal;