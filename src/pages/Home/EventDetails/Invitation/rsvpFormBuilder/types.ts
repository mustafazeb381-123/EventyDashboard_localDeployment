/**
 * RSVP Template Editor types – simplified text editor with styling
 * plus header banner and footer banner.
 */

/** Text element types – only text-based elements (no form inputs) */
export type RsvpFieldType = "paragraph" | "heading" | "divider";

export interface RsvpFormField {
  id: string;
  type: RsvpFieldType;
  name: string;
  /** Text content for paragraph and heading */
  content?: string;
  contentTranslations?: { en?: string; ar?: string };
  /** For heading: size/style */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
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

/** Default text elements: empty – user adds text elements */
export function getDefaultRsvpFormFields(): RsvpFormField[] {
  return [];
}

/** Create a new text element */
export function createRsvpFormField(type: RsvpFieldType): RsvpFormField {
  const id = `${type}-${Date.now()}`;
  const defaults: Record<RsvpFieldType, Partial<RsvpFormField>> = {
    paragraph: { content: "Click to edit text", name: id },
    divider: { content: "", name: id },
    heading: { content: "Heading", headingLevel: 3, name: id },
  };
  const d = defaults[type] ?? {};
  return {
    id,
    type,
    name: id,
    content: d.content,
    headingLevel: d.headingLevel,
  } as RsvpFormField;
}
