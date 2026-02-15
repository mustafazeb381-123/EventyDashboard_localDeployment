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
  onBannerClick?: () => void;
  onFooterClick?: () => void;
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
  onBannerClick,
  onFooterClick,
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
  const [reasonModal, setReasonModal] = useState<{ type: "attend" | "decline"; reason: string } | null>(null);
  const [submittedReasons, setSubmittedReasons] = useState<{ attend?: string; decline?: string }>({});

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
  const attendMessage =
    theme?.acceptMessageTranslations?.[lang] ?? theme?.acceptMessage ?? "";
  const declineMessage =
    theme?.declineMessageTranslations?.[lang] ?? theme?.declineMessage ?? "";
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
      {/* Header banner */}
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
            <img 
              src={bannerUrl} 
              alt="Header banner" 
              className="w-full h-full object-cover"
              style={{
                width: theme?.bannerWidth || "100%",
                height: theme?.bannerHeight || "300px",
              }}
            />
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
          <div className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
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
                  onClick={() => {
                    if (builderMode) {
                      setReasonModal({ type: "attend", reason: submittedReasons.attend || "" });
                    } else {
                      onAttendClick?.();
                    }
                  }}
                  onKeyDown={onAttendClick ? (e) => {
                    if (e.key === "Enter") {
                      if (builderMode) {
                        setReasonModal({ type: "attend", reason: submittedReasons.attend || "" });
                      } else {
                        onAttendClick();
                      }
                    }
                  } : undefined}
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
                {submittedReasons.attend && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-medium text-green-800 mb-1">
                      {theme?.acceptReasonLabel || "Reason for attending"}:
                    </p>
                    <p className="text-sm text-green-900">{submittedReasons.attend}</p>
                  </div>
                )}
                {!submittedReasons.attend && theme?.acceptReasonRequired && builderMode && (
                  <p className="text-xs text-slate-500 mt-1">
                    Click button to provide reason: {theme.acceptReasonLabel || "Reason for attending"}
                  </p>
                )}
              </div>
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
                  onClick={() => {
                    if (builderMode) {
                      setReasonModal({ type: "decline", reason: submittedReasons.decline || "" });
                    } else {
                      onDeclineClick?.();
                    }
                  }}
                  onKeyDown={onDeclineClick ? (e) => {
                    if (e.key === "Enter") {
                      if (builderMode) {
                        setReasonModal({ type: "decline", reason: submittedReasons.decline || "" });
                      } else {
                        onDeclineClick();
                      }
                    }
                  } : undefined}
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
                {submittedReasons.decline && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-800 mb-1">
                      {theme?.declineReasonLabel || "Reason for declining"}:
                    </p>
                    <p className="text-sm text-red-900">{submittedReasons.decline}</p>
                  </div>
                )}
                {!submittedReasons.decline && theme?.declineReasonRequired && builderMode && (
                  <p className="text-xs text-slate-500 mt-1">
                    Click button to provide reason: {theme.declineReasonLabel || "Reason for declining"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer image */}
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

      {/* Reason Modal */}
      {reasonModal && builderMode && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onMouseDown={(e) => e.target === e.currentTarget && setReasonModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {reasonModal.type === "attend" 
                  ? (theme?.acceptReasonLabel || "Reason for attending")
                  : (theme?.declineReasonLabel || "Reason for declining")}
              </h3>
              <button
                type="button"
                onClick={() => setReasonModal(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={reasonModal.reason}
                onChange={(e) => setReasonModal({ ...reasonModal, reason: e.target.value })}
                placeholder={
                  reasonModal.type === "attend"
                    ? (theme?.acceptReasonPlaceholder || "Please provide a reason for attending")
                    : (theme?.declineReasonPlaceholder || "Please provide a reason for declining")
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
              />
            </div>
            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReasonModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (reasonModal.reason.trim()) {
                    if (reasonModal.type === "attend") {
                      setSubmittedReasons((prev) => ({ ...prev, attend: reasonModal.reason }));
                      onAttendClick?.();
                    } else {
                      setSubmittedReasons((prev) => ({ ...prev, decline: reasonModal.reason }));
                      onDeclineClick?.();
                    }
                    setReasonModal(null);
                  }
                }}
                disabled={!reasonModal.reason.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
