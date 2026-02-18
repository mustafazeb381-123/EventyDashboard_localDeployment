import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, X, Image as ImageIcon } from "lucide-react";
import type { RsvpFormField, RsvpTheme } from "./types";

interface RsvpFormPreviewProps {
  formFields: RsvpFormField[];
  theme?: RsvpTheme;
  currentLanguage?: "en" | "ar";
  visibleOnly?: boolean;
  variableMode?: boolean;
  showActionButtons?: boolean;
  onAttendClick?: () => void;
  onDeclineClick?: () => void;
  attendButtonDisabled?: boolean;
  declineButtonDisabled?: boolean;
  onBannerClick?: () => void;
  onFooterClick?: () => void;
  onRemoveBanner?: () => void;
  onRemoveFooter?: () => void;
  builderMode?: boolean;
  editingFieldId?: string | null;
  onFieldClick?: (field: RsvpFormField) => void;
  onFieldContentChange?: (fieldId: string, content: string) => void;
}

function getFieldContent(field: RsvpFormField, lang: "en" | "ar"): string {
  return field.contentTranslations?.[lang] ?? field.content ?? "";
}

/** Render text with variables as styled placeholders */
function renderTextWithVariables(text: string): React.ReactNode {
  if (!text) return null;
  
  // Match both ((variable)) and {{variable}} patterns
  const variablePattern = /(\(\([^)]+\)\)|\{\{[^}]+\}\})/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;
  
  while ((match = variablePattern.exec(text)) !== null) {
    // Add text before the variable
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the variable as a styled placeholder
    const variable = match[0];
    parts.push(
      <span
        key={`var-${keyCounter++}`}
        className="inline-block px-2 py-0.5 mx-0.5 bg-indigo-100 border border-indigo-300 rounded text-indigo-700 font-mono text-xs font-semibold"
        contentEditable={false}
        suppressContentEditableWarning
        title="Dynamic variable"
      >
        {variable}
      </span>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
}

export const RsvpFormPreview: React.FC<RsvpFormPreviewProps> = ({
  formFields,
  theme,
  currentLanguage = "en",
  showActionButtons = true,
  onAttendClick,
  onDeclineClick,
  attendButtonDisabled = false,
  declineButtonDisabled = false,
  onBannerClick,
  onFooterClick,
  onRemoveBanner,
  onRemoveFooter,
  builderMode = false,
  editingFieldId = null,
  onFieldClick,
  onFieldContentChange,
}) => {
  const lang = currentLanguage;
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [footerBannerUrl, setFooterBannerUrl] = useState<string | null>(null);
  const contentEditableRefs = useRef<Record<string, HTMLElement | null>>({});
  const isEditingRef = useRef<Record<string, boolean>>({});
  const lastContentRef = useRef<Record<string, string>>({});

  const displayFields = formFields;

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

  const handleContentChange = useCallback((fieldId: string, newContent: string) => {
    onFieldContentChange?.(fieldId, newContent);
    lastContentRef.current[fieldId] = newContent;
  }, [onFieldContentChange]);

  // Sync contentEditable content when field content changes externally
  useEffect(() => {
    if (!builderMode) return;
    
    formFields.forEach((field) => {
      if (field.type === "heading" || field.type === "paragraph") {
        const element = contentEditableRefs.current[field.id];
        const content = getFieldContent(field, lang);
        const isEditing = isEditingRef.current[field.id];
        const lastContent = lastContentRef.current[field.id];
        
        // Only update if content changed externally (not from user editing)
        if (element && !isEditing && content !== lastContent) {
          // Use requestAnimationFrame to avoid React reconciliation conflicts
          requestAnimationFrame(() => {
            if (element && element.textContent !== content) {
              element.textContent = content;
              lastContentRef.current[field.id] = content;
            }
          });
        }
      }
    });
  }, [formFields, lang, builderMode]);

  const renderField = (field: RsvpFormField) => {
    const style = field.fieldStyle ?? {};
    const isEditing = editingFieldId === field.id;
    const isSelected = isEditing && builderMode;

    // Apply all styling
    const elementStyle: React.CSSProperties = {
      borderColor: style.borderColor,
      borderWidth: style.borderWidth,
      borderStyle: style.borderStyle ?? "solid",
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
      padding: style.padding,
      paddingTop: style.paddingTop,
      paddingRight: style.paddingRight,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,
      margin: style.margin,
      marginTop: style.marginTop,
      marginRight: style.marginRight,
      marginBottom: style.marginBottom,
      marginLeft: style.marginLeft,
      color: style.textColor,
      textAlign: style.textAlign,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecoration: style.textDecoration,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      width: style.width,
      maxWidth: style.maxWidth,
      ...(isSelected && {
        outline: "2px solid #6366f1",
        outlineOffset: "2px",
      }),
    };

    // Divider
    if (field.type === "divider") {
      return (
        <div
          key={field.id}
          onClick={() => builderMode && onFieldClick?.(field)}
          className={`${builderMode ? "cursor-pointer" : ""} transition-all`}
          style={elementStyle}
        >
          <hr
            style={{
              borderColor: style.borderColor ?? "#e5e7eb",
              borderWidth: style.borderWidth ?? "1px",
              borderStyle: style.borderStyle ?? "solid",
              margin: 0,
            }}
          />
        </div>
      );
    }

    // Heading
    if (field.type === "heading") {
      const content = getFieldContent(field, lang);
      const level = field.headingLevel ?? 3;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

      if (builderMode) {
        return (
          <div
            key={field.id}
            onClick={() => onFieldClick?.(field)}
            className={`${builderMode ? "cursor-pointer" : ""} transition-all`}
            style={elementStyle}
          >
            <HeadingTag
              contentEditable={builderMode}
              suppressContentEditableWarning
              onInput={() => {
                isEditingRef.current[field.id] = true;
              }}
              onBlur={(e) => {
                isEditingRef.current[field.id] = false;
                const newContent = e.currentTarget.textContent || "";
                if (newContent !== content) {
                  handleContentChange(field.id, newContent);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              ref={(el) => {
                if (el) {
                  contentEditableRefs.current[field.id] = el as HTMLElement;
                  // Set initial content
                  if (el.textContent !== content) {
                    el.textContent = content || "Click to edit heading";
                    lastContentRef.current[field.id] = content || "";
                  }
                } else {
                  delete contentEditableRefs.current[field.id];
                  delete isEditingRef.current[field.id];
                  delete lastContentRef.current[field.id];
                }
              }}
              style={{
                margin: 0,
                outline: "none",
                minHeight: "1.5em",
              }}
              dangerouslySetInnerHTML={undefined}
            >
              {builderMode ? undefined : (content || "Click to edit heading")}
            </HeadingTag>
          </div>
        );
      }

      return (
        <div key={field.id} style={elementStyle}>
          <HeadingTag style={{ margin: 0 }}>
            {renderTextWithVariables(content)}
          </HeadingTag>
        </div>
      );
    }

    // Paragraph
    if (field.type === "paragraph") {
      const content = getFieldContent(field, lang);

      if (builderMode) {
        return (
          <div
            key={field.id}
            onClick={() => onFieldClick?.(field)}
            className={`${builderMode ? "cursor-pointer" : ""} transition-all`}
            style={elementStyle}
          >
            <p
              contentEditable={builderMode}
              suppressContentEditableWarning
              onInput={() => {
                isEditingRef.current[field.id] = true;
              }}
              onBlur={(e) => {
                isEditingRef.current[field.id] = false;
                const newContent = e.currentTarget.textContent || "";
                if (newContent !== content) {
                  handleContentChange(field.id, newContent);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              ref={(el) => {
                if (el) {
                  contentEditableRefs.current[field.id] = el as HTMLElement;
                  // Set initial content
                  if (el.textContent !== content) {
                    el.textContent = content || "Click to edit text";
                    lastContentRef.current[field.id] = content || "";
                  }
                } else {
                  delete contentEditableRefs.current[field.id];
                  delete isEditingRef.current[field.id];
                  delete lastContentRef.current[field.id];
                }
              }}
              style={{
                margin: 0,
                outline: "none",
                minHeight: "1.5em",
              }}
              dangerouslySetInnerHTML={undefined}
            >
              {builderMode ? undefined : (content ? renderTextWithVariables(content) : "Click to edit text")}
            </p>
          </div>
        );
      }

      return (
        <div key={field.id} style={elementStyle}>
          <p style={{ margin: 0 }}>
            {renderTextWithVariables(content)}
          </p>
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
        .rsvp-form-preview-root .rsvp-btn-attend:hover {
          background-color: ${acceptHoverBg} !important;
        }
        .rsvp-form-preview-root .rsvp-btn-decline:hover {
          background-color: ${declineHoverBg} !important;
        }
        [contenteditable="true"]:focus {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
      `}</style>
      {/* Header banner – only show when there is an image or builder can add one */}
      {(bannerUrl || onBannerClick) && (
        <div
          role={onBannerClick ? "button" : undefined}
          tabIndex={onBannerClick ? 0 : undefined}
          onClick={!bannerUrl ? onBannerClick : undefined}
          onKeyDown={onBannerClick && !bannerUrl ? (e) => e.key === "Enter" && onBannerClick() : undefined}
          className="w-full bg-gray-100 overflow-hidden relative"
          style={{
            marginLeft: `-${paddingValue}px`,
            marginRight: `-${paddingValue}px`,
            marginTop: `-${paddingValue}px`,
            width: `calc(100% + ${paddingValue * 2}px)`,
            cursor: !bannerUrl && onBannerClick ? "pointer" : undefined,
          }}
        >
          <div
            className="overflow-hidden flex items-center justify-center"
            style={{
              width: theme?.bannerWidth || "100%",
              height: theme?.bannerHeight || "300px",
              marginTop: theme?.bannerMarginTop || "0",
              marginRight: theme?.bannerMarginRight || "0",
              marginBottom: theme?.bannerMarginBottom || "0",
              marginLeft: theme?.bannerMarginLeft || "0",
            }}
          >
            {bannerUrl ? (
              <>
                <img
                  src={bannerUrl}
                  alt="Header banner"
                  className="w-full h-full object-cover"
                  style={{
                    width: theme?.bannerWidth || "100%",
                    height: theme?.bannerHeight || "300px",
                  }}
                />
                {onRemoveBanner && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBanner?.();
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-red-600 text-white shadow-lg transition-colors"
                    title="Remove header image"
                    aria-label="Remove header image"
                  >
                    <X size={18} />
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 w-full h-full border-2 border-dashed border-slate-300 rounded-lg m-2 bg-slate-50/80">
                <ImageIcon size={40} />
                <span className="text-sm font-medium">Click to add header banner</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form content: text elements + Attend/Decline buttons */}
      <div
        className="px-6 py-6 pb-8"
        style={{
          backgroundColor: theme?.formBackgroundColor || "#ffffff",
        }}
      >
        <div
          className="space-y-5"
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
          {displayFields.map((field) => renderField(field))}
        </div>

        {/* Attend & Decline buttons */}
        {showActionButtons && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => onAttendClick?.()}
              disabled={attendButtonDisabled}
              className="rsvp-btn-attend flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold text-sm shadow-sm transition-colors border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                backgroundColor: acceptBg,
                color: acceptTextColor,
                borderRadius: buttonRadius,
                padding: buttonPaddingVal,
              }}
              aria-label={attendText}
            >
              <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} />
              <span>{attendText}</span>
            </button>
            <button
              type="button"
              onClick={() => onDeclineClick?.()}
              disabled={declineButtonDisabled}
              className="rsvp-btn-decline flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold text-sm shadow-sm transition-colors border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                backgroundColor: declineBg,
                color: declineTextColor,
                borderRadius: buttonRadius,
                padding: buttonPaddingVal,
              }}
              aria-label={declineText}
            >
              <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
              <span>{declineText}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer image – only show when there is an image or builder can add one */}
      {(footerBannerUrl || onFooterClick) && (
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
              role={!footerBannerUrl && onFooterClick ? "button" : undefined}
              tabIndex={!footerBannerUrl && onFooterClick ? 0 : undefined}
              onClick={!footerBannerUrl ? onFooterClick : undefined}
              onKeyDown={onFooterClick && !footerBannerUrl ? (e) => e.key === "Enter" && onFooterClick() : undefined}
              className="w-full min-h-[200px] h-[300px] bg-gray-100 overflow-hidden mb-2 flex items-center justify-center relative"
              style={{ cursor: !footerBannerUrl && onFooterClick ? "pointer" : undefined }}
            >
              {footerBannerUrl ? (
                <>
                  <img src={footerBannerUrl} alt="Footer image" className="w-full h-full object-cover" />
                  {onRemoveFooter && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFooter?.();
                      }}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-red-600 text-white shadow-lg transition-colors"
                      title="Remove footer image"
                      aria-label="Remove footer image"
                    >
                      <X size={18} />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 w-full h-full min-h-[200px] border-2 border-dashed border-slate-300 rounded-lg m-2 bg-slate-50/80">
                  <ImageIcon size={40} />
                  <span className="text-sm font-medium">Click to add footer image</span>
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
      )}

    </div>
  );
};
