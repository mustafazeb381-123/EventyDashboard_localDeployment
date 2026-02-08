import React from "react";
import { X, Languages } from "lucide-react";
import type { RsvpFormField, RsvpLanguageConfig } from "./types";

interface RsvpTranslationPanelProps {
  formFields: RsvpFormField[];
  languageConfig: RsvpLanguageConfig;
  onLanguageConfigChange: (config: RsvpLanguageConfig) => void;
  onFormFieldsChange: (fields: RsvpFormField[]) => void;
  onClose: () => void;
}

function getFieldDisplayName(f: RsvpFormField): string {
  if (f.type === "paragraph" || f.type === "heading" || f.type === "divider") {
    return f.type.charAt(0).toUpperCase() + f.type.slice(1);
  }
  return f.label || f.type || f.name;
}

export const RsvpTranslationPanel: React.FC<RsvpTranslationPanelProps> = ({
  formFields,
  languageConfig,
  onLanguageConfigChange,
  onFormFieldsChange,
  onClose,
}) => {
  const { languageMode, primaryLanguage = "en" } = languageConfig;
  const secondaryLanguage = primaryLanguage === "en" ? "ar" : "en";

  const updateFieldLabel = (fieldId: string, lang: "en" | "ar", value: string) => {
    onFormFieldsChange(
      formFields.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              labelTranslations: {
                ...f.labelTranslations,
                [lang]: value || undefined,
              },
            }
          : f
      )
    );
  };

  const updateFieldPlaceholder = (fieldId: string, lang: "en" | "ar", value: string) => {
    onFormFieldsChange(
      formFields.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              placeholderTranslations: {
                ...f.placeholderTranslations,
                [lang]: value || undefined,
              },
            }
          : f
      )
    );
  };

  const updateFieldContent = (fieldId: string, lang: "en" | "ar", value: string) => {
    onFormFieldsChange(
      formFields.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              contentTranslations: {
                ...f.contentTranslations,
                [lang]: value || undefined,
              },
            }
          : f
      )
    );
  };

  const getLabelPrimary = (f: RsvpFormField) =>
    f.labelTranslations?.[primaryLanguage] ?? f.label ?? "";
  const getLabelSecondary = (f: RsvpFormField) =>
    f.labelTranslations?.[secondaryLanguage] ?? "";
  const getPlaceholderPrimary = (f: RsvpFormField) =>
    f.placeholderTranslations?.[primaryLanguage] ?? f.placeholder ?? "";
  const getPlaceholderSecondary = (f: RsvpFormField) =>
    f.placeholderTranslations?.[secondaryLanguage] ?? "";
  const getContentPrimary = (f: RsvpFormField) =>
    f.contentTranslations?.[primaryLanguage] ?? f.content ?? "";
  const getContentSecondary = (f: RsvpFormField) =>
    f.contentTranslations?.[secondaryLanguage] ?? "";

  return (
    <div className="absolute right-0 top-0 h-full w-[520px] max-w-[95vw] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col overflow-hidden">
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
          className="p-2 hover:bg-white/80 rounded-lg"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Form language
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rsvpLangMode"
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
                name="rsvpLangMode"
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

        {languageMode === "single" && (
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Language
            </h3>
            <select
              value={primaryLanguage || "en"}
              onChange={(e) =>
                onLanguageConfigChange({
                  ...languageConfig,
                  primaryLanguage: e.target.value as "en" | "ar",
                })
              }
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
            </select>
          </section>
        )}

        {languageMode === "dual" && (
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Primary language
            </h3>
            <select
              value={primaryLanguage || "en"}
              onChange={(e) =>
                onLanguageConfigChange({
                  ...languageConfig,
                  primaryLanguage: e.target.value as "en" | "ar",
                })
              }
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
            </select>
          </section>
        )}

        {languageMode === "dual" && formFields.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Translate field labels &amp; placeholders ({primaryLanguage} → {secondaryLanguage})
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium text-gray-700 border-b">
                        Field
                      </th>
                      <th className="text-left p-2 font-medium text-gray-700 border-b">
                        Primary
                      </th>
                      <th className="text-left p-2 font-medium text-gray-700 border-b">
                        Translation ({secondaryLanguage})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formFields.map((f) => {
                      const displayName = getFieldDisplayName(f);
                      const isContentField = f.type === "paragraph" || f.type === "heading";
                      return (
                        <React.Fragment key={f.id}>
                          {isContentField ? (
                            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="p-2 text-gray-600 font-medium">
                                {displayName} – Content
                              </td>
                              <td className="p-2 text-gray-700">
                                {getContentPrimary(f)}
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={getContentSecondary(f)}
                                  onChange={(e) =>
                                    updateFieldContent(f.id, secondaryLanguage, e.target.value)
                                  }
                                  placeholder={`Translate content to ${secondaryLanguage}`}
                                  className="w-full px-2 py-1 border border-gray-200 rounded text-gray-800 focus:ring-1 focus:ring-indigo-500"
                                  dir={secondaryLanguage === "ar" ? "rtl" : "ltr"}
                                />
                              </td>
                            </tr>
                          ) : (
                            <>
                              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                <td className="p-2 text-gray-600 font-medium">
                                  {displayName} – Label
                                </td>
                                <td className="p-2 text-gray-700">
                                  {getLabelPrimary(f)}
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={getLabelSecondary(f)}
                                    onChange={(e) =>
                                      updateFieldLabel(f.id, secondaryLanguage, e.target.value)
                                    }
                                    placeholder={`Translate label to ${secondaryLanguage}`}
                                    className="w-full px-2 py-1 border border-gray-200 rounded text-gray-800 focus:ring-1 focus:ring-indigo-500"
                                    dir={secondaryLanguage === "ar" ? "rtl" : "ltr"}
                                  />
                                </td>
                              </tr>
                              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                <td className="p-2 text-gray-600 font-medium">
                                  {displayName} – Placeholder
                                </td>
                                <td className="p-2 text-gray-700">
                                  {getPlaceholderPrimary(f)}
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={getPlaceholderSecondary(f)}
                                    onChange={(e) =>
                                      updateFieldPlaceholder(f.id, secondaryLanguage, e.target.value)
                                    }
                                    placeholder={`Translate placeholder to ${secondaryLanguage}`}
                                    className="w-full px-2 py-1 border border-gray-200 rounded text-gray-800 focus:ring-1 focus:ring-indigo-500"
                                    dir={secondaryLanguage === "ar" ? "rtl" : "ltr"}
                                  />
                                </td>
                              </tr>
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
