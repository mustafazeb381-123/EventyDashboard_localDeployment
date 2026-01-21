import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Type,
  Mail,
  Hash,
  Calendar,
  FileText,
  List,
  Radio,
  CheckSquare,
  Image as ImageIcon,
  MousePointerClick,
  Table,
  Minus,
  Heading,
  AlignLeft,
  Space,
  Info,
  User,
  Phone,
  Badge,
  Building2,
  Briefcase,
  Search,
  LayoutGrid,
  Columns2,
  Square,
} from "lucide-react";
import type { CustomFormField, FieldType } from "../types";
import {
  makeAutoPlaceholderFromLabel,
  makeFieldNameFromLabel,
} from "../utils/fieldAuto";

interface FieldPaletteProps {
  onAddField: (field: CustomFormField) => void;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField }) => {
  const { t } = useTranslation("formBuilder");
  const [activeCategory, setActiveCategory] = useState<
    "basic" | "personal" | "professional" | "all" | "layout"
  >("layout");
  const [searchQuery, setSearchQuery] = useState("");

  const fieldPresets: Array<{
    id: string;
    type: FieldType;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
    category?: "basic" | "personal" | "professional";
    defaultLabel?: string;
    defaultName?: string;
    defaultPlaceholder?: string;
  }> = [
    // --- BASIC FIELDS ---
    {
      id: "text",
      type: "text",
      label: "Text Input",
      icon: <Type size={18} />,
      description: "Single line text",
      color: "blue",
      category: "basic",
    },
    {
      id: "email",
      type: "email",
      label: "Email",
      icon: <Mail size={18} />,
      description: "Email address",
      color: "green",
      category: "basic",
    },
    {
      id: "number",
      type: "number",
      label: "Number",
      icon: <Hash size={18} />,
      description: "Numeric input",
      color: "purple",
      category: "basic",
    },
    {
      id: "date",
      type: "date",
      label: "Date",
      icon: <Calendar size={18} />,
      description: "Date picker",
      color: "orange",
      category: "basic",
    },
    {
      id: "textarea",
      type: "textarea",
      label: "Textarea",
      icon: <FileText size={18} />,
      description: "Multi-line text",
      color: "indigo",
      category: "basic",
    },
    {
      id: "select",
      type: "select",
      label: "Dropdown",
      icon: <List size={18} />,
      description: "Select option",
      color: "pink",
      category: "basic",
    },
    {
      id: "radio",
      type: "radio",
      label: "Radio",
      icon: <Radio size={18} />,
      description: "Single choice",
      color: "teal",
      category: "basic",
    },
    {
      id: "checkbox",
      type: "checkbox",
      label: "Checkbox",
      icon: <CheckSquare size={18} />,
      description: "Multiple choice",
      color: "cyan",
      category: "basic",
    },
    {
      id: "file",
      type: "file",
      label: "File Upload",
      icon: <FileText size={18} />,
      description: "Upload files",
      color: "amber",
      category: "basic",
    },
    {
      id: "image",
      type: "image",
      label: "Image Upload",
      icon: <ImageIcon size={18} />,
      description: "Upload images",
      color: "rose",
      category: "basic",
    },
    {
      id: "button",
      type: "button",
      label: "Button",
      icon: <MousePointerClick size={18} />,
      description: "Action button",
      color: "gray",
      category: "basic",
    },

    // --- PERSONAL INFORMATION ---
    {
      id: "firstname",
      type: "text",
      label: "First Name",
      icon: <User size={18} />,
      description: "User's first name",
      color: "blue",
      category: "personal",
      defaultLabel: "First Name",
      defaultName: "first_name",
      defaultPlaceholder: "Enter first name",
    },
    {
      id: "lastname",
      type: "text",
      label: "Last Name",
      icon: <User size={18} />,
      description: "User's last name",
      color: "blue",
      category: "personal",
      defaultLabel: "Last Name",
      defaultName: "last_name",
      defaultPlaceholder: "Enter last name",
    },
    {
      id: "fullname",
      type: "text",
      label: "Full Name",
      icon: <User size={18} />,
      description: "User's full name",
      color: "blue",
      category: "personal",
      defaultLabel: "Full Name",
      defaultName: "full_name",
      defaultPlaceholder: "Enter full name",
    },
    {
      id: "username",
      type: "text",
      label: "Username",
      icon: <User size={18} />,
      description: "User's username",
      color: "purple",
      category: "personal",
      defaultLabel: "Username",
      defaultName: "username",
      defaultPlaceholder: "Enter username",
    },
    {
      id: "phone",
      type: "text", // Will render with country code
      label: "Phone Number",
      icon: <Phone size={18} />,
      description: "Contact phone",
      color: "green",
      category: "personal",
      defaultLabel: "Phone Number",
      defaultName: "phone_number",
      defaultPlaceholder: "+1 (555) 000-0000",
    },
    {
      id: "country",
      type: "select",
      label: "Country",
      icon: <List size={18} />,
      description: "Country selector",
      color: "pink",
      category: "personal",
      defaultLabel: "Country",
      defaultName: "country",
      defaultPlaceholder: "Select country",
    },
    {
      id: "id_number",
      type: "text",
      label: "ID Number",
      icon: <Badge size={18} />,
      description: "Identification number",
      color: "indigo",
      category: "personal",
      defaultLabel: "ID Number",
      defaultName: "id_number",
      defaultPlaceholder: "Enter ID number",
    },

    // --- PROFESSIONAL ---
    {
      id: "company",
      type: "text",
      label: "Company",
      icon: <Building2 size={18} />,
      description: "Company name",
      color: "cyan",
      category: "professional",
      defaultLabel: "Company",
      defaultName: "company",
      defaultPlaceholder: "Enter company name",
    },
    {
      id: "job_title",
      type: "text",
      label: "Job Title",
      icon: <Briefcase size={18} />,
      description: "Job role/title",
      color: "amber",
      category: "professional",
      defaultLabel: "Job Title",
      defaultName: "job_title",
      defaultPlaceholder: "Enter job title",
    },
    {
      id: "positions",
      type: "text",
      label: "Positions",
      icon: <Briefcase size={18} />,
      description: "Current positions",
      color: "amber",
      category: "professional",
      defaultLabel: "Positions",
      defaultName: "positions",
      defaultPlaceholder: "Enter positions",
    },

    // --- STATIC ELEMENTS ---
    {
      id: "table",
      type: "table",
      label: "Table",
      icon: <Table size={18} />,
      description: "Data table",
      color: "indigo",
      category: "basic",
      defaultLabel: "Table",
      defaultName: "table",
    },
    {
      id: "divider",
      type: "divider",
      label: "Divider",
      icon: <Minus size={18} />,
      description: "Horizontal divider line",
      color: "gray",
      category: "basic",
      defaultLabel: "Divider",
      defaultName: "divider",
    },
    {
      id: "heading",
      type: "heading",
      label: "Heading",
      icon: <Heading size={18} />,
      description: "Text heading",
      color: "blue",
      category: "basic",
      defaultLabel: "Heading",
      defaultName: "heading",
      defaultPlaceholder: "Enter heading text",
    },
    {
      id: "paragraph",
      type: "paragraph",
      label: "Paragraph",
      icon: <AlignLeft size={18} />,
      description: "Text paragraph",
      color: "gray",
      category: "basic",
      defaultLabel: "Paragraph",
      defaultName: "paragraph",
      defaultPlaceholder: "Enter paragraph text",
    },
    {
      id: "helper_text",
      type: "helperText",
      label: "Helper Text",
      icon: <Info size={18} />,
      description: "Static helper text (non-input)",
      color: "gray",
      category: "basic",
      defaultLabel: "Helper Text",
      defaultName: "helper_text",
      defaultPlaceholder: "This is a helper text",
    },
    {
      id: "spacer",
      type: "spacer",
      label: "Spacer",
      icon: <Space size={18} />,
      description: "Vertical spacing",
      color: "gray",
      category: "basic",
      defaultLabel: "Spacer",
      defaultName: "spacer",
    },
  ];

  interface FieldButtonProps {
    preset: (typeof fieldPresets)[0];
    onAdd: (field: CustomFormField) => void;
    colorClasses: Record<string, string>;
  }

  const FieldButton: React.FC<FieldButtonProps> = ({
    preset,
    onAdd,
    colorClasses,
  }) => {
    const {
      type,
      label,
      icon,
      color,
      defaultLabel,
      defaultName,
      defaultPlaceholder,
    } = preset;

    const createField = (): CustomFormField => {
      const finalLabel = defaultLabel || label;
      const autoName = makeFieldNameFromLabel(finalLabel);
      const autoPlaceholder = makeAutoPlaceholderFromLabel(type, finalLabel);

      return {
        id: `${type}-${Date.now()}`,
        type,
        label: finalLabel,
        name: defaultName || autoName,
        required: false,
        unique: false,
        placeholder:
          defaultPlaceholder ||
          (type === "email"
            ? "example@email.com"
            : type === "number"
              ? "Enter a number"
              : autoPlaceholder),
        ...(type === "select" || type === "radio" || type === "checkbox"
          ? preset.id === "country"
            ? { optionsSource: "countries" }
            : {
                options: [
                  { label: "Option 1", value: "option_1" },
                  { label: "Option 2", value: "option_2" },
                ],
              }
          : {}),
        ...(preset.id === "phone" ? { inputVariant: "phone" } : {}),
        ...(type === "button"
          ? { buttonText: "Submit", buttonType: "submit" }
          : {}),
        ...(type === "image" ? { accept: "image/*" } : {}),
        ...(type === "file" ? { accept: ".pdf,.doc,.docx" } : {}),
        ...(type === "table"
          ? {
              tableData: {
                columns: [
                  { header: "Column 1", key: "col1" },
                  { header: "Column 2", key: "col2" },
                ],
                rows: [
                  { col1: "Row 1, Col 1", col2: "Row 1, Col 2" },
                  { col1: "Row 2, Col 1", col2: "Row 2, Col 2" },
                ],
              },
            }
          : {}),
        ...(type === "heading" || type === "paragraph" || type === "helperText"
          ? { content: defaultPlaceholder || "Enter text here" }
          : {}),
        ...(type === "spacer" ? { height: "20px" } : {}),
      };
    };

    const dragId = `palette-${preset.id}`;
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: dragId,
        data: {
          type: "palette-item",
          preset,
          createField,
        },
      });

    const style = transform
      ? {
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.5 : 1,
        }
      : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <button
          onClick={() => {
            onAdd(createField());
          }}
          className={`flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-400 transition-all text-center group ${colorClasses[color]} w-full`}
        >
          <div className="text-gray-600 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span className="text-xs font-medium text-gray-700 block">
            {label}
          </span>
        </button>
      </div>
    );
  };

  const colorClasses: Record<string, string> = {
    blue: "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700",
    green: "hover:bg-green-50 hover:border-green-400 hover:text-green-700",
    purple: "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700",
    orange: "hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700",
    indigo: "hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700",
    pink: "hover:bg-pink-50 hover:border-pink-400 hover:text-pink-700",
    teal: "hover:bg-teal-50 hover:border-teal-400 hover:text-teal-700",
    cyan: "hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-700",
    amber: "hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700",
    rose: "hover:bg-rose-50 hover:border-rose-400 hover:text-rose-700",
    gray: "hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700",
  };

  // Filter presets based on category and search
  const filteredPresets = fieldPresets.filter((preset) => {
    const matchesCategory =
      activeCategory === "all" ||
      activeCategory === "layout" ||
      preset.category === activeCategory ||
      (!preset.category && activeCategory === "basic");
    const matchesSearch =
      searchQuery === "" ||
      preset.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={14}
        />
        <input
          type="text"
          placeholder={t("fieldPalette.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveCategory("layout")}
          className={`px-2 py-1 text-xs font-medium transition-colors border-b-2 ${
            activeCategory === "layout"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("fieldPalette.layout")}
        </button>
        <button
          onClick={() => setActiveCategory("basic")}
          className={`px-2 py-1 text-xs font-medium transition-colors border-b-2 ${
            activeCategory === "basic"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("fieldPalette.fields")}
        </button>
        <button
          onClick={() => setActiveCategory("personal")}
          className={`px-2 py-1 text-xs font-medium transition-colors border-b-2 ${
            activeCategory === "personal"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("fieldPalette.personal")}
        </button>
        <button
          onClick={() => setActiveCategory("professional")}
          className={`px-2 py-1 text-xs font-medium transition-colors border-b-2 ${
            activeCategory === "professional"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("fieldPalette.professional")}
        </button>
      </div>

      {/* Layout Elements Section */}
      {activeCategory === "layout" && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {t("fieldPalette.structure")}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const newContainer: CustomFormField = {
                  id: `container-${Date.now()}`,
                  type: "text",
                  label: "Container",
                  name: `container_${Date.now()}`,
                  required: false,
                  unique: false,
                  containerType: "container",
                  children: [],
                  layoutProps: {
                    gap: "16px",
                    padding: "16px",
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                    flexDirection: "column",
                  },
                };
                onAddField(newContainer);
              }}
              className="flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-purple-400 transition-all text-center group"
            >
              <Square className="text-purple-600" size={16} />
              <span className="text-xs font-medium text-gray-700">
                {t("fieldPalette.container")}
              </span>
            </button>
            <button
              onClick={() => {
                const newRow: CustomFormField = {
                  id: `row-${Date.now()}`,
                  type: "text",
                  label: "Row",
                  name: `row_${Date.now()}`,
                  required: false,
                  unique: false,
                  containerType: "row",
                  children: [],
                  layoutProps: {
                    gap: "16px",
                    padding: "12px",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  },
                };
                onAddField(newRow);
              }}
              className="flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-400 transition-all text-center group"
            >
              <LayoutGrid className="text-blue-600" size={16} />
              <span className="text-xs font-medium text-gray-700">{t("fieldPalette.row")}</span>
            </button>
            <button
              onClick={() => {
                const newColumn: CustomFormField = {
                  id: `column-${Date.now()}`,
                  type: "text",
                  label: "Column",
                  name: `column_${Date.now()}`,
                  required: false,
                  unique: false,
                  containerType: "column",
                  children: [],
                  layoutProps: {
                    gap: "12px",
                    padding: "12px",
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                    flexDirection: "column",
                  },
                };
                onAddField(newColumn);
              }}
              className="flex flex-col items-center gap-1.5 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-indigo-400 transition-all text-center group"
            >
              <Columns2 className="text-indigo-600" size={16} />
              <span className="text-xs font-medium text-gray-700">{t("fieldPalette.column")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Fields Section */}
      {activeCategory !== "layout" && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {activeCategory === "basic"
              ? t("fieldPalette.fields")
              : activeCategory === "personal"
                ? t("fieldPalette.personalInformation")
                : t("fieldPalette.professionalOptions")}
          </h4>
          {filteredPresets.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-xs">
              <p>{t("fieldPalette.noFieldsFound")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {filteredPresets.map((preset) => (
                <FieldButton
                  key={preset.id}
                  preset={preset}
                  onAdd={onAddField}
                  colorClasses={colorClasses}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
