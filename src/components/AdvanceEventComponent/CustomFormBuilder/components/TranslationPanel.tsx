import React, { useMemo } from "react";
import { X, Languages } from "lucide-react";
import type { CustomFormField } from "../types";
import type { FormLanguageConfig, PrimaryLanguage } from "../types";
import {
  getDefaultTranslation,
  getDefaultButtonText,
  type LangCode,
} from "../utils/defaultFieldTranslations";

interface TranslationPanelProps {
  fields: CustomFormField[];
  languageConfig: FormLanguageConfig;
  onLanguageConfigChange: (config: FormLanguageConfig) => void;
  onFieldsChange: (fields: CustomFormField[]) => void;
  onClose: () => void;
}

const PRIMARY_OPTIONS: { value: PrimaryLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية (Arabic)" },
];

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  fields,
  languageConfig,
  onLanguageConfigChange,
  onFieldsChange,
  onClose,
}) => {
  const { languageMode, primaryLanguage = "en" } = languageConfig;
  const secondaryLanguage: LangCode = primaryLanguage === "en" ? "ar" : "en";

  const translatableFields = useMemo(() => {
    return fields.filter(
      (f) =>
        f.type !== "divider" &&
        f.type !== "spacer" &&
        !f.containerType &&
        (f.type === "button"
          ? f.buttonText != null || f.name
          : f.label != null || f.name)
    );
  }, [fields]);

  const getPrimaryLabel = (f: CustomFormField) => {
    const fromField =
      primaryLanguage === "en"
        ? f.labelTranslations?.en ?? f.label
        : f.labelTranslations?.ar;
    const fromDefault = getDefaultTranslation(f.name || "", primaryLanguage);
    return (
      fromField ??
      fromDefault?.label ??
      (primaryLanguage === "en" ? f.label : getDefaultTranslation(f.name || "", "en")?.label) ??
      f.label ??
      f.name ??
      ""
    );
  };

  const getPrimaryPlaceholder = (f: CustomFormField) => {
    const fromField =
      primaryLanguage === "en"
        ? f.placeholderTranslations?.en ?? f.placeholder
        : f.placeholderTranslations?.ar;
    const fromDefault = getDefaultTranslation(f.name || "", primaryLanguage);
    return (
      fromField ??
      fromDefault?.placeholder ??
      (primaryLanguage === "en" ? f.placeholder : getDefaultTranslation(f.name || "", "en")?.placeholder) ??
      f.placeholder ??
      ""
    );
  };

  const getSecondaryLabel = (f: CustomFormField) => {
    const fromField =
      secondaryLanguage === "en"
        ? f.labelTranslations?.en
        : f.labelTranslations?.ar;
    const fromDefault = getDefaultTranslation(f.name || "", secondaryLanguage);
    return fromField ?? fromDefault?.label ?? "";
  };

  const getSecondaryPlaceholder = (f: CustomFormField) => {
    const fromField =
      secondaryLanguage === "en"
        ? f.placeholderTranslations?.en
        : f.placeholderTranslations?.ar;
    const fromDefault = getDefaultTranslation(f.name || "", secondaryLanguage);
    return fromField ?? fromDefault?.placeholder ?? "";
  };

  const getPrimaryButtonText = (f: CustomFormField) => {
    if (f.type !== "button") return "";
    const fromField =
      primaryLanguage === "en"
        ? f.buttonTextTranslations?.en ?? f.buttonText
        : f.buttonTextTranslations?.ar;
    const fromDefault = getDefaultButtonText(
      f.buttonText || f.name || "button",
      primaryLanguage
    );
    return fromField ?? fromDefault ?? f.buttonText ?? "Button";
  };

  const getSecondaryButtonText = (f: CustomFormField) => {
    if (f.type !== "button") return "";
    const fromField =
      secondaryLanguage === "en"
        ? f.buttonTextTranslations?.en
        : f.buttonTextTranslations?.ar;
    const fromDefault = getDefaultButtonText(
      f.buttonText || f.name || "button",
      secondaryLanguage
    );
    return fromField ?? fromDefault ?? "";
  };

  const updateFieldTranslation = (
    fieldId: string,
    kind: "label" | "placeholder" | "buttonText",
    value: string,
    lang: LangCode
  ) => {
    onFieldsChange(
      fields.map((f) => {
        if (f.id !== fieldId) return f;
        if (kind === "buttonText") {
          return {
            ...f,
            buttonTextTranslations: {
              ...f.buttonTextTranslations,
              [lang]: value || undefined,
            },
          };
        }
        if (kind === "label") {
          return {
            ...f,
            labelTranslations: {
              ...f.labelTranslations,
              [lang]: value || undefined,
            },
          };
        }
        return {
          ...f,
          placeholderTranslations: {
            ...f.placeholderTranslations,
            [lang]: value || undefined,
          },
        };
      })
    );
  };

  const primaryLabel = primaryLanguage === "en" ? "English" : "العربية";
  const secondaryLabel = secondaryLanguage === "en" ? "English" : "العربية";

  return (
    <div className="absolute right-0 top-0 h-full w-[580px] max-w-[95vw] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col overflow-hidden">
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <Languages size={22} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Language &amp; Translation
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Language mode */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Form language
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="languageMode"
                checked={languageMode === "single"}
                onChange={() =>
                  onLanguageConfigChange({
                    ...languageConfig,
                    languageMode: "single",
                    primaryLanguage: primaryLanguage || "en",
                  })
                }
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-sm text-gray-800">Single language</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="languageMode"
                checked={languageMode === "dual"}
                onChange={() =>
                  onLanguageConfigChange({
                    ...languageConfig,
                    languageMode: "dual",
                    primaryLanguage: primaryLanguage || "en",
                  })
                }
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-sm text-gray-800">Dual language</span>
            </label>
          </div>
        </section>

        {/* Single language: choose English or Arabic */}
        {languageMode === "single" && (
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Language
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              Choose the language for your form (English or Arabic).
            </p>
            <select
              value={primaryLanguage || "en"}
              onChange={(e) =>
                onLanguageConfigChange({
                  ...languageConfig,
                  primaryLanguage: e.target.value as PrimaryLanguage,
                })
              }
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {PRIMARY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Primary language (when dual) */}
        {languageMode === "dual" && (
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Primary language
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              If primary is English, translation is Arabic. If primary is Arabic,
              translation is English.
            </p>
            <select
              value={primaryLanguage || "en"}
              onChange={(e) =>
                onLanguageConfigChange({
                  ...languageConfig,
                  primaryLanguage: e.target.value as PrimaryLanguage,
                })
              }
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {PRIMARY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Translation table (when dual) */}
        {languageMode === "dual" && (
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Translate form (Primary → Secondary)
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Default fields (e.g. first name, last name, email) are
              pre-translated. You can edit any row.
            </p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium text-gray-700 border-b">
                        Field
                      </th>
                      <th className="text-left p-2 font-medium text-gray-700 border-b whitespace-nowrap">
                        Label ({primaryLabel})
                      </th>
                      <th className="text-left p-2 font-medium text-gray-700 border-b whitespace-nowrap">
                        Label ({secondaryLabel})
                      </th>
                      <th className="text-left p-2 font-medium text-gray-700 border-b whitespace-nowrap">
                        Placeholder ({primaryLabel})
                      </th>
                      <th className="text-left p-2 font-medium text-gray-700 border-b whitespace-nowrap">
                        Placeholder ({secondaryLabel})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {translatableFields.map((f) => {
                      const isButton = f.type === "button";
                      return (
                        <tr
                          key={f.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50"
                        >
                          <td className="p-2 text-gray-600 font-mono text-xs">
                            {isButton
                              ? `${f.name || f.id} (button)`
                              : f.name || f.id}
                          </td>
                          <td className="p-2 text-gray-700">
                            {isButton
                              ? getPrimaryButtonText(f)
                              : getPrimaryLabel(f)}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={
                                isButton
                                  ? getSecondaryButtonText(f)
                                  : getSecondaryLabel(f)
                              }
                              onChange={(e) =>
                                updateFieldTranslation(
                                  f.id,
                                  isButton ? "buttonText" : "label",
                                  e.target.value,
                                  secondaryLanguage
                                )
                              }
                              placeholder={
                                isButton
                                  ? `Translate button text to ${secondaryLabel}`
                                  : `Translate label to ${secondaryLabel}`
                              }
                              className="w-full px-2 py-1 border border-gray-200 rounded text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </td>
                          <td className="p-2 text-gray-700">
                            {isButton ? "—" : getPrimaryPlaceholder(f)}
                          </td>
                          <td className="p-2">
                            {isButton ? (
                              "—"
                            ) : (
                              <input
                                type="text"
                                value={getSecondaryPlaceholder(f)}
                                onChange={(e) =>
                                  updateFieldTranslation(
                                    f.id,
                                    "placeholder",
                                    e.target.value,
                                    secondaryLanguage
                                  )
                                }
                                placeholder={`Translate placeholder to ${secondaryLabel}`}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {translatableFields.length === 0 && (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No translatable fields yet. Add fields in the form design
                  first.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
