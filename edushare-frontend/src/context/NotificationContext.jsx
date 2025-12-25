// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

// Helper function to generate storage key from user identifier
const getStorageKeyForUser = (userId, username, email) => {
  const identifier = userId || username || (email ? email.split("@")[0] : null);
  return identifier ? `notifications_${identifier}` : null;
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Get storage key based on current user
  const getStorageKey = () => {
    if (!user) return null;
    return getStorageKeyForUser(user.id, user.username, user.email);
  };

  // Load notifications from localStorage when user changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setNotifications([]);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
      setNotifications([]);
    }
  }, [user?.id, user?.username]); // Reload when user changes

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, user?.id, user?.username]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Add notification for a specific user (by userId or username)
  // This is useful when we want to notify the post owner when someone comments
  const addNotificationForUser = (targetUserId, notification) => {
    if (!targetUserId) return;

    // Check target user's notification settings before creating notification
    // Only create notification if comment notifications are enabled
    if (notification.type === "comment") {
      try {
        const settingsKey = `appSettings_${targetUserId}`;
        const savedSettings = localStorage.getItem(settingsKey);
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          // If commentNotifications is explicitly false, don't create notification
          if (settings.commentNotifications === false) {
            return; // Don't create notification
          }
        }
        // If no settings found or commentNotifications is true/undefined, continue
      } catch (e) {
        console.error("Failed to check target user settings", e);
        // Continue with notification if settings check fails
      }
    }

    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    // Get storage key for target user (targetUserId can be id or username)
    const targetStorageKey = `notifications_${targetUserId}`;
    
    try {
      // Load existing notifications for target user
      const saved = localStorage.getItem(targetStorageKey);
      const existingNotifications = saved ? JSON.parse(saved) : [];
      
      // Add new notification
      const updatedNotifications = [newNotification, ...existingNotifications];
      
      // Save back to localStorage
      localStorage.setItem(targetStorageKey, JSON.stringify(updatedNotifications));
      
      // If target user is the current user, also update state
      const currentStorageKey = getStorageKey();
      if (currentStorageKey === targetStorageKey) {
        setNotifications(updatedNotifications);
      }
    } catch (e) {
      console.error("Failed to add notification for user", e);
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    notifications,
    addNotification,
    addNotificationForUser,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}

