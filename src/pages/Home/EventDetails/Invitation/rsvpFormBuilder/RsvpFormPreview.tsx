import React, { useState, useEffect } from "react";
import { Check, X, Image as ImageIcon } from "lucide-react";
import { COUNTRY_DIAL_CODES } from "@/utils/countries";
import type { RsvpFormField, RsvpTheme } from "./types";

interface RsvpFormPreviewProps {
  formFields: RsvpFormField[];
  theme?: RsvpTheme;
  currentLanguage?: "en" | "ar";
  /** Step 1: when true, only render fields with visible !== false */
  visibleOnly?: boolean;
  /** Step 2: when true, show dynamic variables {{name}} instead of input controls */
  variableMode?: boolean;
  /** Step 4: show Attend/Decline buttons in both visible and hidden preview modes */
  showActionButtons?: boolean;
  /** Step 4: when Attend is clicked (opens reason popup in builder) */
  onAttendClick?: () => void;
  /** Step 4: when Decline is clicked (opens reason popup in builder) */
  onDeclineClick?: () => void;
  /** When provided, banner/footer areas are clickable to open theme (e.g. in builder preview) */
  onBannerClick?: () => void;
  onFooterClick?: () => void;
}

function getFieldLabel(field: RsvpFormField, lang: "en" | "ar"): string {
  return field.labelTranslations?.[lang] ?? field.label ?? "";
}

function getFieldPlaceholder(field: RsvpFormField, lang: "en" | "ar"): string {
  return field.placeholderTranslations?.[lang] ?? field.placeholder ?? "";
}

function getFieldContent(field: RsvpFormField, lang: "en" | "ar"): string {
  return field.contentTranslations?.[lang] ?? field.content ?? "";
}

function getOptionLabel(opt: { label: string; labelTranslations?: { en?: string; ar?: string } }, lang: "en" | "ar"): string {
  return opt.labelTranslations?.[lang] ?? opt.label ?? "";
}

export const RsvpFormPreview: React.FC<RsvpFormPreviewProps> = ({
  formFields,
  theme,
  currentLanguage = "en",
  visibleOnly = false,
  variableMode = false,
  showActionButtons = true,
  onAttendClick,
  onDeclineClick,
  onBannerClick,
  onFooterClick,
}) => {
  const lang = currentLanguage;
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [footerBannerUrl, setFooterBannerUrl] = useState<string | null>(null);

  /** Step 1: filter to visible fields when visibleOnly is true */
  const displayFields = visibleOnly
    ? formFields.filter((f) => f.visible !== false)
    : formFields;

  /** Root fields: exclude any field whose id is in another field's children (for layout containers) */
  const rootFields = displayFields.filter(
    (f) => !displayFields.some((other) => (other.children ?? []).includes(f.id))
  );

  const formPaddingVal = theme?.formPadding || "24px";
  const paddingValue =
    typeof formPaddingVal === "string"
      ? parseInt(formPaddingVal, 10) || 24
      : formPaddingVal;

  useEffect(() => {
    const raw = theme?.bannerImage;
    if (!raw) {
      setBannerUrl(null);
      return;
    }
    if (typeof raw === "string" && raw.trim() !== "") {
      setBannerUrl(raw);
      return () => {};
    }
    if (raw instanceof File) {
      const url = URL.createObjectURL(raw);
      setBannerUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBannerUrl(null);
  }, [theme?.bannerImage]);

  useEffect(() => {
    const raw = theme?.footerBannerImage;
    if (!raw) {
      setFooterBannerUrl(null);
      return;
    }
    if (typeof raw === "string" && raw.trim() !== "") {
      setFooterBannerUrl(raw);
      return () => {};
    }
    if (raw instanceof File) {
      const url = URL.createObjectURL(raw);
      setFooterBannerUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFooterBannerUrl(null);
  }, [theme?.footerBannerImage]);

  const formAlignment = theme?.formAlignment ?? "center";
  const formStyle: React.CSSProperties = {
    backgroundColor: theme?.formBackgroundColor || "#ffffff",
    backgroundImage:
      typeof theme?.formBackgroundImage === "string" && theme.formBackgroundImage
        ? `url(${theme.formBackgroundImage})`
        : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    paddingTop: formPaddingVal,
    paddingLeft: formPaddingVal,
    paddingRight: formPaddingVal,
    paddingBottom: 0,
    borderRadius: theme?.formBorderRadius || "8px",
    borderWidth: theme?.formBorderColor ? "1px" : undefined,
    borderStyle: theme?.formBorderColor ? "solid" : undefined,
    borderColor: theme?.formBorderColor ?? undefined,
    maxWidth: theme?.formMaxWidth || "768px",
    marginLeft: formAlignment === "center" ? "auto" : formAlignment === "right" ? "0" : undefined,
    marginRight: formAlignment === "center" ? "auto" : formAlignment === "left" ? "0" : undefined,
  };

  const inputStyle: React.CSSProperties = {
    borderColor: theme?.inputBorderColor ?? "#e2e8f0",
    backgroundColor: theme?.inputBackgroundColor ?? "#f8fafc",
    borderRadius: theme?.inputBorderRadius ?? "12px",
    padding: theme?.inputPadding ?? "12px 16px",
    color: theme?.inputTextColor ?? undefined,
  };
  const focusRingColor = theme?.inputFocusBorderColor ?? "#6366f1";
  const labelColor = theme?.labelColor ?? "#374151";
  const headingColor = theme?.headingColor ?? theme?.labelColor ?? "#1e293b";
  const paragraphColor = theme?.textColor ?? theme?.bodyTextColor ?? "#374151";

  /** Wrapper style for a field (margin, width from field.fieldStyle) */
  const fieldWrapperStyle = (field: RsvpFormField): React.CSSProperties => {
    const fs = field.fieldStyle;
    if (!fs) return {};
    return {
      margin: fs.margin,
      marginTop: fs.marginTop,
      marginRight: fs.marginRight,
      marginBottom: fs.marginBottom,
      marginLeft: fs.marginLeft,
      width: fs.width,
    };
  };

  /** Merge theme inputStyle with field.fieldStyle for inputs */
  const fieldInputStyle = (field: RsvpFormField): React.CSSProperties => {
    const fs = field.fieldStyle;
    return {
      ...inputStyle,
      ...(fs && {
        backgroundColor: fs.backgroundColor ?? inputStyle.backgroundColor,
        borderColor: fs.borderColor ?? inputStyle.borderColor,
        borderWidth: fs.borderWidth,
        borderRadius: fs.borderRadius ?? inputStyle.borderRadius,
        padding: fs.padding ?? inputStyle.padding,
        color: fs.textColor ?? inputStyle.color,
      }),
    };
  };

  const labelColorFor = (field: RsvpFormField) =>
    field.fieldStyle?.labelColor ?? labelColor;

  const inputTypeFromField = (field: RsvpFormField): string => {
    if (field.type === "phone") return "tel";
    if (field.type === "number") return "number";
    if (field.type === "date") return "date";
    return "text";
  };

  const attendText =
    theme?.acceptButtonTranslations?.[lang] ??
    theme?.acceptButtonText ??
    "Attend";
  const declineText =
    theme?.declineButtonTranslations?.[lang] ??
    theme?.declineButtonText ??
    "Decline";
  const attendMessage =
    theme?.acceptMessageTranslations?.[lang] ?? theme?.acceptMessage ?? "";
  const declineMessage =
    theme?.declineMessageTranslations?.[lang] ?? theme?.declineMessage ?? "";
  const acceptBg = theme?.acceptButtonBackgroundColor ?? "#10b981";
  const acceptTextColor = theme?.acceptButtonTextColor ?? "#ffffff";
  const declineBg = theme?.declineButtonBackgroundColor ?? "#ef4444";
  const declineTextColor = theme?.declineButtonTextColor ?? "#ffffff";

  /** Step 2: variable name for dynamic placeholder (e.g. first_name → {{first_name}}) */
  const variablePlaceholder = (field: RsvpFormField) => `{{${field.name}}}`;

  const renderField = (field: RsvpFormField) => {
    const inputCls = "rsvp-preview-input w-full border text-sm outline-none";
    const inputClsFlex = "rsvp-preview-input flex-1 border text-sm outline-none";

    // Layout container: render wrapper with flex styles and child fields (do not render as paragraph)
    if (field.containerType) {
      const childIds = field.children ?? [];
      const childFields = childIds
        .map((id) => formFields.find((f) => f.id === id))
        .filter((f): f is RsvpFormField => !!f)
        .filter((c) => !visibleOnly || displayFields.some((d) => d.id === c.id));
      const lp = field.layoutProps ?? {};
      const isEmpty = childFields.length === 0;
      const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: lp.flexDirection ?? (field.containerType === "row" ? "row" : "column"),
        gap: lp.gap ?? "16px",
        padding: lp.padding ?? "12px",
        justifyContent: lp.justifyContent as React.CSSProperties["justifyContent"],
        alignItems: lp.alignItems as React.CSSProperties["alignItems"],
        flexWrap: lp.flexWrap as React.CSSProperties["flexWrap"],
        backgroundColor: lp.backgroundColor ?? (isEmpty ? "rgba(148, 163, 184, 0.08)" : undefined),
        borderRadius: lp.borderRadius ?? "8px",
        minHeight: isEmpty ? 56 : undefined,
        border: isEmpty ? "2px dashed rgba(100, 116, 139, 0.4)" : undefined,
        ...fieldWrapperStyle(field),
      };
      return (
        <div key={field.id} style={containerStyle} data-layout-type={field.containerType}>
          {childFields.map((child) => (
            <React.Fragment key={child.id}>{renderField(child)}</React.Fragment>
          ))}
          {isEmpty && (
            <span className="text-xs text-slate-400 self-center">
              {field.containerType === "container"
                ? "Container – add fields inside"
                : field.containerType === "row"
                  ? "Row – add fields inside"
                  : "Column – add fields inside"}
            </span>
          )}
        </div>
      );
    }

    // Step 2: variable mode – show label + {{name}} instead of input for input-like fields
    const isInputLike = !["paragraph", "divider", "heading"].includes(field.type);
    if (variableMode && isInputLike) {
      const wrapperStyle = fieldWrapperStyle(field);
      const mergedInputStyle = fieldInputStyle(field);
      return (
        <div key={field.id} style={wrapperStyle}>
          {field.type !== "checkbox" && (
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColorFor(field) }}>
              {getFieldLabel(field, lang)}
              {field.required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
            </label>
          )}
          <div
            className="inline-block px-3 py-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-700 text-sm font-mono"
            style={{ ...mergedInputStyle, minWidth: "120px" }}
          >
            {variablePlaceholder(field)}
          </div>
        </div>
      );
    }

    // Paragraph – content only (containers use type "paragraph" but are handled above via containerType)
    if (field.type === "paragraph") {
      const content = getFieldContent(field, lang);
      if (!content) return null;
      const fs = field.fieldStyle;
      const pStyle: React.CSSProperties = {
        color: fs?.textColor ?? paragraphColor,
        textAlign: fs?.textAlign,
        fontSize: fs?.fontSize,
        margin: fs?.margin,
        marginTop: fs?.marginTop,
        marginRight: fs?.marginRight,
        marginBottom: fs?.marginBottom,
        marginLeft: fs?.marginLeft,
      };
      return (
        <div key={field.id} style={fieldWrapperStyle(field)}>
          <p className="text-sm leading-relaxed" style={pStyle}>
            {content}
          </p>
        </div>
      );
    }

    // Divider – horizontal rule
    if (field.type === "divider") {
      const fs = field.fieldStyle;
      const hrStyle: React.CSSProperties = {
        borderColor: fs?.borderColor ?? "#e5e7eb",
        margin: fs?.margin ?? "1rem 0",
        marginTop: fs?.marginTop,
        marginRight: fs?.marginRight,
        marginBottom: fs?.marginBottom,
        marginLeft: fs?.marginLeft,
      };
      return (
        <div key={field.id} style={fieldWrapperStyle(field)}>
          <hr className="border-t my-4" style={hrStyle} />
        </div>
      );
    }

    // Heading – content as heading
    if (field.type === "heading") {
      const content = getFieldContent(field, lang) || field.label;
      if (!content) return null;
      const level = field.headingLevel ?? 3;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const fs = field.fieldStyle;
      const hStyle: React.CSSProperties = {
        color: fs?.textColor ?? fs?.labelColor ?? headingColor,
        fontSize: fs?.fontSize,
        textAlign: fs?.textAlign,
        margin: fs?.margin,
        marginTop: fs?.marginTop ?? "1rem",
        marginRight: fs?.marginRight,
        marginBottom: fs?.marginBottom ?? "0.5rem",
        marginLeft: fs?.marginLeft,
      };
      return (
        <div key={field.id} style={fieldWrapperStyle(field)}>
          <HeadingTag className="font-semibold" style={hStyle}>
            {content}
          </HeadingTag>
        </div>
      );
    }

    // Label for input-like fields (uses field.fieldStyle.labelColor when set)
    const labelEl = (
      <label className="block text-sm font-medium mb-1.5" style={{ color: labelColorFor(field) }}>
        {getFieldLabel(field, lang)}
        {field.required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
      </label>
    );

    const wrapperStyle = fieldWrapperStyle(field);
    const mergedInputStyle = fieldInputStyle(field);

    // Phone with country code
    if (field.type === "phone" && field.inputVariant === "phone") {
      return (
        <div key={field.id} style={wrapperStyle}>
          {labelEl}
          <div className="flex gap-2">
            <select
              disabled
              className="rsvp-preview-input w-[140px] border text-sm outline-none"
              style={mergedInputStyle}
              aria-label={`${getFieldLabel(field, lang)} country code`}
            >
              <option value="">Code</option>
              {COUNTRY_DIAL_CODES.map((c) => (
                <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                  {c.name} ({c.dialCode})
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder={getFieldPlaceholder(field, lang)}
              required={field.required}
              className={inputClsFlex}
              style={mergedInputStyle}
              readOnly
              aria-label={getFieldLabel(field, lang)}
            />
          </div>
        </div>
      );
    }

    // Text, phone (single), number, date
    if (field.type === "text" || field.type === "phone" || field.type === "number" || field.type === "date") {
      return (
        <div key={field.id} style={wrapperStyle}>
          {labelEl}
          <input
            type={inputTypeFromField(field)}
            placeholder={getFieldPlaceholder(field, lang)}
            required={field.required}
            min={field.type === "number" && field.min != null ? field.min : undefined}
            max={field.type === "number" && field.max != null ? field.max : undefined}
            className={inputCls}
            style={mergedInputStyle}
            readOnly
            aria-label={getFieldLabel(field, lang)}
          />
        </div>
      );
    }

    // Textarea
    if (field.type === "textarea") {
      return (
        <div key={field.id} style={wrapperStyle}>
          {labelEl}
          <textarea
            placeholder={getFieldPlaceholder(field, lang)}
            required={field.required}
            rows={4}
            className={inputCls + " resize-none"}
            style={mergedInputStyle}
            readOnly
            aria-label={getFieldLabel(field, lang)}
          />
        </div>
      );
    }

    // Select / dropdown
    if (field.type === "select") {
      return (
        <div key={field.id} style={wrapperStyle}>
          {labelEl}
          <select
            required={field.required}
            className={inputCls}
            style={mergedInputStyle}
            disabled
            aria-label={getFieldLabel(field, lang)}
          >
            <option value="">{getFieldPlaceholder(field, lang) || "Choose..."}</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {getOptionLabel(opt, lang)}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Radio
    if (field.type === "radio") {
      return (
        <div key={field.id} style={wrapperStyle}>
          {labelEl}
          <div className="space-y-2">
            {(field.options ?? []).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={field.name} value={opt.value} disabled className="rounded-full border-gray-300" />
                <span className="text-sm" style={{ color: labelColorFor(field) }}>{getOptionLabel(opt, lang)}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Checkbox
    if (field.type === "checkbox") {
      return (
        <div key={field.id} className="flex items-center gap-2" style={wrapperStyle}>
          <input type="checkbox" id={field.id} disabled className="rounded border-gray-300 text-indigo-600" />
          <label htmlFor={field.id} className="text-sm font-medium" style={{ color: labelColorFor(field) }}>
            {getFieldLabel(field, lang)}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        </div>
      );
    }

    return null;
  };

  const buttonRadius = theme?.buttonBorderRadius ?? "12px";
  const buttonPaddingVal = theme?.buttonPadding ?? "12px 20px";
  const acceptHoverBg = theme?.acceptButtonHoverBackgroundColor ?? "#059669";
  const declineHoverBg = theme?.declineButtonHoverBackgroundColor ?? "#dc2626";

  return (
    <div
      className="w-full rounded-xl shadow-lg overflow-hidden rsvp-form-preview-root"
      style={formStyle}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <style>{`
        .rsvp-form-preview-root .rsvp-preview-input:focus {
          border-color: ${focusRingColor};
          box-shadow: 0 0 0 2px ${focusRingColor}40;
        }
        .rsvp-form-preview-root .rsvp-btn-attend:hover {
          background-color: ${acceptHoverBg} !important;
        }
        .rsvp-form-preview-root .rsvp-btn-decline:hover {
          background-color: ${declineHoverBg} !important;
        }
      `}</style>
      {/* Header banner – always visible; placeholder when no image; click opens theme when in builder */}
      <div
        role={onBannerClick ? "button" : undefined}
        tabIndex={onBannerClick ? 0 : undefined}
        onClick={onBannerClick}
        onKeyDown={onBannerClick ? (e) => e.key === "Enter" && onBannerClick() : undefined}
        className="w-full bg-gray-100 overflow-hidden"
        style={{
          marginLeft: `-${paddingValue}px`,
          marginRight: `-${paddingValue}px`,
          marginTop: `-${paddingValue}px`,
          width: `calc(100% + ${paddingValue * 2}px)`,
          cursor: onBannerClick ? "pointer" : undefined,
        }}
      >
        <div
          className="w-full h-[300px] overflow-hidden flex items-center justify-center"
          style={{
            marginTop: theme?.bannerMarginTop || "0",
            marginRight: theme?.bannerMarginRight || "0",
            marginBottom: theme?.bannerMarginBottom || "0",
            marginLeft: theme?.bannerMarginLeft || "0",
          }}
        >
          {bannerUrl ? (
            <img src={bannerUrl} alt="Header banner" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400 w-full h-full border-2 border-dashed border-slate-300 rounded-lg m-2 bg-slate-50/80">
              <ImageIcon size={40} />
              <span className="text-sm font-medium">
                {onBannerClick ? "Click to add header banner" : "No header banner"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Form content: fields + Attend/Decline buttons (Step 3: alignment) */}
      <div
        className="px-6 py-6 pb-8"
        style={{
          backgroundColor: theme?.formBackgroundColor || "#ffffff",
        }}
      >
        <form
          className="space-y-4"
          style={{
            maxWidth: "100%",
            ...(theme?.formFieldsAlignment === "center" && {
              marginLeft: "auto",
              marginRight: "auto",
              width: "fit-content",
              minWidth: "min(100%, 320px)",
            }),
            ...(theme?.formFieldsAlignment === "right" && {
              marginLeft: "auto",
              width: "fit-content",
              minWidth: "min(100%, 320px)",
            }),
          }}
        >
          {rootFields.map((field) => (
            <React.Fragment key={field.id}>{renderField(field)}</React.Fragment>
          ))}
        </form>

        {/* Attend & Decline: messages + buttons always shown on form */}
        {showActionButtons && (
          <div className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Attend: message above button */}
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className="text-sm"
                  style={{ color: theme?.textColor ?? theme?.labelColor ?? "#374151" }}
                >
                  <span className="font-medium text-slate-600 block mb-0.5">Attend message</span>
                  <span className={attendMessage ? "" : "text-slate-400 italic"}>
                    {attendMessage || "(Add in Theme → Attend & Decline Buttons)"}
                  </span>
                </div>
                <div
                  role={onAttendClick ? "button" : undefined}
                  tabIndex={onAttendClick ? 0 : undefined}
                  onClick={onAttendClick}
                  onKeyDown={onAttendClick ? (e) => e.key === "Enter" && onAttendClick() : undefined}
                  className="rsvp-btn-attend inline-flex items-center justify-center gap-2 text-white font-semibold text-sm shadow-sm transition-colors cursor-default"
                  style={{
                    backgroundColor: acceptBg,
                    color: acceptTextColor,
                    borderRadius: buttonRadius,
                    padding: buttonPaddingVal,
                    cursor: onAttendClick ? "pointer" : "default",
                  }}
                >
                  <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                  <span>{attendText}</span>
                </div>
              </div>
              {/* Decline: message above button */}
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className="text-sm"
                  style={{ color: theme?.textColor ?? theme?.labelColor ?? "#374151" }}
                >
                  <span className="font-medium text-slate-600 block mb-0.5">Decline message</span>
                  <span className={declineMessage ? "" : "text-slate-400 italic"}>
                    {declineMessage || "(Add in Theme → Attend & Decline Buttons)"}
                  </span>
                </div>
                <div
                  role={onDeclineClick ? "button" : undefined}
                  tabIndex={onDeclineClick ? 0 : undefined}
                  onClick={onDeclineClick}
                  onKeyDown={onDeclineClick ? (e) => e.key === "Enter" && onDeclineClick() : undefined}
                  className="rsvp-btn-decline inline-flex items-center justify-center gap-2 text-white font-semibold text-sm shadow-sm transition-colors cursor-default"
                  style={{
                    backgroundColor: declineBg,
                    color: declineTextColor,
                    borderRadius: buttonRadius,
                    padding: buttonPaddingVal,
                    cursor: onDeclineClick ? "pointer" : "default",
                  }}
                >
                  <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                  <span>{declineText}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer image – always visible and scrollable; placeholder when no image; click to upload */}
      <div
        className="border-t border-slate-200 pb-6"
        style={{
          marginLeft: `-${paddingValue}px`,
          marginRight: `-${paddingValue}px`,
          marginTop: theme?.footerMarginTop ?? "24px",
          width: `calc(100% + ${paddingValue * 2}px)`,
        }}
      >
        <div
          style={{
            marginRight: theme?.footerMarginRight || "0",
            marginBottom: theme?.footerMarginBottom || "0",
            marginLeft: theme?.footerMarginLeft || "0",
          }}
        >
          <div
            role={onFooterClick ? "button" : undefined}
            tabIndex={onFooterClick ? 0 : undefined}
            onClick={onFooterClick}
            onKeyDown={onFooterClick ? (e) => e.key === "Enter" && onFooterClick() : undefined}
            className="w-full min-h-[200px] h-[300px] bg-gray-100 overflow-hidden mb-2 flex items-center justify-center"
            style={{ cursor: onFooterClick ? "pointer" : undefined }}
          >
            {footerBannerUrl ? (
              <img src={footerBannerUrl} alt="Footer image" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 w-full h-full min-h-[200px] border-2 border-dashed border-slate-300 rounded-lg m-2 bg-slate-50/80">
                <ImageIcon size={40} />
                <span className="text-sm font-medium">
                  {onFooterClick ? "Click to add footer image" : "Footer image – click to add"}
                </span>
              </div>
            )}
          </div>
          {theme?.footerEnabled && theme?.footerText && (
            <div
              style={{
                backgroundColor: theme.footerBackgroundColor || "#f9fafb",
                color: theme.footerTextColor || "#6b7280",
                padding: theme.footerPadding || "16px",
                fontSize: theme.footerFontSize || "14px",
                textAlign: theme.footerAlignment || "center",
              }}
            >
              {theme.footerText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
