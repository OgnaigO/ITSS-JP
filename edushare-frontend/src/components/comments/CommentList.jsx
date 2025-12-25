// src/components/comments/CommentList.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAvatarUrl } from "../../utils/avatarUtils";

const BACKEND_ORIGIN = "http://localhost:8080";

export function CommentList({
  comments,
  onCreateReply,
  onUpdateComment,
  onDeleteComment,
}) {
  const { user } = useAuth(); // user đang đăng nhập (có id, username, email...)

  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const [replyToId, setReplyToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await onUpdateComment(editingId, editingContent);
    setEditingId(null);
    setEditingContent("");
  };

  const handleSubmitReply = async (parentId) => {
    if (!replyContent.trim()) return;
    await onCreateReply?.(parentId, replyContent.trim());
    setReplyContent("");
    setReplyToId(null);
  };

  // LẤY TÊN TÁC GIẢ: ưu tiên authorUsername từ API mới, fallback về author object từ API cũ
  const getAuthorName = (c) =>
    c.authorUsername ||  // ✅ API mới: /api/posts/filter trả về authorUsername (string)
    c.authorName ||
    c.author?.username ||  // API cũ: /api/posts/{id} vẫn trả về author object
    c.author?.name ||
    c.username ||
    c.userName ||
    (c.author?.email ? c.author.email.split("@")[0] : "") ||
    "Unknown";

  // Xác định đây có phải comment của chính user đang đăng nhập không
  // ✅ Cập nhật để hỗ trợ cả API mới (authorUsername) và API cũ (author.id)
  const isOwnComment = (c) => {
    if (!user) return false;

    // So sánh theo username (API mới trả về authorUsername string)
    if (user.username && c.authorUsername) {
      return user.username === c.authorUsername;
    }

    // So sánh theo ID (API cũ /api/posts/{id} vẫn trả về author object với id)
    const myId = user.id;
    if (myId) {
      const candidateIds = [c.author?.id, c.authorId, c.userId, c.user_id].filter(
        Boolean
      );
      if (candidateIds.includes(myId)) return true;
    }

    // Fallback: so sánh username từ author object (API cũ)
    if (user.username && c.author?.username) {
      return user.username === c.author.username;
    }

    return false;
  };

  if (!comments || comments.length === 0) {
    return <p>No comments yet. Be the first to comment!</p>;
  }

  // ✅ Kiểm tra xem comments đã là tree (có replies) hay là flat list
  // API mới (/api/posts/filter) trả về tree, API cũ (/api/posts/{id}) trả về flat list
  const isTreeStructure = comments.some((c) => Array.isArray(c.replies) && c.replies.length > 0);

  // --------- Build maps ---------
  const commentMap = {};
  
  // Nếu là tree, cần flatten để build map (bao gồm cả replies)
  const flattenComments = (commentList) => {
    const result = [];
    for (const c of commentList) {
      result.push(c);
      if (Array.isArray(c.replies) && c.replies.length > 0) {
        result.push(...flattenComments(c.replies));
      }
    }
    return result;
  };

  const allComments = isTreeStructure ? flattenComments(comments) : comments;
  allComments.forEach((c) => {
    commentMap[c.id] = c;
  });

  const childrenMap = {};
  allComments.forEach((c) => {
    const pid = c.parentId || null;
    if (pid) {
      if (!childrenMap[pid]) childrenMap[pid] = [];
      childrenMap[pid].push(c);
    }
  });

  // Nếu là tree, rootComments đã là root comments
  // Nếu là flat list, filter ra root comments
  const rootComments = isTreeStructure 
    ? comments.filter((c) => !c.parentId)
    : allComments.filter((c) => !c.parentId);

  // Lấy toàn bộ reply (mọi cấp) của 1 root, nhưng chỉ indent 1 lần
  const getFlatRepliesOfRoot = (rootId) => {
    const result = [];
    const queue = [...(childrenMap[rootId] || [])];

    while (queue.length) {
      const c = queue.shift();
      const parent = commentMap[c.parentId];
      const parentAuthorName = parent ? getAuthorName(parent) : "";

      result.push({ comment: c, parentAuthorName });

      const more = childrenMap[c.id];
      if (more && more.length) queue.push(...more);
    }
    return result;
  };

  const renderCommentRow = (c, { isReply, parentAuthorName }) => {
    const authorName = getAuthorName(c);
    const timeAgo = c.timeAgo || "";
    const isEditing = editingId === c.id;
    const isReplyBoxOpen = replyToId === c.id;
    const own = isOwnComment(c); // true nếu là comment của mình

    // Avatar URL từ author
    // ✅ API mới không trả về avatarUrl trong comments, chỉ có authorUsername
    // Nên ta chỉ dùng avatarUrl từ currentUser nếu là chính mình
    let avatarUrlToUse = null;
    
    // Chỉ hiển thị avatar nếu là comment của chính user đang đăng nhập
    if (own && user?.avatarUrl) {
      avatarUrlToUse = user.avatarUrl;
    }
    
    // Fallback: nếu API cũ vẫn trả về author object với avatarUrl
    if (!avatarUrlToUse && c.author?.avatarUrl) {
      avatarUrlToUse = c.author.avatarUrl;
    }
    const authorAvatarUrl = getAvatarUrl(avatarUrlToUse);
    const authorInitials = (authorName?.[0] || "U").toUpperCase();

    return (
      <div key={c.id} className="comment-row" style={{ display: "flex" }}>
        {authorAvatarUrl ? (
          <img
            src={authorAvatarUrl}
            alt={authorName}
            className="comment-avatar comment-avatar-image"
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
          className="comment-avatar"
          style={{ display: authorAvatarUrl ? "none" : "flex" }}
        >
          {authorInitials}
        </div>

        <div className="comment-body">
          <div className="comment-header">
            <span className="comment-author">{authorName}</span>
            <span className="comment-time">
              {c.edited ? "(edited) " : ""}
              {timeAgo}
            </span>
          </div>

          {isEditing ? (
            <>
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                rows={3}
                style={{ width: "100%", marginBottom: 6 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={saveEdit}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #d1d5db",
                    backgroundColor: "#fff",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                {isReply && parentAuthorName && (
                  <strong style={{ marginRight: 4 }}>{parentAuthorName}</strong>
                )}
                {c.content}
              </p>

              <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
                {/* Ai cũng có thể Reply (backend đã chặn nếu chưa login) */}
                <button
                  type="button"
                  onClick={() => setReplyToId(c.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid #d1d5db",
                    backgroundColor: "#fff",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Reply
                </button>

                {/* Chỉ chủ comment mới thấy Edit / Delete */}
                {own && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid #d1d5db",
                        backgroundColor: "#fff",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteComment(c.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid #fecaca",
                        backgroundColor: "#fee2e2",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Inline reply box ngay dưới comment */}
          {isReplyBoxOpen && (
            <div className="comment-reply-inline" style={{ marginTop: 8 }}>
              <div
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: "#6b7280",
                }}
              >
                Replying to <strong>{authorName}</strong>
              </div>
              <textarea
                rows={2}
                style={{ width: "100%", marginBottom: 6 }}
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSubmitReply(c.id)}
                >
                  Post Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyToId(null);
                    setReplyContent("");
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #d1d5db",
                    backgroundColor: "#fff",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============ RETURN ============

  return (
    <ul
      className="comments-list"
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      {rootComments.map((root) => {
        const flatReplies = getFlatRepliesOfRoot(root.id);

        return (
          <li
            key={root.id}
            className="comment-item"
            style={{
              display: "block",
              marginBottom: 16,
            }}
          >
            {/* comment gốc */}
            {renderCommentRow(root, {
              isReply: false,
              parentAuthorName: "",
            })}

            {/* replies: bên dưới, hơi lệch phải */}
            {flatReplies.length > 0 && (
              <div
                className="comment-children"
                style={{
                  marginLeft: 40,
                  marginTop: 8,
                  borderLeft: "2px solid #e5e7eb",
                  paddingLeft: 16,
                  display: "block",
                }}
              >
                {flatReplies.map(({ comment, parentAuthorName }) =>
                  renderCommentRow(comment, {
                    isReply: true,
                    parentAuthorName,
                  })
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
