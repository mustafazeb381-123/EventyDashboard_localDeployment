// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import loginPageEN from '../locales/english/loginPage.json';
import signupPageEN from '../locales/english/signupPage.json';
import loginPageAR from '../locales/arabic/loginPage.json';
import signupPageAR from '../locales/arabic/signupPage.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        loginPage: loginPageEN,
        signupPage: signupPageEN,
      },
      ar: {
        loginPage: loginPageAR,
        signupPage: signupPageAR,
      },
    },
    fallbackLng: 'en',
    debug: true,
    ns: ['loginPage', 'signupPage'], // ← register all namespaces here
    defaultNS: 'loginPage', // ← optional default
    interpolation: {
      escapeValue: false,
    },
  });
// --- Add direction handling ---
const updateDir = (lng) => {
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
};

// Run once on initial load
updateDir(i18n.language);

// Update whenever language changes
i18n.on("languageChanged", (lng) => {
  updateDir(lng);
});


export default i18n;
