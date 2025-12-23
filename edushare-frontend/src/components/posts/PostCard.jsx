// src/components/posts/PostCard.jsx
import { Link } from "react-router-dom";
import thumbBiology from "../../assets/thumb-biology.jpg";
import thumbMath from "../../assets/thumb-math.jpg";
import thumbHistory from "../../assets/thumb-history.jpg";

import defaultThumb from "../../assets/thumb-math.jpg";

// Map category -> ảnh fallback (nếu backend chưa có thumbnailUrl)
const SUBJECT_THUMBNAILS = {
  Biology: thumbBiology,
  Mathematics: thumbMath,
  History: thumbHistory,
};

const BACKEND_ORIGIN = "http://localhost:8080";

export default function PostCard({ post }) {
  const authorName =
    post.authorName ||
    post.author?.username ||
    (post.author?.email ? post.author.email.split("@")[0] : "") ||
    "Unknown";

  const authorInitials =
    post.authorInitials ||
    authorName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  // ✅ Ưu tiên thumbnailUrl từ backend
  const thumbnailSrcFromBackend = post.thumbnailUrl
    ? `${BACKEND_ORIGIN}${post.thumbnailUrl}`
    : "";

  // fallback ảnh cứng theo subject (nếu backend chưa trả thumbnailUrl)
  const fallbackThumb = SUBJECT_THUMBNAILS[post.category] || defaultThumb;

  const thumbnailSrc = thumbnailSrcFromBackend || fallbackThumb;

  return (
    <Link to={`/posts/${post.id}`} className="post-card">
      <div className="post-card-image-wrapper">
        <img
          src={thumbnailSrc}
          alt={post.category || "Slide thumbnail"}
          className="post-card-image"
          onError={(e) => {
            // nếu link BE lỗi, tự fallback về ảnh cứng
            e.currentTarget.src = fallbackThumb;
          }}
        />
      </div>

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
