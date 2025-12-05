// src/pages/MyPostsPage.jsx
import { useEffect, useState } from "react";
import { fetchPosts } from "../api/postsApi";
import PostCard from "../components/posts/PostCard";

const currentUserId = "demo-user-id"; // TODO: lấy từ auth

export default function MyPostsPage({ externalSearch = "", reloadFlag = 0 }) {
  // TOÀN bộ bài viết của user hiện tại
  const [allPosts, setAllPosts] = useState([]);

  // Bài viết đang hiển thị ở trang hiện tại
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // tab demo (Published / Drafts / Saved)
  const [tab, setTab] = useState("published");

  // Phân trang (FE tự cắt, giống HomePage)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // search theo title lấy từ header
  const titleFilter = externalSearch || "";

  // --------- 1. Lấy toàn bộ bài viết của user ----------
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPosts({
          page: 0,
          size: 1000, // đủ lớn cho bài tập
          authorId: currentUserId,
        });

        const items = Array.isArray(data.content) ? data.content : data;
        setAllPosts(items || []);
      } catch (err) {
        console.error("Failed to load my posts", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [reloadFlag, tab]);

  // Khi search thay đổi thì quay về trang 1
  useEffect(() => {
    setPage(0);
  }, [externalSearch]);

  // so sánh chuỗi không phân biệt hoa/thường
  const compareStrings = (a = "", b = "") =>
    a.toString().toLowerCase().localeCompare(b.toString().toLowerCase());

  // --------- 2. Filter + sort (mặc định newest) + cắt trang ----------
  useEffect(() => {
    let data = [...allPosts];

    // filter theo title
    if (titleFilter.trim()) {
      const keyword = titleFilter.trim().toLowerCase();
      data = data.filter((p) =>
        (p.title || "").toLowerCase().includes(keyword)
      );
    }

    // sort mặc định: createdAt desc (newest)
    data.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      // newest first
      return db - da;
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
  }, [allPosts, titleFilter, page, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil((totalFiltered || allPosts.length || 0) / pageSize)
  );

  return (
    <div className="page">
      <h1>My Posts</h1>
      <p>Manage your shared slides and track community feedback</p>

      <div className="tabs">
        <button
          className={tab === "published" ? "tab active" : "tab"}
          onClick={() => setTab("published")}
        >
          Published
        </button>
        <button
          className={tab === "drafts" ? "tab active" : "tab"}
          onClick={() => setTab("drafts")}
        >
          Drafts
        </button>
        <button
          className={tab === "saved" ? "tab active" : "tab"}
          onClick={() => setTab("saved")}
        >
          Saved
        </button>
      </div>

      {/* Grid giống HomePage: bỏ single-column để nó auto-fill nhiều cột */}
      {loading ? (
        <div>Loading...</div>
      ) : posts.length === 0 ? (
        <div>No posts found.</div>
      ) : (
        <div className="posts-grid">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {/* Phân trang giống HomePage */}
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
