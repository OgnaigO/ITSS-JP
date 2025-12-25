// src/components/posts/PostCard.jsx
import { Link } from "react-router-dom";
import thumbBiology from "../../assets/thumb-biology.jpg";
import thumbMath from "../../assets/thumb-math.jpg";
import thumbHistory from "../../assets/thumb-history.jpg";
import { getAvatarUrl } from "../../utils/avatarUtils";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslatedPostContent } from "../../translations/postContentTranslations";

import defaultThumb from "../../assets/thumb-math.jpg";

// Map category -> ảnh fallback (nếu backend chưa có thumbnailUrl)
const SUBJECT_THUMBNAILS = {
  Biology: thumbBiology,
  Mathematics: thumbMath,
  History: thumbHistory,
};

const BACKEND_ORIGIN = "http://localhost:8080";

export default function PostCard({ post }) {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  
  // ✅ Ưu tiên authorUserName từ API mới (/api/posts/filter)
  // Fallback về author object từ API cũ (/api/posts/{id})
  // Nếu là post của chính mình, ưu tiên lấy từ currentUser (đã được update)
  const isMyPost = currentUser && (
    post.authorUserName === currentUser.username ||
    post.author?.username === currentUser.username ||
    post.author?.id === currentUser.id
  );
  
  const authorName = isMyPost && currentUser?.username
    ? currentUser.username  // ✅ Ưu tiên username từ currentUser nếu là post của mình
    : post.authorUserName ||  // API mới: PostResponse có authorUserName (string)
      post.authorName ||
      post.author?.username ||  // API cũ: Post model có author object
      (post.author?.email ? post.author.email.split("@")[0] : "") ||
      t("post.unknownAuthor");

  // Lấy bản dịch cho title và description nếu có
  // Description được dịch dựa trên title (vì mapping dùng title làm key)
  const translatedTitle = getTranslatedPostContent(post.title, "title", language);
  const translatedDescription = getTranslatedPostContent(post.title, "description", language);
  
  const displayTitle = translatedTitle || post.title;
  const displayDescription = translatedDescription || post.description;

  const authorInitials =
    post.authorInitials ||
    authorName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  // Avatar URL từ author - ưu tiên lấy từ API mới (authorAvatarUrl)
  // Fallback về author object từ API cũ (/api/posts/{id})
  // ✅ Nếu là post của chính mình, ưu tiên lấy từ currentUser (đã được update)
  let avatarUrlToUse = null;
  
  if (isMyPost && currentUser?.avatarUrl) {
    // ✅ Ưu tiên avatar từ currentUser nếu là post của mình
    avatarUrlToUse = currentUser.avatarUrl;
  } else {
    // Fallback về avatar từ backend
    avatarUrlToUse = 
      post.authorAvatarUrl ||  // ✅ API mới: PostResponse có authorAvatarUrl (string)
      post.author?.avatarUrl ||  // API cũ: Post model có author object
      null;
  }
  
  const authorAvatarUrl = getAvatarUrl(avatarUrlToUse);

  // ✅ Ưu tiên thumbnailUrl từ backend
  const thumbnailSrcFromBackend = post.thumbnailUrl
    ? `${BACKEND_ORIGIN}${post.thumbnailUrl}`
    : "";

  // fallback ảnh cứng theo subject (nếu backend chưa trả thumbnailUrl)
  const fallbackThumb = SUBJECT_THUMBNAILS[post.category] || defaultThumb;

  const thumbnailSrc = thumbnailSrcFromBackend || fallbackThumb;

  // Translate category names
  const getCategoryName = (category) => {
    const categoryMap = {
      "Biology": t("post.categoryBiology"),
      "Mathematics": t("post.categoryMathematics"),
      "History": t("post.categoryHistory"),
      "Physics": t("post.categoryPhysics"),
      "Chemistry": t("post.categoryChemistry"),
      "Literature": t("post.categoryLiterature"),
      "Geography": t("post.categoryGeography"),
      "English": t("post.categoryEnglish"),
      "Computer Science": t("post.categoryComputerScience"),
      "Art": t("post.categoryArt"),
      "Music": t("post.categoryMusic"),
    };
    return categoryMap[category] || category;
  };

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
          {authorAvatarUrl ? (
            <img
              src={authorAvatarUrl}
              alt={authorName}
              className="avatar-circle avatar-image"
              onError={(e) => {
                // Fallback to initials if image fails
                const placeholder = e.currentTarget.nextElementSibling;
                if (placeholder) {
                  e.currentTarget.style.display = "none";
                  placeholder.style.display = "flex";
                }
              }}
            />
          ) : null}
          <div 
            className="avatar-circle"
            style={{ display: authorAvatarUrl ? "none" : "flex" }}
          >
            {authorInitials || "U"}
          </div>
          <div className="meta-text">
            <div className="author-name">{authorName}</div>
            <div className="time-ago">
              {post.timeAgo || t("post.timeAgo")}
            </div>
          </div>
        </div>

        <div className="post-title">{displayTitle}</div>

        <p className="post-description">{displayDescription?.slice(0, 120)}...</p>

        <div className="post-footer">
          <span className="tag">{getCategoryName(post.category)}</span>
          {post.aiSuggested && (
            <span className="tag tag-green">{t("post.aiSuggested")}</span>
          )}
          <div className="comments-count">
            💬{" "}
            {post.commentsCount ??
              (post.comments
                ? (() => {
                    // Tính tổng số comments (bao gồm cả replies nếu là tree)
                    const countComments = (commentList) => {
                      let count = 0;
                      for (const c of commentList) {
                        count++;
                        if (Array.isArray(c.replies) && c.replies.length > 0) {
                          count += countComments(c.replies);
                        }
                      }
                      return count;
                    };
                    return countComments(post.comments);
                  })()
                : 0)}
          </div>
        </div>
      </div>
    </Link>
  );
}
