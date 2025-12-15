// -------------------- TYPES --------------------
export type FieldType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "image"
  | "button"
  | "table"
  | "divider"
  | "heading"
  | "paragraph"
  | "spacer";

export interface CustomFormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  unique: boolean;
  defaultValue?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  options?: Array<{ label: string; value: string }>; // For select, radio, checkbox
  accept?: string; // For file/image
  buttonText?: string; // For button
  buttonType?: "button" | "submit" | "reset";
  // For table field
  tableData?: {
    columns: Array<{ header: string; key: string }>;
    rows: Array<Record<string, any>>;
  };
  // For text/paragraph fields
  content?: string; // HTML or plain text content
  // For spacer
  height?: string; // Height of spacer (e.g., "20px", "2rem")
  conditions?: Array<{
    field: string;
    operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
    value: string;
    action: "show" | "hide" | "enable" | "disable";
  }>;
  // Individual field styling
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
    width?: string;
  };
  // Layout properties
  containerType?: "row" | "column" | "container";
  columnSpan?: number; // For grid layouts
  rowSpan?: number;
  // Bootstrap CSS class for column sizing (e.g., "col-6", "col-md-4", "col-lg-3")
  bootstrapClass?: string;
  // Container layout properties (FormEngine-like)
  children?: string[]; // IDs of child fields
  layoutProps?: {
    justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
    alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
    gap?: string; // e.g., "8px", "16px", "1rem"
    padding?: string;
    margin?: string;
    flexDirection?: "row" | "column";
    flexWrap?: "nowrap" | "wrap";
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    minHeight?: string;
  };
  // Event handlers (FormEngine-like)
  events?: {
    onClick?: string; // JavaScript code or function name
    onChange?: string;
    onFocus?: string;
    onBlur?: string;
    onSubmit?: string;
  };
  // Inline parameters/variables (FormEngine-like)
  inlineParams?: Record<string, string>; // e.g., {Name: "John", Email: "john@example.com"}
}

// Export FormField as an alias for compatibility
export type FormField = CustomFormField;

export interface FormTheme {
  formBackgroundColor?: string;
  formPadding?: string;
  formBorderRadius?: string;
  formBorderColor?: string;
  formBorderWidth?: string;
  headingColor?: string;
  headingFontSize?: string;
  headingFontWeight?: string;
  labelColor?: string;
  labelFontSize?: string;
  labelFontWeight?: string;
  textColor?: string;
  textFontSize?: string;
  descriptionColor?: string;
  descriptionFontSize?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputBorderWidth?: string;
  inputBorderRadius?: string;
  inputTextColor?: string;
  inputPlaceholderColor?: string;
  inputFocusBorderColor?: string;
  inputFocusBackgroundColor?: string;
  inputPadding?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderRadius?: string;
  buttonPadding?: string;
  buttonHoverBackgroundColor?: string;
  buttonHoverTextColor?: string;
  footerEnabled?: boolean;
  footerText?: string;
  footerTextColor?: string;
  footerBackgroundColor?: string;
  footerPadding?: string;
  footerFontSize?: string;
  footerAlignment?: "left" | "center" | "right";
  requiredIndicatorColor?: string;
  errorTextColor?: string;
  errorBorderColor?: string;
}
