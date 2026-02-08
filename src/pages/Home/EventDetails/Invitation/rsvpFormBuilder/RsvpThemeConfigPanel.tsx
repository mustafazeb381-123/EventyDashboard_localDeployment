import React from "react";
import { X } from "lucide-react";
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
  const [localTheme, setLocalTheme] = React.useState<RsvpTheme>(() => ({
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
    ...theme,
  }));

  React.useEffect(() => {
    setLocalTheme((prev) => ({ ...prev, ...theme }));
  }, [theme]);

  const handleUpdate = (updates: Partial<RsvpTheme>) => {
    const next = { ...localTheme, ...updates };
    setLocalTheme(next);
    onUpdate(next);
  };

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            RSVP Theme &amp; Layout
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Form container, footer text, and colors
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
        {/* Form container */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Form Container
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Padding</label>
              <input
                type="text"
                value={localTheme.formPadding ?? "24px"}
                onChange={(e) => handleUpdate({ formPadding: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="24px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Background</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.formBackgroundColor ?? "#ffffff"}
                  onChange={(e) => handleUpdate({ formBackgroundColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.formBackgroundColor ?? "#ffffff"}
                  onChange={(e) => handleUpdate({ formBackgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Max width</label>
              <input
                type="text"
                value={localTheme.formMaxWidth ?? "768px"}
                onChange={(e) => handleUpdate({ formMaxWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="768px"
              />
            </div>
          </div>
        </div>

        {/* Footer text (banner/footer image are set in the preview) */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Footer Text
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localTheme.footerEnabled ?? false}
                onChange={(e) => handleUpdate({ footerEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Enable footer text</span>
            </label>
            {localTheme.footerEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Footer text</label>
                  <textarea
                    value={localTheme.footerText ?? ""}
                    onChange={(e) => handleUpdate({ footerText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={3}
                    placeholder="e.g. Thank you for your response."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Footer text color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localTheme.footerTextColor ?? "#6b7280"}
                      onChange={(e) => handleUpdate({ footerTextColor: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localTheme.footerTextColor ?? "#6b7280"}
                      onChange={(e) => handleUpdate({ footerTextColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Footer alignment</label>
                  <select
                    value={localTheme.footerAlignment ?? "center"}
                    onChange={(e) =>
                      handleUpdate({
                        footerAlignment: e.target.value as "left" | "center" | "right",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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

        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Block colors (Header / Body / Buttons)
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Background
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Text color
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Body
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Background
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Text color
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Attend &amp; Decline buttons
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                  handleUpdate({ declineButtonText: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g. Decline, No I Can't Attend"
              />
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
