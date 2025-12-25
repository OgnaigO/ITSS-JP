// src/components/layout/Header.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getAvatarUrl } from "../../utils/avatarUtils";
import NotificationDropdown from "../notifications/NotificationDropdown";

const BACKEND_ORIGIN = "http://localhost:8080";

export default function Header({
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  onOpenPostModal,
}) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (onSearchChange) onSearchChange(value);
  };

  const displayName = user?.username || user?.email || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
  const avatarUrl = getAvatarUrl(user?.avatarUrl);

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          EduShare
        </Link>
        <nav className="nav">
          <Link to="/">{t("header.home")}</Link>
          <Link to="/my-posts">{t("header.myPosts")}</Link>
        </nav>
      </div>

      {/* Ô search dùng chung cho Home & MyPosts */}
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("header.search")}
          value={searchValue}
          onChange={handleChange}
        />
      </form>

      <div className="header-right">
        {user ? (
          <>
            <NotificationDropdown />
            <Link to="/profile" className="user-chip">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="user-avatar-img"
                  onError={(e) => {
                    // Fallback to initials if image fails
                    const placeholder = e.currentTarget.nextElementSibling;
                    if (placeholder) {
                      e.currentTarget.style.display = "none";
                      placeholder.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div 
                className="user-avatar"
                style={{ display: avatarUrl ? "none" : "flex" }}
              >
                {initials}
              </div>
              <span className="user-name">{displayName}</span>
            </Link>
            <Link to="/settings" className="btn-ghost" style={{ marginRight: 4 }}>
              {t("header.settings")}
            </Link>
            <button
              type="button"
              className="btn-ghost"
              onClick={logout}
              style={{ marginRight: 4 }}
            >
              {t("header.logout")}
            </button>
            <button
              type="button"
              onClick={onOpenPostModal}
              className="btn-primary"
            >
              {t("header.createPost")}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">
              {t("header.login")}
            </Link>
            <Link to="/register" className="btn-ghost">
              {t("header.register")}
            </Link>
            <button
              type="button"
              onClick={onOpenPostModal}
              className="btn-primary"
            >
              {t("header.createPost")}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
