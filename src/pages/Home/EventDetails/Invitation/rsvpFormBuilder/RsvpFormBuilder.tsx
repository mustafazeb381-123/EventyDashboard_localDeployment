import React, { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Save,
  Eye,
  EyeOff,
  Palette as PaletteIcon,
  X,
} from "lucide-react";
import type { RsvpFormField, RsvpTheme, RsvpLanguageConfig, RsvpFieldType } from "./types";
import { getDefaultRsvpFormFields } from "./types";

function migrateFormFields(fields: RsvpFormField[]): RsvpFormField[] {
  return fields.map((f) => {
    if ((f as RsvpFormField & { type?: RsvpFieldType }).type) return f;
    const name = (f as RsvpFormField & { name: string }).name;
    const type: RsvpFieldType = name === "email" ? "email" : name === "phone_number" ? "phone" : "text";
    return { ...f, type };
  });
}
import { RsvpFieldPalette } from "./RsvpFieldPalette";
import { RsvpMainDropZone } from "./RsvpMainDropZone";
import { RsvpSortableFieldItem } from "./RsvpSortableFieldItem";
import { RsvpFieldConfigPanel } from "./RsvpFieldConfigPanel";
import { RsvpThemeConfigPanel } from "./RsvpThemeConfigPanel";
import { RsvpFormPreview } from "./RsvpFormPreview";

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

export const RsvpFormBuilder: React.FC<RsvpFormBuilderProps> = ({
  initialFormFields,
  initialTheme,
  initialLanguageConfig,
  initialTemplateName = "",
  onSave,
  onClose,
}) => {
  const [formFields, setFormFields] = useState<RsvpFormField[]>(() =>
    initialFormFields?.length ? migrateFormFields(initialFormFields) : getDefaultRsvpFormFields()
  );
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [editingField, setEditingField] = useState<RsvpFormField | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [theme, setTheme] = useState<RsvpTheme>({
    ...defaultTheme,
    ...initialTheme,
  });
  const [languageConfig] = useState<RsvpLanguageConfig>(
    initialLanguageConfig ?? { languageMode: "single", primaryLanguage: "en" }
  );
  const [isSaving, setIsSaving] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const overId = String(over.id);
    const oldIndex = formFields.findIndex((f) => f.id === active.id);
    const newIndex = formFields.findIndex((f) => f.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    setFormFields(arrayMove(formFields, oldIndex, newIndex));
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

  const handleDeleteField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
    if (editingField?.id === id) setEditingField(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.resolve(
        onSave(formFields, theme, languageConfig, templateName.trim() || undefined)
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const isEmpty = formFields.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-lg font-semibold text-slate-800 shrink-0">
            RSVP Form Builder
          </h2>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-w-[200px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700"
          >
            {showPreview ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => setShowThemePanel(!showThemePanel)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
              showThemePanel
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            <PaletteIcon size={18} />
            Theme
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm"
          >
            <Save size={18} />
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Form fields list */}
        <div className="w-56 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto p-3">
          <RsvpFieldPalette
            formFields={formFields}
            selectedFieldId={editingField?.id ?? null}
            onSelectField={setEditingField}
            onAddField={handleAddField}
          />
        </div>

        {/* Center: Canvas or Preview – scrollable so banner, form, and footer image all visible */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          {showPreview ? (
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-100">
              <div className="p-6 flex justify-center min-h-full">
                <RsvpFormPreview
                  formFields={formFields}
                  theme={theme}
                  currentLanguage={languageConfig.primaryLanguage ?? "en"}
                  onBannerClick={() => bannerInputRef.current?.click()}
                  onFooterClick={() => footerInputRef.current?.click()}
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
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <RsvpMainDropZone isEmpty={isEmpty}>
                  {formFields.length > 0 && (
                    <SortableContext
                      items={formFields.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {formFields.map((field) => (
                          <RsvpSortableFieldItem
                            key={field.id}
                            field={field}
                            onEdit={setEditingField}
                            onUpdate={handleUpdateField}
                            onDelete={handleDeleteField}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  )}
                </RsvpMainDropZone>
              </DndContext>
            </div>
          )}
        </div>

        {/* Right: Config / Theme / Translation panels */}
        {editingField && (
          <RsvpFieldConfigPanel
            field={editingField}
            onUpdate={handleUpdateField}
            onClose={() => setEditingField(null)}
          />
        )}
        {showThemePanel && !editingField && (
          <RsvpThemeConfigPanel
            theme={theme}
            onUpdate={setTheme}
            onClose={() => setShowThemePanel(false)}
          />
        )}
      </div>
    </div>
  );
};
