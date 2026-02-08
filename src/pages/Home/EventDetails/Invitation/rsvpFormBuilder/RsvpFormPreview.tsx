import React, { useState, useEffect } from "react";
import { Check, X, Image as ImageIcon } from "lucide-react";
import { COUNTRY_DIAL_CODES } from "@/utils/countries";
import type { RsvpFormField, RsvpTheme } from "./types";

interface RsvpFormPreviewProps {
  formFields: RsvpFormField[];
  theme?: RsvpTheme;
  currentLanguage?: "en" | "ar";
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
  onBannerClick,
  onFooterClick,
}) => {
  const lang = currentLanguage;
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [footerBannerUrl, setFooterBannerUrl] = useState<string | null>(null);

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

  const formStyle: React.CSSProperties = {
    backgroundColor: theme?.formBackgroundColor || "#ffffff",
    paddingTop: formPaddingVal,
    paddingLeft: formPaddingVal,
    paddingRight: formPaddingVal,
    paddingBottom: 0,
    borderRadius: theme?.formBorderRadius || "8px",
    maxWidth: theme?.formMaxWidth || "768px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const inputStyle: React.CSSProperties = {
    borderColor: theme?.inputBorderColor ?? "#e2e8f0",
    backgroundColor: theme?.inputBackgroundColor ?? "#f8fafc",
  };
  const labelColor = theme?.labelColor ?? "#374151";

  const inputTypeFromField = (field: RsvpFormField): string => {
    if (field.type === "email") return "email";
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
  const acceptBg = theme?.acceptButtonBackgroundColor ?? "#10b981";
  const acceptTextColor = theme?.acceptButtonTextColor ?? "#ffffff";
  const declineBg = theme?.declineButtonBackgroundColor ?? "#ef4444";
  const declineTextColor = theme?.declineButtonTextColor ?? "#ffffff";

  const renderField = (field: RsvpFormField) => {
    const inputCls = "w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    const inputClsFlex = "flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

    // Paragraph – content only
    if (field.type === "paragraph") {
      const content = getFieldContent(field, lang);
      if (!content) return null;
      return (
        <p className="text-sm text-slate-700 leading-relaxed" style={{ color: theme?.bodyTextColor ?? "#374151" }}>
          {content}
        </p>
      );
    }

    // Divider – horizontal rule
    if (field.type === "divider") {
      return <hr className="border-slate-200 my-4" />;
    }

    // Heading – content as heading
    if (field.type === "heading") {
      const content = getFieldContent(field, lang) || field.label;
      if (!content) return null;
      const level = field.headingLevel ?? 3;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <HeadingTag className="font-semibold text-slate-800 mt-4 mb-2" style={{ color: theme?.labelColor ?? "#1e293b" }}>
          {content}
        </HeadingTag>
      );
    }

    // Label for input-like fields
    const labelEl = (
      <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
        {getFieldLabel(field, lang)}
        {field.required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
      </label>
    );

    // Phone with country code
    if (field.type === "phone" && field.inputVariant === "phone") {
      return (
        <div key={field.id}>
          {labelEl}
          <div className="flex gap-2">
            <select
              disabled
              className="px-4 py-3 rounded-xl border text-sm outline-none bg-slate-50 w-[140px]"
              style={inputStyle}
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
              style={inputStyle}
              readOnly
              aria-label={getFieldLabel(field, lang)}
            />
          </div>
        </div>
      );
    }

    // Text, email, phone (single), number, date
    if (field.type === "text" || field.type === "email" || field.type === "phone" || field.type === "number" || field.type === "date") {
      return (
        <div key={field.id}>
          {labelEl}
          <input
            type={inputTypeFromField(field)}
            placeholder={getFieldPlaceholder(field, lang)}
            required={field.required}
            min={field.type === "number" && field.min != null ? field.min : undefined}
            max={field.type === "number" && field.max != null ? field.max : undefined}
            className={inputCls}
            style={inputStyle}
            readOnly
            aria-label={getFieldLabel(field, lang)}
          />
        </div>
      );
    }

    // Textarea
    if (field.type === "textarea") {
      return (
        <div key={field.id}>
          {labelEl}
          <textarea
            placeholder={getFieldPlaceholder(field, lang)}
            required={field.required}
            rows={4}
            className={inputCls + " resize-none"}
            style={inputStyle}
            readOnly
            aria-label={getFieldLabel(field, lang)}
          />
        </div>
      );
    }

    // Select / dropdown
    if (field.type === "select") {
      return (
        <div key={field.id}>
          {labelEl}
          <select
            required={field.required}
            className={inputCls}
            style={inputStyle}
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
        <div key={field.id}>
          {labelEl}
          <div className="space-y-2">
            {(field.options ?? []).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={field.name} value={opt.value} disabled className="rounded-full border-gray-300" />
                <span className="text-sm" style={{ color: labelColor }}>{getOptionLabel(opt, lang)}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Checkbox
    if (field.type === "checkbox") {
      return (
        <div key={field.id} className="flex items-center gap-2">
          <input type="checkbox" id={field.id} disabled className="rounded border-gray-300 text-indigo-600" />
          <label htmlFor={field.id} className="text-sm font-medium" style={{ color: labelColor }}>
            {getFieldLabel(field, lang)}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="w-full rounded-xl shadow-lg overflow-hidden"
      style={formStyle}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
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

      {/* Form content: fields + Attend/Decline buttons */}
      <div
        className="px-6 py-6 pb-8"
        style={{ backgroundColor: theme?.formBackgroundColor || "#ffffff" }}
      >
        <form className="space-y-4">
          {formFields.map((field) => (
            <React.Fragment key={field.id}>{renderField(field)}</React.Fragment>
          ))}
        </form>

        {/* Attend & Decline buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-600/20"
            style={{ backgroundColor: acceptBg, color: acceptTextColor }}
          >
            <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <span>{attendText}</span>
          </div>
          <div
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm shadow-sm ring-2 ring-red-600/20"
            style={{ backgroundColor: declineBg, color: declineTextColor }}
          >
            <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <span>{declineText}</span>
          </div>
        </div>
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
