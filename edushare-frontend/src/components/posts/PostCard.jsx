import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <div className="post-card-image-placeholder" />

      <div className="post-card-body">
        <div className="post-card-meta">
          <div className="avatar-circle">{post.authorInitials || "U"}</div>
          <div className="meta-text">
            <div className="author-name">{post.authorName || "Unknown"}</div>
            <div className="time-ago">
              {post.timeAgo || "about 2 hours ago"}
            </div>
          </div>
        </div>

        <Link to={`/posts/${post.id}`} className="post-title">
          {post.title}
        </Link>

        <p className="post-description">{post.description?.slice(0, 120)}...</p>

        <div className="post-footer">
          <span className="tag">{post.category}</span>
          {post.aiSuggested && (
            <span className="tag tag-green">AI Suggested</span>
          )}
          <div className="comments-count">💬 {post.commentsCount ?? 0}</div>
        </div>
      </div>
    </article>
  );
}
