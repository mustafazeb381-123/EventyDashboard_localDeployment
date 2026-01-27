import type { CustomFormField } from "../types";
import i18n from "i18next";

/**
 * Normalize field name/label for translation lookup
 */
const normalizeFieldKey = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

/**
 * Get the translated label for a field based on current language
 * Falls back to translation JSON files if field doesn't have labelTranslations
 */
export const getTranslatedLabel = (
  field: CustomFormField,
  currentLanguage: string
): string => {
  // First, try field's own translations
  if (currentLanguage === "ar" && field.labelTranslations?.ar) {
    return field.labelTranslations.ar;
  }
  if (field.labelTranslations?.en) {
    return field.labelTranslations.en;
  }

  // Fallback: Try to get translation from JSON files
  const fieldName = normalizeFieldKey(field.name || "");
  const fieldLabel = normalizeFieldKey(field.label || "");
  const originalLabel = field.label || "";
  
  // Try common field name patterns
  const possibleKeys = [
    `registrationForm.fieldLabels.${fieldName}`,
    `registrationForm.fieldLabels.${fieldLabel}`,
    `registrationForm.fieldLabels.${field.name?.toLowerCase()}`,
    `registrationForm.fieldLabels.${originalLabel.toLowerCase()}`,
  ];

  // Try each key until we find a translation
  // Use the current language from i18n if available, otherwise use the passed currentLanguage
  const langToUse = i18n.language || currentLanguage;
  for (const key of possibleKeys) {
    try {
      const translation = i18n.t(key, { 
        lng: langToUse,
        returnObjects: false, 
        defaultValue: null 
      });
      if (translation && translation !== key && typeof translation === 'string') {
        return translation;
      }
    } catch (e) {
      // Continue to next key if translation fails
    }
  }

  // Final fallback to original label
  return originalLabel;
};

/**
 * Get the translated placeholder for a field based on current language
 * Falls back to translation JSON files if field doesn't have placeholderTranslations
 */
export const getTranslatedPlaceholder = (
  field: CustomFormField,
  currentLanguage: string
): string | undefined => {
  // First, try field's own translations
  if (currentLanguage === "ar" && field.placeholderTranslations?.ar) {
    return field.placeholderTranslations.ar;
  }
  if (field.placeholderTranslations?.en) {
    return field.placeholderTranslations.en;
  }

  // Fallback: Try to get translation from JSON files
  const fieldName = normalizeFieldKey(field.name || "");
  const fieldLabel = normalizeFieldKey(field.label || "");
  const originalPlaceholder = field.placeholder || "";
  
  // Try common field name patterns
  const possibleKeys = [
    `registrationForm.fieldPlaceholders.${fieldName}`,
    `registrationForm.fieldPlaceholders.${fieldLabel}`,
    `registrationForm.fieldPlaceholders.${field.name?.toLowerCase()}`,
    `registrationForm.fieldPlaceholders.${originalPlaceholder.toLowerCase()}`,
  ];

  // Try each key until we find a translation
  // Use the current language from i18n if available, otherwise use the passed currentLanguage
  const langToUse = i18n.language || currentLanguage;
  for (const key of possibleKeys) {
    try {
      const translation = i18n.t(key, { 
        lng: langToUse,
        returnObjects: false, 
        defaultValue: null 
      });
      if (translation && translation !== key && typeof translation === 'string') {
        return translation;
      }
    } catch (e) {
      // Continue to next key if translation fails
    }
  }

  // Final fallback to original placeholder
  return originalPlaceholder || undefined;
};

/**
 * Get the translated description for a field based on current language
 * Falls back to main description if translation doesn't exist
 */
export const getTranslatedDescription = (
  field: CustomFormField,
  currentLanguage: string
): string | undefined => {
  if (currentLanguage === "ar" && field.descriptionTranslations?.ar) {
    return field.descriptionTranslations.ar;
  }
  // Fallback to English translation or main description
  return field.descriptionTranslations?.en || field.description || undefined;
};

/**
 * Get the translated option label for select/radio/checkbox fields
 */
export const getTranslatedOptionLabel = (
  option: { label: string; value: string; labelTranslations?: { en?: string; ar?: string } },
  currentLanguage: string
): string => {
  if (currentLanguage === "ar" && option.labelTranslations?.ar) {
    return option.labelTranslations.ar;
  }
  // Fallback to English translation or main label
  return option.labelTranslations?.en || option.label || "";
};

/**
 * Get the translated button text (Register, Submit, Save, etc.) for button fields
 */
export const getTranslatedButtonText = (
  field: CustomFormField,
  currentLanguage: string
): string => {
  if (field.type !== "button") return field.buttonText || "Button";
  if (currentLanguage === "ar" && field.buttonTextTranslations?.ar) {
    return field.buttonTextTranslations.ar;
  }
  return (
    field.buttonTextTranslations?.en ??
    field.buttonText ??
    "Button"
  );
};
