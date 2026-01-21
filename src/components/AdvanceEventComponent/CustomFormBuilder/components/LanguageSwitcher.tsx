import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        title="Change Language"
      >
        <Globe size={18} />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform rtl:rotate-180 ${isOpen ? "rotate-180 rtl:rotate-0" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-2 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50 min-w-[160px] border border-gray-200 language-switcher-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                i18n.language === lang.code ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium flex-1">{lang.name}</span>
              {i18n.language === lang.code && (
                <span className="text-blue-600 rtl:order-first">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
