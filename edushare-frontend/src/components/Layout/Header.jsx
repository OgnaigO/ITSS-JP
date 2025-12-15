// src/components/layout/Header.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header({
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  onOpenPostModal,
}) {
  const { user, logout } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (onSearchChange) onSearchChange(value);
  };

  const displayName = user?.username || user?.email || "User";

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          EduShare
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/my-posts">My Posts</Link>
        </nav>
      </div>

      {/* Ô search dùng chung cho Home & MyPosts */}
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchValue}
          onChange={handleChange}
        />
      </form>

      <div className="header-right">
        {user ? (
          <>
            <div className="user-chip">{displayName}</div>
            <button
              type="button"
              className="btn-ghost"
              onClick={logout}
              style={{ marginRight: 4 }}
            >
              Logout
            </button>
            <button
              type="button"
              onClick={onOpenPostModal}
              className="btn-primary"
            >
              + Post Slide
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn-ghost">
              Register
            </Link>
            <button
              type="button"
              onClick={onOpenPostModal}
              className="btn-primary"
            >
              + Post Slide
            </button>
          </>
        )}
      </div>
    </header>
  );
}
