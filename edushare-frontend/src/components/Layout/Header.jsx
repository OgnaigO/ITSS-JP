// src/components/layout/Header.jsx
import { Link } from "react-router-dom";

/**
 * Props gợi ý:
 * - searchValue: string  → giá trị ô "Search posts..." (chính là titleFilter của Home)
 * - onSearchChange(value: string): void → gọi khi người dùng gõ trong ô search
 * - onSearchSubmit(): void → gọi khi người dùng bấm Enter / submit form
 * - onOpenPostModal(): void → mở modal Post Slide (dùng chung với HomePage)
 */
export default function Header({
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  onOpenPostModal,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (onSearchChange) onSearchChange(value);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          EduShare
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          {/* <Link to="/browse">Browse</Link> */}
          <Link to="/my-posts">My Posts</Link>
        </nav>
      </div>

      {/* Ô search dùng chung cho Home */}
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchValue}
          onChange={handleChange}
        />
      </form>

      <div className="header-right">
        <button type="button" onClick={onOpenPostModal} className="btn-primary">
          + Post Slide
        </button>
      </div>
    </header>
  );
}
