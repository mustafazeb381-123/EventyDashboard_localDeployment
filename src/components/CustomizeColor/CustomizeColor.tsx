import React, { useState } from "react";

const CustomizeColorPicker = () => {
  const [colors, setColors] = useState({
    primary: "#202242",
    secondary: "#FB64B6",
  });

  const handleColorChange = (type: "primary" | "secondary", value: string) => {
    setColors((prev) => ({ ...prev, [type]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 w-full max-w-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-3">
        Brand Colors
      </h3>

      {/* Primary Color */}
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm text-gray-600">Primary Color</label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={colors.primary}
              onChange={(e) => handleColorChange("primary", e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div
              className="w-8 h-8 rounded-md border border-gray-300"
              style={{ backgroundColor: colors.primary }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {colors.primary.replace("#", "").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Secondary Color */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-600">Secondary Color</label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={colors.secondary}
              onChange={(e) => handleColorChange("secondary", e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div
              className="w-8 h-8 rounded-md border border-gray-300"
              style={{ backgroundColor: colors.secondary }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {colors.secondary.replace("#", "").toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomizeColorPicker;
