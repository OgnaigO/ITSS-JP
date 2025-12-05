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
} from "../api/postsApi";
import { CommentList } from "../components/comments/CommentList";
import { CommentForm } from "../components/comments/CommentForm";
import EditPostModal from "../components/posts/EditPostModal";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --------- helper cho slide ----------
  const getFileName = (url = "") => {
    const parts = url.split("/");
    return parts[parts.length - 1] || url;
  };

  const isImage = (url = "") => /\.(png|jpe?g|gif|webp)$/i.test(url);
  const isPdf = (url = "") => /\.pdf$/i.test(url);

  // Load post + comments khi vào trang
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const postData = await fetchPostById(id);
        setPost(postData);
        setComments(postData.comments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Tạo comment gốc (parentId = null)
  const handleCreateComment = async (content) => {
    try {
      await createComment(id, {
        content,
        authorId: "t001", // tạm hard-code
        authorName: "Tanaka Sensei",
        parentId: null,
      });

      const updatedPost = await fetchPostById(id);
      setPost(updatedPost);
      setComments(updatedPost.comments || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Tạo reply cho 1 comment
  const handleCreateReply = async (parentId, content) => {
    try {
      await createComment(id, {
        content,
        authorId: "t001",
        authorName: "Tanaka Sensei",
        parentId,
      });

      const updatedPost = await fetchPostById(id);
      setPost(updatedPost);
      setComments(updatedPost.comments || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Lưu thay đổi bài viết (PUT /api/posts/{id})
  const handleSavePost = async (payload) => {
    try {
      const updated = await updatePost(id, payload);
      setPost(updated);
      setIsEditOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Xoá bài viết (DELETE /api/posts/{id})
  const handleDeletePost = async () => {
    const ok = window.confirm("Are you sure you want to delete this post?");
    if (!ok) return;

    try {
      await deletePost(id);
      navigate("/my-posts"); // hoặc "/"
    } catch (e) {
      console.error(e);
    }
  };

  // Sửa comment
  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await updateComment(id, commentId, newContent);
      const updatedPost = await fetchPostById(id);
      setPost(updatedPost);
      setComments(updatedPost.comments || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Xoá comment
  const handleDeleteComment = async (commentId) => {
    const ok = window.confirm("Are you sure you want to delete this comment?");
    if (!ok) return;

    try {
      await deleteComment(id, commentId);
      const updatedPost = await fetchPostById(id);
      setPost(updatedPost);
      setComments(updatedPost.comments || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  // Lấy tên tác giả & initials
  const authorName = post.authorName || post.author?.name || "Unknown";
  const authorInitials =
    post.authorInitials ||
    authorName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div className="page post-detail">
      <main className="post-detail-main">
        <div className="post-meta-top">
          <div className="avatar-circle">{authorInitials || "U"}</div>
          <div>
            <div className="author-name">{authorName}</div>
            <div className="time-ago">{post.timeAgo}</div>
          </div>
          <span className="tag">{post.category}</span>

          {/* Nút Edit / Delete post */}
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
        </div>

        <h1>{post.title}</h1>
        <p className="post-description-full">{post.description}</p>

        {/* ======= SLIDES SECTION (preview ngay trên trang) ======= */}
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

          {/* Form comment gốc */}
          <CommentForm onSubmit={handleCreateComment} />

          {/* List comment + reply inline */}
          <CommentList
            comments={comments}
            onCreateReply={handleCreateReply}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />
        </section>
      </main>

      <aside className="post-detail-sidebar">
        <div className="ai-suggestions-card">
          <h3>AI Teaching Suggestions</h3>
          <h4>Use Visual Analogies</h4>
          <p>
            Compare chloroplasts to solar panels and mitochondria to
            batteries...
          </p>
          <h4>Hands-On Activity</h4>
          <p>
            Try the celery experiment with colored water to show how plants
            transport nutrients...
          </p>
        </div>
      </aside>

      {/* Modal sửa bài viết */}
      <EditPostModal
        isOpen={isEditOpen}
        post={post}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSavePost}
      />
    </div>
  );
}
