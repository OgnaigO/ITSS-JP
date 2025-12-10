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

  // tab demo (Published / Drafts / Saved)
  const [tab, setTab] = useState("published");

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

    const author = post.author || {};
    const currentId = user.id;
    const currentUsername = user.username;
    const currentEmail = user.email;
    const currentDisplay =
      currentUsername || (currentEmail ? currentEmail.split("@")[0] : "");

    // 1. so id
    if (author.id && currentId && author.id === currentId) return true;

    // 2. so username
    if (
      author.username &&
      currentUsername &&
      normalize(author.username) === normalize(currentUsername)
    ) {
      return true;
    }

    // 3. so email
    if (
      author.email &&
      currentEmail &&
      author.email.toLowerCase() === currentEmail.toLowerCase()
    ) {
      return true;
    }

    // 4. so với authorName (lúc tạo post từ modal)
    if (
      post.authorName &&
      currentDisplay &&
      normalize(post.authorName) === normalize(currentDisplay)
    ) {
      return true;
    }

    return false;
  };

  // --------- 1. Lấy toàn bộ bài viết từ backend ----------
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPosts({
          page: 0,
          size: 1000, // đủ lớn cho bài tập
          // authorId gửi lên cũng được nhưng backend hiện chưa dùng
        });

        const items = Array.isArray(data.content) ? data.content : data || [];

        // Lọc lại: chỉ lấy bài của user đang đăng nhập
        const mine = items.filter(isOwner);

        setAllPosts(mine);
      } catch (err) {
        console.error("Failed to load my posts", err);
        setAllPosts([]);
      } finally {
        setLoading(false);
      }
    }

    // nếu chưa login thì không cần gọi, hoặc gọi nhưng sẽ filter ra rỗng
    if (user) {
      load();
    } else {
      setAllPosts([]);
      setLoading(false);
    }
  }, [reloadFlag, tab, user]); // user đổi (login/logout) thì reload

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
