import type { FormTheme } from "../types";

type FormHeaderProps = {
  theme?: FormTheme | null;
};

export function FormHeader({ theme }: FormHeaderProps) {
  // Only render if there are event details (name, description, location, date)
  if (!(theme?.eventName || theme?.eventDescription || theme?.eventLocation || theme?.eventDate)) {
    return null;
  }

  return (
    <div
      className="w-full py-6 px-6"
      style={{
        textAlign: theme?.eventDetailsAlignment || "left",
      }}
    >
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
                  theme?.eventDetailsAlignment === "center"
                    ? "center"
                    : theme?.eventDetailsAlignment === "right"
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
