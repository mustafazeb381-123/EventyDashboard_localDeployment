import React, { useRef, useState, useEffect } from "react";
import {
  DndContext,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Save,
  Palette as PaletteIcon,
  X,
  Trash2,
  Code,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { RsvpFormField, RsvpTheme, RsvpLanguageConfig } from "./types";
import { getDefaultRsvpFormFields, createRsvpFormField } from "./types";
import { RsvpTextStylingPanel } from "./RsvpTextStylingPanel";
import { RsvpThemeConfigPanel } from "./RsvpThemeConfigPanel";
import { RsvpFormPreview } from "./RsvpFormPreview";
import { RsvpFieldPalette } from "./RsvpFieldPalette";

const AVAILABLE_VARIABLES = [
  { label: "First Name", value: "((firstname))" },
  { label: "Last Name", value: "{{lastname}}" },
  { label: "Full Name", value: "{{fullname}}" },
  { label: "Email", value: "{{email}}" },
  { label: "Company", value: "{{comapny}}" },
  { label: "Organization", value: "{{organization}}" },
  { label: "Event Name", value: "{{eventname}}" },
  { label: "Event Location", value: "{{eventlocation}}" },
  { label: "Event Start", value: "{{eventstart}}" },
  { label: "Event End", value: "{{eventend}}" },
];

/** Draggable variable button: click adds to form, drag-and-drop onto page or into containers */
function DraggableVariableButton({
  variable,
  onClick,
}: {
  variable: { label: string; value: string };
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `variable:${variable.value}`,
    data: {
      type: "palette-item",
      createField: () => {
        const f = createRsvpFormField("paragraph");
        f.content = variable.value;
        return f;
      },
    },
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium transition-all text-left cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium">{variable.label}</span>
        <code className="text-xs font-mono text-indigo-600 mt-0.5">{variable.value}</code>
      </div>
    </button>
  );
}

export interface RsvpFormBuilderProps {
  initialFormFields?: RsvpFormField[];
  initialTheme?: Partial<RsvpTheme>;
  initialLanguageConfig?: RsvpLanguageConfig;
  initialTemplateName?: string;
  onSave: (
    formFields: RsvpFormField[],
    theme: RsvpTheme,
    languageConfig: RsvpLanguageConfig,
    templateName?: string
  ) => void | Promise<void>;
  onClose: () => void;
}

const defaultTheme: RsvpTheme = {
  headerBackgroundColor: "#1e293b",
  headerTextColor: "#ffffff",
  bodyBackgroundColor: "#f8fafc",
  bodyTextColor: "#1e293b",
  labelColor: "#374151",
  acceptButtonBackgroundColor: "#10b981",
  acceptButtonTextColor: "#ffffff",
  declineButtonBackgroundColor: "#ef4444",
  declineButtonTextColor: "#ffffff",
  inputBorderColor: "#e2e8f0",
  inputBackgroundColor: "#f8fafc",
};

/** Theme presets for high-end RSVP look */
const THEME_PRESETS: { name: string; theme: Partial<RsvpTheme> }[] = [
  {
    name: "Elegant",
    theme: {
      headerBackgroundColor: "#1f2937",
      bodyBackgroundColor: "#fafaf9",
      formBackgroundColor: "#ffffff",
      formBorderRadius: "16px",
      acceptButtonBackgroundColor: "#292524",
      declineButtonBackgroundColor: "#78716c",
      inputBorderColor: "#e7e5e4",
      inputBorderRadius: "10px",
    },
  },
  {
    name: "Modern",
    theme: {
      headerBackgroundColor: "#0f172a",
      bodyBackgroundColor: "#f1f5f9",
      formBackgroundColor: "#ffffff",
      formBorderRadius: "12px",
      acceptButtonBackgroundColor: "#3b82f6",
      declineButtonBackgroundColor: "#64748b",
      inputBorderColor: "#cbd5e1",
      inputBorderRadius: "8px",
    },
  },
  {
    name: "Minimal",
    theme: {
      headerBackgroundColor: "#ffffff",
      headerTextColor: "#0f172a",
      bodyBackgroundColor: "#f8fafc",
      formBackgroundColor: "#ffffff",
      formBorderRadius: "8px",
      formBorderColor: "#e2e8f0",
      acceptButtonBackgroundColor: "#10b981",
      declineButtonBackgroundColor: "#94a3b8",
      inputBorderColor: "#e2e8f0",
      inputBorderRadius: "6px",
    },
  },
];

/** Convert File to base64 data URL so theme can be saved in JSON (rsvp_template) */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Only keep image fields that are valid for JSON: string (base64) or null. File → base64; {} or other → null. */
function sanitizeThemeImages(theme: RsvpTheme): RsvpTheme {
  const next: RsvpTheme = { ...theme };
  if (typeof theme.bannerImage !== "string" && !(theme.bannerImage instanceof File)) {
    next.bannerImage = null;
  }
  if (typeof theme.footerBannerImage !== "string" && !(theme.footerBannerImage instanceof File)) {
    next.footerBannerImage = null;
  }
  if (typeof theme.formBackgroundImage !== "string" && !(theme.formBackgroundImage instanceof File)) {
    next.formBackgroundImage = null;
  }
  return next;
}

/** Convert theme image fields (File) to base64 so data saves as drawn. Sanitizes {} to null. */
async function themeFilesToBase64(theme: RsvpTheme): Promise<RsvpTheme> {
  const sanitized = sanitizeThemeImages(theme);
  const next: RsvpTheme = { ...sanitized };
  if (sanitized.bannerImage instanceof File) {
    try {
      next.bannerImage = await fileToDataUrl(sanitized.bannerImage);
    } catch {
      next.bannerImage = null;
    }
  }
  if (sanitized.footerBannerImage instanceof File) {
    try {
      next.footerBannerImage = await fileToDataUrl(sanitized.footerBannerImage);
    } catch {
      next.footerBannerImage = null;
    }
  }
  if (sanitized.formBackgroundImage instanceof File) {
    try {
      next.formBackgroundImage = await fileToDataUrl(sanitized.formBackgroundImage);
    } catch {
      next.formBackgroundImage = null;
    }
  }
  return next;
}

export const RsvpFormBuilder: React.FC<RsvpFormBuilderProps> = ({
  initialFormFields,
  initialTheme,
  initialLanguageConfig,
  initialTemplateName = "",
  onSave,
  onClose,
}) => {
  const [formFields, setFormFields] = useState<RsvpFormField[]>(() =>
    initialFormFields?.length ? initialFormFields : getDefaultRsvpFormFields()
  );
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [editingField, setEditingField] = useState<RsvpFormField | null>(null);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [theme, setTheme] = useState<RsvpTheme>({
    ...defaultTheme,
    ...initialTheme,
  });
  const [languageConfig] = useState<RsvpLanguageConfig>(
    initialLanguageConfig ?? { languageMode: "single", primaryLanguage: "en" }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  /** JSON string for Code modal (theme images as base64); set when modal opens */
  const [codeModalJson, setCodeModalJson] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<RsvpFormField | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (!showCodeModal) {
      setCodeModalJson(null);
      return;
    }
    let cancelled = false;
    themeFilesToBase64(theme).then((themeWithBase64) => {
      if (!cancelled) {
        setCodeModalJson(
          JSON.stringify(
            { title: templateName, formFields, theme: themeWithBase64, languageConfig },
            null,
            2
          )
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showCodeModal, theme, templateName, formFields, languageConfig]);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const pendingImageFieldIdRef = useRef<string | null>(null);

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setTheme((prev) => ({ ...prev, bannerImage: file }));
    }
    e.target.value = "";
  };

  const handleFooterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setTheme((prev) => ({ ...prev, footerBannerImage: file }));
    }
    e.target.value = "";
  };

  const handleImageUploadRequest = (fieldId: string) => {
    pendingImageFieldIdRef.current = fieldId;
    imageUploadRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fieldId = pendingImageFieldIdRef.current;
    e.target.value = "";
    pendingImageFieldIdRef.current = null;
    if (!file || !fieldId || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFormFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, content: dataUrl } : f))
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = () => {
    setTheme((prev) => ({ ...prev, bannerImage: null }));
  };

  const handleRemoveFooter = () => {
    setTheme((prev) => ({ ...prev, footerBannerImage: null }));
  };

  const handleUpdateField = (updated: RsvpFormField) => {
    setFormFields((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
    if (editingField?.id === updated.id) setEditingField(updated);
  };

  const handleAddField = (field: RsvpFormField) => {
    setFormFields((prev) => [...prev, field]);
    setEditingField(field);
  };

  const handleInsertVariable = (variable: string) => {
    const newField = createRsvpFormField("paragraph");
    newField.content = variable;
    setFormFields((prev) => [...prev, newField]);
    setEditingField(newField);
  };

  const handleDeleteField = (id: string) => {
    const candidate = formFields.find((f) => f.id === id) ?? null;
    setDeleteCandidate(candidate);
    setShowDeleteModal(true);
  };

  const confirmDeleteField = () => {
    if (!deleteCandidate) {
      setShowDeleteModal(false);
      return;
    }
    const id = deleteCandidate.id;
    setFormFields((prev) =>
      prev
        .filter((f) => f.id !== id)
        .map((f) =>
          f.children
            ? { ...f, children: f.children.filter((c) => c !== id) }
            : f
        )
    );
    if (editingField?.id === id) setEditingField(null);
    setShowDeleteModal(false);
    setDeleteCandidate(null);
  };

  const cancelDeleteField = () => {
    setShowDeleteModal(false);
    setDeleteCandidate(null);
  };

  /** Root field IDs = not in any field's children (for elements list and move) */
  const childIds = new Set(
    formFields
      .filter((f) => f.children?.length)
      .flatMap((f) => f.children ?? [])
  );
  const rootFields = formFields.filter((f) => !childIds.has(f.id));

  const getContainerIdFromOverId = (id: string) =>
    id.startsWith("container:") ? id.replace("container:", "") : null;

  const findParentContainerId = (fieldId: string) =>
    formFields.find((f) => f.children?.includes(fieldId))?.id ?? null;

  const isDescendant = (ancestorId: string, possibleDescendantId: string) => {
    const ancestor = formFields.find((f) => f.id === ancestorId);
    if (!ancestor?.children?.length) return false;
    const queue = [...ancestor.children];
    const visited = new Set<string>();
    while (queue.length) {
      const current = queue.shift()!;
      if (current === possibleDescendantId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const node = formFields.find((f) => f.id === current);
      if (node?.children?.length) queue.push(...node.children);
    }
    return false;
  };

  const handleDragStart = () => {
    document.body.style.cursor = "grabbing";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    document.body.style.cursor = "";

    if (!over) {
      if (active.data?.current?.type === "palette-item" && active.data.current.createField) {
        const newField = active.data.current.createField();
        setFormFields((prev) => [...prev, newField]);
      }
      return;
    }

    const overId = String(over.id);

    if (active.data?.current?.type === "palette-item" && active.data.current.createField) {
      const newField = active.data.current.createField();

      if (overId === "rsvp-main-drop-zone") {
        setFormFields((prev) => [...prev, newField]);
        return;
      }

      const containerTargetId = getContainerIdFromOverId(overId);
      if (containerTargetId) {
        setFormFields((prev) => {
          const updated = prev.map((f) =>
            f.id === containerTargetId
              ? { ...f, children: [...(f.children || []), newField.id] }
              : f
          );
          return [...updated, newField];
        });
        return;
      }

      const overField = formFields.find((f) => f.id === overId);
      if (overField?.containerType) {
        setFormFields((prev) => {
          const updated = prev.map((f) =>
            f.id === overId
              ? { ...f, children: [...(f.children || []), newField.id] }
              : f
          );
          return [...updated, newField];
        });
        return;
      }

      const overIndex = formFields.findIndex((f) => f.id === overId);
      if (overIndex !== -1) {
        const updated = [...formFields];
        updated.splice(overIndex + 1, 0, newField);
        setFormFields(updated);
      } else {
        setFormFields((prev) => [...prev, newField]);
      }
      return;
    }

    const activeIdStr = String(active.id);
    if (activeIdStr === overId) return;

    const containerTargetId = getContainerIdFromOverId(overId);
    const sourceParentId = findParentContainerId(activeIdStr);

    if (containerTargetId) {
      const activeField = formFields.find((f) => f.id === activeIdStr);
      if (activeField?.containerType) {
        if (containerTargetId === activeIdStr) return;
        if (isDescendant(activeIdStr, containerTargetId)) return;
      }
      setFormFields((prev) => {
        let next = prev.map((f) =>
          f.children?.includes(activeIdStr)
            ? { ...f, children: f.children.filter((id) => id !== activeIdStr) }
            : f
        );
        next = next.map((f) =>
          f.id === containerTargetId
            ? { ...f, children: [...(f.children || []), activeIdStr] }
            : f
        );
        return next;
      });
      return;
    }

    if (overId === "rsvp-main-drop-zone") {
      if (!sourceParentId) return;
      setFormFields((prev) =>
        prev.map((f) =>
          f.id === sourceParentId
            ? { ...f, children: (f.children || []).filter((id) => id !== activeIdStr) }
            : f
        )
      );
      return;
    }

    const overFieldId = overId;
    const targetParentId = findParentContainerId(overFieldId);

    if (targetParentId) {
      const activeField = formFields.find((f) => f.id === activeIdStr);
      if (activeField?.containerType) {
        if (targetParentId === activeIdStr) return;
        if (isDescendant(activeIdStr, targetParentId)) return;
      }
      setFormFields((prev) => {
        let next = prev.map((f) =>
          f.children?.includes(activeIdStr)
            ? { ...f, children: f.children.filter((id) => id !== activeIdStr) }
            : f
        );
        next = next.map((f) => {
          if (f.id !== targetParentId) return f;
          const children = [...(f.children || [])];
          const overIndex = children.indexOf(overFieldId);
          const insertIndex = overIndex === -1 ? children.length : overIndex + 1;
          if (children.includes(activeIdStr)) {
            const oldIndex = children.indexOf(activeIdStr);
            return {
              ...f,
              children: arrayMove(
                children,
                oldIndex,
                insertIndex > oldIndex ? insertIndex - 1 : insertIndex
              ),
            };
          }
          children.splice(insertIndex, 0, activeIdStr);
          return { ...f, children };
        });
        return next;
      });
      return;
    }

    const oldIndex = formFields.findIndex((f) => f.id === activeIdStr);
    const newIndex = formFields.findIndex((f) => f.id === overFieldId);
    if (oldIndex !== -1 && newIndex !== -1) {
      setFormFields(arrayMove(formFields, oldIndex, newIndex));
    }
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rootFields.length) return;
    const rootIds = rootFields.map((f) => f.id);
    const movedId = rootIds[index];
    const targetId = rootIds[newIndex];
    const flatIndexMoved = formFields.findIndex((f) => f.id === movedId);
    const flatIndexTarget = formFields.findIndex((f) => f.id === targetId);
    if (flatIndexMoved === -1 || flatIndexTarget === -1) return;
    const next = [...formFields];
    [next[flatIndexMoved], next[flatIndexTarget]] = [next[flatIndexTarget], next[flatIndexMoved]];
    setFormFields(next);
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setTheme((prev) => ({ ...prev, ...preset.theme }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const themeWithBase64 = await themeFilesToBase64(theme);
      await Promise.resolve(
        onSave(formFields, themeWithBase64, languageConfig, templateName.trim() || undefined)
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = async () => {
    const json =
      codeModalJson ??
      (await themeFilesToBase64(theme).then((themeWithBase64) =>
        JSON.stringify(
          { title: templateName, formFields, theme: themeWithBase64, languageConfig },
          null,
          2
        )
      ));
    if (json) {
      navigator.clipboard.writeText(json).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
      {/* Header – high-end toolbar */}
      <div className="flex-shrink-0 flex flex-col gap-2 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-semibold text-white shrink-0">
              RSVP Builder
            </h2>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="px-3 py-1.5 border border-slate-500 rounded-lg text-sm text-white bg-slate-700/50 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 max-w-[200px]"
            />
            <div className="hidden sm:flex items-center gap-1 rounded-lg bg-slate-700/50 p-1">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                  title={`Apply ${preset.name} style`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-500 bg-slate-700/50 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
              title="Preview"
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-500 bg-slate-700/50 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
              title="See code"
            >
              <Code size={18} />
              Code
            </button>
            <button
              type="button"
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showThemePanel
                  ? "border-indigo-400 bg-indigo-500/30 text-white"
                  : "border-slate-500 bg-slate-700/50 hover:bg-slate-600 text-slate-200"
              }`}
            >
              <PaletteIcon size={18} />
              Theme
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 text-sm transition-colors"
            >
              <Save size={18} />
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-600 text-slate-300"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Layout & Content palette (drag or click) + variables + elements list */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto p-4 shadow-sm">
          <RsvpFieldPalette
            formFields={formFields}
            selectedFieldId={editingField?.id ?? null}
            onSelectField={setEditingField}
            onAddField={handleAddField}
            layoutAndContentOnly
          />
          <div className="border-t border-slate-200 pt-4 mt-4">
            <button
              type="button"
              onClick={() => setShowVariables(!showVariables)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors mb-2"
            >
              <div className="flex items-center gap-2">
                <Code size={16} />
                <span>Available Variables</span>
              </div>
              {showVariables ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showVariables && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 mb-1">Click to add at end, or drag onto the form or into containers.</p>
                {AVAILABLE_VARIABLES.map((variable) => (
                  <DraggableVariableButton
                    key={variable.value}
                    variable={variable}
                    onClick={() => handleInsertVariable(variable.value)}
                  />
                ))}
              </div>
            )}
          </div>

          {rootFields.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Elements ({rootFields.length})</h3>
              <div className="space-y-1.5">
                {rootFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`flex items-center gap-1 p-2 rounded-lg border transition-all ${
                      editingField?.id === field.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col shrink-0 gap-0.5">
                      <button type="button" onClick={() => handleMoveField(index, "up")} disabled={index === 0} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move up" aria-label="Move up">
                        <ChevronLeft size={14} className="rotate-[-90deg]" />
                      </button>
                      <button type="button" onClick={() => handleMoveField(index, "down")} disabled={index === rootFields.length - 1} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move down" aria-label="Move down">
                        <ChevronRight size={14} className="rotate-[-90deg]" />
                      </button>
                    </div>
                    <button type="button" onClick={() => setEditingField(field)} className="flex-1 min-w-0 text-left text-sm text-slate-700 truncate">
                      {field.containerType ? (
                        <span className="truncate">{field.containerType} – {field.children?.length ?? 0}</span>
                      ) : field.type === "image" || field.type === "icon" ? (
                        <span className="truncate">{field.type === "image" ? "Image" : "Icon"}{field.content ? " (uploaded)" : ""}</span>
                      ) : (
                        <span className="truncate">{field.content?.slice(0, 24) || field.type}</span>
                      )}
                    </button>
                    <button type="button" onClick={() => handleDeleteField(field.id)} className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0" title="Delete" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Form preview (banner, footer, Attend/Decline, fields) with DnD drop zones for containers */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-100">
              <div className="p-6 flex justify-center min-h-full">
                <RsvpFormPreview
                  formFields={formFields}
                  theme={theme}
                  currentLanguage={languageConfig.primaryLanguage ?? "en"}
                  visibleOnly={false}
                  variableMode={false}
                  showActionButtons={true}
                  onBannerClick={() => bannerInputRef.current?.click()}
                  onFooterClick={() => footerInputRef.current?.click()}
                  onRemoveBanner={handleRemoveBanner}
                  onRemoveFooter={handleRemoveFooter}
                  builderMode={true}
                  editingFieldId={editingField?.id ?? null}
                  onFieldClick={setEditingField}
                  onFieldContentChange={(fieldId, content) => {
                    setFormFields((prev) =>
                      prev.map((f) => (f.id === fieldId ? { ...f, content } : f))
                    );
                    if (editingField?.id === fieldId) {
                      setEditingField({ ...editingField, content });
                    }
                  }}
                  onImageUploadRequest={handleImageUploadRequest}
                />
              </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerFileChange}
              className="hidden"
              aria-hidden
            />
            <input
              ref={footerInputRef}
              type="file"
              accept="image/*"
              onChange={handleFooterFileChange}
              className="hidden"
              aria-hidden
            />
            <input
              ref={imageUploadRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
              aria-hidden
            />
          </div>
        </div>

        {/* Right: Text styling or Theme */}
        {editingField && (
          <RsvpTextStylingPanel field={editingField} onUpdate={handleUpdateField} onClose={() => setEditingField(null)} />
        )}
        {showThemePanel && !editingField && (
          <RsvpThemeConfigPanel
            theme={theme}
            onUpdate={setTheme}
            onClose={() => setShowThemePanel(false)}
          />
        )}
      </div>
      </DndContext>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cancelDeleteField();
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Remove field?</h3>
            <p className="text-sm text-slate-600 mb-4">
              This will remove the field from the form. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDeleteField}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteField}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal – full preview while building */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowPreviewModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Preview</h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-6 bg-slate-50">
              <div className="max-w-md mx-auto">
                <RsvpFormPreview
                  formFields={formFields}
                  theme={theme}
                  currentLanguage={languageConfig.primaryLanguage ?? "en"}
                  visibleOnly={true}
                  variableMode={false}
                  showActionButtons={true}
                  onBannerClick={() => bannerInputRef.current?.click()}
                  onFooterClick={() => footerInputRef.current?.click()}
                  onRemoveBanner={handleRemoveBanner}
                  onRemoveFooter={handleRemoveFooter}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code modal – form definition as JSON */}
      {showCodeModal && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCodeModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Code</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  <Copy size={16} />
                  {codeCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-4">
              <pre className="text-xs font-mono text-slate-800 bg-slate-50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap break-words max-h-[70vh]">
                {codeModalJson ?? "Loading…"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
