// src/context/LanguageContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("Vietnamese");

  // Load language from localStorage on mount
  // Note: Language is loaded per user in SettingsPage, but here we load a default/global one
  // The actual per-user language will be managed by SettingsPage
  useEffect(() => {
    try {
      // Try to load from common settings first
      const savedSettings = localStorage.getItem("appSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.language) {
          setLanguage(parsed.language);
        }
      }
    } catch (e) {
      console.error("Failed to load language from storage", e);
    }
  }, []);

  // Get translation for a key
  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to Vietnamese if key not found
        value = translations["Vietnamese"];
        for (const k2 of keys) {
          if (value && value[k2] !== undefined) {
            value = value[k2];
          } else {
            return key; // Return key if not found in fallback
          }
        }
        break;
      }
    }
    
    return value;
  };

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

