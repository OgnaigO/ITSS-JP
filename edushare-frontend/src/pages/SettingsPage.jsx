// src/pages/SettingsPage.jsx
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  // Get storage key for settings based on current user
  const getSettingsStorageKey = () => {
    if (!user) return "appSettings"; // Fallback to old key if no user
    const userId = user.id || user.username || (user.email ? user.email.split("@")[0] : null);
    return userId ? `appSettings_${userId}` : "appSettings";
  };

  // Load settings from localStorage immediately in initial state
  const loadSettingsFromStorage = () => {
    try {
      const settingsKey = getSettingsStorageKey();
      const savedSettings = localStorage.getItem(settingsKey);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return {
          commentNotifications: parsed.commentNotifications !== undefined ? parsed.commentNotifications : true,
          language: parsed.language || language,
          theme: parsed.theme || "Light",
        };
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    // Default values if no saved settings
    return {
      commentNotifications: true,
      language: language,
      theme: "Light",
    };
  };

  const [settings, setSettings] = useState(loadSettingsFromStorage);
  const isFirstRender = useRef(true);

  // Reload settings when user changes
  useEffect(() => {
    const settingsKey = getSettingsStorageKey();
    const savedSettings = localStorage.getItem(settingsKey);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        commentNotifications: parsed.commentNotifications !== undefined ? parsed.commentNotifications : true,
        language: parsed.language || language,
        theme: parsed.theme || "Light",
      });
      // Update language context if settings have language
      if (parsed.language) {
        setLanguage(parsed.language);
      }
    } else {
      // Use defaults if no settings found
      setSettings({
        commentNotifications: true,
        language: language,
        theme: "Light",
      });
    }
    isFirstRender.current = true; // Reset first render flag when user changes
  }, [user?.id, user?.username]);

  // Save settings to localStorage whenever they change (but skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const settingsKey = getSettingsStorageKey();
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings, user?.id, user?.username]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === "Dark") {
      root.classList.add("dark-mode");
      root.classList.remove("light-mode");
    } else {
      // Default to Light mode
      root.classList.add("light-mode");
      root.classList.remove("dark-mode");
    }
  }, [settings.theme]);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    // Update language context when language changes
    if (key === "language") {
      setLanguage(value);
    }
  };

  const SettingSection = ({ icon, title, description, children }) => (
    <div className="settings-section">
      <div className="settings-section-header">
        <div className="settings-icon">{icon}</div>
        <div>
          <h3 className="settings-section-title">{title}</h3>
          <p className="settings-section-description">{description}</p>
        </div>
      </div>
      <div className="settings-section-content">{children}</div>
    </div>
  );

  const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div className="settings-item">
      <div className="settings-item-info">
        <label className="settings-item-label">{label}</label>
        {description && (
          <p className="settings-item-description">{description}</p>
        )}
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );

  const SelectField = ({ label, value, options, onChange, optionLabels }) => (
    <div className="settings-item">
      <label className="settings-item-label">{label}</label>
      <select
        className="settings-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option, index) => (
          <option key={option} value={option}>
            {optionLabels ? optionLabels[index] : option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="page settings-page">
      <div className="settings-header">
        <h1>{t("settings.title")}</h1>
        <p className="settings-subtitle">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="settings-content">
        {/* Notifications Section */}
        <SettingSection
          icon="🔔"
          title={t("settings.notifications.title")}
          description={t("settings.notifications.description")}
        >
          <ToggleSwitch
            label={t("settings.notifications.comments")}
            description={t("settings.notifications.commentsDesc")}
            checked={settings.commentNotifications}
            onChange={() => handleToggle("commentNotifications")}
          />
        </SettingSection>

        {/* Language & Region Section */}
        <SettingSection
          icon="🌐"
          title={t("settings.language.title")}
          description={t("settings.language.description")}
        >
          <SelectField
            label={t("settings.language.label")}
            value={settings.language}
            options={["Vietnamese", "Japanese"]}
            optionLabels={
              language === "Vietnamese" 
                ? ["Tiếng Việt", "日本語 (Tiếng Nhật)"]
                : ["ベトナム語 (Vietnamese)", "日本語"]
            }
            onChange={(value) => handleSelectChange("language", value)}
          />
        </SettingSection>

        {/* Appearance Section */}
        <SettingSection
          icon="🎨"
          title={t("settings.appearance.title")}
          description={t("settings.appearance.description")}
        >
          <SelectField
            label={t("settings.appearance.label")}
            value={settings.theme}
            options={["Light", "Dark"]}
            optionLabels={[
              t("settings.appearance.light"),
              t("settings.appearance.dark")
            ]}
            onChange={(value) => handleSelectChange("theme", value)}
          />
        </SettingSection>
      </div>
    </div>
  );
}

