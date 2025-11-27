// src/components/comments/CommentList.jsx
import { useState } from "react";

export function CommentList({ comments, onUpdateComment, onDeleteComment }) {
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

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

  if (!comments || comments.length === 0) {
    return <p>No comments yet. Be the first to comment!</p>;
  }

  return (
    <ul className="comments-list">
      {comments.map((c) => {
        const authorName = c.authorName || c.author?.name || "Unknown";
        const timeAgo = c.timeAgo || "";

        const isEditing = editingId === c.id;

        return (
          <li key={c.id} className="comment-item">
            <div className="comment-avatar">
              {(authorName[0] || "U").toUpperCase()}
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
                  <p>{c.content}</p>
                  <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
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
                  </div>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
