// src/i18n.js
// Global i18n configuration - ready for global extension
// Currently scoped to Custom Advance Registration module
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import loginPageEN from '../locales/english/loginPage.json';
import signupPageEN from '../locales/english/signupPage.json';
import formBuilderEN from '../locales/english/formBuilder.json';
import registrationEN from '../locales/english/registration.json';
import loginPageAR from '../locales/arabic/loginPage.json';
import signupPageAR from '../locales/arabic/signupPage.json';
import formBuilderAR from '../locales/arabic/formBuilder.json';
import registrationAR from '../locales/arabic/registration.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        loginPage: loginPageEN,
        signupPage: signupPageEN,
        formBuilder: formBuilderEN,
        registration: registrationEN,
      },
      ar: {
        loginPage: loginPageAR,
        signupPage: signupPageAR,
        formBuilder: formBuilderAR,
        registration: registrationAR,
      },
    },
    // For Custom Advance Registration: English is default, Arabic when selected
    // For global extension: Change to detect from browser
    fallbackLng: 'en',
    lng: 'en', // Default for Custom Advance Registration module
    debug: false,
    ns: ['loginPage', 'signupPage', 'formBuilder', 'registration'],
    defaultNS: 'registration',
    detection: {
      // For Custom Advance Registration: Disabled to use default 'en'
      // For global extension: Enable detection with order: ['localStorage', 'navigator']
      order: [],
      caches: [],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Direction handling utility - scoped to module, ready for global extension
// This function can be called by components that need RTL support
export const updateDirection = (lng, element = null) => {
  const targetElement = element || document.documentElement;
  targetElement.dir = lng === "ar" ? "rtl" : "ltr";
  targetElement.lang = lng;
};

// Listen for language changes (for module-level RTL components)
i18n.on("languageChanged", (lng) => {
  // Only update if there's a module-specific element
  // For global extension: update document.documentElement here
});

export default i18n;
