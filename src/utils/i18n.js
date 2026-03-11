// src/i18n.js
// Global i18n configuration for Eventy Dashboard
// Supports English (en) and Arabic (ar) with RTL support
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English locale imports
import loginPageEN from '../locales/english/loginPage.json';
import signupPageEN from '../locales/english/signupPage.json';
import formBuilderEN from '../locales/english/formBuilder.json';
import registrationEN from '../locales/english/registration.json';
import commonEN from '../locales/english/common.json';
import dashboardEN from '../locales/english/dashboard.json';
import settingsEN from '../locales/english/settings.json';

// Arabic locale imports
import loginPageAR from '../locales/arabic/loginPage.json';
import signupPageAR from '../locales/arabic/signupPage.json';
import formBuilderAR from '../locales/arabic/formBuilder.json';
import registrationAR from '../locales/arabic/registration.json';
import commonAR from '../locales/arabic/common.json';
import dashboardAR from '../locales/arabic/dashboard.json';
import settingsAR from '../locales/arabic/settings.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEN,
        loginPage: loginPageEN,
        signupPage: signupPageEN,
        formBuilder: formBuilderEN,
        registration: registrationEN,
        dashboard: dashboardEN,
        settings: settingsEN,
      },
      ar: {
        common: commonAR,
        loginPage: loginPageAR,
        signupPage: signupPageAR,
        formBuilder: formBuilderAR,
        registration: registrationAR,
        dashboard: dashboardAR,
        settings: settingsAR,
      },
    },
    fallbackLng: 'en',
    debug: false,
    ns: ['common', 'loginPage', 'signupPage', 'formBuilder', 'registration', 'dashboard', 'settings'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'eventy_language',
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Direction handling utility — updates dir and lang attributes for RTL/LTR
export const updateDirection = (lng, element = null) => {
  const targetElement = element || document.documentElement;
  targetElement.dir = lng === "ar" ? "rtl" : "ltr";
  targetElement.lang = lng;
};

// Apply direction on initial load
updateDirection(i18n.language || 'en');

// Listen for language changes and update document direction globally
i18n.on("languageChanged", (lng) => {
  updateDirection(lng);
  // Persist language choice
  localStorage.setItem('eventy_language', lng);
});

export default i18n;
