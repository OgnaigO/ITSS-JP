import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchPosts } from "../api/postsApi";
import PostCard from "../components/posts/PostCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function HomePage() {
  const [tab, setTab] = useState("latest");
  const [postsPage, setPostsPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const query = useQuery();
  const searchTitle = query.get("q") || "";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPosts({
          page: 0,
          size: 12,
          sortBy: "createdAt",
          direction: tab === "latest" ? "desc" : "desc",
          title: searchTitle || undefined,
        });
        setPostsPage(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab, searchTitle]);

  return (
    <div className="page">
      <h1>Welcome to EduShare</h1>
      <p>
        Share challenging slides and get AI-powered suggestions from fellow
        educators
      </p>

      <div className="tabs">
        <button
          className={tab === "latest" ? "tab active" : "tab"}
          onClick={() => setTab("latest")}
        >
          Latest
        </button>
        <button
          className={tab === "following" ? "tab active" : "tab"}
          onClick={() => setTab("following")}
        >
          Following
        </button>
        <button
          className={tab === "ai" ? "tab active" : "tab"}
          onClick={() => setTab("ai")}
        >
          AI Recommended
        </button>
      </div>

      {loading && <div>Loading...</div>}

      <div className="posts-grid">
        {postsPage?.content?.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
