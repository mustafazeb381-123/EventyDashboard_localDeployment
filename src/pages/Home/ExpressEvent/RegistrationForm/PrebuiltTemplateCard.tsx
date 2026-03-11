/**
 * PrebuiltTemplateCard — beautiful preview cards for pre-built templates
 *
 * Shows a stylised preview with the template's gradient, a mini form
 * skeleton, the template name / description, and call-to-action buttons.
 * Fully responsive and animated.
 */

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Minus,
  Briefcase,
  Sparkles,
  Crown,
  Users,
  PartyPopper,
  BookOpen,
  GlassWater,
  Check,
  Eye,
  Loader2,
} from "lucide-react";
import type { PrebuiltTemplate } from "./prebuiltTemplates";

/* -------------------------------------------------------------------------- */
/*  Icon resolver                                                              */
/* -------------------------------------------------------------------------- */

const ICONS: Record<string, React.ElementType> = {
  Minus,
  Briefcase,
  Sparkles,
  Crown,
  Users,
  PartyPopper,
  BookOpen,
  GlassWater,
};

/* -------------------------------------------------------------------------- */
/*  Mini Form Skeleton – shows a styled mock form inside the card              */
/* -------------------------------------------------------------------------- */

const MiniFormSkeleton: React.FC<{
  template: PrebuiltTemplate;
}> = ({ template }) => {
  const bg = template.theme.formBackgroundColor || "#ffffff";
  const inputBg = template.theme.inputBackgroundColor || "#f9fafb";
  const inputBorder = template.theme.inputBorderColor || "#d1d5db";
  const buttonBg = template.theme.buttonBackgroundColor || "#111827";
  const buttonText = template.theme.buttonTextColor || "#ffffff";
  const labelColor = template.theme.labelColor || "#374151";
  const headingColor = template.theme.headingColor || "#111827";
  const borderRadius = template.theme.inputBorderRadius || "8px";
  const btnRadius = template.theme.buttonBorderRadius || "8px";

  // Build a structural preview that reflects rows, helperText blocks, dividers
  const childIds = new Set(
    template.fields.filter((f) => f.containerType).flatMap((f) => f.children || [])
  );

  // Only show top-level fields (not children of containers)
  const topLevelFields = template.fields.filter(
    (f) => !childIds.has(f.id)
  );

  const renderMiniField = (labelWidth: string) => (
    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
      <div
        className="h-1 rounded-full"
        style={{ backgroundColor: labelColor, width: labelWidth, opacity: 0.5 }}
      />
      <div
        className="h-3.5 rounded"
        style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}`, borderRadius }}
      />
    </div>
  );

  // Take up to 6 visual rows
  let rowCount = 0;
  const maxRows = 6;

  const elements: React.ReactNode[] = [];

  for (const field of topLevelFields) {
    if (rowCount >= maxRows) break;

    if (field.type === "button") continue; // button rendered separately

    if (field.type === "spacer") {
      elements.push(<div key={field.id} className="h-0.5" />);
      continue; // spacers don't count as rows
    }

    if (field.type === "divider") {
      elements.push(
        <div
          key={field.id}
          className="h-px w-full my-0.5"
          style={{
            backgroundColor: field.fieldStyle?.borderColor || inputBorder,
            opacity: 0.6,
          }}
        />
      );
      rowCount++;
      continue;
    }

    if (field.type === "helperText") {
      const fs = field.fieldStyle;
      elements.push(
        <div
          key={field.id}
          className="rounded px-1.5 py-1"
          style={{
            backgroundColor: fs?.backgroundColor || `${headingColor}10`,
            borderLeft: fs?.borderWidth?.includes("0 0 0")
              ? `3px solid ${fs?.borderColor || headingColor}`
              : undefined,
            borderRadius: fs?.borderWidth?.includes("0 0 0") ? "0 4px 4px 0" : "4px",
          }}
        >
          <div
            className="h-1 rounded-full"
            style={{
              backgroundColor: fs?.textColor || headingColor,
              width: "70%",
              opacity: 0.6,
            }}
          />
        </div>
      );
      rowCount++;
      continue;
    }

    // Container → show children side-by-side
    if (field.containerType && field.children?.length) {
      const childCount = Math.min(field.children.length, 3);
      const containerStyle: React.CSSProperties = {};
      const lp = field.layoutProps;
      if (lp?.backgroundColor) containerStyle.backgroundColor = lp.backgroundColor;
      if (lp?.borderRadius) containerStyle.borderRadius = "4px";
      if (lp?.borderColor) containerStyle.border = `1px solid ${lp.borderColor}`;
      if (lp?.backgroundColor || lp?.borderColor) {
        containerStyle.padding = "4px";
      }

      elements.push(
        <div
          key={field.id}
          className="flex gap-1.5"
          style={containerStyle}
        >
          {Array.from({ length: childCount }).map((_, i) =>
            <React.Fragment key={i}>
              {renderMiniField(`${28 + (i * 12) % 30}%`)}
            </React.Fragment>
          )}
        </div>
      );
      rowCount++;
      continue;
    }

    // Regular standalone field
    elements.push(
      <React.Fragment key={field.id}>
        {renderMiniField(`${30 + (rowCount * 10) % 25}%`)}
      </React.Fragment>
    );
    rowCount++;
  }

  return (
    <div
      className="w-full h-full flex flex-col p-3 gap-1"
      style={{ backgroundColor: bg, borderRadius: "8px" }}
    >
      {/* Mini heading */}
      <div
        className="h-2 rounded-full mb-0.5"
        style={{ backgroundColor: headingColor, width: "60%", opacity: 0.8 }}
      />
      {template.theme.eventDescription && (
        <div
          className="h-1 rounded-full mb-1"
          style={{ backgroundColor: labelColor, width: "42%", opacity: 0.25 }}
        />
      )}

      {/* Structural preview */}
      {elements}

      {/* Mini button */}
      <div className="mt-auto pt-1">
        <div
          className="h-3.5 rounded flex items-center justify-center"
          style={{ background: buttonBg, borderRadius: btnRadius }}
        >
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: buttonText, width: "45%", opacity: 0.9 }}
          />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Category badges                                                            */
/* -------------------------------------------------------------------------- */

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  minimal: { bg: "#f3f4f6", text: "#374151" },
  corporate: { bg: "#dbeafe", text: "#1e40af" },
  creative: { bg: "#ede9fe", text: "#6d28d9" },
  elegant: { bg: "#1f2937", text: "#c9a96e" },
  conference: { bg: "#ffe4e6", text: "#be123c" },
  social: { bg: "#ffedd5", text: "#c2410c" },
  workshop: { bg: "#d1fae5", text: "#047857" },
  gala: { bg: "#fef3c7", text: "#92400e" },
};

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

interface PrebuiltTemplateCardProps {
  template: PrebuiltTemplate;
  isSelected: boolean;
  isLoading: boolean;
  onUse: (key: string) => void;
  onPreview: (key: string) => void;
}

const PrebuiltTemplateCard: React.FC<PrebuiltTemplateCardProps> = ({
  template,
  isSelected,
  isLoading,
  onUse,
  onPreview,
}) => {
  const { t } = useTranslation("dashboard");
  const [isHovered, setIsHovered] = useState(false);

  const Icon = ICONS[template.icon] || Minus;
  const catColor = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.minimal;

  const handleUse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isLoading) onUse(template.key);
    },
    [isLoading, onUse, template.key]
  );

  const handlePreview = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPreview(template.key);
    },
    [onPreview, template.key]
  );

  const inputFieldCount = template.fields.filter(
    (f) => !["heading", "paragraph", "divider", "spacer", "button", "helperText"].includes(f.type) && !f.containerType
  ).length;

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
        ${isSelected
          ? "ring-2 ring-pink-500 ring-offset-2 shadow-lg shadow-pink-100"
          : "ring-1 ring-gray-200 hover:ring-2 hover:ring-pink-300 hover:shadow-lg hover:shadow-gray-100"
        }
        ${isLoading ? "opacity-70 pointer-events-none" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleUse}
    >
      {/* Top: Preview Area */}
      <div
        className="relative h-[180px] overflow-hidden"
        style={{ background: template.previewGradient }}
      >
        {/* Category badge */}
        <div
          className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: catColor.bg, color: catColor.text }}
        >
          {t(`prebuiltTemplates.category_${template.category}`)}
        </div>

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center shadow-md">
            <Check size={14} className="text-white" />
          </div>
        )}

        {/* Mini form preview */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pt-8">
          <div
            className="w-[85%] rounded-lg shadow-sm overflow-hidden transition-transform duration-300"
            style={{
              transform: isHovered ? "scale(1.04) translateY(-2px)" : "scale(1)",
              boxShadow: isHovered
                ? "0 8px 30px rgba(0,0,0,0.12)"
                : "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <MiniFormSkeleton template={template} />
          </div>
        </div>

        {/* Hover overlay with Preview button */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-gray-800 rounded-lg text-xs font-medium hover:bg-white shadow-md transition-all"
          >
            <Eye size={13} />
            {t("prebuiltTemplates.preview")}
          </button>
          <button
            onClick={handleUse}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-medium hover:bg-pink-600 shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            {t("prebuiltTemplates.useTemplate")}
          </button>
        </div>
      </div>

      {/* Bottom: Info Area */}
      <div className="bg-white p-3.5">
        <div className="flex items-start gap-2.5">
          {/* Icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${template.accentColor}15` }}
          >
            <Icon size={16} style={{ color: template.accentColor }} />
          </div>
          {/* Text */}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {t(template.nameKey)}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {t(template.descriptionKey)}
            </p>
          </div>
        </div>
        {/* Meta */}
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
          <span className="text-[10px] text-gray-400 font-medium">
            {inputFieldCount} {t("prebuiltTemplates.fields")}
          </span>
          {isSelected && (
            <span className="flex items-center gap-1 text-[11px] text-pink-500 font-semibold">
              <Check size={12} />
              {t("expressEvent.selected")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrebuiltTemplateCard;
