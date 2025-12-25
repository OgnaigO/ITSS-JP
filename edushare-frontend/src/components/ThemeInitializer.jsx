// src/components/ThemeInitializer.jsx
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ThemeInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    // Get settings storage key based on current user
    const getSettingsStorageKey = () => {
      if (!user) return null;
      const userId = user.id || user.username || (user.email ? user.email.split("@")[0] : null);
      return userId ? `appSettings_${userId}` : null;
    };

    // Load theme from localStorage and apply immediately on app mount
    try {
      const settingsKey = getSettingsStorageKey();
      let theme = "Light"; // Default

      if (settingsKey) {
        const savedSettings = localStorage.getItem(settingsKey);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          theme = parsed.theme || "Light";
        }
      } else {
        // Fallback to old key if no user
        const savedSettings = localStorage.getItem("appSettings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          theme = parsed.theme || "Light";
        }
      }

      const root = document.documentElement;
      if (theme === "Dark") {
        root.classList.add("dark-mode");
        root.classList.remove("light-mode");
      } else {
        root.classList.add("light-mode");
        root.classList.remove("dark-mode");
      }
    } catch (e) {
      console.error("Failed to load theme", e);
      // Default to Light mode on error
      const root = document.documentElement;
      root.classList.add("light-mode");
      root.classList.remove("dark-mode");
    }
  }, [user?.id, user?.username]);

  return null; // This component doesn't render anything
}

