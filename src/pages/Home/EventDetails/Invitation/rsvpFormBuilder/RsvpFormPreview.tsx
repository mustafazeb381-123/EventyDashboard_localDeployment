import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Check, X, Image as ImageIcon, Square, LayoutGrid, Columns2, Sparkles, Upload } from "lucide-react";
import type { RsvpFormField, RsvpTheme } from "./types";

interface RsvpFormPreviewProps {
  formFields: RsvpFormField[];
  theme?: RsvpTheme;
  currentLanguage?: "en" | "ar";
  visibleOnly?: boolean;
  variableMode?: boolean;
  showActionButtons?: boolean;
  /** When true, show "Thanks for your response" instead of Attend/Decline buttons (e.g. after successful submit). */
  responseSubmitted?: boolean;
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
  /** When provided, clicking the upload icon on image/icon opens file picker for this field */
  onImageUploadRequest?: (fieldId: string) => void;
}

function getFieldContent(field: RsvpFormField, lang: "en" | "ar"): string {
  return field.contentTranslations?.[lang] ?? field.content ?? "";
}

/** Wraps a field in sortable for DnD in builder mode. */
function SortableFieldNode({
  field,
  children,
}: {
  field: RsvpFormField;
  children: React.ReactNode;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const isImageOrIcon = field.type === "image" || field.type === "icon";
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    ...(isImageOrIcon && { width: "100%", minWidth: 0 }),
  };
  return (
    <div ref={setNodeRef} style={style} className="rsvp-sortable-field-node">
      <div {...attributes} {...listeners}>{children}</div>
    </div>
  );
}

const CONTAINER_STYLES: Record<
  "container" | "row" | "column",
  { borderColor: string; headerColor: string; iconColor: string; Icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  container: { borderColor: "#c4b5fd", headerColor: "#a78bfa", iconColor: "text-purple-400", Icon: Square },
  row: { borderColor: "#93c5fd", headerColor: "#60a5fa", iconColor: "text-blue-400", Icon: LayoutGrid },
  column: { borderColor: "#93c5fd", headerColor: "#60a5fa", iconColor: "text-blue-400", Icon: Columns2 },
};

/** Renders a container as droppable and its children as sortable in builder mode (screenshot design) */
function DroppableContainerNode({
  field,
  formFields,
  getChildFields,
  renderField,
}: {
  field: RsvpFormField;
  formFields: RsvpFormField[];
  getChildFields: (f: RsvpFormField) => RsvpFormField[];
  renderField: (f: RsvpFormField, parentContainerType?: "container" | "row" | "column") => React.ReactNode;
}) {
  const childFields = getChildFields(field);
  const { setNodeRef, isOver } = useDroppable({ id: "container:" + field.id });
  const type = field.containerType ?? "container";
  const { borderColor, headerColor, iconColor, Icon } = CONTAINER_STYLES[type];
  const layout = field.layoutProps ?? {};
  const isRow = type === "row";
  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: (layout.flexDirection as React.CSSProperties["flexDirection"]) ?? (isRow ? "row" : "column"),
    gap: layout.gap ?? "8px",
    flexWrap: isRow ? "nowrap" : (layout.flexWrap as React.CSSProperties["flexWrap"]),
    alignItems: layout.alignItems as React.CSSProperties["alignItems"],
    justifyContent: (isRow ? "flex-start" : layout.justifyContent) as React.CSSProperties["justifyContent"],
    minHeight: "40px",
    width: "100%",
  };

  return (
    <div className="w-full" style={{ marginBottom: 12 }}>
      {/* Header: CONTAINER / ROW / COLUMN + thin line */}
      <div
        className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
        style={{ color: headerColor }}
      >
        {type}
      </div>
      <div
        style={{
          borderTop: `1px solid ${borderColor}`,
          marginLeft: -2,
          marginRight: -2,
          marginBottom: 8,
        }}
      />
      {/* Title bar: icon + label, solid border */}
      <div
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#fff",
        }}
      >
        <Icon size={18} className={iconColor} />
        <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
      </div>
      {/* Main body: white, solid border, inner dashed drop zone */}
      <div
        style={{
          border: `1px solid ${borderColor}`,
          borderTop: "none",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderRadius: 6,
          padding: 12,
          backgroundColor: "#fff",
          minHeight: 56,
        }}
      >
        <div
          ref={setNodeRef}
          style={{
            ...contentStyle,
            border: "1px dashed #d1d5db",
            borderRadius: 4,
            padding: childFields.length === 0 ? 16 : 8,
            paddingBottom: childFields.length > 0 ? 56 : 10,
            minHeight: childFields.length > 0 ? 64 : undefined,
            backgroundColor: isOver ? "rgba(99, 102, 241, 0.06)" : "#fafafa",
          }}
          className={isOver ? "ring-2 ring-indigo-400" : ""}
        >
          {childFields.length === 0 ? (
            <span className="text-sm italic text-slate-400 w-full text-center block">Drop fields here</span>
          ) : (
            <SortableContext
              items={childFields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {childFields.map((child) => {
                const cellStyle: React.CSSProperties = isRow
                  ? { flex: "0 0 31.5%", width: "31.5%", minWidth: 0, boxSizing: "border-box" }
                  : {};
                const inner = child.containerType ? (
                  <DroppableContainerNode
                    key={child.id}
                    field={child}
                    formFields={formFields}
                    getChildFields={getChildFields}
                    renderField={renderField}
                  />
                ) : (
                  <SortableFieldNode key={child.id} field={child}>
                    {renderField(child, type)}
                  </SortableFieldNode>
                );
                return isRow ? (
                  <div key={child.id} style={cellStyle}>
                    <div style={{ width: "100%", minWidth: 0 }}>{inner}</div>
                  </div>
                ) : (
                  inner
                );
              })}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
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
  responseSubmitted = false,
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
  onImageUploadRequest,
}) => {
  const lang = currentLanguage;
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [footerBannerUrl, setFooterBannerUrl] = useState<string | null>(null);
  const contentEditableRefs = useRef<Record<string, HTMLElement | null>>({});
  const isEditingRef = useRef<Record<string, boolean>>({});
  const lastContentRef = useRef<Record<string, string>>({});

  /** Root fields = not in any field's children; used for tree rendering and DnD */
  const { rootFields, getChildFields } = useMemo(() => {
    const childIds = new Set(
      formFields.flatMap((f) => f.children ?? [])
    );
    const root = formFields.filter((f) => !childIds.has(f.id));
    const getChildFields = (field: RsvpFormField): RsvpFormField[] =>
      (field.children ?? [])
        .map((id) => formFields.find((f) => f.id === id))
        .filter((f): f is RsvpFormField => !!f);
    return { rootFields: root, getChildFields };
  }, [formFields]);


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

  const mainDropZone = useDroppable({ id: "rsvp-main-drop-zone" });

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

  const renderField = (
    field: RsvpFormField,
    parentContainerType?: "container" | "row" | "column"
  ) => {
    const style = field.fieldStyle ?? {};
    const isEditing = editingFieldId === field.id;
    const isSelected = isEditing && builderMode;

    // Map alignment to flex alignSelf and to margins (so it works in both flex and block parents)
    const alignSelf =
      style.alignment === "left"
        ? "flex-start"
        : style.alignment === "right"
          ? "flex-end"
          : style.alignment === "center"
            ? "center"
            : undefined;
    const alignmentMargin: React.CSSProperties =
      style.alignment === "right"
        ? { marginLeft: "auto" }
        : style.alignment === "center"
          ? { marginLeft: "auto", marginRight: "auto" }
          : {};
    // When Layout alignment is right/center, block must not be full width or margin has no effect
    const effectiveWidth =
      (style.alignment === "right" || style.alignment === "center") &&
      (!style.width || String(style.width).trim() === "100%")
        ? "fit-content"
        : style.width;

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
      width: effectiveWidth,
      maxWidth: style.maxWidth,
      height: style.height,
      alignSelf,
      ...alignmentMargin,
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

    // Pixel minimums so flex + alignment never collapse the box (fixes image/icon disappearing).
    const pixelMin = (v: string | undefined, fallbackPx: number): string =>
      v && /^\d+(\.\d+)?\s*px$/i.test(String(v).trim()) ? String(v).trim() : `${fallbackPx}px`;

    // Image – content holds image URL (data URL or external). In preview (non-builder), hide when no image.
    // Use a dedicated wrapper style (no elementStyle) so width/height/alignment never collapse or hide the image.
    if (field.type === "image") {
      const src = field.content?.trim() || null;
      if (!builderMode && !src) return null;
      const isPlaceholder = !src;
      const inRow = parentContainerType === "row";
      const rawW = style.width;
      const rawH = style.height;
      const isPercentOrAuto = (v: string | undefined) =>
        !v || String(v).includes("%") || String(v).trim().toLowerCase() === "auto";
      const defaultW = inRow ? "80px" : undefined;
      const defaultH = isPlaceholder ? "120px" : inRow ? "80px" : "80px";
      const w = inRow && isPercentOrAuto(rawW) ? "31.5%" : (rawW || defaultW);
      const h = inRow && isPercentOrAuto(rawH) ? (isPlaceholder ? "120px" : "80px") : (rawH || defaultH);
      // Every image in a row gets 31.5% width (first, second, third, etc.)
      const effectiveW = inRow ? "31.5%" : w;
      const minW = inRow ? "200px" : pixelMin(typeof w === "string" ? w : undefined, 80);
      const minH = pixelMin(typeof h === "string" ? h : undefined, isPlaceholder ? 120 : 80);
      const imageWrapperStyle: React.CSSProperties = {
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
        width: effectiveW,
        height: h,
        minWidth: minW,
        minHeight: minH,
        flexShrink: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        position: "relative",
        alignSelf,
        ...(style.alignment === "right" ? { marginLeft: "auto" as const } : style.alignment === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}),
        ...(isSelected && { outline: "2px solid #6366f1", outlineOffset: "2px" }),
      };
      return (
        <div
          key={field.id}
          data-field-id={field.id}
          data-field-type="image"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (builderMode) onFieldClick?.(field);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          role={builderMode ? "button" : undefined}
          className={`${builderMode ? "cursor-pointer" : ""} transition-all flex items-center justify-center overflow-hidden rounded-lg`}
          style={{ ...imageWrapperStyle, zIndex: 1 }}
        >
          {isPlaceholder ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600"
              style={{
                minHeight: 120,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {builderMode && onImageUploadRequest ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onImageUploadRequest(field.id);
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg p-2 -m-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full h-full"
                  title="Upload image"
                  aria-label="Upload image"
                  style={{ minHeight: "100%", justifyContent: "center" }}
                >
                  <Upload size={32} />
                  <span className="text-sm font-medium">Click to upload image</span>
                </button>
              ) : (
                <>
                  <Upload size={32} />
                  <span className="text-sm font-medium">Click to upload image</span>
                </>
              )}
            </div>
          ) : (
            <>
              <img
                src={src}
                alt=""
                className="rounded-lg object-contain"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
              {builderMode && onImageUploadRequest && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onImageUploadRequest(field.id);
                  }}
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  title="Change image"
                  aria-label="Change image"
                >
                  <Upload size={18} />
                </button>
              )}
            </>
          )}
        </div>
      );
    }

    // Icon – content holds icon image URL (data URL or external). In preview (non-builder), hide when no image.
    // Dedicated wrapper style so alignment/width/height never collapse or hide the icon; each field is individually editable.
    if (field.type === "icon") {
      const src = field.content?.trim() || null;
      if (!builderMode && !src) return null;
      const isPlaceholder = !src;
      const inRow = parentContainerType === "row";
      const isPercentOrAuto = (v: string | undefined) =>
        !v || String(v).includes("%") || String(v).trim().toLowerCase() === "auto";
      const defaultW = inRow ? "80px" : isPlaceholder ? undefined : "64px";
      const defaultH = inRow ? "80px" : isPlaceholder ? "80px" : "64px";
      const rawW = style.width;
      const rawH = style.height;
      const w = inRow && isPercentOrAuto(rawW) ? "31.5%" : (rawW || defaultW);
      const h = inRow && isPercentOrAuto(rawH) ? defaultH : (rawH || defaultH);
      // Every icon in a row gets 31.5% width (first, second, third, etc.)
      const effectiveW = inRow ? "31.5%" : w;
      const minW = inRow ? "200px" : pixelMin(typeof w === "string" ? w : undefined, isPlaceholder ? 80 : 64);
      const minH = pixelMin(typeof h === "string" ? h : undefined, isPlaceholder ? 80 : 64);
      const iconWrapperStyle: React.CSSProperties = {
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
        width: effectiveW,
        height: h,
        minWidth: minW,
        minHeight: minH,
        flexShrink: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        position: "relative",
        alignSelf,
        ...(style.alignment === "right" ? { marginLeft: "auto" as const } : style.alignment === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}),
        ...(isSelected && { outline: "2px solid #6366f1", outlineOffset: "2px" }),
      };
      return (
        <div
          key={field.id}
          data-field-id={field.id}
          data-field-type="icon"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (builderMode) onFieldClick?.(field);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          role={builderMode ? "button" : undefined}
          className={`${builderMode ? "cursor-pointer" : ""} transition-all flex items-center justify-center overflow-hidden rounded`}
          style={{ ...iconWrapperStyle, zIndex: 1 }}
        >
          {isPlaceholder ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600"
              style={{
                minHeight: 80,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {builderMode && onImageUploadRequest ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onImageUploadRequest(field.id);
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg p-2 -m-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full h-full"
                  title="Upload icon"
                  aria-label="Upload icon"
                  style={{ minHeight: "100%", justifyContent: "center" }}
                >
                  <Upload size={28} />
                  <span className="text-sm font-medium">Click to upload icon</span>
                </button>
              ) : (
                <>
                  <Sparkles size={28} />
                  <span className="text-sm font-medium">Click to upload icon</span>
                </>
              )}
            </div>
          ) : (
            <>
              <img
                src={src}
                alt=""
                className="rounded object-contain"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
              {builderMode && onImageUploadRequest && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onImageUploadRequest(field.id);
                  }}
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  title="Change icon"
                  aria-label="Change icon"
                >
                  <Upload size={18} />
                </button>
              )}
            </>
          )}
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

  /** Renders a container in preview: only the laid-out children, no CONTAINER/ROW/COLUMN chrome */
  const renderContainerBlock = (field: RsvpFormField): React.ReactNode => {
    const childFields = getChildFields(field);
    if (childFields.length === 0) return null;
    const type = field.containerType ?? "container";
    const layout = field.layoutProps ?? {};
    const isRow = type === "row";
    const contentStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: (layout.flexDirection as React.CSSProperties["flexDirection"]) ?? (isRow ? "row" : "column"),
      gap: layout.gap ?? "8px",
      flexWrap: isRow ? "nowrap" : (layout.flexWrap as React.CSSProperties["flexWrap"]),
      alignItems: layout.alignItems as React.CSSProperties["alignItems"],
      justifyContent: (isRow ? "flex-start" : layout.justifyContent) as React.CSSProperties["justifyContent"],
      width: "100%",
    };
    const cellStyle: React.CSSProperties = isRow
      ? { flex: "0 0 31.5%", width: "31.5%", minWidth: 0, boxSizing: "border-box" }
      : {};
    return (
      <div key={field.id} className="w-full" style={{ marginBottom: 12, ...contentStyle }}>
        {childFields.map((child) => {
          const inner = child.containerType ? renderContainerBlock(child) : renderField(child, type);
          return isRow ? (
            <div key={child.id} style={cellStyle}>
              <div style={{ width: "100%", minWidth: 0 }}>{inner}</div>
            </div>
          ) : (
            <React.Fragment key={child.id}>{inner}</React.Fragment>
          );
        })}
      </div>
    );
  };

  /** Form body: tree of root fields, with optional DnD in builder mode. Extra padding when items exist so you can drop multiple fields (invisible drop area, no "Drop fields here" box). */
  const formBodyContent = builderMode ? (
    <div
      ref={mainDropZone.setNodeRef}
      className={`space-y-5 ${mainDropZone.isOver ? "ring-2 ring-indigo-400 rounded-lg bg-indigo-50/50" : ""}`}
      style={{
        maxWidth: "100%",
        minHeight: rootFields.length === 0 ? 80 : undefined,
        paddingBottom: rootFields.length > 0 ? 48 : undefined,
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
      <SortableContext items={rootFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        {rootFields.map((field) =>
          field.containerType ? (
            <DroppableContainerNode
              key={field.id}
              field={field}
              formFields={formFields}
              getChildFields={getChildFields}
              renderField={renderField}
            />
          ) : (
            <SortableFieldNode key={field.id} field={field}>
              {renderField(field, undefined)}
            </SortableFieldNode>
          )
        )}
      </SortableContext>
    </div>
  ) : (
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
      {rootFields.map((field) =>
        field.containerType ? renderContainerBlock(field) : renderField(field, undefined)
      )}
    </div>
  );

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
      {/* Header banner – show only when there is an image; in builder mode also show placeholder so user can add */}
      {(bannerUrl || (builderMode && onBannerClick)) && (
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
        {formBodyContent}

        {/* Thanks message after successful response, or Attend & Decline buttons */}
        {responseSubmitted ? (
          <div className="mt-6 py-4 px-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-green-800 font-medium text-base">Thanks for your response.</p>
          </div>
        ) : showActionButtons ? (
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
        ) : null}
      </div>

      {/* Footer image – show only when there is an image; in builder mode also show placeholder so user can add */}
      {(footerBannerUrl || (builderMode && onFooterClick)) && (
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
