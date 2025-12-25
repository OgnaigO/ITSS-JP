// src/components/LanguageInitializer.jsx
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageInitializer() {
  const { user } = useAuth();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    // Get settings storage key based on current user
    const getSettingsStorageKey = () => {
      if (!user) return null;
      const userId = user.id || user.username || (user.email ? user.email.split("@")[0] : null);
      return userId ? `appSettings_${userId}` : null;
    };

    const settingsKey = getSettingsStorageKey();
    if (!settingsKey) {
      // No user, use default Vietnamese
      return;
    }

    try {
      const savedSettings = localStorage.getItem(settingsKey);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.language) {
          setLanguage(parsed.language);
        }
      }
    } catch (e) {
      console.error("Failed to load language from user settings", e);
    }
  }, [user?.id, user?.username, setLanguage]);

  return null; // This component doesn't render anything
}

