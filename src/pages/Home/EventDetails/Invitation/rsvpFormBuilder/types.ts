/**
 * RSVP Form Builder types – form with customizable fields (like Advance Registration)
 * plus header banner and footer banner.
 */

/** Field types – like Advance Registration (number, textarea, date, dropdown, checkbox, paragraph, divider, heading). */
export type RsvpFieldType =
  | "text"
  | "phone"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "paragraph"
  | "divider"
  | "heading";

/** Optional input variant (e.g. phone with country code) */
export type RsvpFormFieldInputVariant = "phone" | "default";

export interface RsvpFormFieldOption {
  label: string;
  value: string;
  labelTranslations?: { en?: string; ar?: string };
}

export interface RsvpFormField {
  id: string;
  type: RsvpFieldType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  /** Step 1: show/hide – when false, field is hidden in preview */
  visible?: boolean;
  /** Optional translations for dual-language */
  labelTranslations?: { en?: string; ar?: string };
  placeholderTranslations?: { en?: string; ar?: string };
  /** Like Advance Registration: "phone" for country code + number (when type === "phone") */
  inputVariant?: RsvpFormFieldInputVariant;
  /** For select, radio: options list */
  options?: RsvpFormFieldOption[];
  /** For paragraph, heading: text content */
  content?: string;
  contentTranslations?: { en?: string; ar?: string };
  /** For heading: size/style */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** For number: min/max */
  min?: number;
  max?: number;
  /** Per-field styling (like Advance Registration FieldConfigPanel custom styling) */
  fieldStyle?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    padding?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    margin?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    textColor?: string;
    labelColor?: string;
    textAlign?: "left" | "center" | "right" | "justify";
    fontSize?: string;
    height?: string;
    width?: string;
  };
  /** Layout: container / row / column (like Advance Registration). When set, field acts as a wrapper. */
  containerType?: "row" | "column" | "container";
  /** IDs of child fields when this field is a container */
  children?: string[];
  /** Layout styling for containers */
  layoutProps?: {
    gap?: string;
    padding?: string;
    justifyContent?: string;
    alignItems?: string;
    flexDirection?: "row" | "column";
    flexWrap?: "wrap" | "nowrap";
    backgroundColor?: string;
    borderRadius?: string;
  };
}

/** @deprecated Use RsvpFormField.type and .name instead */
export type RsvpFormFieldName =
  | "first_name"
  | "last_name"
  | "phone_number";

export type RsvpLanguageMode = "single" | "dual";
export type RsvpPrimaryLanguage = "en" | "ar";

export interface RsvpLanguageConfig {
  languageMode: RsvpLanguageMode;
  primaryLanguage?: RsvpPrimaryLanguage;
}

export interface RsvpTheme {
  /** Header banner image at top (File or URL string) */
  bannerImage?: File | string | null;
  formPadding?: string;
  formBackgroundColor?: string;
  formBorderRadius?: string;
  formMaxWidth?: string;
  formAlignment?: "left" | "center" | "right";
  /** Step 3: alignment of form fields + buttons block inside the form */
  formFieldsAlignment?: "left" | "center" | "right";
  formBorderColor?: string;
  formBackgroundImage?: string | File | null;
  /** Footer banner image at bottom (File or URL string) */
  footerBannerImage?: File | string | null;
  footerEnabled?: boolean;
  footerText?: string;
  footerTextColor?: string;
  footerBackgroundColor?: string;
  footerPadding?: string;
  footerFontSize?: string;
  footerAlignment?: "left" | "center" | "right";
  bannerMarginTop?: string;
  bannerMarginRight?: string;
  bannerMarginBottom?: string;
  bannerMarginLeft?: string;
  footerMarginTop?: string;
  footerMarginRight?: string;
  footerMarginBottom?: string;
  footerMarginLeft?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  bodyBackgroundColor?: string;
  bodyTextColor?: string;
  /** Typography: heading (in-form headings), label, body text */
  headingColor?: string;
  labelColor?: string;
  textColor?: string;
  /** Input field styling (like Advance Registration) */
  inputBorderColor?: string;
  inputBackgroundColor?: string;
  inputBorderRadius?: string;
  inputPadding?: string;
  inputFocusBorderColor?: string;
  inputTextColor?: string;
  inputPlaceholderColor?: string;
  /** Buttons */
  acceptButtonBackgroundColor?: string;
  acceptButtonTextColor?: string;
  declineButtonBackgroundColor?: string;
  declineButtonTextColor?: string;
  acceptButtonHoverBackgroundColor?: string;
  declineButtonHoverBackgroundColor?: string;
  buttonBorderRadius?: string;
  buttonPadding?: string;
  acceptButtonText?: string;
  declineButtonText?: string;
  acceptButtonTranslations?: { en?: string; ar?: string };
  declineButtonTranslations?: { en?: string; ar?: string };
  /** Optional message shown in the form above Attend/Decline buttons (e.g. "Thank you for responding") */
  acceptMessage?: string;
  declineMessage?: string;
  acceptMessageTranslations?: { en?: string; ar?: string };
  declineMessageTranslations?: { en?: string; ar?: string };
}

export interface RsvpFormBuilderTemplate {
  id: string;
  title: string;
  formFields: RsvpFormField[];
  theme: RsvpTheme;
  languageConfig: RsvpLanguageConfig;
  createdAt: string;
  updatedAt?: string;
}

/** Default form fields: empty – user adds layout and fields from the palette. */
export function getDefaultRsvpFormFields(): RsvpFormField[] {
  return [];
}

/** Create a new field of the given type for "Add field" in palette */
export function createRsvpFormField(type: RsvpFieldType): RsvpFormField {
  const id = `${type}-${Date.now()}`;
  const name = ["paragraph", "divider", "heading"].includes(type) ? id : `${type}_${Date.now()}`;
  const defaults: Record<RsvpFieldType, Partial<RsvpFormField>> = {
    text: { label: "Text", placeholder: "Enter text", required: false },
    phone: { label: "Phone number", placeholder: "Enter phone", required: false, inputVariant: "default" },
    number: { label: "Number", placeholder: "0", required: false },
    date: { label: "Date", placeholder: "", required: false },
    textarea: { label: "Message", placeholder: "Enter message", required: false },
    select: { label: "Select", placeholder: "Choose...", required: false, options: [{ label: "Option 1", value: "opt1" }, { label: "Option 2", value: "opt2" }] },
    radio: { label: "Choice", required: false, options: [{ label: "Option A", value: "a" }, { label: "Option B", value: "b" }] },
    checkbox: { label: "Checkbox", required: false },
    paragraph: { label: "", content: "Paragraph text here.", required: false },
    divider: { label: "", required: false },
    heading: { label: "", content: "Heading", required: false, headingLevel: 3 },
  };
  const d = defaults[type] ?? {};
  return {
    id,
    type,
    name: type === "heading" || type === "paragraph" || type === "divider" ? id : name,
    label: d.label ?? type,
    placeholder: d.placeholder,
    required: d.required ?? false,
    visible: true,
    options: d.options,
    content: d.content,
    headingLevel: d.headingLevel,
    inputVariant: d.inputVariant,
  } as RsvpFormField;
}
