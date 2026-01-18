import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  QrCode,
} from "lucide-react";

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

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    setNotification({ message, type });
  };

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
      showNotification("Please enter a template name", "warning");
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
    // Use 96 DPI for consistency with print (standard web DPI)
    const DPI = 96;
    const widthInInches = template.width > 50 ? template.width / DPI : template.width;
    const heightInInches = template.height > 50 ? template.height / DPI : template.height;
    
    // Calculate preview dimensions at 96 DPI
    const previewWidth = widthInInches * DPI;
    const previewHeight = heightInInches * DPI;
    
    // Positions are stored in pixels relative to a 400px wide canvas
    // Scale factor: actual badge width (in pixels) / 400
    const canvasWidth = 400; // Base canvas width for position coordinates
    const scaleX = previewWidth / canvasWidth;
    const scaleY = previewHeight / (canvasWidth * (heightInInches / widthInInches)); // Maintain aspect ratio

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div
          className="relative rounded-lg shadow-md overflow-hidden border-2 border-gray-200"
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
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
                width: `${(template.photoSize.width || 200) * scaleX}px`,
                height: `${(template.photoSize.height || 200) * scaleY}px`,
                left: `${((template.photoPosition?.x || 200) * scaleX)}px`,
                transform: "none",
                top: `${(template.photoPosition?.y || 60) * scaleY}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            </div>
          )}

          {template.hasName && template.nameText && (
            <div
              className="absolute"
              style={{
                top: `${(template.nameText.position?.y || 280) * scaleY}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.nameText.alignment || "center",
              }}
            >
              <div
                className="font-bold px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.nameText.size || 24) * scaleY}px`,
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
                top: `${(template.companyText.position?.y || 315) * scaleY}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.companyText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.companyText.size || 18) * scaleY}px`,
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
                top: `${(template.titleText.position?.y || 350) * scaleY}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.titleText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.titleText.size || 16) * scaleY}px`,
                  color: template.titleText.color || "#999999",
                }}
              >
                Title
              </div>
            </div>
          )}

          {template.hasQrCode && template.qrCodeSize && (
            <div
              className="absolute bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden rounded-lg"
              style={{
                width: `${(template.qrCodeSize.width || 120) * scaleX}px`,
                height: `${(template.qrCodeSize.height || 120) * scaleY}px`,
                left: `${((template.qrCodePosition?.x || 200) * scaleX)}px`,
                transform: "none",
                top: `${(template.qrCodePosition?.y || 400) * scaleY}px`,
                padding: "4px",
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                <QrCode
                  size={Math.min(
                    (template.qrCodeSize.width || 120) * scaleX * 0.9,
                    (template.qrCodeSize.height || 120) * scaleY * 0.9
                  )}
                  className="text-gray-600"
                />
              </div>
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
    disabled = false,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    step?: number;
    disabled?: boolean;
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
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
            disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
          }`}
        />
      </div>
    );
  };

  // Slider component for QR code positioning and sizing
  const BadgeSlider = ({
    label,
    value,
    onChange,
    min = 0,
    max = 1000,
    step = 1,
    unit = "px",
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <span className="text-sm text-pink-600 font-semibold bg-pink-50 px-2 py-1 rounded">
            {value} {unit}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
            }}
          />
          <style>{`
            .slider-thumb::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #ec4899;
              cursor: pointer;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              transition: all 0.2s;
            }
            .slider-thumb::-webkit-slider-thumb:hover {
              background: #db2777;
              transform: scale(1.1);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            .slider-thumb::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #ec4899;
              cursor: pointer;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              transition: all 0.2s;
            }
            .slider-thumb::-moz-range-thumb:hover {
              background: #db2777;
              transform: scale(1.1);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
          `}</style>
        </div>
      </div>
    );
  };

  // Combined Slider + Input component for all fields
  const SliderWithInput = ({
    label,
    value,
    onChange,
    min = 0,
    max = 1000,
    step = 1,
    unit = "px",
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }) => {
    const [inputValue, setInputValue] = useState(value.toString());

    useEffect(() => {
      setInputValue(value.toString());
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setInputValue(newVal);
      const parsed = step % 1 === 0 ? parseInt(newVal) : parseFloat(newVal);
      if (!isNaN(parsed) && parsed >= min && parsed <= max) {
        onChange(parsed);
      }
    };

    const handleInputBlur = () => {
      const parsed = step % 1 === 0 ? parseInt(inputValue) : parseFloat(inputValue);
      if (isNaN(parsed) || parsed < min) {
        onChange(min);
      } else if (parsed > max) {
        onChange(max);
      } else {
        onChange(parsed);
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="space-y-2">
          <BadgeSlider
            label=""
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            unit={unit}
          />
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="bg-white w-full h-full overflow-hidden flex flex-col">
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
                <div className="space-y-6 ml-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Photo Size</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="Width"
                        value={editingTemplate.photoSize?.width || 200}
                        min={50}
                        max={600}
                        step={5}
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
                      <SliderWithInput
                        label="Height"
                        value={editingTemplate.photoSize?.height || 200}
                        min={50}
                        max={800}
                        step={5}
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

                  {/* <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Photo Alignment</h5>
                    <AlignmentButtons
                      value={editingTemplate.photoAlignment}
                      onChange={(alignment) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          photoAlignment: alignment,
                        })
                      }
                    />
                  </div> */}

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Photo Position</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="X Position (Horizontal)"
                        value={editingTemplate.photoPosition?.x || 200}
                        min={0}
                        max={400}
                        step={5}
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
                      <SliderWithInput
                        label="Y Position (Vertical)"
                        value={editingTemplate.photoPosition?.y || 60}
                        min={0}
                        max={800}
                        step={5}
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
                <div className="space-y-6 ml-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Name Text Size & Color</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="Size"
                        value={editingTemplate.nameText?.size || 24}
                        min={8}
                        max={72}
                        step={1}
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
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Name Text Alignment</h5>
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
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Name Text Position</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="X Position (Horizontal)"
                        value={editingTemplate.nameText?.position?.x || 200}
                        min={0}
                        max={400}
                        step={5}
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
                      <SliderWithInput
                        label="Y Position (Vertical)"
                        value={editingTemplate.nameText?.position?.y || 280}
                        min={0}
                        max={800}
                        step={5}
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
                <div className="space-y-6 ml-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Company Text Size & Color</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="Size"
                        value={editingTemplate.companyText?.size || 18}
                        min={8}
                        max={72}
                        step={1}
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
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Company Text Alignment</h5>
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
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Company Text Position</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="X Position (Horizontal)"
                        value={editingTemplate.companyText?.position?.x || 200}
                        min={0}
                        max={400}
                        step={5}
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
                      <SliderWithInput
                        label="Y Position (Vertical)"
                        value={editingTemplate.companyText?.position?.y || 315}
                        min={0}
                        max={800}
                        step={5}
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
                <div className="space-y-6 ml-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Title Text Size & Color</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="Size"
                        value={editingTemplate.titleText?.size || 16}
                        min={8}
                        max={72}
                        step={1}
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
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Title Text Alignment</h5>
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
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">Title Text Position</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="X Position (Horizontal)"
                        value={editingTemplate.titleText?.position?.x || 200}
                        min={0}
                        max={400}
                        step={5}
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
                      <SliderWithInput
                        label="Y Position (Vertical)"
                        value={editingTemplate.titleText?.position?.y || 350}
                        min={0}
                        max={800}
                        step={5}
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
                <div className="space-y-6 ml-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">QR Code Size</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="Width"
                        value={editingTemplate.qrCodeSize?.width || 120}
                        min={50}
                        max={300}
                        step={5}
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
                      <SliderWithInput
                        label="Height"
                        value={editingTemplate.qrCodeSize?.height || 120}
                        min={50}
                        max={300}
                        step={5}
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
                  </div>

                  {/* <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">QR Code Alignment</h5>
                    <AlignmentButtons
                      value={editingTemplate.qrCodeAlignment || "center"}
                      onChange={(alignment) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          qrCodeAlignment: alignment,
                        })
                      }
                    />
                  </div> */}

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-4">QR Code Position</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <SliderWithInput
                        label="X Position (Horizontal)"
                        value={editingTemplate.qrCodePosition?.x || 200}
                        min={0}
                        max={400}
                        step={5}
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
                      <SliderWithInput
                        label="Y Position (Vertical)"
                        value={editingTemplate.qrCodePosition?.y || 400}
                        min={0}
                        max={800}
                        step={5}
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
                </div>
              )}
            </div>
          </div>

          <div className="w-[500px] border-l border-gray-200 p-6 overflow-auto bg-gray-50">
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

      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : notification.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdvanceCustomBadgeModal;