// src/components/LanguageToggle.tsx
import React from "react";
import { useTranslation } from "react-i18next";
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
      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer text-sm font-medium"
      title={i18n.language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      {i18n.language === "en" ? "العربية" : "English"}
    </button>
  );
};

export default LanguageToggle;
