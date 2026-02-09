/**
 * Block types available in the custom confirmation template.
 * Data for these comes from event/registration — no manual input in the builder.
 */
export type ConfirmationBlockType =
  | "success_badge"
  | "confirmation_message"
  | "qr_code"
  | "event_name"
  | "event_date_time"
  | "location"
  | "event_details"
  | "attendee_name"
  | "event_logo"
  | "divider"
  | "spacer"
  | "custom_text";

export type BlockAlignment = "left" | "center" | "right";
export type BlockHeadingSize = "sm" | "md" | "lg";
export type BlockSpacerSize = "sm" | "md" | "lg";
export type BlockTheme =
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "gray"
  | "slate";
export type DividerStyle = "solid" | "dashed" | "dotted";
export type CustomTextSize = "sm" | "md" | "lg";

// Advanced styling
export type PaddingSize = "none" | "sm" | "md" | "lg";
export type BorderWidth = "0" | "1" | "2" | "4";
export type BorderRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";
export type ShadowSize = "none" | "sm" | "md" | "lg";
export type FontWeight = "normal" | "medium" | "semibold" | "bold";
export type DividerThickness = "1" | "2" | "3";
export type TextColorPreset =
  | "default"
  | "gray"
  | "muted"
  | "primary"
  | "white"
  | "black";

export interface ConfirmationBlockOptions {
  alignment?: BlockAlignment;
  headingSize?: BlockHeadingSize;
  spacerSize?: BlockSpacerSize;
  theme?: BlockTheme;
  dividerStyle?: DividerStyle;
  dividerThickness?: DividerThickness;
  dividerColor?: string; // hex or Tailwind name
  textSize?: CustomTextSize;
  bold?: boolean;
  italic?: boolean;
  fontWeight?: FontWeight;
  label?: string;
  sublabel?: string;

  // Advanced: layout & container
  paddingSize?: PaddingSize;
  borderWidth?: BorderWidth;
  borderColor?: string;
  borderRadius?: BorderRadius;
  shadow?: ShadowSize;

  // Advanced: colors (override theme) — full control
  backgroundColor?: string; // hex e.g. "#f0f9ff"
  textColor?: TextColorPreset | string; // preset or hex — main/label text
  sublabelColor?: string; // hex — secondary/muted text (sublabel, caption, body)
  borderColor?: string; // hex — container border
  iconBackgroundColor?: string; // hex — circle behind icon
  iconColor?: string; // hex — icon stroke/fill (e.g. checkmark, map pin)

  // QR block: size
  qrSize?: "sm" | "md" | "lg"; // 80, 112, 144
}

export interface ConfirmationBlock {
  id: string;
  type: ConfirmationBlockType;
  text?: string;
  options?: ConfirmationBlockOptions;
}

export interface ConfirmationTemplateConfig {
  blocks: ConfirmationBlock[];
}

export interface ConfirmationPreviewData {
  eventName?: string;
  eventDateFrom?: string;
  eventDateTo?: string;
  eventTimeFrom?: string;
  eventTimeTo?: string;
  location?: string;
  about?: string;
  attendeeName?: string;
  logoUrl?: string | null;
  qrValue?: string | null;
}

export const BLOCK_LABELS: Record<ConfirmationBlockType, string> = {
  success_badge: "Success badge",
  confirmation_message: "Confirmation message",
  qr_code: "QR code",
  event_name: "Event name",
  event_date_time: "Event date & time",
  location: "Location",
  event_details: "Event details (about)",
  attendee_name: "Attendee name",
  event_logo: "Event logo",
  divider: "Divider line",
  spacer: "Spacer",
  custom_text: "Custom text",
};

export const THEME_LABELS: Record<BlockTheme, string> = {
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  orange: "Orange",
  gray: "Gray",
  slate: "Slate",
};

export const ALIGNMENT_OPTIONS: { value: BlockAlignment; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export const HEADING_SIZE_OPTIONS: { value: BlockHeadingSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const SPACER_SIZE_OPTIONS: { value: BlockSpacerSize; label: string }[] = [
  { value: "sm", label: "Small (1rem)" },
  { value: "md", label: "Medium (2rem)" },
  { value: "lg", label: "Large (3rem)" },
];

export const DIVIDER_STYLE_OPTIONS: { value: DividerStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

export const PADDING_OPTIONS: { value: PaddingSize; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const BORDER_WIDTH_OPTIONS: { value: BorderWidth; label: string }[] = [
  { value: "0", label: "None" },
  { value: "1", label: "Thin" },
  { value: "2", label: "Medium" },
  { value: "4", label: "Thick" },
];

export const BORDER_RADIUS_OPTIONS: { value: BorderRadius; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
  { value: "full", label: "Full (pill)" },
];

export const SHADOW_OPTIONS: { value: ShadowSize; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const FONT_WEIGHT_OPTIONS: { value: FontWeight; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
];

export const TEXT_COLOR_OPTIONS: { value: TextColorPreset; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "gray", label: "Gray" },
  { value: "muted", label: "Muted" },
  { value: "primary", label: "Primary" },
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
];

export const DIVIDER_THICKNESS_OPTIONS: { value: DividerThickness; label: string }[] = [
  { value: "1", label: "1px" },
  { value: "2", label: "2px" },
  { value: "3", label: "3px" },
];

export const QR_SIZE_OPTIONS: { value: "sm" | "md" | "lg"; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];
