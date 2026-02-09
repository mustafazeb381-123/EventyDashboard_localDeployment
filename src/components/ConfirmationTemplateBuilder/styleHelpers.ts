import type { ConfirmationBlockOptions } from "./types";
import type { PaddingSize, BorderWidth, BorderRadius, ShadowSize, FontWeight, TextColorPreset } from "./types";

const PADDING_CLASSES: Record<NonNullable<PaddingSize>, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const BORDER_WIDTH_CLASSES: Record<NonNullable<BorderWidth>, string> = {
  "0": "border-0",
  "1": "border",
  "2": "border-2",
  "4": "border-4",
};

const BORDER_RADIUS_CLASSES: Record<NonNullable<BorderRadius>, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  full: "rounded-full",
};

const SHADOW_CLASSES: Record<NonNullable<ShadowSize>, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

const FONT_WEIGHT_CLASSES: Record<NonNullable<FontWeight>, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const TEXT_COLOR_CLASSES: Record<TextColorPreset, string> = {
  default: "text-gray-900",
  gray: "text-gray-600",
  muted: "text-gray-500",
  primary: "text-blue-700",
  white: "text-white",
  black: "text-black",
};

export function getContainerClasses(opts: ConfirmationBlockOptions): string {
  const parts: string[] = [];
  parts.push(PADDING_CLASSES[opts.paddingSize ?? "md"]);
  parts.push(BORDER_WIDTH_CLASSES[opts.borderWidth ?? "2"]);
  parts.push(BORDER_RADIUS_CLASSES[opts.borderRadius ?? "lg"]);
  parts.push(SHADOW_CLASSES[opts.shadow ?? "sm"]);
  return parts.filter(Boolean).join(" ");
}

export function getFontWeightClass(opts: ConfirmationBlockOptions): string {
  if (opts.bold) return "font-bold";
  return FONT_WEIGHT_CLASSES[opts.fontWeight ?? "normal"];
}

export function getTextColorClass(opts: ConfirmationBlockOptions): string {
  if (!opts.textColor) return "";
  if (opts.textColor.startsWith("#")) return ""; // use style
  return TEXT_COLOR_CLASSES[opts.textColor as TextColorPreset] ?? "";
}

export function getBlockContainerStyle(opts: ConfirmationBlockOptions): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (opts.backgroundColor?.startsWith("#")) style.backgroundColor = opts.backgroundColor;
  if (opts.borderColor?.startsWith("#")) {
    style.borderColor = opts.borderColor;
    if (!opts.borderWidth || opts.borderWidth !== "0") style.borderWidth = `${opts.borderWidth ?? 2}px`;
  }
  if (opts.textColor?.startsWith("#")) style.color = opts.textColor;
  return style;
}

export function getIconBgStyle(opts: ConfirmationBlockOptions): React.CSSProperties {
  if (opts.iconBackgroundColor?.startsWith("#"))
    return { backgroundColor: opts.iconBackgroundColor };
  return {};
}

/** Inline style for sublabel/muted text when hex is set */
export function getSublabelStyle(opts: ConfirmationBlockOptions): React.CSSProperties {
  if (opts.sublabelColor?.startsWith("#")) return { color: opts.sublabelColor };
  return {};
}

/** Inline style for icon (stroke/fill) when hex is set */
export function getIconColorStyle(opts: ConfirmationBlockOptions): React.CSSProperties {
  if (opts.iconColor?.startsWith("#")) return { color: opts.iconColor };
  return {};
}
