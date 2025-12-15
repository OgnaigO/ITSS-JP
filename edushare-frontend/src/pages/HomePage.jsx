// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { fetchPosts } from "../api/postsApi";
import PostCard from "../components/posts/PostCard";

export default function HomePage({ externalSearch = "", reloadFlag = 0 }) {
  // TOÀN bộ bài viết lấy từ BE
  const [allPosts, setAllPosts] = useState([]);

  // Bài viết đang hiển thị ở trang hiện tại
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phân trang (FE tự cắt)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // ===== FILTER STATE =====
  // titleFilter giờ lấy từ externalSearch (header)
  const titleFilter = externalSearch || "";
  const [categoryFilter, setCategoryFilter] = useState("");

  // ===== SORT STATE (FE xử lý) =====
  const [sortBy, setSortBy] = useState("createdAt"); // createdAt | title
  const [direction, setDirection] = useState("desc"); // asc | desc

  // ----------------------------------
  // 1. Lấy TOÀN BỘ bài viết từ backend
  //    chạy lại khi reloadFlag đổi (có post mới)
  // ----------------------------------
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const data = await fetchPosts({
          page: 0,
          size: 1000, // đủ lớn cho bài tập
        });

        const items = Array.isArray(data.content) ? data.content : data;
        setAllPosts(items || []);
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [reloadFlag]);

  // Khi text search thay đổi thì luôn quay về trang 1
  useEffect(() => {
    setPage(0);
  }, [externalSearch]);

  // Hàm sort dùng chung, không phân biệt hoa/thường
  const compareStrings = (a = "", b = "") =>
    a.toString().toLowerCase().localeCompare(b.toString().toLowerCase());

  // ----------------------------------
  // 2. Filter + sort + cắt trang trên FE
  // ----------------------------------
  useEffect(() => {
    let data = [...allPosts];

    // --- Filter theo title (dùng externalSearch) ---
    if (titleFilter.trim()) {
      const keyword = titleFilter.trim().toLowerCase();
      data = data.filter((p) =>
        (p.title || "").toLowerCase().includes(keyword)
      );
    }

    // --- Filter theo category ---
    if (categoryFilter) {
      data = data.filter((p) => (p.category || "") === categoryFilter);
    }

    // --- Sort ---
    data.sort((a, b) => {
      let result = 0;

      if (sortBy === "title") {
        result = compareStrings(a.title, b.title);
      } else if (sortBy === "category") {
        result = compareStrings(a.category, b.category);
      } else {
        // createdAt (mặc định)
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        result = da - db;
      }

      return direction === "asc" ? result : -result;
    });

    const total = data.length;
    setTotalFiltered(total);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page >= totalPages) {
      setPage(totalPages - 1);
      return;
    }

    const start = page * pageSize;
    const end = start + pageSize;
    setPosts(data.slice(start, end));
  }, [
    allPosts,
    titleFilter,
    categoryFilter,
    sortBy,
    direction,
    page,
    pageSize,
  ]);

  const handleClearFilters = () => {
    setCategoryFilter("");
    setSortBy("createdAt");
    setDirection("desc");
    setPage(0);
  };

  const totalPages = Math.max(
    1,
    Math.ceil((totalFiltered || allPosts.length || 0) / pageSize)
  );

  return (
    <div className="page home-page">
      {/* Header khu feed (không còn nút +Post Slide nữa) */}
      <div className="feed-header">
        <div>
          <h1>Welcome to EduShare</h1>
          <p>
            Share challenging slides and get AI-powered suggestions from fellow
            educators.
          </p>
        </div>
      </div>

      {/* ====== FILTER + SORT BAR ====== */}
      <div className="filter-bar">
        {/* Không có ô search nữa, vì search ở Header */}

        {/* Lọc theo category */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setPage(0);
            setCategoryFilter(e.target.value);
          }}
        >
          <option value="">All subjects</option>
          <option value="Biology">Biology</option>
          <option value="Mathematics">Mathematics</option>
          <option value="History">History</option>
        </select>

        {/* Sort field */}
        <select
          value={sortBy}
          onChange={(e) => {
            setPage(0);
            setSortBy(e.target.value);
          }}
        >
          <option value="createdAt">Default sort (Newest)</option>
          <option value="title">Sort by: Title</option>
          {/* nếu sau này sort By subject thì mở lại: */}
          {/* <option value="category">Sort by: Subject</option> */}
        </select>

        {/* Sort direction */}
        <select
          value={direction}
          onChange={(e) => {
            setPage(0);
            setDirection(e.target.value);
          }}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <button type="button" onClick={handleClearFilters}>
          Clear filters
        </button>
      </div>

      {/* Tabs UI (chưa cần logic) */}
      <div className="feed-tabs">
        <button className="tab active">Latest</button>
        <button className="tab">Following</button>
        <button className="tab">AI Recommended</button>
      </div>

      {/* List bài viết */}
      {loading ? (
        <div>Loading...</div>
      ) : posts.length === 0 ? (
        <div>No posts found.</div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Phân trang FE */}
      <div className="pagination">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </button>
        <span>
          Page {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
