// src/components/comments/CommentList.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

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

  // LẤY TÊN TÁC GIẢ: chỉ dựa trên dữ liệu backend trả về
  const getAuthorName = (c) =>
    c.authorName ||
    c.author?.username ||
    c.author?.name ||
    c.username ||
    c.userName ||
    (c.author?.email ? c.author.email.split("@")[0] : "") ||
    "Unknown";

  // Xác định đây có phải comment của chính user đang đăng nhập không
  const isOwnComment = (c) => {
    if (!user) return false;
    const myId = user.id;
    if (!myId) return false;

    // các khả năng backend/front-end lưu id
    const candidateIds = [c.author?.id, c.authorId, c.userId, c.user_id].filter(
      Boolean
    );

    return candidateIds.includes(myId);
  };

  if (!comments || comments.length === 0) {
    return <p>No comments yet. Be the first to comment!</p>;
  }

  // --------- Build maps ---------
  const commentMap = {};
  comments.forEach((c) => {
    commentMap[c.id] = c;
  });

  const childrenMap = {};
  comments.forEach((c) => {
    const pid = c.parentId || null;
    if (pid) {
      if (!childrenMap[pid]) childrenMap[pid] = [];
      childrenMap[pid].push(c);
    }
  });

  const rootComments = comments.filter((c) => !c.parentId);

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

    return (
      <div key={c.id} className="comment-row" style={{ display: "flex" }}>
        <div className="comment-avatar">
          {(authorName?.[0] || "U").toUpperCase()}
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
