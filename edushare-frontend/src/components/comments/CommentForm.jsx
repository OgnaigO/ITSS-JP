// src/components/comments/CommentForm.jsx
import { useEffect, useState } from "react";

export function CommentForm({ onSubmit, replyingToName, onCancelReply }) {
  const [content, setContent] = useState("");

  // Khi bắt đầu reply 1 người → tự điền tên vào textarea
  useEffect(() => {
    if (replyingToName) {
      setContent(`${replyingToName} `);
    }
  }, [replyingToName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {replyingToName && (
        <div
          className="replying-to-banner"
          style={{
            fontSize: 12,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Replying to <strong>{replyingToName}</strong>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      <textarea
        placeholder="Share your feedback or advice..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
        Post Comment
      </button>
    </form>
  );
}
