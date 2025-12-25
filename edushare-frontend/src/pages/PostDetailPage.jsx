// src/pages/PostDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPostById,
  createComment,
  updatePost,
  deletePost,
  updateComment,
  deleteComment,
  explainPost, // ✅ thêm
} from "../api/postsApi";
import { CommentList } from "../components/comments/CommentList";
import { CommentForm } from "../components/comments/CommentForm";
import EditPostModal from "../components/posts/EditPostModal";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useNotifications } from "../context/NotificationContext";
import { getAvatarUrl } from "../utils/avatarUtils";
import { getTranslatedPostContent } from "../translations/postContentTranslations";

export default function PostDetailPage() {
  // ✅ HOOKS luôn nằm trên cùng, không đặt sau return
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { addNotification, addNotificationForUser } = useNotifications();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ===== AI states =====
  const aiLevel = "basic"; // ✅ Cố định là basic, không cho user chọn
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiData, setAiData] = useState(null);

  // --------- helper cho slide ----------
  const getFileName = (url = "") => {
    const parts = url.split("/");
    return parts[parts.length - 1] || url;
  };
  const isImage = (url = "") => /\.(png|jpe?g|gif|webp)$/i.test(url);
  const isPdf = (url = "") => /\.pdf$/i.test(url);

  const normalize = (s = "") => s.toString().toLowerCase().replace(/\s+/g, "");

  // ✅ Owner check: ưu tiên ID/username/email (authorName chỉ là hiển thị)
  const isOwner =
    !!user &&
    ((post?.author?.id && user?.id && post.author.id === user.id) ||
      (post?.author?.username &&
        user?.username &&
        normalize(post.author.username) === normalize(user.username)) ||
      (post?.author?.email &&
        user?.email &&
        post.author.email.toLowerCase() === user.email.toLowerCase()));

  // ====== Load post + comments khi vào trang ======
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const postData = await fetchPostById(id);
        if (!alive) return;
        setPost(postData);
        setComments(postData.comments || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const reloadComments = async () => {
    const updatedPost = await fetchPostById(id);
    setPost(updatedPost);
    setComments(updatedPost.comments || []);
  };

  // ====== TẠO COMMENT GỐC ======
  const handleCreateComment = async (content) => {
    try {
      if (!user) {
        alert("Please log in to comment.");
        return;
      }

      await createComment(id, {
        content,
        parentId: null,
        authorId: user.id,
        authorName: user.username || user.email,
        username: user.username,
        email: user.email,
      });

      // Tạo notification cho chủ bài viết (nếu không phải chính mình comment)
      if (post && !isOwner && post.author) {
        // Kiểm tra cài đặt thông báo bình luận của chủ bài post
        // Note: Ta kiểm tra settings của chủ bài post, nhưng vì ta không có access,
        // ta sẽ giả sử nó được bật (hoặc có thể kiểm tra từ một nguồn chung)
        const commenterName = user.username || user.email;
        const translatedTitle = getTranslatedPostContent(post.title, "title", language);
        const displayTitle = translatedTitle || post.title;
        
        // Lấy ID hoặc username của chủ bài post để lưu notification
        const postOwnerId = post.author.id || post.author.username;
        
        if (postOwnerId) {
          addNotificationForUser(postOwnerId, {
            type: "comment",
            title: language === "Vietnamese" 
              ? `${commenterName} đã bình luận`
              : `${commenterName}がコメントしました`,
            message: language === "Vietnamese"
              ? `"${displayTitle}"`
              : `「${displayTitle}」`,
            link: `/posts/${id}`,
          });
        }
      }

      await reloadComments();
    } catch (e) {
      console.error(e);
    }
  };

  // ====== TẠO REPLY ======
  const handleCreateReply = async (parentId, content) => {
    try {
      if (!user) {
        alert("Please log in to reply.");
        return;
      }

      await createComment(id, {
        content,
        parentId,
        authorId: user.id,
        authorName: user.username || user.email,
        username: user.username,
        email: user.email,
      });

      // Tạo notification cho chủ bài viết (nếu không phải chính mình reply)
      if (post && !isOwner && post.author) {
        // Lấy ID hoặc username của chủ bài post để lưu notification
        const commenterName = user.username || user.email;
        const translatedTitle = getTranslatedPostContent(post.title, "title", language);
        const displayTitle = translatedTitle || post.title;
        
        const postOwnerId = post.author.id || post.author.username;
        
        if (postOwnerId) {
          addNotificationForUser(postOwnerId, {
            type: "comment",
            title: language === "Vietnamese" 
              ? `${commenterName} đã trả lời bình luận`
              : `${commenterName}がコメントに返信しました`,
            message: language === "Vietnamese"
              ? `"${displayTitle}"`
              : `「${displayTitle}」`,
            link: `/posts/${id}`,
          });
        }
      }

      await reloadComments();
    } catch (e) {
      console.error(e);
    }
  };

  // ====== Update/Delete post (chỉ UI chặn, backend vẫn nên chặn nữa) ======
  const handleSavePost = async (payload) => {
    try {
      const updated = await updatePost(id, payload);
      setPost(updated);
      setIsEditOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async () => {
    const ok = window.confirm("Are you sure you want to delete this post?");
    if (!ok) return;

    try {
      await deletePost(id);
      navigate("/my-posts");
    } catch (e) {
      console.error(e);
    }
  };

  // ====== Update/Delete comment ======
  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await updateComment(id, commentId, newContent);
      await reloadComments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const ok = window.confirm("Are you sure you want to delete this comment?");
    if (!ok) return;

    try {
      await deleteComment(id, commentId);
      await reloadComments();
    } catch (e) {
      console.error(e);
    }
  };

  // ====== AI Explain call ======
  const handleExplain = async () => {
    try {
      setAiError("");
      setAiLoading(true);
      const data = await explainPost(id, aiLevel);
      setAiData(data);
    } catch (e) {
      console.error(e);
      setAiError("AI explain failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ✅ Từ đây trở xuống mới return (không còn hook nào)
  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  // ====== TÍNH TÊN TÁC GIẢ HIỂN THỊ ======
  // ✅ Ưu tiên authorUserName từ API mới, fallback về author object từ API cũ
  // Nếu là post của chính mình, ưu tiên lấy từ user (đã được update)
  const isMyPost = user && (
    post.authorUserName === user.username ||
    post.author?.username === user.username ||
    post.author?.id === user.id
  );
  
  const authorName = isMyPost && user?.username
    ? user.username  // ✅ Ưu tiên username từ user nếu là post của mình
    : post.authorUserName ||  // API mới: PostResponse có authorUserName (string)
      post.authorName ||
      post.author?.username ||  // API cũ: Post model có author object
      (post.author?.email ? post.author.email.split("@")[0] : "") ||
      post.author?.name ||
      "Unknown";

  const authorInitials =
    authorName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "U";

  // Avatar URL từ author
  // ✅ Nếu là post của chính mình, ưu tiên lấy từ user (đã được update)
  let avatarUrlToUse = null;
  
  if (isMyPost && user?.avatarUrl) {
    // ✅ Ưu tiên avatar từ user nếu là post của mình
    avatarUrlToUse = user.avatarUrl;
  } else {
    // Fallback về avatar từ backend
    avatarUrlToUse = post.author?.avatarUrl || null;
  }
  
  const authorAvatarUrl = getAvatarUrl(avatarUrlToUse);

  // Lấy bản dịch cho title và description nếu có
  const translatedTitle = getTranslatedPostContent(post.title, "title", language);
  const translatedDescription = getTranslatedPostContent(post.title, "description", language);
  
  const displayTitle = translatedTitle || post.title;
  const displayDescription = translatedDescription || post.description;

  return (
    <div className="page post-detail">
      <main className="post-detail-main">
        <div className="post-meta-top">
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
            {authorInitials}
          </div>

          <div>
            <div className="author-name">{authorName}</div>
            <div className="time-ago">{post.timeAgo}</div>
          </div>

          <span className="tag">{post.category}</span>

          {/* ✅ Nút Edit/Delete chỉ hiện khi là owner */}
          {isOwner && (
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsEditOpen(true)}
              >
                Edit
              </button>
              <button
                type="button"
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid #fecaca",
                  backgroundColor: "#fee2e2",
                  fontSize: 13,
                  cursor: "pointer",
                }}
                onClick={handleDeletePost}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <h1>{displayTitle}</h1>
        <p className="post-description-full">{displayDescription}</p>

        {/* ======= SLIDES SECTION ======= */}
        {post.slideUrls && post.slideUrls.length > 0 && (
          <section className="slides-section">
            <h2>Slides</h2>
            <div className="slides-grid">
              {post.slideUrls.map((url, index) => {
                const fullUrl = `http://localhost:8080${url}`;

                return (
                  <div key={index} className="slide-item">
                    <div className="slide-file">
                      <span>Slide {index + 1}</span>
                      <span className="slide-filename">{getFileName(url)}</span>
                    </div>

                    <div className="slide-preview-wrapper">
                      {isImage(url) && (
                        <img
                          src={fullUrl}
                          alt={`Slide ${index + 1}`}
                          className="slide-preview-img"
                        />
                      )}

                      {isPdf(url) && (
                        <iframe
                          src={fullUrl}
                          title={`Slide ${index + 1}`}
                          className="slide-preview-frame"
                        />
                      )}

                      {!isImage(url) && !isPdf(url) && (
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="slide-download-link"
                        >
                          Open / Download
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== COMMENTS ===== */}
        <section className="comments-section">
          <h2>Comments ({comments.length})</h2>

          <CommentForm onSubmit={handleCreateComment} />

          <CommentList
            comments={comments}
            onCreateReply={handleCreateReply}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />
        </section>
      </main>

      {/* ===== AI SIDEBAR (gắn API mới) ===== */}
      <aside className="post-detail-sidebar">
        <div className="ai-suggestions-card">
          <h3>AI Explain</h3>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn-primary"
              type="button"
              onClick={handleExplain}
              disabled={aiLoading}
            >
              {aiLoading ? "Generating..." : "Generate"}
            </button>
          </div>

          {aiError && (
            <p style={{ marginTop: 10, color: "crimson" }}>{aiError}</p>
          )}

          {aiData && (
            <div style={{ marginTop: 12 }}>
              <h4>Summary</h4>
              <p>{aiData.summary}</p>

              <h4>Explanation</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>{aiData.explanation}</p>

              {Array.isArray(aiData.key_points) &&
                aiData.key_points.length > 0 && (
                  <>
                    <h4>Key points</h4>
                    <ul>
                      {aiData.key_points.map((k, idx) => (
                        <li key={idx}>{k}</li>
                      ))}
                    </ul>
                  </>
                )}

              {Array.isArray(aiData.suggested_tags) &&
                aiData.suggested_tags.length > 0 && (
                  <>
                    <h4>Suggested tags</h4>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {aiData.suggested_tags.map((t, idx) => (
                        <span key={idx} className="tag tag-green">
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}
            </div>
          )}
        </div>
      </aside>

      <EditPostModal
        isOpen={isEditOpen}
        post={post}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSavePost}
      />
    </div>
  );
}
