// src/components/comments/CommentForm.js
import { useState } from "react";

export function CommentForm({ onSubmit }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        placeholder="Share your feedback or advice..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit" className="btn-primary">
        Post Comment
      </button>
    </form>
  );
}
