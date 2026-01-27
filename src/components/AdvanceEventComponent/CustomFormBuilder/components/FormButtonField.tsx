import type { CSSProperties } from "react";

import type { CustomFormField, FormTheme } from "../types";
import { getTranslatedButtonText } from "../utils/fieldTranslations";

type FormButtonFieldProps = {
  field: CustomFormField;
  theme?: FormTheme;
  currentLanguage?: string;
};

export function FormButtonField({
  field,
  theme,
  currentLanguage = "en",
}: FormButtonFieldProps) {
  const displayText =
    currentLanguage
      ? getTranslatedButtonText(field, currentLanguage)
      : field.buttonText ?? "Button";
  const justifyContent: CSSProperties["justifyContent"] =
    field.buttonAlignment === "center"
      ? "center"
      : field.buttonAlignment === "right"
      ? "flex-end"
      : "flex-start";

  const width =
    field.buttonWidth === "full"
      ? "100%"
      : field.buttonWidth === "custom"
      ? field.fieldStyle?.width || "auto"
      : "auto";

  const baseStyle: CSSProperties = {
    width,
    backgroundColor:
      field.fieldStyle?.backgroundColor ||
      theme?.buttonBackgroundColor ||
      "#3b82f6",
    color: field.fieldStyle?.textColor || theme?.buttonTextColor || "#ffffff",
    borderColor:
      field.fieldStyle?.borderColor || theme?.buttonBorderColor || "#3b82f6",
    borderWidth: field.fieldStyle?.borderWidth || "1px",
    borderStyle: "solid",
    borderRadius:
      field.fieldStyle?.borderRadius || theme?.buttonBorderRadius || "6px",
    padding: field.fieldStyle?.padding || theme?.buttonPadding || "12px 24px",
  };

  return (
    <div className="w-full flex" style={{ justifyContent }}>
      <button
        type={field.buttonType || "button"}
        className="font-medium shadow-md hover:shadow-lg transition-all"
        style={baseStyle}
        onMouseEnter={(e) => {
          if (theme?.buttonHoverBackgroundColor) {
            e.currentTarget.style.backgroundColor =
              theme.buttonHoverBackgroundColor;
          }
          if (theme?.buttonHoverTextColor) {
            e.currentTarget.style.color = theme.buttonHoverTextColor;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = (field.fieldStyle
            ?.backgroundColor ||
            theme?.buttonBackgroundColor ||
            "#3b82f6") as string;
          e.currentTarget.style.color = (field.fieldStyle?.textColor ||
            theme?.buttonTextColor ||
            "#ffffff") as string;
        }}
      >
        {displayText}
      </button>
    </div>
  );
}
