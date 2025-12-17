import { useEffect, useState } from "react";

import type { FormTheme } from "../types";

type FormHeaderProps = {
  theme?: FormTheme | null;
};

export function FormHeader({ theme }: FormHeaderProps) {
  const [logoObjectUrl, setLogoObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!theme?.logo || typeof theme.logo === "string") {
      setLogoObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(theme.logo);
    setLogoObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [theme?.logo]);

  const logoSrc =
    typeof theme?.logo === "string" ? theme.logo : logoObjectUrl || "";

  if (!(theme?.logo || theme?.eventName || theme?.eventDescription)) {
    return null;
  }

  return (
    <div
      className={`w-full py-6 px-6 flex gap-6 items-center ${
        theme?.logoPosition === "center" ? "flex-col text-center" : ""
      }`}
      style={{
        flexDirection:
          theme?.logoPosition === "right"
            ? "row-reverse"
            : theme?.logoPosition === "center"
            ? "column"
            : "row",
        justifyContent:
          theme?.logoPosition === "center" ? "center" : "flex-start",
        textAlign:
          theme?.logoPosition === "center"
            ? "center"
            : theme?.logoPosition === "right"
            ? "right"
            : "left",
      }}
    >
      {theme?.logo && (
        <img
          src={logoSrc}
          alt="Form logo"
          style={{
            width: theme.logoWidth || "100px",
            height: theme.logoHeight || "auto",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      )}

      {(theme?.eventName ||
        theme?.eventDescription ||
        theme?.eventLocation ||
        theme?.eventDate) && (
        <div
          className="flex-1"
          style={{ color: theme?.eventDetailsColor || "#111827" }}
        >
          {theme.eventName && (
            <h1 className="text-2xl font-bold mb-2">{theme.eventName}</h1>
          )}
          {theme.eventDescription && (
            <p
              className="text-gray-600 mb-3"
              style={{
                color: theme?.eventDetailsColor
                  ? `${theme.eventDetailsColor}CC`
                  : undefined,
              }}
            >
              {theme.eventDescription}
            </p>
          )}
          {(theme.eventLocation || theme.eventDate) && (
            <div
              className="flex gap-4 text-sm font-medium opacity-80"
              style={{
                justifyContent:
                  theme?.logoPosition === "center"
                    ? "center"
                    : theme?.logoPosition === "right"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              {theme.eventDate && (
                <span className="flex items-center gap-1">
                  📅 {theme.eventDate}
                </span>
              )}
              {theme.eventLocation && (
                <span className="flex items-center gap-1">
                  📍 {theme.eventLocation}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
