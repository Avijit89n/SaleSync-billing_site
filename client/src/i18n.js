
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./languages/en.json";
import bn from "./languages/bn.json";
import hi from "./languages/hi.json";

const supportedLanguages = ["en", "hi", "bn"]; // Add "hi" when enabled

const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("i18nextLng")
    : null;

const initialLanguage = supportedLanguages.includes(savedLanguage)
  ? savedLanguage
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
    hi: { translation: hi },
  },

  lng: initialLanguage,
  fallbackLng: "en",
  supportedLngs: supportedLanguages,

  interpolation: {
    escapeValue: false,
  },
});

// Save the selected language whenever it changes
i18n.on("languageChanged", (language) => {
  const normalizedLanguage = language.split("-")[0];

  if (supportedLanguages.includes(normalizedLanguage)) {
    localStorage.setItem("i18nextLng", normalizedLanguage);
  }
});

export default i18n;
