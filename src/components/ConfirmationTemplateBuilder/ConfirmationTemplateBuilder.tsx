import React, { useState, useCallback } from "react";
import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  QrCode,
  MapPin,
  Info,
  Calendar,
  Clock,
  Type,
  Minus,
  Square,
  User,
  LayoutTemplate,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import { ConfirmationPreview } from "./ConfirmationPreview";
import {
  type ConfirmationBlock,
  type ConfirmationBlockType,
  type ConfirmationBlockOptions,
  type ConfirmationPreviewData,
  BLOCK_LABELS,
  THEME_LABELS,
  ALIGNMENT_OPTIONS,
  HEADING_SIZE_OPTIONS,
  SPACER_SIZE_OPTIONS,
  DIVIDER_STYLE_OPTIONS,
  PADDING_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  SHADOW_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  TEXT_COLOR_OPTIONS,
  DIVIDER_THICKNESS_OPTIONS,
  QR_SIZE_OPTIONS,
} from "./types";
import type {
  BlockTheme,
  BlockHeadingSize,
  BlockSpacerSize,
  DividerStyle,
  CustomTextSize,
  PaddingSize,
  BorderWidth,
  BorderRadius,
  ShadowSize,
  FontWeight,
  TextColorPreset,
} from "./types";

const BLOCK_ICONS: Record<ConfirmationBlockType, React.ComponentType<{ size?: number; className?: string }>> = {
  success_badge: Check,
  confirmation_message: Check,
  qr_code: QrCode,
  event_name: LayoutTemplate,
  event_date_time: Calendar,
  location: MapPin,
  event_details: Info,
  attendee_name: User,
  event_logo: ImageIcon,
  divider: Minus,
  spacer: Square,
  custom_text: Type,
};

/** Normalize to #rrggbb for type="color"; expand #abc to #aabbcc */
function toHexColor(s: string | undefined): string | undefined {
  if (!s?.trim()) return undefined;
  const t = s.trim();
  if (/^#([0-9A-Fa-f]{3})$/i.test(t))
    return `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`;
  if (/^#([0-9A-Fa-f]{6})$/i.test(t)) return t;
  return undefined;
}

function ColorPickerField({
  value,
  onChange,
  placeholder = "#000000",
}: {
  value: string | undefined;
  onChange: (hex: string | undefined) => void;
  placeholder?: string;
}) {
  const hex = value?.trim() || "";
  const normalized = toHexColor(hex) || (hex.startsWith("#") ? hex : undefined);
  const pickerValue = normalized || "#808080";
  return (
    <div className="flex gap-2 items-center">
      <input
        type="color"
        value={pickerValue}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer bg-white p-0.5 shrink-0"
        title="Pick color"
      />
      <input
        type="text"
        value={hex}
        onChange={(e) => onChange(e.target.value.trim() || undefined)}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
      />
    </div>
  );
}

const BLOCKS_WITH_THEME: ConfirmationBlockType[] = [
  "success_badge",
  "confirmation_message",
  "qr_code",
  "location",
  "event_details",
];

const BLOCKS_WITH_HEADING_SIZE: ConfirmationBlockType[] = [
  "success_badge",
  "event_name",
  "attendee_name",
];

function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ConfirmationTemplateBuilderProps {
  eventData?: ConfirmationPreviewData | null;
  initialBlocks?: ConfirmationBlock[];
  onTemplateChange?: (blocks: ConfirmationBlock[]) => void;
  className?: string;
}

export function ConfirmationTemplateBuilder({
  eventData = null,
  initialBlocks = [],
  onTemplateChange,
  className = "",
}: ConfirmationTemplateBuilderProps) {
  const [blocks, setBlocks] = useState<ConfirmationBlock[]>(() =>
    initialBlocks.length > 0 ? initialBlocks : []
  );
  const [editingCustomTextId, setEditingCustomTextId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const previewData: ConfirmationPreviewData = {
    eventName: eventData?.eventName ?? "Sample Event",
    eventDateFrom: eventData?.eventDateFrom ?? "2026-03-15",
    eventDateTo: eventData?.eventDateTo ?? "2026-03-16",
    eventTimeFrom: eventData?.eventTimeFrom ?? "09:00:00",
    eventTimeTo: eventData?.eventTimeTo ?? "17:00:00",
    location: eventData?.location ?? "123 Main St, City",
    about: eventData?.about ?? "This is a sample event description for the confirmation preview.",
    attendeeName: eventData?.attendeeName ?? "John Doe",
    logoUrl: eventData?.logoUrl,
  };

  const notifyChange = useCallback(
    (next: ConfirmationBlock[]) => {
      onTemplateChange?.(next);
    },
    [onTemplateChange]
  );

  const addBlock = (type: ConfirmationBlockType) => {
    const block: ConfirmationBlock = {
      id: generateId(),
      type,
      ...(type === "custom_text" ? { text: "Your custom text" } : {}),
    };
    const next = [...blocks, block];
    setBlocks(next);
    notifyChange(next);
    if (type === "custom_text") setEditingCustomTextId(block.id);
    setSelectedBlockId(block.id);
  };

  const removeBlock = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    setBlocks(next);
    notifyChange(next);
    if (editingCustomTextId === id) setEditingCustomTextId(null);
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setBlocks(next);
    notifyChange(next);
  };

  const updateBlock = (id: string, updates: Partial<ConfirmationBlock>) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBlocks(next);
    notifyChange(next);
  };

  const updateBlockOptions = (id: string, options: Partial<ConfirmationBlockOptions>) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const nextOptions = { ...(block.options ?? {}), ...options };
    updateBlock(id, { options: nextOptions });
  };

  const selectedBlock = selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : null;

  const blockTypes: ConfirmationBlockType[] = [
    "success_badge",
    "confirmation_message",
    "qr_code",
    "event_name",
    "event_date_time",
    "location",
    "event_details",
    "attendee_name",
    "event_logo",
    "divider",
    "spacer",
    "custom_text",
  ];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${className}`}>
      {/* Left: Add blocks + list */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Add block</h3>
        <p className="text-xs text-gray-500">
          Data comes from your event and registration — no manual input.
        </p>
        <div className="flex flex-wrap gap-2">
          {blockTypes.map((type) => {
            const Icon = BLOCK_ICONS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <Icon size={16} className="text-gray-500" />
                {BLOCK_LABELS[type]}
              </button>
            );
          })}
        </div>

        {/* Block list */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Order</h3>
          {blocks.length === 0 ? (
            <p className="text-xs text-gray-500">No blocks yet. Add blocks above.</p>
          ) : (
            <ul className="space-y-2">
              {blocks.map((block, index) => (
                <li
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors group ${
                    selectedBlockId === block.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <GripVertical size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                    {block.type === "custom_text"
                      ? (block.text || "Custom text").slice(0, 20) + (block.text && block.text.length > 20 ? "…" : "")
                      : BLOCK_LABELS[block.type]}
                  </span>
                  <div
                    className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => moveBlock(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, "down")}
                      disabled={index === blocks.length - 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Block settings panel */}
        {selectedBlock && (
          <div className="mt-6 p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Settings size={16} />
              Customize block
            </h3>

            {/* — Layout — */}
            {["success_badge", "confirmation_message", "qr_code", "location", "event_details", "custom_text"].includes(selectedBlock.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Padding</label>
                <select
                  value={selectedBlock.options?.paddingSize ?? "md"}
                  onChange={(e) =>
                    updateBlockOptions(selectedBlock.id, {
                      paddingSize: e.target.value as PaddingSize,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PADDING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* — Border & shadow — */}
            {["confirmation_message", "qr_code", "location", "event_details", "custom_text"].includes(selectedBlock.type) && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Border width</label>
                  <select
                    value={selectedBlock.options?.borderWidth ?? "2"}
                    onChange={(e) =>
                      updateBlockOptions(selectedBlock.id, {
                        borderWidth: e.target.value as BorderWidth,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {BORDER_WIDTH_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Border radius</label>
                  <select
                    value={selectedBlock.options?.borderRadius ?? "lg"}
                    onChange={(e) =>
                      updateBlockOptions(selectedBlock.id, {
                        borderRadius: e.target.value as BorderRadius,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {BORDER_RADIUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Shadow</label>
                  <select
                    value={selectedBlock.options?.shadow ?? "sm"}
                    onChange={(e) =>
                      updateBlockOptions(selectedBlock.id, {
                        shadow: e.target.value as ShadowSize,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SHADOW_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* — Colors — */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
              <ColorPickerField
                value={selectedBlock.options?.backgroundColor ?? ""}
                onChange={(v) => updateBlockOptions(selectedBlock.id, { backgroundColor: v })}
                placeholder="#f0f9ff"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Text color (preset)</label>
              <select
                value={
                  selectedBlock.options?.textColor && !selectedBlock.options.textColor.startsWith("#")
                    ? selectedBlock.options.textColor
                    : "default"
                }
                onChange={(e) =>
                  updateBlockOptions(selectedBlock.id, {
                    textColor: e.target.value as TextColorPreset,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TEXT_COLOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Text color (override)</label>
              <ColorPickerField
                value={
                  selectedBlock.options?.textColor?.startsWith("#")
                    ? selectedBlock.options.textColor
                    : ""
                }
                onChange={(v) => updateBlockOptions(selectedBlock.id, { textColor: v || undefined })}
                placeholder="#374151"
              />
            </div>
            {BLOCKS_WITH_THEME.includes(selectedBlock.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Icon background</label>
                <ColorPickerField
                  value={selectedBlock.options?.iconBackgroundColor ?? ""}
                  onChange={(v) => updateBlockOptions(selectedBlock.id, { iconBackgroundColor: v })}
                  placeholder="#10b981"
                />
              </div>
            )}
            {["success_badge", "confirmation_message", "location"].includes(selectedBlock.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Icon color (checkmark/pin)</label>
                <ColorPickerField
                  value={selectedBlock.options?.iconColor ?? ""}
                  onChange={(v) => updateBlockOptions(selectedBlock.id, { iconColor: v })}
                  placeholder="#ffffff"
                />
              </div>
            )}
            {["success_badge", "confirmation_message", "qr_code", "location", "event_details", "attendee_name", "event_date_time"].includes(selectedBlock.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sublabel / secondary text color</label>
                <ColorPickerField
                  value={selectedBlock.options?.sublabelColor ?? ""}
                  onChange={(v) => updateBlockOptions(selectedBlock.id, { sublabelColor: v })}
                  placeholder="#6b7280"
                />
              </div>
            )}
            {["confirmation_message", "qr_code", "location", "event_details", "custom_text"].includes(selectedBlock.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Border color</label>
                <ColorPickerField
                  value={selectedBlock.options?.borderColor ?? ""}
                  onChange={(v) => updateBlockOptions(selectedBlock.id, { borderColor: v })}
                  placeholder="#e5e7eb"
                />
              </div>
            )}

            {/* Theme (for card-style blocks) */}
            {BLOCKS_WITH_THEME.includes(selectedBlock.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Theme / color</label>
                <select
                  value={selectedBlock.options?.theme ?? "green"}
                  onChange={(e) =>
                    updateBlockOptions(selectedBlock.id, {
                      theme: e.target.value as BlockTheme,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {(Object.entries(THEME_LABELS) as [BlockTheme, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* — Typography — */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Text alignment</label>
              <p className="text-xs text-gray-500 mb-1.5">Align text and content left, center, or right</p>
              <select
                value={selectedBlock.options?.alignment ?? "center"}
                onChange={(e) =>
                  updateBlockOptions(selectedBlock.id, {
                    alignment: e.target.value as ConfirmationBlockOptions["alignment"],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ALIGNMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {["success_badge", "confirmation_message", "qr_code", "location", "event_details", "event_name", "attendee_name", "custom_text"].includes(selectedBlock.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Font weight</label>
                <select
                  value={selectedBlock.options?.fontWeight ?? "normal"}
                  onChange={(e) =>
                    updateBlockOptions(selectedBlock.id, {
                      fontWeight: e.target.value as FontWeight,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {FONT_WEIGHT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
            {selectedBlock.type === "custom_text" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selectedBlock.options?.italic}
                  onChange={(e) =>
                    updateBlockOptions(selectedBlock.id, { italic: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Italic</span>
              </label>
            )}

            {/* Heading size */}
            {BLOCKS_WITH_HEADING_SIZE.includes(selectedBlock.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Heading size</label>
                <select
                  value={selectedBlock.options?.headingSize ?? "md"}
                  onChange={(e) =>
                    updateBlockOptions(selectedBlock.id, {
                      headingSize: e.target.value as BlockHeadingSize,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {HEADING_SIZE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Spacer size */}
            {selectedBlock.type === "spacer" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Spacer size</label>
                <select
                  value={selectedBlock.options?.spacerSize ?? "md"}
                  onChange={(e) =>
                    updateBlockOptions(selectedBlock.id, {
                      spacerSize: e.target.value as BlockSpacerSize,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SPACER_SIZE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Divider style, thickness, color */}
            {selectedBlock.type === "divider" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Line style</label>
                  <select
                    value={selectedBlock.options?.dividerStyle ?? "solid"}
                    onChange={(e) =>
                      updateBlockOptions(selectedBlock.id, {
                        dividerStyle: e.target.value as DividerStyle,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {DIVIDER_STYLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Line thickness</label>
                  <select
                    value={selectedBlock.options?.dividerThickness ?? "1"}
                    onChange={(e) =>
                      updateBlockOptions(selectedBlock.id, {
                        dividerThickness: e.target.value as "1" | "2" | "3",
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {DIVIDER_THICKNESS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Line color</label>
                  <ColorPickerField
                    value={selectedBlock.options?.dividerColor ?? ""}
                    onChange={(v) => updateBlockOptions(selectedBlock.id, { dividerColor: v })}
                    placeholder="#d1d5db"
                  />
                </div>
              </>
            )}

            {/* QR size */}
            {selectedBlock.type === "qr_code" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">QR size</label>
                <select
                  value={selectedBlock.options?.qrSize ?? "md"}
                  onChange={(e) =>
                    updateBlockOptions(selectedBlock.id, {
                      qrSize: e.target.value as "sm" | "md" | "lg",
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {QR_SIZE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom text: size + bold */}
            {selectedBlock.type === "custom_text" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Text size</label>
                  <select
                    value={selectedBlock.options?.textSize ?? "md"}
                    onChange={(e) =>
                      updateBlockOptions(selectedBlock.id, {
                        textSize: e.target.value as CustomTextSize,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedBlock.options?.bold}
                    onChange={(e) =>
                      updateBlockOptions(selectedBlock.id, { bold: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Bold</span>
                </label>
              </>
            )}

            {/* — Block labels — */}
            {["success_badge", "confirmation_message", "qr_code", "location", "event_details", "attendee_name"].includes(
              selectedBlock.type
            ) && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Custom label (optional)</label>
                  <input
                    type="text"
                    value={selectedBlock.options?.label ?? ""}
                    onChange={(e) =>
                      updateBlockOptions(selectedBlock.id, { label: e.target.value || undefined })
                    }
                    placeholder="Override default title"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {selectedBlock.type === "success_badge" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sublabel (optional)</label>
                    <input
                      type="text"
                      value={selectedBlock.options?.sublabel ?? ""}
                      onChange={(e) =>
                        updateBlockOptions(selectedBlock.id, { sublabel: e.target.value || undefined })
                      }
                      placeholder="e.g. You're registered"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Edit custom text content when selected */}
        {editingCustomTextId && blocks.some((b) => b.id === editingCustomTextId) && (() => {
          const block = blocks.find((b) => b.id === editingCustomTextId);
          if (block?.type !== "custom_text") return null;
          return (
            <div className="mt-4 p-3 rounded-lg border border-gray-200 bg-gray-50">
              <label className="block text-xs font-medium text-gray-600 mb-1">Custom text content</label>
              <textarea
                value={block.text ?? ""}
                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your custom text"
              />
            </div>
          );
        })()}
      </div>

      {/* Right: Preview */}
      <div className="lg:col-span-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview</h3>
        <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner border border-gray-200">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className="w-3 h-3 bg-green-400 rounded-full" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Confirmation preview</span>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <ConfirmationPreview blocks={blocks} data={previewData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
