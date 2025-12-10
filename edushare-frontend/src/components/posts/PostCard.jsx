// src/components/posts/PostCard.jsx
import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  // Ưu tiên nhiều nguồn tên khác nhau
  const authorName =
    post.authorName || // nếu backend có field này
    post.author?.username || // username từ author
    (post.author?.email ? post.author.email.split("@")[0] : "") || // phần trước @ của email
    "Unknown";

  const authorInitials =
    post.authorInitials ||
    authorName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <Link to={`/posts/${post.id}`} className="post-card">
      <div className="post-card-image-placeholder" />

      <div className="post-card-body">
        <div className="post-card-meta">
          <div className="avatar-circle">{authorInitials || "U"}</div>
          <div className="meta-text">
            <div className="author-name">{authorName}</div>
            <div className="time-ago">
              {post.timeAgo || "about 2 hours ago"}
            </div>
          </div>
        </div>

        <div className="post-title">{post.title}</div>

        <p className="post-description">{post.description?.slice(0, 120)}...</p>

        <div className="post-footer">
          <span className="tag">{post.category}</span>
          {post.aiSuggested && (
            <span className="tag tag-green">AI Suggested</span>
          )}
          <div className="comments-count">💬 {post.commentsCount ?? 0}</div>
        </div>
      </div>
    </Link>
  );
}
