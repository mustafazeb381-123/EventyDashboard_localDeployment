import React, { useState, useRef } from "react";
import { X, ImageIcon } from "lucide-react";
import type { FormTheme } from "../types";

interface ThemeConfigPanelProps {
  theme: FormTheme;
  onUpdate: (theme: FormTheme) => void;
  onClose: () => void;
}

export const ThemeConfigPanel: React.FC<ThemeConfigPanelProps> = ({
  theme,
  onUpdate,
  onClose,
}) => {
  const [localTheme, setLocalTheme] = useState<FormTheme>(theme);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(
    typeof theme.formBackgroundImage === "string"
      ? theme.formBackgroundImage
      : null
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    typeof theme.logo === "string" ? theme.logo : null
  );

  React.useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    if (theme.formBackgroundImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImagePreview(reader.result as string);
      };
      reader.readAsDataURL(theme.formBackgroundImage);
    } else if (typeof theme.formBackgroundImage === "string") {
      setBackgroundImagePreview(theme.formBackgroundImage);
    } else {
      setBackgroundImagePreview(null);
    }

    if (theme.logo instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(theme.logo);
    } else if (typeof theme.logo === "string") {
      setLogoPreview(theme.logo);
    } else {
      setLogoPreview(null);
    }
  }, [theme.formBackgroundImage, theme.logo]);

  const handleUpdate = (updates: Partial<FormTheme>) => {
    const newTheme = { ...localTheme, ...updates };
    setLocalTheme(newTheme);
    onUpdate(newTheme);
  };

  const handleBackgroundImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setBackgroundImagePreview(dataUrl);
      handleUpdate({ formBackgroundImage: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      handleUpdate({ logo: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackgroundImage = () => {
    handleUpdate({ formBackgroundImage: null });
    setBackgroundImagePreview(null);
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    handleUpdate({ logo: null });
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-linear-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Theme & Styling
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize form appearance
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close theme panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Form Container */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Form Container
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Max Width
              </label>
              <input
                type="text"
                value={localTheme.formMaxWidth || "768px"}
                onChange={(e) => handleUpdate({ formMaxWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="768px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Alignment
              </label>
              <select
                value={localTheme.formAlignment || "center"}
                onChange={(e) =>
                  handleUpdate({
                    formAlignment: e.target.value as
                      | "left"
                      | "center"
                      | "right",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.formBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ formBackgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.formBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ formBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Background Image
            </label>
            {backgroundImagePreview ? (
              <div className="relative">
                <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img
                    src={backgroundImagePreview}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleRemoveBackgroundImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  title="Remove background image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-3 pb-2">
                  <ImageIcon className="w-8 h-8 mb-1 text-gray-400" />
                  <p className="text-xs text-gray-500">Click to upload</p>
                </div>
                <input
                  ref={backgroundImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Padding
              </label>
              <input
                type="text"
                value={localTheme.formPadding || "24px"}
                onChange={(e) => handleUpdate({ formPadding: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="24px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Border Radius
              </label>
              <input
                type="text"
                value={localTheme.formBorderRadius || "8px"}
                onChange={(e) =>
                  handleUpdate({ formBorderRadius: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="8px"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Border Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.formBorderColor || "#e5e7eb"}
                onChange={(e) =>
                  handleUpdate({ formBorderColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.formBorderColor || "#e5e7eb"}
                onChange={(e) =>
                  handleUpdate({ formBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Logo Configuration */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Logo
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Upload Logo
            </label>
            {logoPreview ? (
              <div className="relative">
                <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <button
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  title="Remove logo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-3 pb-2">
                  <ImageIcon className="w-8 h-8 mb-1 text-gray-400" />
                  <p className="text-xs text-gray-500">Click to upload logo</p>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Position
            </label>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {["left", "center", "right"].map((pos) => (
                <button
                  key={pos}
                  onClick={() =>
                    handleUpdate({
                      logoPosition: pos as "left" | "center" | "right",
                    })
                  }
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                    (localTheme.logoPosition || "left") === pos
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Width
              </label>
              <input
                type="text"
                value={localTheme.logoWidth || "100px"}
                onChange={(e) => handleUpdate({ logoWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="100px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Height
              </label>
              <input
                type="text"
                value={localTheme.logoHeight || "auto"}
                onChange={(e) => handleUpdate({ logoHeight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="auto"
              />
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Event Details (Header)
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Event Name
            </label>
            <input
              type="text"
              value={localTheme.eventName || ""}
              onChange={(e) => handleUpdate({ eventName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Annual Tech Conference"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Description
            </label>
            <textarea
              value={localTheme.eventDescription || ""}
              onChange={(e) =>
                handleUpdate({ eventDescription: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="Event description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={localTheme.eventLocation || ""}
                onChange={(e) =>
                  handleUpdate({ eventLocation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="New York, NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Date
              </label>
              <input
                type="text"
                value={localTheme.eventDate || ""}
                onChange={(e) => handleUpdate({ eventDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Oct 15, 2025"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.eventDetailsColor || "#111827"}
                onChange={(e) =>
                  handleUpdate({ eventDetailsColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.eventDetailsColor || "#111827"}
                onChange={(e) =>
                  handleUpdate({ eventDetailsColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Typography
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Heading Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.headingColor || "#111827"}
                onChange={(e) => handleUpdate({ headingColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.headingColor || "#111827"}
                onChange={(e) => handleUpdate({ headingColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Label Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.labelColor || "#374151"}
                onChange={(e) => handleUpdate({ labelColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.labelColor || "#374151"}
                onChange={(e) => handleUpdate({ labelColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.textColor || "#111827"}
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.textColor || "#111827"}
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Input Fields
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Border Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputBorderColor || "#d1d5db"}
                onChange={(e) =>
                  handleUpdate({ inputBorderColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputBorderColor || "#d1d5db"}
                onChange={(e) =>
                  handleUpdate({ inputBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Focus Border Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputFocusBorderColor || "#3b82f6"}
                onChange={(e) =>
                  handleUpdate({ inputFocusBorderColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputFocusBorderColor || "#3b82f6"}
                onChange={(e) =>
                  handleUpdate({ inputFocusBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ inputBackgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputBackgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ inputBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Border Radius
              </label>
              <input
                type="text"
                value={localTheme.inputBorderRadius || "6px"}
                onChange={(e) =>
                  handleUpdate({ inputBorderRadius: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="6px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Padding
              </label>
              <input
                type="text"
                value={localTheme.inputPadding || "10px 16px"}
                onChange={(e) => handleUpdate({ inputPadding: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="10px 16px"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Buttons
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.buttonBackgroundColor || "#3b82f6"}
                onChange={(e) =>
                  handleUpdate({ buttonBackgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.buttonBackgroundColor || "#3b82f6"}
                onChange={(e) =>
                  handleUpdate({ buttonBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.buttonTextColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ buttonTextColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.buttonTextColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ buttonTextColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Hover Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.buttonHoverBackgroundColor || "#2563eb"}
                onChange={(e) =>
                  handleUpdate({ buttonHoverBackgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.buttonHoverBackgroundColor || "#2563eb"}
                onChange={(e) =>
                  handleUpdate({ buttonHoverBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Footer
            </h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localTheme.footerEnabled || false}
                onChange={(e) =>
                  handleUpdate({ footerEnabled: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enable Footer</span>
            </label>
          </div>

          {localTheme.footerEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Footer Text
                </label>
                <textarea
                  value={localTheme.footerText || ""}
                  onChange={(e) => handleUpdate({ footerText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter footer text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localTheme.footerTextColor || "#6b7280"}
                    onChange={(e) =>
                      handleUpdate({ footerTextColor: e.target.value })
                    }
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localTheme.footerTextColor || "#6b7280"}
                    onChange={(e) =>
                      handleUpdate({ footerTextColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localTheme.footerBackgroundColor || "#f9fafb"}
                    onChange={(e) =>
                      handleUpdate({ footerBackgroundColor: e.target.value })
                    }
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localTheme.footerBackgroundColor || "#f9fafb"}
                    onChange={(e) =>
                      handleUpdate({ footerBackgroundColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Alignment
                </label>
                <select
                  value={localTheme.footerAlignment || "center"}
                  onChange={(e) =>
                    handleUpdate({
                      footerAlignment: e.target.value as
                        | "left"
                        | "center"
                        | "right",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
