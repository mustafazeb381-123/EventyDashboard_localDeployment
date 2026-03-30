// src/components/LanguageToggle.tsx
import { useTranslation } from "react-i18next";
// @ts-expect-error Typed JS i18n helper module
import { updateDirection } from "../../utils/i18n";

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    // updateDirection is also called by the i18n languageChanged listener,
    // but we call it here to ensure immediate visual update
    updateDirection(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:shadow-[0_10px_24px_rgba(37,99,235,0.28)] dark:hover:bg-blue-400"
      title={i18n.language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      {i18n.language === "en" ? "العربية" : "English"}
    </button>
  );
};

export default LanguageToggle;
