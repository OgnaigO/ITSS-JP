// src/pages/MyPostsPage.jsx
import { useEffect, useState } from "react";
import { fetchPosts } from "../api/postsApi";
import PostCard from "../components/posts/PostCard";
import { useAuth } from "../context/AuthContext";

export default function MyPostsPage({ externalSearch = "", reloadFlag = 0 }) {
  const { user } = useAuth();

  // TOÀN bộ bài viết (sau khi lọc theo user)
  const [allPosts, setAllPosts] = useState([]);

  // Bài viết đang hiển thị ở trang hiện tại
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phân trang (FE tự cắt, giống HomePage)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // search theo title lấy từ header
  const titleFilter = externalSearch || "";

  // ===== helper so khớp owner =====
  const normalize = (s = "") => s.toString().toLowerCase().replace(/\s+/g, "");

  const isOwner = (post) => {
    if (!user) return false;

    // ✅ Hỗ trợ cả API mới (authorUserName string) và API cũ (author object)
    const author = post.author || {}; // API cũ: có thể là object hoặc null
    const authorUserName = post.authorUserName; // API mới: string
    const currentId = user.id;
    const currentUsername = user.username;
    const currentEmail = user.email;
    const currentDisplay =
      currentUsername || (currentEmail ? currentEmail.split("@")[0] : "");

    // 1. So sánh với authorUserName từ API mới
    if (authorUserName && currentUsername) {
      if (normalize(authorUserName) === normalize(currentUsername)) {
        return true;
      }
    }

    // 2. So id (API cũ)
    if (author.id && currentId && author.id === currentId) return true;

    // 3. So username (API cũ)
    if (
      author.username &&
      currentUsername &&
      normalize(author.username) === normalize(currentUsername)
    ) {
      return true;
    }

    // 4. So email (API cũ)
    if (
      author.email &&
      currentEmail &&
      author.email.toLowerCase() === currentEmail.toLowerCase()
    ) {
      return true;
    }

    // 5. So với authorName (lúc tạo post từ modal)
    if (
      post.authorName &&
      currentDisplay &&
      normalize(post.authorName) === normalize(currentDisplay)
    ) {
      return true;
    }

    return false;
  };

  // --------- 1. Lấy bài viết từ backend (filter theo userId) ----------
  useEffect(() => {
    async function load() {
      if (!user?.id) {
        setAllPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // ✅ Gửi userId lên backend để filter trực tiếp
        const data = await fetchPosts({
          page: 0,
          size: 1000, // đủ lớn cho bài tập
          userId: user.id, // ✅ Backend hỗ trợ filter theo userId
        });

        const items = Array.isArray(data.content) ? data.content : data || [];

        // ✅ Backend đã filter theo userId rồi, nên tất cả items đều là của user
        // Không cần filter lại ở frontend nữa
        setAllPosts(items);
      } catch (err) {
        console.error("Failed to load my posts", err);
        console.error("User ID:", user?.id); // Debug log
        setAllPosts([]);
      } finally {
        setLoading(false);
      }
    }

    // Chỉ gọi khi có user và user.id
    if (user?.id) {
      load();
    } else {
      setAllPosts([]);
      setLoading(false);
    }
  }, [reloadFlag, user?.id]); // ✅ Chỉ depend vào user.id thay vì toàn bộ user object

  // Khi search thay đổi thì quay về trang 1
  useEffect(() => {
    setPage(0);
  }, [externalSearch]);

  // --------- 2. Filter + sort + cắt trang ----------
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
      return db - da; // newest first
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

      {loading ? (
        <div>Loading...</div>
      ) : !user ? (
        <div>Please log in to see your posts.</div>
      ) : posts.length === 0 ? (
        <div>No posts found.</div>
      ) : (
        <div className="posts-grid">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

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
