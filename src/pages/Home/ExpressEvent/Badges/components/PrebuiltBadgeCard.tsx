/**
 * PrebuiltBadgeCard — Preview card for pre-built badge templates
 *
 * Renders a scaled-down badge preview inside a selectable card,
 * showing the template's actual element layout (photo, name, company,
 * title, QR) on the real background colour.
 */

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Minus,
  Palette,
  Crown,
  Mic,
  Star,
  Cpu,
  Users,
  Check,
  Eye,
  Loader2,
  QrCode,
} from "lucide-react";
import type { PrebuiltBadgeTemplate, BadgeTemplate } from "../prebuiltBadgeTemplates";

/* -------------------------------------------------------------------------- */
/*  Icon resolver                                                              */
/* -------------------------------------------------------------------------- */

const ICONS: Record<string, React.ElementType> = {
  Briefcase,
  Minus,
  Palette,
  Crown,
  Mic,
  Star,
  Cpu,
  Users,
};

/* -------------------------------------------------------------------------- */
/*  Mini Badge Preview – shows scaled badge inside card                        */
/* -------------------------------------------------------------------------- */

const MiniBadgePreview: React.FC<{ template: BadgeTemplate }> = ({
  template,
}) => {
  const { t } = useTranslation("dashboard");

  // Calculate preview dimensions from inches
  // Fit into a ~180 × 260 box at most
  const maxW = 160;
  const maxH = 240;
  const aspect = template.height / template.width;
  let w = maxW;
  let h = w * aspect;
  if (h > maxH) {
    h = maxH;
    w = h / aspect;
  }

  // Scale factor: positions are relative to 400px canvas
  const canvasW = 400;
  const canvasH = canvasW * aspect;
  const sx = w / canvasW;
  const sy = h / canvasH;

  return (
    <div
      className="relative rounded-lg shadow-inner overflow-hidden mx-auto border border-white/20"
      style={{
        width: `${w}px`,
        height: `${h}px`,
        backgroundColor: template.hasBackground
          ? template.bgColor
          : "#ffffff",
      }}
    >
      {/* Personal Photo */}
      {template.hasPersonalPhoto && (
        <div
          className="absolute rounded-full border-2 border-white/30 overflow-hidden"
          style={{
            width: `${(template.photoSize?.width || 120) * sx}px`,
            height: `${(template.photoSize?.height || 120) * sy}px`,
            left: `${(template.photoPosition?.x || 200) * sx}px`,
            top: `${(template.photoPosition?.y || 60) * sy}px`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
            <Users
              size={Math.max(8, (template.photoSize?.width || 120) * sx * 0.4)}
              className="text-white/60"
            />
          </div>
        </div>
      )}

      {/* Name */}
      {template.hasName && template.nameText && (
        <div
          className="absolute w-full px-1"
          style={{
            top: `${(template.nameText.position?.y || 280) * sy}px`,
            textAlign: template.nameText.alignment || "center",
          }}
        >
          <span
            className="font-bold whitespace-nowrap"
            style={{
              fontSize: `${Math.max(6, (template.nameText.size || 24) * sy)}px`,
              color: template.nameText.color || "#ffffff",
              lineHeight: 1.2,
            }}
          >
            {t("expressEvent.sampleName")}
          </span>
        </div>
      )}

      {/* Company */}
      {template.hasCompany && template.companyText && (
        <div
          className="absolute w-full px-1"
          style={{
            top: `${(template.companyText.position?.y || 315) * sy}px`,
            textAlign: template.companyText.alignment || "center",
          }}
        >
          <span
            className="whitespace-nowrap"
            style={{
              fontSize: `${Math.max(5, (template.companyText.size || 14) * sy)}px`,
              color: template.companyText.color || "#cccccc",
              lineHeight: 1.2,
            }}
          >
            {t("expressEvent.sampleCompany")}
          </span>
        </div>
      )}

      {/* Title */}
      {template.hasTitle && template.titleText && (
        <div
          className="absolute w-full px-1"
          style={{
            top: `${(template.titleText.position?.y || 350) * sy}px`,
            textAlign: template.titleText.alignment || "center",
          }}
        >
          <span
            className="whitespace-nowrap"
            style={{
              fontSize: `${Math.max(5, (template.titleText.size || 12) * sy)}px`,
              color: template.titleText.color || "#999999",
              lineHeight: 1.2,
            }}
          >
            {t("expressEvent.sampleTitle")}
          </span>
        </div>
      )}

      {/* QR Code */}
      {template.hasQrCode && template.qrCodeSize && (
        <div
          className="absolute bg-white/90 rounded flex items-center justify-center"
          style={{
            width: `${(template.qrCodeSize.width || 120) * sx}px`,
            height: `${(template.qrCodeSize.height || 120) * sy}px`,
            left: `${(template.qrCodePosition?.x || 200) * sx}px`,
            top: `${(template.qrCodePosition?.y || 400) * sy}px`,
          }}
        >
          <QrCode
            size={Math.max(
              8,
              Math.min(
                (template.qrCodeSize.width || 120) * sx * 0.7,
                (template.qrCodeSize.height || 120) * sy * 0.7,
              ),
            )}
            className="text-gray-600"
          />
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  CATEGORY LABEL                                                             */
/* -------------------------------------------------------------------------- */

const categoryLabel = (cat: string): string => {
  const map: Record<string, string> = {
    corporate: "Corporate",
    minimal: "Minimal",
    creative: "Creative",
    elegant: "Elegant",
    conference: "Conference",
    vip: "VIP",
    tech: "Tech",
    networking: "Networking",
  };
  return map[cat] || cat;
};

/* -------------------------------------------------------------------------- */
/*  MAIN CARD COMPONENT                                                        */
/* -------------------------------------------------------------------------- */

interface PrebuiltBadgeCardProps {
  template: PrebuiltBadgeTemplate;
  isSelected: boolean;
  onSelect: (template: PrebuiltBadgeTemplate) => void;
  onPreview?: (template: PrebuiltBadgeTemplate) => void;
}

const PrebuiltBadgeCard: React.FC<PrebuiltBadgeCardProps> = ({
  template,
  isSelected,
  onSelect,
  onPreview,
}) => {
  const { t } = useTranslation("dashboard");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const IconComponent = ICONS[template.icon] || Briefcase;

  const handleSelect = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSelect(template);
    } finally {
      setIsLoading(false);
    }
  }, [onSelect, template]);

  return (
    <div
      className={`
        group relative flex flex-col rounded-2xl border-2 overflow-hidden
        transition-all duration-300 ease-out cursor-pointer min-h-[350px]
        ${
          isSelected
            ? "border-pink-500 shadow-lg shadow-pink-500/20 scale-[1.02]"
            : "border-gray-200 hover:border-pink-400 hover:shadow-md"
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      {/* ---- Top: gradient preview area ---- */}
      <div
        className="relative flex items-center justify-center p-4 min-h-[260px]"
        style={{ background: template.previewGradient }}
      >
        {/* Category pill */}
        <div
          className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#ffffff",
            backdropFilter: "blur(8px)",
          }}
        >
          {categoryLabel(template.category)}
        </div>

        {/* Icon badge */}
        <div
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <IconComponent size={14} className="text-white/80" />
        </div>

        {/* Mini badge preview */}
        <div
          className="transition-transform duration-300"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        >
          <MiniBadgePreview template={template.template} />
        </div>

        {/* Hover overlay with Preview button */}
        {isHovered && onPreview && (
          <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-4 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 hover:bg-white transition-colors shadow-lg"
            >
              <Eye size={12} />
              {t("expressEvent.preview")}
            </button>
          </div>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center shadow-lg z-10">
            <Check size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* ---- Bottom: info area ---- */}
      <div className="flex flex-col gap-1 p-4 bg-white flex-1">
        <h3 className="text-sm font-semibold text-gray-900 leading-tight">
          {t(template.nameKey)}
        </h3>
        <p className="text-xs text-gray-500 leading-snug line-clamp-2">
          {t(template.descriptionKey)}
        </p>

        {/* Dimensions badge */}
        <div className="mt-auto pt-2 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
            {template.template.width}" × {template.template.height}"
          </span>
          {isSelected && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-pink-500">
              <Check size={12} />
              {t("expressEvent.selected")}
            </span>
          )}
          {isLoading && (
            <Loader2 size={14} className="animate-spin text-pink-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrebuiltBadgeCard;
