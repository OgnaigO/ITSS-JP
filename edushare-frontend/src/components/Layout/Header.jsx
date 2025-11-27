import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Header({ onOpenPostModal }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // điều hướng kèm query ?q=
    navigate(`/?q=${encodeURIComponent(search)}`);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          EduShare
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/browse">Browse</Link>
          <Link to="/my-posts">My Posts</Link>
        </nav>
      </div>
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <div className="header-right">
        <button onClick={onOpenPostModal} className="btn-primary">
          + Post Slide
        </button>
        {/* icon dark mode + avatar tạm thời bỏ qua */}
      </div>
    </header>
  );
}
