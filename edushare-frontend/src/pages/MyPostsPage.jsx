import { useEffect, useState } from "react";
import { fetchPosts } from "../api/postsApi";
import PostCard from "../components/posts/PostCard";

const currentUserId = "demo-user-id"; // TODO: lấy từ auth

export default function MyPostsPage() {
  const [tab, setTab] = useState("published");
  const [postsPage, setPostsPage] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await fetchPosts({
        page: 0,
        size: 20,
        authorId: currentUserId,
      });
      setPostsPage(data);
    }
    load();
  }, [tab]); // demo: tab chưa đổi query, nhưng UI sẽ giống design

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

      <div className="posts-grid single-column">
        {postsPage?.content?.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
