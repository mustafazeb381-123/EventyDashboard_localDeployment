import React, { useState, useRef, useEffect } from "react";
import { X, ImageIcon } from "lucide-react";
import type { RsvpTheme } from "./types";

interface RsvpThemeConfigPanelProps {
  theme: RsvpTheme;
  onUpdate: (theme: RsvpTheme) => void;
  onClose: () => void;
}

export const RsvpThemeConfigPanel: React.FC<RsvpThemeConfigPanelProps> = ({
  theme,
  onUpdate,
  onClose,
}) => {
  const [localTheme, setLocalTheme] = useState<RsvpTheme>(() => ({
    headerBackgroundColor: "#1e293b",
    headerTextColor: "#ffffff",
    bodyBackgroundColor: "#f8fafc",
    bodyTextColor: "#1e293b",
    labelColor: "#374151",
    acceptButtonBackgroundColor: "#10b981",
    acceptButtonTextColor: "#ffffff",
    declineButtonBackgroundColor: "#ef4444",
    declineButtonTextColor: "#ffffff",
    inputBorderColor: "#e2e8f0",
    inputBackgroundColor: "#f8fafc",
    formPadding: "24px",
    formBackgroundColor: "#ffffff",
    formBorderRadius: "8px",
    formMaxWidth: "768px",
    ...theme,
  }));
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(
    typeof theme.formBackgroundImage === "string"
      ? theme.formBackgroundImage
      : null
  );

  useEffect(() => {
    setLocalTheme((prev) => ({ ...prev, ...theme }));
  }, [theme]);

  useEffect(() => {
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
  }, [theme.formBackgroundImage]);

  const handleUpdate = (updates: Partial<RsvpTheme>) => {
    const next = { ...localTheme, ...updates };
    setLocalTheme(next);
    onUpdate(next);
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

  const handleRemoveBackgroundImage = () => {
    handleUpdate({ formBackgroundImage: null });
    setBackgroundImagePreview(null);
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            RSVP Theme &amp; Styling
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize form appearance (like Advance Registration)
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Close"
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
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Max width
              </label>
              <input
                type="text"
                value={localTheme.formMaxWidth ?? "768px"}
                onChange={(e) => handleUpdate({ formMaxWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="768px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Form alignment
              </label>
              <select
                value={localTheme.formAlignment ?? "center"}
                onChange={(e) =>
                  handleUpdate({
                    formAlignment: e.target.value as
                      | "left"
                      | "center"
                      | "right",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Fields &amp; buttons alignment (Step 3)
              </label>
              <select
                value={localTheme.formFieldsAlignment ?? ""}
                onChange={(e) =>
                  handleUpdate({
                    formFieldsAlignment: (e.target.value || undefined) as
                      | "left"
                      | "center"
                      | "right"
                      | undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Default (full width)</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.formBackgroundColor ?? "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ formBackgroundColor: e.target.value })
                }
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.formBackgroundColor ?? "#ffffff"}
                onChange={(e) =>
                  handleUpdate({ formBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
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
                  type="button"
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
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Padding
              </label>
              <input
                type="text"
                value={localTheme.formPadding ?? "24px"}
                onChange={(e) => handleUpdate({ formPadding: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="24px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Border Radius
              </label>
              <input
                type="text"
                value={localTheme.formBorderRadius ?? "8px"}
                onChange={(e) =>
                  handleUpdate({ formBorderRadius: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="8px"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Border Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.formBorderColor ?? "#e5e7eb"}
                onChange={(e) =>
                  handleUpdate({ formBorderColor: e.target.value })
                }
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.formBorderColor ?? "#e5e7eb"}
                onChange={(e) =>
                  handleUpdate({ formBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Banner Image Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Banner Image
          </h4>
          <p className="text-xs text-gray-500">
            Configure banner image dimensions. Click the banner in preview to upload an image.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Banner Height
              </label>
              <input
                type="text"
                value={localTheme.bannerHeight ?? "300px"}
                onChange={(e) =>
                  handleUpdate({ bannerHeight: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="300px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Banner Width
              </label>
              <input
                type="text"
                value={localTheme.bannerWidth ?? "100%"}
                onChange={(e) =>
                  handleUpdate({ bannerWidth: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="100%"
              />
            </div>
          </div>
        </div>

        {/* Banner & Footer Margins */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Banner &amp; Footer Margins
          </h4>
          <p className="text-xs text-gray-500">
            Banner and footer touch edges by default. Add margins (e.g. 8px,
            16px) to inset from edges.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Banner Top
              </label>
              <input
                type="text"
                value={localTheme.bannerMarginTop ?? "0"}
                onChange={(e) =>
                  handleUpdate({ bannerMarginTop: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Banner Right
              </label>
              <input
                type="text"
                value={localTheme.bannerMarginRight ?? "0"}
                onChange={(e) =>
                  handleUpdate({ bannerMarginRight: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Banner Bottom
              </label>
              <input
                type="text"
                value={localTheme.bannerMarginBottom ?? "0"}
                onChange={(e) =>
                  handleUpdate({ bannerMarginBottom: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Banner Left
              </label>
              <input
                type="text"
                value={localTheme.bannerMarginLeft ?? "0"}
                onChange={(e) =>
                  handleUpdate({ bannerMarginLeft: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Footer Top (gap from form)
              </label>
              <input
                type="text"
                value={localTheme.footerMarginTop ?? "24px"}
                onChange={(e) =>
                  handleUpdate({ footerMarginTop: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="24px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Footer Right
              </label>
              <input
                type="text"
                value={localTheme.footerMarginRight ?? "0"}
                onChange={(e) =>
                  handleUpdate({ footerMarginRight: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Footer Bottom
              </label>
              <input
                type="text"
                value={localTheme.footerMarginBottom ?? "0"}
                onChange={(e) =>
                  handleUpdate({ footerMarginBottom: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Footer Left
              </label>
              <input
                type="text"
                value={localTheme.footerMarginLeft ?? "0"}
                onChange={(e) =>
                  handleUpdate({ footerMarginLeft: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Header / Body block colors */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Header &amp; Body
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Header background
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.headerBackgroundColor ?? "#1e293b"}
                  onChange={(e) =>
                    handleUpdate({ headerBackgroundColor: e.target.value })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.headerBackgroundColor ?? "#1e293b"}
                  onChange={(e) =>
                    handleUpdate({ headerBackgroundColor: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Header text color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.headerTextColor ?? "#ffffff"}
                  onChange={(e) =>
                    handleUpdate({ headerTextColor: e.target.value })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.headerTextColor ?? "#ffffff"}
                  onChange={(e) =>
                    handleUpdate({ headerTextColor: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Body background
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.bodyBackgroundColor ?? "#f8fafc"}
                  onChange={(e) =>
                    handleUpdate({ bodyBackgroundColor: e.target.value })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.bodyBackgroundColor ?? "#f8fafc"}
                  onChange={(e) =>
                    handleUpdate({ bodyBackgroundColor: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Body text color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.bodyTextColor ?? "#1e293b"}
                  onChange={(e) =>
                    handleUpdate({ bodyTextColor: e.target.value })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.bodyTextColor ?? "#1e293b"}
                  onChange={(e) =>
                    handleUpdate({ bodyTextColor: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography (form fields: heading, label, text) */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Typography
          </h4>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Heading color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.headingColor ?? "#111827"}
                onChange={(e) =>
                  handleUpdate({ headingColor: e.target.value })
                }
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.headingColor ?? "#111827"}
                onChange={(e) =>
                  handleUpdate({ headingColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Label color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.labelColor ?? "#374151"}
                onChange={(e) =>
                  handleUpdate({ labelColor: e.target.value })
                }
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.labelColor ?? "#374151"}
                onChange={(e) =>
                  handleUpdate({ labelColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Text color (paragraphs)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.textColor ?? "#111827"}
                onChange={(e) =>
                  handleUpdate({ textColor: e.target.value })
                }
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.textColor ?? "#111827"}
                onChange={(e) =>
                  handleUpdate({ textColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Border color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputBorderColor ?? "#e2e8f0"}
                onChange={(e) =>
                  handleUpdate({ inputBorderColor: e.target.value })
                }
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputBorderColor ?? "#e2e8f0"}
                onChange={(e) =>
                  handleUpdate({ inputBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Focus border color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputFocusBorderColor ?? "#6366f1"}
                onChange={(e) =>
                  handleUpdate({ inputFocusBorderColor: e.target.value })
                }
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputFocusBorderColor ?? "#6366f1"}
                onChange={(e) =>
                  handleUpdate({ inputFocusBorderColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Background color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localTheme.inputBackgroundColor ?? "#f8fafc"}
                onChange={(e) =>
                  handleUpdate({ inputBackgroundColor: e.target.value })
                }
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.inputBackgroundColor ?? "#f8fafc"}
                onChange={(e) =>
                  handleUpdate({ inputBackgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Border radius
              </label>
              <input
                type="text"
                value={localTheme.inputBorderRadius ?? "12px"}
                onChange={(e) =>
                  handleUpdate({ inputBorderRadius: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="12px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Padding
              </label>
              <input
                type="text"
                value={localTheme.inputPadding ?? "12px 16px"}
                onChange={(e) =>
                  handleUpdate({ inputPadding: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="12px 16px"
              />
            </div>
          </div>
        </div>

        {/* Attend & Decline buttons */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Attend &amp; Decline Buttons
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Attend button text
              </label>
              <input
                type="text"
                value={localTheme.acceptButtonText ?? "Attend"}
                onChange={(e) =>
                  handleUpdate({ acceptButtonText: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Attend, Yes I'll Attend"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Decline button text
              </label>
              <input
                type="text"
                value={localTheme.declineButtonText ?? "Decline"}
                onChange={(e) =>
                  handleUpdate({
                    declineButtonText: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Decline, No I Can't Attend"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Attend message (shown in form above buttons)
              </label>
              <input
                type="text"
                value={localTheme.acceptMessage ?? ""}
                onChange={(e) =>
                  handleUpdate({ acceptMessage: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Thank you for responding"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Decline message (shown in form above buttons)
              </label>
              <input
                type="text"
                value={localTheme.declineMessage ?? ""}
                onChange={(e) =>
                  handleUpdate({ declineMessage: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. We'll miss you!"
              />
            </div>
            
            {/* Reason Fields */}
            <div className="pt-2 border-t border-gray-200">
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Reason Fields
              </h5>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="acceptReasonRequired"
                    checked={localTheme.acceptReasonRequired ?? false}
                    onChange={(e) =>
                      handleUpdate({ acceptReasonRequired: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="acceptReasonRequired" className="text-sm text-gray-700">
                    Require reason for Attend
                  </label>
                </div>
                {localTheme.acceptReasonRequired && (
                  <div className="ml-6 space-y-2">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">
                        Reason label
                      </label>
                      <input
                        type="text"
                        value={localTheme.acceptReasonLabel ?? "Reason for attending"}
                        onChange={(e) =>
                          handleUpdate({ acceptReasonLabel: e.target.value || undefined })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Reason for attending"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">
                        Reason placeholder
                      </label>
                      <input
                        type="text"
                        value={localTheme.acceptReasonPlaceholder ?? "Please provide a reason"}
                        onChange={(e) =>
                          handleUpdate({ acceptReasonPlaceholder: e.target.value || undefined })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Please provide a reason"
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="declineReasonRequired"
                    checked={localTheme.declineReasonRequired ?? false}
                    onChange={(e) =>
                      handleUpdate({ declineReasonRequired: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="declineReasonRequired" className="text-sm text-gray-700">
                    Require reason for Decline
                  </label>
                </div>
                {localTheme.declineReasonRequired && (
                  <div className="ml-6 space-y-2">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">
                        Reason label
                      </label>
                      <input
                        type="text"
                        value={localTheme.declineReasonLabel ?? "Reason for declining"}
                        onChange={(e) =>
                          handleUpdate({ declineReasonLabel: e.target.value || undefined })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Reason for declining"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">
                        Reason placeholder
                      </label>
                      <input
                        type="text"
                        value={localTheme.declineReasonPlaceholder ?? "Please provide a reason"}
                        onChange={(e) =>
                          handleUpdate({ declineReasonPlaceholder: e.target.value || undefined })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Please provide a reason"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Attend button color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.acceptButtonBackgroundColor ?? "#10b981"}
                  onChange={(e) =>
                    handleUpdate({
                      acceptButtonBackgroundColor: e.target.value,
                    })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.acceptButtonBackgroundColor ?? "#10b981"}
                  onChange={(e) =>
                    handleUpdate({
                      acceptButtonBackgroundColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Attend button text color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.acceptButtonTextColor ?? "#ffffff"}
                  onChange={(e) =>
                    handleUpdate({
                      acceptButtonTextColor: e.target.value,
                    })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.acceptButtonTextColor ?? "#ffffff"}
                  onChange={(e) =>
                    handleUpdate({
                      acceptButtonTextColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Attend hover color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={
                    localTheme.acceptButtonHoverBackgroundColor ?? "#059669"
                  }
                  onChange={(e) =>
                    handleUpdate({
                      acceptButtonHoverBackgroundColor: e.target.value,
                    })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={
                    localTheme.acceptButtonHoverBackgroundColor ?? "#059669"
                  }
                  onChange={(e) =>
                    handleUpdate({
                      acceptButtonHoverBackgroundColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Decline button color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.declineButtonBackgroundColor ?? "#ef4444"}
                  onChange={(e) =>
                    handleUpdate({
                      declineButtonBackgroundColor: e.target.value,
                    })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.declineButtonBackgroundColor ?? "#ef4444"}
                  onChange={(e) =>
                    handleUpdate({
                      declineButtonBackgroundColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Decline hover color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={
                    localTheme.declineButtonHoverBackgroundColor ?? "#dc2626"
                  }
                  onChange={(e) =>
                    handleUpdate({
                      declineButtonHoverBackgroundColor: e.target.value,
                    })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={
                    localTheme.declineButtonHoverBackgroundColor ?? "#dc2626"
                  }
                  onChange={(e) =>
                    handleUpdate({
                      declineButtonHoverBackgroundColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Button radius
                </label>
                <input
                  type="text"
                  value={localTheme.buttonBorderRadius ?? "12px"}
                  onChange={(e) =>
                    handleUpdate({ buttonBorderRadius: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="12px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Button padding
                </label>
                <input
                  type="text"
                  value={localTheme.buttonPadding ?? "12px 20px"}
                  onChange={(e) =>
                    handleUpdate({ buttonPadding: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="12px 20px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Footer Text
            </h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localTheme.footerEnabled ?? false}
                onChange={(e) =>
                  handleUpdate({ footerEnabled: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Enable footer text</span>
            </label>
          </div>
          {localTheme.footerEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Footer text
                </label>
                <textarea
                  value={localTheme.footerText ?? ""}
                  onChange={(e) =>
                    handleUpdate({ footerText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="e.g. Thank you for your response."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Footer text color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localTheme.footerTextColor ?? "#6b7280"}
                    onChange={(e) =>
                      handleUpdate({ footerTextColor: e.target.value })
                    }
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localTheme.footerTextColor ?? "#6b7280"}
                    onChange={(e) =>
                      handleUpdate({ footerTextColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Footer background
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localTheme.footerBackgroundColor ?? "#f9fafb"}
                    onChange={(e) =>
                      handleUpdate({ footerBackgroundColor: e.target.value })
                    }
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localTheme.footerBackgroundColor ?? "#f9fafb"}
                    onChange={(e) =>
                      handleUpdate({ footerBackgroundColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Footer alignment
                </label>
                <select
                  value={localTheme.footerAlignment ?? "center"}
                  onChange={(e) =>
                    handleUpdate({
                      footerAlignment: e.target.value as
                        | "left"
                        | "center"
                        | "right",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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
