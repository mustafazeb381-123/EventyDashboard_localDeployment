// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  X,
  GripVertical,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  Upload,
  ChevronDown,
  ChevronUp,
  Type,
  Image as ImageIcon,
  QrCode,
  MousePointerClick,
  Minus,
  MoveVertical,
  Copy,
  Smartphone,
  Monitor,
  Heading1,
  FileText,
  Square,
  LayoutGrid,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Globe,
  Columns,
  Sparkles,
  Save,
  Settings,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QRCodeSVG } from "qrcode.react";
import { GrapesEmailEditor } from "./GrapesEmailEditor";

export type MergeTag = { name: string; value: string };

type Align = "left" | "center" | "right";

type BaseBlock = { id: string; type: string };

type HeadingBlock = BaseBlock & {
  type: "heading";
  text: string;
  align: Align;
  color: string;
  fontSize: number;
};

type ParagraphBlock = BaseBlock & {
  type: "paragraph";
  html: string;
  align: Align;
  color: string;
  fontSize: number;
  lineHeight: number;
};

type ImageBlock = BaseBlock & {
  type: "image";
  src: string;
  alt: string;
  width: number;
  align: Align;
  borderRadius: number;
};

type QRCodeBlock = BaseBlock & {
  type: "qrcode";
  size: number;
  align: Align;
  backgroundColor: string;
  foregroundColor: string;
};

type ButtonBlock = BaseBlock & {
  type: "button";
  text: string;
  href: string;
  align: Align;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
};

type DividerBlock = BaseBlock & {
  type: "divider";
  color: string;
  thickness: number;
  paddingY: number;
};

type SpacerBlock = BaseBlock & {
  type: "spacer";
  height: number;
};

type SocialIcon = {
  platform:
    | "facebook"
    | "twitter"
    | "instagram"
    | "linkedin"
    | "youtube"
    | "email"
    | "website";
  url: string;
};

type SocialBlock = BaseBlock & {
  type: "social";
  icons: SocialIcon[];
  align: Align;
  iconSize: number;
  spacing: number;
};

type ColumnsBlock = BaseBlock & {
  type: "columns";
  columnCount: 2 | 3;
  gap: number;
  content: string[];
};

type EmailBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | QRCodeBlock
  | ButtonBlock
  | DividerBlock
  | SpacerBlock
  | SocialBlock
  | ColumnsBlock;

type GlobalStyles = {
  backgroundColor: string;
  contentWidth: number;
  fontFamily: string;
  primaryColor: string;
  textColor: string;
  linkColor: string;
  paddingX: number;
  paddingY: number;
};

export type EmailTemplateDesign = {
  schema: "eventy-email-builder";
  schemaVersion: 1;
  blocks: EmailBlock[];
  globalStyles: GlobalStyles;
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
}

function stripEmbeddedDesignComment(html: string) {
  return html.replace(/<!--\s*EMAIL_EDITOR_DESIGN:[\s\S]*?-->/g, "");
}

function defaultDesignFromHtml(html?: string): EmailTemplateDesign {
  const safeHtml = html ? stripEmbeddedDesignComment(html) : "";
  const blocks: EmailBlock[] = safeHtml
    ? [
        {
          id: uid("p"),
          type: "paragraph",
          html: safeHtml,
          align: "left",
          color: "#111827",
          fontSize: 14,
          lineHeight: 1.6,
        },
      ]
    : [
        {
          id: uid("h"),
          type: "heading",
          text: "Your email title",
          align: "left",
          color: "#111827",
          fontSize: 24,
        },
        {
          id: uid("p"),
          type: "paragraph",
          html: "<p>Hi {{user.firstname}},</p><p>Write your email content here…</p>",
          align: "left",
          color: "#111827",
          fontSize: 14,
          lineHeight: 1.6,
        },
      ];

  const globalStyles: GlobalStyles = {
    backgroundColor: "#f3f4f6",
    contentWidth: 600,
    fontFamily: "Arial, Helvetica, sans-serif",
    primaryColor: "#ec4899",
    textColor: "#111827",
    linkColor: "#3b82f6",
    paddingX: 24,
    paddingY: 32,
  };

  return {
    schema: "eventy-email-builder",
    schemaVersion: 1,
    blocks,
    globalStyles,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Alignment Button Group Component
   ───────────────────────────────────────────────────────────────────────────── */
function AlignmentButtons({
  value,
  onChange,
}: {
  value: Align;
  onChange: (v: Align) => void;
}) {
  const options: { v: Align; icon: React.ReactNode }[] = [
    { v: "left", icon: <AlignLeft size={16} /> },
    { v: "center", icon: <AlignCenter size={16} /> },
    { v: "right", icon: <AlignRight size={16} /> },
  ];
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      {options.map(({ v, icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 p-2 flex items-center justify-center transition-colors ${
            value === v
              ? "bg-pink-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          title={v.charAt(0).toUpperCase() + v.slice(1)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Image Block Settings Component with File Upload
   ───────────────────────────────────────────────────────────────────────────── */
function ImageBlockSettings({
  block,
  onUpdate,
}: {
  block: ImageBlock;
  onUpdate: (updates: Partial<ImageBlock>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUpdate({ src: dataUrl } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Image Preview
        </label>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 min-h-[100px] flex items-center justify-center">
          {block.src ? (
            <div className="relative w-full">
              <img
                key={block.src}
                src={block.src}
                alt={block.alt || "Preview"}
                className="max-w-full h-auto max-h-40 mx-auto rounded shadow-sm"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "block";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "none";
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div className="hidden h-24 flex-col items-center justify-center text-gray-400 text-sm gap-2">
                <ImageIcon size={24} className="text-gray-300" />
                <span>Image failed to load</span>
              </div>
            </div>
          ) : (
            <div className="h-24 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
              <ImageIcon size={32} className="text-gray-300" />
              <span>No image selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
        >
          <Upload size={18} />
          <span className="font-medium">Upload from Computer</span>
        </button>
      </div>

      {/* Or use URL */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-xs text-gray-400 uppercase">
            or enter URL
          </span>
        </div>
      </div>

      <div>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-pink-400 outline-none"
          placeholder="https://example.com/image.jpg"
          value={block.src}
          onChange={(e) => onUpdate({ src: e.target.value } as any)}
        />
      </div>

      {/* Alt Text */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Alt Text
        </label>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-pink-400 outline-none"
          placeholder="Image description"
          value={block.alt}
          onChange={(e) => onUpdate({ alt: e.target.value } as any)}
        />
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Alignment
        </label>
        <AlignmentButtons
          value={block.align}
          onChange={(v) => onUpdate({ align: v } as any)}
        />
      </div>

      {/* Width Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-gray-600">Width</label>
          <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
            {block.width}px
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="600"
          value={block.width}
          onChange={(e) => onUpdate({ width: Number(e.target.value) } as any)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>50px</span>
          <span>300px</span>
          <span>600px</span>
        </div>
      </div>

      {/* Border Radius Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-gray-600">
            Border Radius
          </label>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {block.borderRadius}px
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={block.borderRadius}
          onChange={(e) =>
            onUpdate({ borderRadius: Number(e.target.value) } as any)
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>0</span>
          <span>Square</span>
          <span>50</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   QR Code Block Settings Component with Preview
   ───────────────────────────────────────────────────────────────────────────── */
function QRCodeBlockSettings({
  block,
  onUpdate,
}: {
  block: QRCodeBlock;
  onUpdate: (updates: Partial<QRCodeBlock>) => void;
}) {
  return (
    <div className="space-y-4">
      {/* QR Code Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          QR Code Preview
        </label>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center">
          <QRCodeSVG
            value="{{user.qrcode}}"
            size={block.size > 120 ? 120 : block.size}
            bgColor={block.backgroundColor}
            fgColor={block.foregroundColor}
          />
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <QrCode size={14} />
            <code className="bg-gray-200 px-2 py-0.5 rounded">
              {"{{user.qrcode}}"}
            </code>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> The QR code will be dynamically generated for
          each recipient using their unique identifier.
        </p>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Alignment
        </label>
        <AlignmentButtons
          value={block.align}
          onChange={(v) => onUpdate({ align: v } as any)}
        />
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          QR Code Size
        </label>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <input
            type="number"
            min={50}
            max={300}
            className="flex-1 px-3 py-2 text-sm outline-none"
            value={block.size}
            onChange={(e) => onUpdate({ size: Number(e.target.value) } as any)}
          />
          <span className="px-2 py-2 bg-gray-50 text-gray-500 text-sm border-l">
            px
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={300}
          className="w-full mt-2 accent-pink-500"
          value={block.size}
          onChange={(e) => onUpdate({ size: Number(e.target.value) } as any)}
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer"
              value={block.backgroundColor}
              onChange={(e) =>
                onUpdate({ backgroundColor: e.target.value } as any)
              }
            />
            <input
              type="text"
              className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm font-mono"
              value={block.backgroundColor}
              onChange={(e) =>
                onUpdate({ backgroundColor: e.target.value } as any)
              }
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Foreground
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer"
              value={block.foregroundColor}
              onChange={(e) =>
                onUpdate({ foregroundColor: e.target.value } as any)
              }
            />
            <input
              type="text"
              className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm font-mono"
              value={block.foregroundColor}
              onChange={(e) =>
                onUpdate({ foregroundColor: e.target.value } as any)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtmlAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderHtml(design: EmailTemplateDesign) {
  const gs = design.globalStyles;

  const bodyInner = design.blocks
    .map((block) => {
      switch (block.type) {
        case "heading": {
          const b = block as HeadingBlock;
          return `<h1 style="margin:0 0 12px 0;text-align:${b.align};color:${
            b.color
          };font-size:${b.fontSize}px;font-weight:700;font-family:${
            gs.fontFamily
          };">${escapeHtmlAttr(b.text)}</h1>`;
        }
        case "paragraph": {
          const b = block as ParagraphBlock;
          return `<div style="margin:0 0 12px 0;text-align:${b.align};color:${b.color};font-size:${b.fontSize}px;line-height:${b.lineHeight};font-family:${gs.fontFamily};">${b.html}</div>`;
        }
        case "image": {
          const b = block as ImageBlock;
          const img = `<img src="${escapeHtmlAttr(
            b.src,
          )}" alt="${escapeHtmlAttr(b.alt)}" style="width:${
            b.width
          }px;max-width:100%;height:auto;border-radius:${
            b.borderRadius
          }px;display:block;" />`;
          const wrapperAlign =
            b.align === "left"
              ? "flex-start"
              : b.align === "right"
                ? "flex-end"
                : "center";
          return `<div style="display:flex;justify-content:${wrapperAlign};margin:0 0 12px 0;">${img}</div>`;
        }
        case "button": {
          const b = block as ButtonBlock;
          const wrapperAlign =
            b.align === "left"
              ? "flex-start"
              : b.align === "right"
                ? "flex-end"
                : "center";
          return `<div style="display:flex;justify-content:${wrapperAlign};margin:16px 0;"><a href="${escapeHtmlAttr(
            b.href,
          )}" style="background:${b.backgroundColor};color:${
            b.textColor
          };text-decoration:none;padding:12px 18px;border-radius:${
            b.borderRadius
          }px;font-family:${
            gs.fontFamily
          };font-weight:600;display:inline-block;">${escapeHtmlAttr(
            b.text,
          )}</a></div>`;
        }
        case "social": {
          const b = block as SocialBlock;
          const wrapperAlign =
            b.align === "left"
              ? "flex-start"
              : b.align === "right"
                ? "flex-end"
                : "center";
          const iconsHtml = b.icons
            .map((icon) => {
              const iconColors: Record<string, string> = {
                facebook: "#1877f2",
                twitter: "#1da1f2",
                instagram: "#e4405f",
                linkedin: "#0077b5",
                youtube: "#ff0000",
                email: "#ea4335",
                website: "#6366f1",
              };
              const color = iconColors[icon.platform] || "#6366f1";
              return `<a href="${escapeHtmlAttr(
                icon.url,
              )}" style="display:inline-block;margin:0 ${Math.floor(
                b.spacing / 2,
              )}px;"><div style="width:${b.iconSize}px;height:${
                b.iconSize
              }px;background:${color};border-radius:50%;"></div></a>`;
            })
            .join("");
          return `<div style="display:flex;justify-content:${wrapperAlign};margin:16px 0;">${iconsHtml}</div>`;
        }
        case "columns": {
          const b = block as ColumnsBlock;
          const colWidth = b.columnCount === 2 ? "48%" : "31%";
          const columnsHtml = b.content
            .map(
              (html) =>
                `<div style="width:${colWidth};display:inline-block;vertical-align:top;font-family:${gs.fontFamily};font-size:14px;color:${gs.textColor};">${html}</div>`,
            )
            .join(`<div style="width:${b.gap}px;display:inline-block;"></div>`);
          return `<div style="margin:16px 0;">${columnsHtml}</div>`;
        }
        case "divider": {
          const b = block as DividerBlock;
          return `<div style="padding:${b.paddingY}px 0;"><div style="height:${b.thickness}px;background:${b.color};width:100%;"></div></div>`;
        }
        case "spacer": {
          const b = block as SpacerBlock;
          return `<div style="height:${b.height}px;line-height:${b.height}px;">&nbsp;</div>`;
        }
        case "qrcode": {
          const b = block as QRCodeBlock;
          const wrapperAlign =
            b.align === "left"
              ? "flex-start"
              : b.align === "right"
                ? "flex-end"
                : "center";
          const bg = b.backgroundColor.replace("#", "%23");
          const fg = b.foregroundColor.replace("#", "%23");
          const qrPlaceholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='${b.size}' height='${b.size}'%3E%3Crect fill='${bg}' width='100' height='100'/%3E%3Crect fill='${fg}' x='10' y='10' width='25' height='25'/%3E%3Crect fill='${bg}' x='15' y='15' width='15' height='15'/%3E%3Crect fill='${fg}' x='18' y='18' width='9' height='9'/%3E%3Crect fill='${fg}' x='65' y='10' width='25' height='25'/%3E%3Crect fill='${bg}' x='70' y='15' width='15' height='15'/%3E%3Crect fill='${fg}' x='73' y='18' width='9' height='9'/%3E%3Crect fill='${fg}' x='10' y='65' width='25' height='25'/%3E%3Crect fill='${bg}' x='15' y='70' width='15' height='15'/%3E%3Crect fill='${fg}' x='18' y='73' width='9' height='9'/%3E%3Crect fill='${fg}' x='40' y='40' width='20' height='20'/%3E%3Crect fill='${fg}' x='45' y='65' width='10' height='10'/%3E%3Crect fill='${fg}' x='65' y='45' width='10' height='10'/%3E%3Crect fill='${fg}' x='75' y='55' width='10' height='10'/%3E%3Crect fill='${fg}' x='65' y='65' width='25' height='10'/%3E%3Crect fill='${fg}' x='65' y='80' width='10' height='10'/%3E%3Crect fill='${fg}' x='80' y='75' width='10' height='15'/%3E%3C/svg%3E`;
          return `<div style="display:flex;justify-content:${wrapperAlign};margin:16px 0;"><img src="${qrPlaceholderSvg}" alt="QR Code Preview" style="width:${b.size}px;height:${b.size}px;display:block;" /></div>`;
        }
        default:
          return "";
      }
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body style="margin:0;padding:0;background:${gs.backgroundColor};font-family:${gs.fontFamily};"><div style="max-width:${gs.contentWidth}px;margin:0 auto;background:#ffffff;padding:${gs.paddingY}px ${gs.paddingX}px;">${bodyInner}</div></body></html>`;
}

function renderHtmlForPreview(design: EmailTemplateDesign) {
  const gs = design.globalStyles;

  const bodyInner = design.blocks
    .map((block) => {
      switch (block.type) {
        case "heading": {
          const b = block as HeadingBlock;
          return `<h1 style="margin:0 0 12px 0;text-align:${b.align};color:${
            b.color
          };font-size:${b.fontSize}px;font-weight:700;font-family:${
            gs.fontFamily
          };">${escapeHtmlAttr(b.text)}</h1>`;
        }
        case "paragraph": {
          const b = block as ParagraphBlock;
          return `<div style="margin:0 0 12px 0;text-align:${b.align};color:${b.color};font-size:${b.fontSize}px;line-height:${b.lineHeight};font-family:${gs.fontFamily};">${b.html}</div>`;
        }
        case "image": {
          const b = block as ImageBlock;
          const img = `<img src="${escapeHtmlAttr(
            b.src,
          )}" alt="${escapeHtmlAttr(b.alt)}" style="max-width:100%;width:auto;height:auto;border-radius:${
            b.borderRadius
          }px;display:block;" />`;
          const wrapperAlign =
            b.align === "left"
              ? "flex-start"
              : b.align === "right"
                ? "flex-end"
                : "center";
          return `<div style="display:flex;justify-content:${wrapperAlign};margin:0 0 12px 0;width:100%;">${img}</div>`;
        }
        case "button": {
          const b = block as ButtonBlock;
          const wrapperAlign =
            b.align === "left"
              ? "flex-start"
              : b.align === "right"
                ? "flex-end"
                : "center";
          return `<div style="display:flex;justify-content:${wrapperAlign};margin:16px 0;"><a href="${escapeHtmlAttr(
            b.href,
          )}" style="background:${b.backgroundColor};color:${
            b.textColor
          };text-decoration:none;padding:12px 18px;border-radius:${
            b.borderRadius
          }px;font-family:${
            gs.fontFamily
          };font-weight:600;display:inline-block;">${escapeHtmlAttr(
            b.text,
          )}</a></div>`;
        }
        case "social": {
          const b = block as SocialBlock;
          const wrapperAlign =
            b.align === "left"
              ? "flex-start"
              : b.align === "right"
                ? "flex-end"
                : "center";
          const iconsHtml = b.icons
            .map((icon) => {
              const iconColors: Record<string, string> = {
                facebook: "#1877f2",
                twitter: "#1da1f2",
                instagram: "#e4405f",
                linkedin: "#0077b5",
                youtube: "#ff0000",
                email: "#ea4335",
                website: "#6366f1",
              };
              const color = iconColors[icon.platform] || "#6366f1";
              return `<a href="${escapeHtmlAttr(
                icon.url,
              )}" style="display:inline-block;margin:0 ${Math.floor(
                b.spacing / 2,
              )}px;"><div style="width:${b.iconSize}px;height:${
                b.iconSize
              }px;background:${color};border-radius:50%;"></div></a>`;
            })
            .join("");
          return `<div style="display:flex;justify-content:${wrapperAlign};margin:16px 0;">${iconsHtml}</div>`;
        }
        case "columns": {
          const b = block as ColumnsBlock;
          const colWidth = b.columnCount === 2 ? "48%" : "31%";
          const columnsHtml = b.content
            .map(
              (html) =>
                `<div style="width:${colWidth};display:inline-block;vertical-align:top;font-family:${gs.fontFamily};font-size:14px;color:${gs.textColor};">${html}</div>`,
            )
            .join(`<div style="width:${b.gap}px;display:inline-block;"></div>`);
          return `<div style="margin:16px 0;">${columnsHtml}</div>`;
        }
        case "divider": {
          const b = block as DividerBlock;
          return `<div style="padding:${b.paddingY}px 0;"><div style="height:${b.thickness}px;background:${b.color};width:100%;"></div></div>`;
        }
        case "spacer": {
          const b = block as SpacerBlock;
          return `<div style="height:${b.height}px;line-height:${b.height}px;">&nbsp;</div>`;
        }
        case "qrcode": {
          const b = block as QRCodeBlock;
          const wrapperAlign =
            b.align === "left"
              ? "flex-start"
              : b.align === "right"
                ? "flex-end"
                : "center";
          const bg = b.backgroundColor.replace("#", "%23");
          const fg = b.foregroundColor.replace("#", "%23");
          const qrPlaceholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='${b.size}' height='${b.size}'%3E%3Crect fill='${bg}' width='100' height='100'/%3E%3Crect fill='${fg}' x='10' y='10' width='25' height='25'/%3E%3Crect fill='${bg}' x='15' y='15' width='15' height='15'/%3E%3Crect fill='${fg}' x='18' y='18' width='9' height='9'/%3E%3Crect fill='${fg}' x='65' y='10' width='25' height='25'/%3E%3Crect fill='${bg}' x='70' y='15' width='15' height='15'/%3E%3Crect fill='${fg}' x='73' y='18' width='9' height='9'/%3E%3Crect fill='${fg}' x='10' y='65' width='25' height='25'/%3E%3Crect fill='${bg}' x='15' y='70' width='15' height='15'/%3E%3Crect fill='${fg}' x='18' y='73' width='9' height='9'/%3E%3Crect fill='${fg}' x='40' y='40' width='20' height='20'/%3E%3Crect fill='${fg}' x='45' y='65' width='10' height='10'/%3E%3Crect fill='${fg}' x='65' y='45' width='10' height='10'/%3E%3Crect fill='${fg}' x='75' y='55' width='10' height='10'/%3E%3Crect fill='${fg}' x='65' y='65' width='25' height='10'/%3E%3Crect fill='${fg}' x='65' y='80' width='10' height='10'/%3E%3Crect fill='${fg}' x='80' y='75' width='10' height='15'/%3E%3C/svg%3E`;
          return `<div style="display:flex;justify-content:${wrapperAlign};margin:16px 0;"><img src="${qrPlaceholderSvg}" alt="QR Code Preview" style="width:${b.size}px;height:${b.size}px;display:block;" /></div>`;
        }
        default:
          return "";
      }
    })
    .join("");

  // Preview version: full width, no max-width constraint, responsive
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      overflow-x: hidden;
      width: 100%;
    } 
    body > div { 
      max-width: 100% !important; 
      width: 100% !important; 
      overflow-x: hidden;
    }
    img { 
      max-width: 100% !important; 
      height: auto !important; 
    }
    div { 
      max-width: 100% !important; 
      overflow-wrap: break-word;
      word-wrap: break-word;
    }
    table { 
      max-width: 100% !important; 
      table-layout: fixed;
    }
  </style></head><body style="margin:0;padding:0;background:${gs.backgroundColor};font-family:${gs.fontFamily};overflow-x:hidden;"><div style="width:100%;max-width:100%;background:#ffffff;padding:${gs.paddingY}px ${gs.paddingX}px;overflow-x:hidden;">${bodyInner}</div></body></html>`;
}

function renderPreviewContent(block: EmailBlock, gs: GlobalStyles) {
  switch (block.type) {
    case "heading": {
      const b = block as HeadingBlock;
      return (
        <h2
          style={{
            margin: "0 0 12px 0",
            textAlign: b.align,
            color: b.color,
            fontSize: `${b.fontSize}px`,
            fontWeight: 700,
            fontFamily: gs.fontFamily,
            lineHeight: 1.3,
          }}
        >
          {b.text}
        </h2>
      );
    }
    case "paragraph": {
      const b = block as ParagraphBlock;
      return (
        <div
          style={{
            margin: "0 0 12px 0",
            textAlign: b.align,
            color: b.color,
            fontSize: `${b.fontSize}px`,
            lineHeight: b.lineHeight,
            fontFamily: gs.fontFamily,
          }}
          dangerouslySetInnerHTML={{ __html: b.html }}
        />
      );
    }
    case "image": {
      const b = block as ImageBlock;
      const justify =
        b.align === "left"
          ? "flex-start"
          : b.align === "right"
            ? "flex-end"
            : "center";
      return (
        <div
          style={{
            display: "flex",
            justifyContent: justify,
            margin: "0 0 12px 0",
          }}
        >
          <img
            key={b.src}
            src={b.src}
            alt={b.alt || "Image"}
            style={{
              width: `${b.width}px`,
              maxWidth: "100%",
              height: "auto",
              borderRadius: `${b.borderRadius}px`,
              display: "block",
              objectFit: "cover",
            }}
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "block";
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      );
    }
    case "button": {
      const b = block as ButtonBlock;
      const justify =
        b.align === "left"
          ? "flex-start"
          : b.align === "right"
            ? "flex-end"
            : "center";
      return (
        <div
          style={{ display: "flex", justifyContent: justify, margin: "16px 0" }}
        >
          <a
            href={b.href || "#"}
            style={{
              background: b.backgroundColor,
              color: b.textColor,
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: `${b.borderRadius}px`,
              fontFamily: gs.fontFamily,
              fontWeight: 600,
              display: "inline-block",
            }}
          >
            {b.text}
          </a>
        </div>
      );
    }
    case "social": {
      const b = block as SocialBlock;
      const justify =
        b.align === "left"
          ? "flex-start"
          : b.align === "right"
            ? "flex-end"
            : "center";
      const iconColors: Record<string, string> = {
        facebook: "#1877f2",
        twitter: "#1da1f2",
        instagram: "#e4405f",
        linkedin: "#0077b5",
        youtube: "#ff0000",
        email: "#ea4335",
        website: "#6366f1",
      };
      return (
        <div
          style={{
            display: "flex",
            justifyContent: justify,
            gap: `${b.spacing}px`,
            flexWrap: "wrap",
          }}
        >
          {b.icons.map((icon, idx) => (
            <div
              key={`${icon.platform}-${idx}`}
              style={{
                width: `${b.iconSize}px`,
                height: `${b.iconSize}px`,
                borderRadius: "9999px",
                background: iconColors[icon.platform] || gs.primaryColor,
                display: "grid",
                placeItems: "center",
                color: "white",
              }}
              title={icon.url}
            >
              {getSocialIcon(icon.platform)}
            </div>
          ))}
        </div>
      );
    }
    case "columns": {
      const b = block as ColumnsBlock;
      const columns = b.columnCount === 2 ? "1fr 1fr" : "1fr 1fr 1fr";
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: columns,
            gap: `${b.gap}px`,
            width: "100%",
          }}
        >
          {b.content.slice(0, b.columnCount).map((html, idx) => (
            <div
              key={idx}
              style={{
                fontFamily: gs.fontFamily,
                fontSize: "14px",
                color: gs.textColor,
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </div>
      );
    }
    case "divider": {
      const b = block as DividerBlock;
      return (
        <div style={{ padding: `${b.paddingY}px 0` }}>
          <div
            style={{
              height: `${b.thickness}px`,
              background: b.color,
              width: "100%",
            }}
          />
        </div>
      );
    }
    case "spacer": {
      const b = block as SpacerBlock;
      return <div style={{ height: `${b.height}px` }} />;
    }
    case "qrcode": {
      const b = block as QRCodeBlock;
      const justify =
        b.align === "left"
          ? "flex-start"
          : b.align === "right"
            ? "flex-end"
            : "center";
      return (
        <div
          style={{ display: "flex", justifyContent: justify, margin: "16px 0" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <QRCodeSVG
              value="{{user.qrcode}}"
              size={b.size}
              bgColor={b.backgroundColor}
              fgColor={b.foregroundColor}
            />
            <span
              style={{
                fontSize: "11px",
                color: "#6b7280",
                fontFamily: gs.fontFamily,
              }}
            >
              QR Code will be generated for each recipient
            </span>
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

function SortablePreviewBlock({
  block,
  gs,
  selected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  block: EmailBlock;
  gs: GlobalStyles;
  selected: boolean;
  onSelect: (blockId: string) => void;
  onEdit: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div
        className={`relative group rounded-lg border transition-all cursor-pointer ${
          selected
            ? "border-pink-500 ring-2 ring-pink-200 ring-offset-2 shadow-lg bg-pink-50/30"
            : "border-gray-300 bg-white hover:border-pink-300 hover:shadow-md"
        } ${isDragging ? "opacity-50 scale-95" : "opacity-100"}`}
        onClick={() => onSelect(block.id)}
        style={{
          padding: block.type === "spacer" ? "8px 12px" : "12px 16px",
        }}
      >
        {/* Selection indicator */}
        {selected && (
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-pink-500 rounded-full" />
        )}

        {/* Block actions - shown on hover */}
        <div className="absolute top-2 right-2 flex flex-wrap items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <button
            type="button"
            className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md bg-white text-gray-700 text-xs border border-gray-300 shadow-md hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(block.id);
            }}
            title="Edit block"
          >
            <Type size={11} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md bg-white text-gray-700 text-xs border border-gray-300 shadow-md hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(block.id);
            }}
            title="Duplicate block"
          >
            <Copy size={11} />
            <span className="hidden sm:inline">Copy</span>
          </button>
          <button
            type="button"
            className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md bg-white text-gray-700 text-xs border border-gray-300 shadow-md hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            title="Delete block"
          >
            <Trash2 size={11} />
            <span className="hidden sm:inline">Delete</span>
          </button>
          <button
            type="button"
            className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md bg-white text-gray-700 text-xs border border-gray-300 shadow-md hover:border-gray-400 transition-colors cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <GripVertical size={11} />
            <span className="hidden sm:inline">Drag</span>
          </button>
        </div>

        {/* Block content */}
        <div className="pr-20">{renderPreviewContent(block, gs)}</div>
      </div>
    </div>
  );
}

function RichTextEditor({
  value,
  onChange,
  mergeTags,
}: {
  value: string;
  onChange: (html: string) => void;
  mergeTags: MergeTag[];
}) {
  const [showTags, setShowTags] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Initialize content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value;
      isInitialized.current = true;
    }
  }, [value]);

  const execCommand = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    // Trigger onChange after command
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertTag = (tag: MergeTag) => {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<span style="background:#fce7f3;padding:0 4px;border-radius:2px;">${tag.value}</span>&nbsp;`,
    );
    setShowTags(false);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter link URL:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const setFontSize = (size: string) => {
    execCommand("fontSize", size);
    setShowFontSize(false);
  };

  const setTextColor = (color: string) => {
    execCommand("foreColor", color);
    setShowTextColor(false);
  };

  const setBgColor = (color: string) => {
    execCommand("hiliteColor", color);
    setShowBgColor(false);
  };

  const ToolbarButton = ({
    onClick,
    children,
    title,
    className = "",
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded transition-colors text-gray-600 hover:bg-gray-200 hover:text-gray-900 ${className}`}
    >
      {children}
    </button>
  );

  const fontSizes = [
    { label: "Small", value: "1" },
    { label: "Normal", value: "3" },
    { label: "Large", value: "4" },
    { label: "Huge", value: "6" },
  ];

  const colors = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#cccccc",
    "#ffffff",
    "#980000",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
    "#e6b8af",
    "#f4cccc",
    "#fce5cd",
    "#fff2cc",
    "#d9ead3",
    "#d0e0e3",
    "#c9daf8",
    "#cfe2f3",
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-b bg-gray-50 flex-wrap">
        {/* Undo/Redo */}
        <div className="flex items-center border-r border-gray-300 pr-1 mr-1">
          <ToolbarButton onClick={() => execCommand("undo")} title="Undo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("redo")} title="Redo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Font Size */}
        <div className="relative border-r border-gray-300 pr-1 mr-1">
          <button
            type="button"
            onClick={() => setShowFontSize(!showFontSize)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded"
            title="Font Size"
          >
            <span>Size</span>
            <ChevronDown size={12} />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-50">
              {fontSizes.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFontSize(s.value)}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Formatting */}
        <div className="flex items-center border-r border-gray-300 pr-1 mr-1">
          <ToolbarButton
            onClick={() => execCommand("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("underline")}
            title="Underline (Ctrl+U)"
          >
            <Underline size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("strikeThrough")}
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </ToolbarButton>
        </div>

        {/* Text Color */}
        <div className="relative border-r border-gray-300 pr-1 mr-1">
          <button
            type="button"
            onClick={() => {
              setShowTextColor(!showTextColor);
              setShowBgColor(false);
            }}
            className="flex items-center gap-1 p-1.5 text-gray-600 hover:bg-gray-200 rounded"
            title="Text Color"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 20h16" />
              <path d="m6 16 6-12 6 12" />
              <path d="M8 12h8" />
            </svg>
          </button>
          {showTextColor && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-50 w-40">
              <div className="text-xs text-gray-500 mb-1">Text Color</div>
              <div className="grid grid-cols-6 gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTextColor(c)}
                    className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="relative border-r border-gray-300 pr-1 mr-1">
          <button
            type="button"
            onClick={() => {
              setShowBgColor(!showBgColor);
              setShowTextColor(false);
            }}
            className="flex items-center gap-1 p-1.5 text-gray-600 hover:bg-gray-200 rounded"
            title="Highlight Color"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
          </button>
          {showBgColor && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-50 w-40">
              <div className="text-xs text-gray-500 mb-1">Highlight</div>
              <div className="grid grid-cols-6 gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alignment */}
        <div className="flex items-center border-r border-gray-300 pr-1 mr-1">
          <ToolbarButton
            onClick={() => execCommand("justifyLeft")}
            title="Align Left"
          >
            <AlignLeft size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyCenter")}
            title="Align Center"
          >
            <AlignCenter size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyRight")}
            title="Align Right"
          >
            <AlignRight size={15} />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-gray-300 pr-1 mr-1">
          <ToolbarButton
            onClick={() => execCommand("insertUnorderedList")}
            title="Bullet List"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3" cy="6" r="1" fill="currentColor" />
              <circle cx="3" cy="12" r="1" fill="currentColor" />
              <circle cx="3" cy="18" r="1" fill="currentColor" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("insertOrderedList")}
            title="Numbered List"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <text x="3" y="7" fontSize="6" fill="currentColor" stroke="none">
                1
              </text>
              <text x="3" y="13" fontSize="6" fill="currentColor" stroke="none">
                2
              </text>
              <text x="3" y="19" fontSize="6" fill="currentColor" stroke="none">
                3
              </text>
            </svg>
          </ToolbarButton>
        </div>

        {/* Link */}
        <div className="flex items-center border-r border-gray-300 pr-1 mr-1">
          <ToolbarButton onClick={insertLink} title="Insert Link">
            <Link2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("unlink")}
            title="Remove Link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
              <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Clear Formatting */}
        <div className="flex items-center border-r border-gray-300 pr-1 mr-1">
          <ToolbarButton
            onClick={() => execCommand("removeFormat")}
            title="Clear Formatting"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16" />
              <path d="M10 4v3" />
              <path d="M9 20h6" />
              <path d="M12 17v3" />
              <path d="M12 7l-4 10" />
              <line x1="4" y1="21" x2="20" y2="5" />
            </svg>
          </ToolbarButton>
        </div>

        {/* Merge Tags / Personalization */}
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setShowTags((s) => !s)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
          >
            <Type size={13} />
            Personalize
            <ChevronDown
              size={12}
              className={`transition-transform ${showTags ? "rotate-180" : ""}`}
            />
          </button>
          {showTags && (
            <div className="absolute right-0 z-50 mt-1 w-64 max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl">
              <div className="p-2 border-b bg-gray-50 sticky top-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Insert Merge Tag
                </span>
              </div>
              {mergeTags.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => insertTag(t)}
                  className="flex items-center justify-between w-full text-left px-3 py-2 hover:bg-pink-50 text-sm border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">{t.name}</span>
                  <code className="text-xs bg-pink-100 px-1.5 py-0.5 rounded text-pink-600 font-mono">
                    {t.value}
                  </code>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="w-full min-h-48 p-4 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-inset"
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
        contentEditable
        suppressContentEditableWarning
        onBlur={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        onKeyUp={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
      />
    </div>
  );
}

function SortableRow({
  id,
  selected,
  label,
  blockType,
  onClick,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  id: string;
  selected: boolean;
  label: string;
  blockType: string;
  onClick: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 border rounded-lg px-2 py-2 cursor-pointer transition-all ${
        selected
          ? "border-pink-400 bg-gradient-to-r from-pink-50 to-pink-100 shadow-md ring-1 ring-pink-200"
          : "border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/50"
      }`}
      onClick={onClick}
    >
      <div
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </div>
      <div
        className={`p-1.5 rounded ${
          selected ? "bg-pink-200 text-pink-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {blockIcon(blockType)}
      </div>
      <div
        className={`text-sm font-medium truncate flex-1 ${
          selected ? "text-pink-700" : "text-gray-700"
        }`}
      >
        {label}
      </div>
      {/* Quick Actions - shown on hover */}
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={isFirst}
          className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move Up"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={isLast}
          className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move Down"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

function blockLabel(block: EmailBlock) {
  switch (block.type) {
    case "heading":
      return "Heading";
    case "paragraph":
      return "Paragraph";
    case "image":
      return "Image";
    case "qrcode":
      return "QR Code";
    case "button":
      return "Button";
    case "social":
      return "Social Icons";
    case "columns":
      return "Columns";
    case "divider":
      return "Divider";
    case "spacer":
      return "Spacer";
    default:
      return "Block";
  }
}

function blockIcon(type: string) {
  switch (type) {
    case "heading":
      return <Heading1 size={14} />;
    case "paragraph":
      return <FileText size={14} />;
    case "image":
      return <ImageIcon size={14} />;
    case "qrcode":
      return <QrCode size={14} />;
    case "button":
      return <Square size={14} />;
    case "divider":
      return <Minus size={14} />;
    case "spacer":
      return <MoveVertical size={14} />;
    case "social":
      return <Globe size={14} />;
    case "columns":
      return <Columns size={14} />;
    default:
      return <LayoutGrid size={14} />;
  }
}

function getSocialIcon(platform: string) {
  switch (platform) {
    case "facebook":
      return <Facebook size={16} />;
    case "twitter":
      return <Twitter size={16} />;
    case "instagram":
      return <Instagram size={16} />;
    case "linkedin":
      return <Linkedin size={16} />;
    case "youtube":
      return <Youtube size={16} />;
    case "email":
      return <Mail size={16} />;
    case "website":
      return <Globe size={16} />;
    default:
      return <Globe size={16} />;
  }
}

function addBlock(
  design: EmailTemplateDesign,
  type: EmailBlock["type"],
): EmailTemplateDesign {
  const next = { ...design, blocks: [...design.blocks] };
  if (type === "heading") {
    next.blocks.push({
      id: uid("h"),
      type: "heading",
      text: "New heading",
      align: "left",
      color: "#111827",
      fontSize: 22,
    });
  } else if (type === "paragraph") {
    next.blocks.push({
      id: uid("p"),
      type: "paragraph",
      html: "<p>New paragraph…</p>",
      align: "left",
      color: "#111827",
      fontSize: 14,
      lineHeight: 1.6,
    });
  } else if (type === "image") {
    next.blocks.push({
      id: uid("img"),
      type: "image",
      src: "https://via.placeholder.com/600x240.png?text=Image",
      alt: "",
      width: 520,
      align: "center",
      borderRadius: 8,
    });
  } else if (type === "qrcode") {
    next.blocks.push({
      id: uid("qr"),
      type: "qrcode",
      size: 150,
      align: "center",
      backgroundColor: "#ffffff",
      foregroundColor: "#000000",
    });
  } else if (type === "button") {
    next.blocks.push({
      id: uid("btn"),
      type: "button",
      text: "Call to action",
      href: "https://example.com",
      align: "center",
      backgroundColor: "#ec4899",
      textColor: "#ffffff",
      borderRadius: 10,
    });
  } else if (type === "divider") {
    next.blocks.push({
      id: uid("div"),
      type: "divider",
      color: "#e5e7eb",
      thickness: 1,
      paddingY: 16,
    });
  } else if (type === "spacer") {
    next.blocks.push({
      id: uid("sp"),
      type: "spacer",
      height: 24,
    });
  } else if (type === "social") {
    next.blocks.push({
      id: uid("social"),
      type: "social",
      icons: [
        { platform: "facebook", url: "https://facebook.com" },
        { platform: "twitter", url: "https://twitter.com" },
        { platform: "instagram", url: "https://instagram.com" },
      ],
      align: "center",
      iconSize: 32,
      spacing: 12,
    });
  } else if (type === "columns") {
    next.blocks.push({
      id: uid("cols"),
      type: "columns",
      columnCount: 2,
      gap: 16,
      content: ["<p>Column 1 content</p>", "<p>Column 2 content</p>"],
    });
  }
  return next;
}

export function EmailTemplateBuilderModal({
  open,
  title,
  initialDesign,
  initialHtml,
  mergeTags,
  onClose,
  onSave,
}: {
  open: boolean;
  title?: string;
  initialDesign?: any;
  initialHtml?: string;
  mergeTags: MergeTag[];
  onClose: () => void;
  onSave: (design: EmailTemplateDesign, html: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const startingDesign: EmailTemplateDesign = useMemo(() => {
    if (
      initialDesign?.schema === "eventy-email-builder" &&
      initialDesign?.schemaVersion === 1
    ) {
      return initialDesign as EmailTemplateDesign;
    }
    return defaultDesignFromHtml(initialHtml);
  }, [initialDesign, initialHtml]);

  const [design, setDesign] = useState<EmailTemplateDesign>(startingDesign);
  const [selectedId, setSelectedId] = useState<string>(
    startingDesign.blocks[0]?.id,
  );
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [previewType, setPreviewType] = useState<"builder" | "html">("builder");

  const initialGrapesHtml = useMemo(() => {
    if (initialHtml) return stripEmbeddedDesignComment(initialHtml);
    return renderHtml(startingDesign);
  }, [initialHtml, startingDesign]);

  const [grapesHtml, setGrapesHtml] = useState<string>(initialGrapesHtml);

  useEffect(() => {
    if (!open) return;
    setGrapesHtml(initialGrapesHtml);
  }, [open, initialGrapesHtml]);

  const selectedBlock = design.blocks.find((b) => b.id === selectedId);
  const previewHtml = useMemo(() => renderHtml(design), [design]);
  const previewHtmlFullWidth = useMemo(
    () => renderHtmlForPreview(design),
    [design],
  );

  if (!open) return null;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = design.blocks.findIndex((b) => b.id === active.id);
    const newIndex = design.blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setDesign((prev) => ({
      ...prev,
      blocks: arrayMove(prev.blocks, oldIndex, newIndex),
    }));
  };

  const updateSelected = (patch: Partial<EmailBlock>) => {
    if (!selectedBlock) return;
    setDesign((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === selectedBlock.id ? ({ ...b, ...patch } as EmailBlock) : b,
      ),
    }));
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDupe = design.blocks.find((b) => b.id === blockId);
    if (!blockToDupe) return;
    const newBlock = { ...blockToDupe, id: uid(blockToDupe.type.slice(0, 3)) };
    const idx = design.blocks.findIndex((b) => b.id === blockId);
    const newBlocks = [...design.blocks];
    newBlocks.splice(idx + 1, 0, newBlock as EmailBlock);
    setDesign((prev) => ({ ...prev, blocks: newBlocks }));
    setSelectedId(newBlock.id);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const idx = design.blocks.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= design.blocks.length) return;
    setDesign((prev) => ({
      ...prev,
      blocks: arrayMove(prev.blocks, idx, newIdx),
    }));
  };

  const removeBlock = (blockId: string) => {
    setDesign((prev) => {
      const removedIndex = prev.blocks.findIndex((b) => b.id === blockId);
      const remaining = prev.blocks.filter((b) => b.id !== blockId);
      const fallbackBlocks = remaining.length
        ? remaining
        : defaultDesignFromHtml().blocks;
      const nextIndex = Math.min(
        Math.max(0, removedIndex - 1),
        fallbackBlocks.length - 1,
      );
      const nextSelectedId =
        blockId === selectedId
          ? fallbackBlocks[nextIndex]?.id
          : selectedId && fallbackBlocks.some((b) => b.id === selectedId)
            ? selectedId
            : fallbackBlocks[0]?.id;
      setSelectedId(nextSelectedId);
      return { ...prev, blocks: fallbackBlocks };
    });
  };

  const removeSelected = () => {
    if (!selectedBlock) return;
    removeBlock(selectedBlock.id);
  };

  const save = () => {
    const htmlToSave = grapesHtml;
    const designToSave = defaultDesignFromHtml(htmlToSave);
    onSave(designToSave, htmlToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {title || "Email Template Builder"}
                </h3>
                <p className="text-xs text-pink-100 mt-0.5">
                  Design your email template
                </p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 backdrop-blur-sm">
              <LayoutGrid size={14} />
              <span className="text-sm font-medium">
                {design.blocks.length}{" "}
                {design.blocks.length === 1 ? "block" : "blocks"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white text-pink-600 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
            >
              <Save size={16} />
              Save Template
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              title="Close editor"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-0 min-h-0">
          <div className="col-span-12 h-full min-h-0">
            <GrapesEmailEditor
              initialHtml={initialGrapesHtml}
              mergeTags={mergeTags}
              onChange={setGrapesHtml}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-600">Shortcuts:</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-gray-700 font-mono shadow-sm">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-gray-700 font-mono shadow-sm">
              B
            </kbd>
            <span className="text-gray-400">Bold</span>
            <span className="text-gray-300">|</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-gray-700 font-mono shadow-sm">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-gray-700 font-mono shadow-sm">
              I
            </kbd>
            <span className="text-gray-400">Italic</span>
            <span className="text-gray-300">|</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-gray-700 font-mono shadow-sm">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-gray-700 font-mono shadow-sm">
              U
            </kbd>
            <span className="text-gray-400">Underline</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold text-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="flex-1 sm:flex-none bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
