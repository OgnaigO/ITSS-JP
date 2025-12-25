// src/components/notifications/NotificationDropdown.jsx
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router-dom";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();
  const { t } = useLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now - time;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return t("notification.justNow");
    if (diffInMins < 60) return `${diffInMins} ${t("notification.minutesAgo")}`;
    if (diffInHours < 24) return `${diffInHours} ${t("notification.hoursAgo")}`;
    return `${diffInDays} ${t("notification.daysAgo")}`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>{t("notification.title")}</h3>
            {notifications.length > 0 && (
              <div className="notification-actions">
                <button
                  onClick={markAllAsRead}
                  className="btn-text-small"
                >
                  {t("notification.markAllRead")}
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="btn-text-small"
                >
                  {t("notification.clearAll")}
                </button>
              </div>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                {t("notification.noNotifications")}
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={notification.link || "#"}
                  className={`notification-item ${!notification.read ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.type === "comment" && "💬"}
                    {notification.type === "post" && "📝"}
                    {notification.type === "like" && "❤️"}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {getTimeAgo(notification.timestamp)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="notification-unread-dot"></div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

