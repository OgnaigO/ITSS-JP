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

export default function PostDetailPage() {
  // ✅ HOOKS luôn nằm trên cùng, không đặt sau return
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ===== AI states =====
  const [aiLevel, setAiLevel] = useState("basic");
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
  const authorName =
    post.authorName ||
    post.author?.username ||
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

  return (
    <div className="page post-detail">
      <main className="post-detail-main">
        <div className="post-meta-top">
          <div className="avatar-circle">{authorInitials}</div>

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

        <h1>{post.title}</h1>
        <p className="post-description-full">{post.description}</p>

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
            <select
              value={aiLevel}
              onChange={(e) => setAiLevel(e.target.value)}
              style={{ padding: 8, borderRadius: 10 }}
            >
              <option value="basic">basic</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>

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
