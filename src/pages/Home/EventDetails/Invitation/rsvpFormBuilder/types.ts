/**
 * RSVP Template Editor types – content blocks, form fields, and layout containers.
 */

/** All field types: form inputs + content + layout (layout uses containerType) */
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
  | "heading"
  | "image"
  | "icon";

export interface RsvpLayoutProps {
  gap?: string;
  padding?: string;
  margin?: string;
  justifyContent?: string;
  alignItems?: string;
  flexDirection?: "row" | "column";
  flexWrap?: "wrap" | "nowrap";
  minHeight?: string;
  backgroundColor?: string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
}

export interface RsvpFormField {
  id: string;
  type: RsvpFieldType;
  name: string;
  /** Display label for form fields */
  label?: string;
  /** Placeholder for inputs */
  placeholder?: string;
  required?: boolean;
  /** If false, hidden in final form (builder-only) */
  visible?: boolean;
  /** Text content for paragraph and heading */
  content?: string;
  contentTranslations?: { en?: string; ar?: string };
  /** For heading: size/style */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Layout container: container (column), row, or column */
  containerType?: "container" | "row" | "column";
  /** Child field IDs when this is a container */
  children?: string[];
  /** Layout styling when containerType is set */
  layoutProps?: RsvpLayoutProps;
  /** Options for select, radio, checkbox */
  options?: { label: string; value: string }[];
  /** Enhanced styling for text elements */
  fieldStyle?: {
    /** Border styling */
    borderColor?: string;
    borderWidth?: string;
    borderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
    borderRadius?: string;
    /** Background */
    backgroundColor?: string;
    /** Padding */
    padding?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    /** Margin */
    margin?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    /** Text styling */
    textColor?: string;
    textAlign?: "left" | "center" | "right" | "justify";
    fontSize?: string;
    fontWeight?: "normal" | "bold" | "lighter" | "bolder" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
    fontStyle?: "normal" | "italic" | "oblique";
    textDecoration?: "none" | "underline" | "overline" | "line-through";
    lineHeight?: string;
    letterSpacing?: string;
    /** Layout */
    width?: string;
    maxWidth?: string;
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
  /** Banner image dimensions */
  bannerHeight?: string;
  bannerWidth?: string;
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
  /** Reason fields for Attend/Decline buttons */
  acceptReasonRequired?: boolean;
  declineReasonRequired?: boolean;
  acceptReasonPlaceholder?: string;
  declineReasonPlaceholder?: string;
  acceptReasonLabel?: string;
  declineReasonLabel?: string;
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

/** Default: empty – user adds content elements */
export function getDefaultRsvpFormFields(): RsvpFormField[] {
  return [];
}

/** Create a new form or content element */
export function createRsvpFormField(type: RsvpFieldType): RsvpFormField {
  const id = `${type}-${Date.now()}`;
  const name = id.replace(/-/g, "_");
  const defaults: Record<RsvpFieldType, Partial<RsvpFormField>> = {
    text: { label: "Text", placeholder: "Enter text", name },
    phone: { label: "Phone", placeholder: "+1 (555) 000-0000", name: "phone_number" },
    number: { label: "Number", placeholder: "0", name },
    date: { label: "Date", placeholder: "", name },
    textarea: { label: "Textarea", placeholder: "Enter text", name },
    select: {
      label: "Dropdown",
      placeholder: "Select...",
      name,
      options: [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ],
    },
    radio: {
      label: "Radio",
      placeholder: "",
      name,
      options: [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ],
    },
    checkbox: {
      label: "Checkbox",
      placeholder: "",
      name,
      options: [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ],
    },
    paragraph: { content: "Click to edit text", name: id },
    divider: { content: "", name: id },
    heading: { content: "Heading", headingLevel: 3, name: id },
    image: { content: "", name: id },
    icon: { content: "", name: id },
  };
  const d = defaults[type] ?? {};
  return {
    id,
    type,
    name: d.name ?? name,
    label: d.label,
    placeholder: d.placeholder,
    required: false,
    visible: true,
    content: d.content,
    headingLevel: d.headingLevel,
    options: d.options,
  } as RsvpFormField;
}

/** Create a layout field (Container, Row, or Column) for the RSVP form builder */
export function createRsvpLayoutField(
  containerType: "container" | "row" | "column"
): RsvpFormField {
  const id = `${containerType}-${Date.now()}`;
  const label =
    containerType === "container"
      ? "Container"
      : containerType === "row"
        ? "Row"
        : "Column";
  const isRow = containerType === "row";
  return {
    id,
    type: "paragraph",
    name: id,
    label,
    required: false,
    visible: true,
    content: "",
    containerType,
    children: [],
    layoutProps: {
      gap: "16px",
      padding: isRow ? "12px" : "16px",
      justifyContent: "flex-start",
      alignItems: isRow ? "center" : "stretch",
      flexDirection: isRow ? "row" : "column",
      flexWrap: isRow ? "wrap" : "nowrap",
      borderWidth: "1px",
      borderColor: containerType === "container" ? "#c4b5fd" : containerType === "row" ? "#93c5fd" : "#67e8f9",
      borderStyle: "dashed",
      borderRadius: "8px",
      minHeight: "48px",
    },
  };
}
