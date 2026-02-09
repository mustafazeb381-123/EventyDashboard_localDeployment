import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, MapPin, Info, QrCode, Calendar, Clock, Image } from "lucide-react";
import type {
  ConfirmationBlock,
  ConfirmationBlockOptions,
  ConfirmationPreviewData,
  BlockTheme,
  BlockHeadingSize,
  BlockSpacerSize,
  DividerStyle,
  CustomTextSize,
} from "./types";
import {
  getContainerClasses,
  getBlockContainerStyle,
  getFontWeightClass,
  getTextColorClass,
  getIconBgStyle,
  getSublabelStyle,
  getIconColorStyle,
} from "./styleHelpers";

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return "";
  try {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

function alignmentClass(align: ConfirmationBlockOptions["alignment"]): string {
  if (!align || align === "center") return "text-center";
  if (align === "left") return "text-left";
  return "text-right";
}

function flexAlignClass(align: ConfirmationBlockOptions["alignment"]): string {
  if (!align || align === "center") return "justify-center";
  if (align === "left") return "justify-start";
  return "justify-end";
}

const THEME_STYLES: Record<
  BlockTheme,
  { bg: string; border: string; icon: string; text: string; textMuted: string }
> = {
  green: {
    bg: "bg-gradient-to-r from-green-50 to-emerald-50",
    border: "border-green-200",
    icon: "bg-green-500",
    text: "text-green-800",
    textMuted: "text-green-600",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    border: "border-blue-200",
    icon: "bg-blue-500",
    text: "text-blue-800",
    textMuted: "text-blue-600",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-pink-50",
    border: "border-purple-200",
    icon: "bg-purple-500",
    text: "text-purple-800",
    textMuted: "text-purple-600",
  },
  orange: {
    bg: "bg-gradient-to-r from-orange-50 to-amber-50",
    border: "border-orange-200",
    icon: "bg-orange-500",
    text: "text-orange-800",
    textMuted: "text-orange-600",
  },
  gray: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: "bg-gray-500",
    text: "text-gray-800",
    textMuted: "text-gray-600",
  },
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: "bg-slate-600",
    text: "text-slate-800",
    textMuted: "text-slate-600",
  },
};

const HEADING_CLASSES: Record<BlockHeadingSize, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const SPACER_HEIGHTS: Record<BlockSpacerSize, string> = {
  sm: "h-4",
  md: "h-8",
  lg: "h-12",
};

const TEXT_SIZE_CLASSES: Record<CustomTextSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

interface ConfirmationPreviewProps {
  blocks: ConfirmationBlock[];
  data: ConfirmationPreviewData;
  className?: string;
}

export function ConfirmationPreview({
  blocks,
  data,
  className = "",
}: ConfirmationPreviewProps) {
  const eventName = data.eventName || "Event Name";
  const attendeeName = data.attendeeName || "John Doe";
  const location = data.location ?? "—";
  const about = data.about ?? "";
  const logoUrl = data.logoUrl;
  /** Real user QR payload when on confirmation page; sample value in builder preview */
  const qrValue = data.qrValue ?? "SAMPLE-USER-QR-PREVIEW";

  const dateRange =
    data.eventDateFrom && data.eventDateTo && data.eventDateFrom !== data.eventDateTo
      ? `${formatDate(data.eventDateFrom)} – ${formatDate(data.eventDateTo)}`
      : formatDate(data.eventDateFrom) || "—";
  const timeRange =
    data.eventTimeFrom && data.eventTimeTo
      ? `${formatTime(data.eventTimeFrom)} – ${formatTime(data.eventTimeTo)}`
      : formatTime(data.eventTimeFrom) || "—";

  const getTheme = (block: ConfirmationBlock): BlockTheme =>
    (block.options?.theme as BlockTheme) || "green";

  const containerClass = (opts: ConfirmationBlockOptions, themeStyles: typeof THEME_STYLES[BlockTheme]) => {
    const base = getContainerClasses(opts);
    const theme = (opts.theme as BlockTheme) || "green";
    const t = themeStyles[theme];
    return `${base} ${opts.backgroundColor ? "" : t.bg} ${opts.borderColor ? "" : t.border}`;
  };

  const QR_SIZES = { sm: 80, md: 112, lg: 144 } as const;

  const renderBlock = (block: ConfirmationBlock) => {
    const opts = block.options ?? {};
    const align = opts.alignment ?? "center";
    const theme = getTheme(block);
    const styles = THEME_STYLES[theme];
    const containerStyle = getBlockContainerStyle(opts);
    const iconStyle = getIconBgStyle(opts);

    switch (block.type) {
      case "success_badge": {
        const badgeTheme = (opts.theme as BlockTheme) || "green";
        const s = THEME_STYLES[badgeTheme];
        const iconBg = opts.iconBackgroundColor?.startsWith("#") ? opts.iconBackgroundColor : undefined;
        const iconColorStyle = getIconColorStyle(opts);
        const sublabelStyle = getSublabelStyle(opts);
        const innerAlign =
          align === "left" ? "items-start text-left" : align === "right" ? "items-end text-right" : "items-center text-center";
        return (
          <div key={block.id} className={`flex ${flexAlignClass(align)} py-6`}>
            <div className={`flex flex-col ${innerAlign} w-full max-w-md`}>
              <div
                className={`w-20 h-20 mb-3 rounded-full flex items-center justify-center shadow-lg shrink-0 ${iconBg ? "" : s.icon} ${Object.keys(iconColorStyle).length ? "" : "text-white"}`}
                style={{ ...(iconBg ? { backgroundColor: iconBg } : {}), ...iconColorStyle }}
              >
                <Check size={32} strokeWidth={3} />
              </div>
              <p
                className={`${getFontWeightClass(opts)} ${opts.headingSize ? HEADING_CLASSES[opts.headingSize] : "text-lg"} ${getTextColorClass(opts) || s.text}`}
                style={opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined}
              >
                {opts.label || "Registration Complete!"}
              </p>
              <p
                className={opts.sublabel ? "text-xs mt-1" : `${s.textMuted} text-xs mt-1`}
                style={Object.keys(sublabelStyle).length ? sublabelStyle : undefined}
              >
                {opts.sublabel || "Your registration has been confirmed"}
              </p>
            </div>
          </div>
        );
      }
      case "confirmation_message": {
        const iconColorStyle = getIconColorStyle(opts);
        const sublabelStyle = getSublabelStyle(opts);
        return (
          <div
            key={block.id}
            className={`flex items-center gap-3 ${containerClass(opts, THEME_STYLES)} ${opts.backgroundColor ? "" : styles.bg} ${opts.borderColor ? "" : styles.border}`}
            style={Object.keys(containerStyle).length ? containerStyle : undefined}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${opts.iconBackgroundColor?.startsWith("#") ? "" : styles.icon} ${Object.keys(iconColorStyle).length ? "" : "text-white"}`}
              style={{ ...(opts.iconBackgroundColor?.startsWith("#") ? { backgroundColor: opts.iconBackgroundColor } : {}), ...iconColorStyle }}
            >
              <Check size={20} strokeWidth={3} />
            </div>
            <div>
              <p
                className={`${getFontWeightClass(opts)} ${getTextColorClass(opts) || styles.text}`}
                style={opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined}
              >
                {opts.label || "Registration Confirmed Successfully!"}
              </p>
              <p
                className={`${styles.textMuted} text-xs mt-0.5`}
                style={Object.keys(sublabelStyle).length ? sublabelStyle : undefined}
              >
                You will receive a confirmation email shortly
              </p>
            </div>
          </div>
        );
      }
      case "qr_code": {
        const qrSize = (opts.qrSize as "sm" | "md" | "lg") || "md";
        const qrPx = QR_SIZES[qrSize];
        const sublabelStyle = getSublabelStyle(opts);
        return (
          <div
            key={block.id}
            className={`text-center ${containerClass(opts, THEME_STYLES)} ${opts.backgroundColor ? "" : styles.bg} ${opts.borderColor ? "" : styles.border}`}
            style={Object.keys(containerStyle).length ? containerStyle : undefined}
          >
            <div
              className={`flex items-center justify-center gap-3 mb-3 ${getTextColorClass(opts) || styles.text}`}
              style={opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined}
            >
              <QrCode size={20} className={styles.textMuted} />
              <span className={getFontWeightClass(opts)}>{opts.label || "Your Event QR Code"}</span>
            </div>
            <div className={`mx-auto bg-white rounded-xl p-3 shadow-inner flex items-center justify-center ${opts.borderColor ? "" : styles.border}`} style={{ width: qrPx + 24, height: qrPx + 24 }}>
              <QRCodeSVG
                value={qrValue}
                size={qrPx}
                level="M"
                includeMargin={false}
                className="w-full h-full"
              />
            </div>
            <p
              className={`${styles.textMuted} text-xs mt-3`}
              style={Object.keys(sublabelStyle).length ? sublabelStyle : undefined}
            >
              Present this QR code at the event entrance
            </p>
          </div>
        );
      }
      case "event_name":
        return (
          <div key={block.id} className={`${alignmentClass(align)} py-4`}>
            <h2
              className={`${getFontWeightClass(opts)} ${getTextColorClass(opts) || "text-gray-900"} ${
                opts.headingSize ? HEADING_CLASSES[opts.headingSize] : "text-2xl"
              }`}
              style={opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined}
            >
              {eventName}
            </h2>
          </div>
        );
      case "event_date_time": {
        const textStyle = opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined;
        const mutedStyle = getSublabelStyle(opts);
        return (
          <div
            key={block.id}
            className={`flex gap-4 text-sm flex-wrap ${flexAlignClass(align)} ${getTextColorClass(opts) || "text-gray-600"}`}
            style={textStyle}
          >
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="shrink-0" style={Object.keys(mutedStyle).length ? mutedStyle : { color: "var(--tw-text-opacity, #9ca3af)" }} />
              <span>{dateRange}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="shrink-0" style={Object.keys(mutedStyle).length ? mutedStyle : { color: "var(--tw-text-opacity, #9ca3af)" }} />
              <span>{timeRange}</span>
            </div>
          </div>
        );
      }
      case "location": {
        const iconColorStyle = getIconColorStyle(opts);
        const sublabelStyle = getSublabelStyle(opts);
        return (
          <div
            key={block.id}
            className={`flex items-center gap-3 ${containerClass(opts, THEME_STYLES)} ${opts.backgroundColor ? "" : styles.bg} ${opts.borderColor ? "" : styles.border}`}
            style={Object.keys(containerStyle).length ? containerStyle : undefined}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${opts.iconBackgroundColor?.startsWith("#") ? "" : styles.icon} ${Object.keys(iconColorStyle).length ? "" : "text-white"}`}
              style={{ ...(opts.iconBackgroundColor?.startsWith("#") ? { backgroundColor: opts.iconBackgroundColor } : {}), ...iconColorStyle }}
            >
              <MapPin size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p
                className={`${getFontWeightClass(opts)} ${getTextColorClass(opts) || styles.text}`}
                style={opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined}
              >
                {opts.label || "Event Location"}
              </p>
              <p
                className={`${styles.textMuted} text-xs mt-0.5`}
                style={Object.keys(sublabelStyle).length ? sublabelStyle : undefined}
              >
                {location}
              </p>
            </div>
          </div>
        );
      }
      case "event_details": {
        const sublabelStyle = getSublabelStyle(opts);
        return (
          <div
            key={block.id}
            className={`${getContainerClasses(opts)} ${opts.backgroundColor ? "" : "bg-gray-50"} border border-gray-200`}
            style={Object.keys(containerStyle).length ? containerStyle : undefined}
          >
            <h3
              className={`${getFontWeightClass(opts)} mb-2 ${getTextColorClass(opts) || "text-gray-900"}`}
              style={opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined}
            >
              {opts.label || "About Event"}
            </h3>
            <p
              className="text-sm text-gray-600 leading-relaxed"
              style={Object.keys(sublabelStyle).length ? sublabelStyle : undefined}
            >
              {about || "Event description will appear here."}
            </p>
          </div>
        );
      }
      case "attendee_name": {
        const sublabelStyle = getSublabelStyle(opts);
        return (
          <div key={block.id} className={`${alignmentClass(align)} py-2`}>
            <p
              className={`${getTextColorClass(opts) || "text-gray-700"} ${getFontWeightClass(opts)} ${
                opts.headingSize ? HEADING_CLASSES[opts.headingSize] : ""
              }`}
              style={opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined}
            >
              <span className="text-gray-500" style={Object.keys(sublabelStyle).length ? sublabelStyle : undefined}>
                {opts.label || "Attendee: "}
              </span>
              {attendeeName}
            </p>
          </div>
        );
      }
      case "event_logo":
        return (
          <div key={block.id} className={`flex ${flexAlignClass(align)} py-4`}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Event logo"
                className="max-h-24 w-auto object-contain rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                <Image size={32} className="text-gray-400" />
              </div>
            )}
          </div>
        );
      case "divider": {
        const divStyle = (opts.dividerStyle as DividerStyle) || "solid";
        const thickness = (opts.dividerThickness as "1" | "2" | "3") || "1";
        const borderClass =
          divStyle === "dashed"
            ? "border-dashed"
            : divStyle === "dotted"
              ? "border-dotted"
              : "border-solid";
        const hrStyle: React.CSSProperties = { borderWidth: `${thickness}px` };
        if (opts.dividerColor?.startsWith("#")) hrStyle.borderColor = opts.dividerColor;
        return (
          <hr
            key={block.id}
            className={`my-4 border-gray-300 ${borderClass}`}
            style={hrStyle}
          />
        );
      }
      case "spacer": {
        const size = (opts.spacerSize as BlockSpacerSize) || "md";
        return (
          <div key={block.id} className={SPACER_HEIGHTS[size]} />
        );
      }
      case "custom_text": {
        const textSize = (opts.textSize as CustomTextSize) || "md";
        return (
          <div
            key={block.id}
            className={`${getContainerClasses(opts)} ${opts.backgroundColor ? "" : "bg-gray-50"} border border-gray-200 ${alignmentClass(align)}`}
            style={Object.keys(containerStyle).length ? containerStyle : undefined}
          >
            <p
              className={`whitespace-pre-wrap ${TEXT_SIZE_CLASSES[textSize]} ${getFontWeightClass(opts)} ${opts.italic ? "italic" : ""} ${getTextColorClass(opts) || "text-gray-700"}`}
              style={opts.textColor?.startsWith("#") ? { color: opts.textColor } : undefined}
            >
              {block.text || "Your custom text"}
            </p>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="space-y-4">
        {blocks.map((block) => renderBlock(block))}
      </div>
    </div>
  );
}
