// src/components/posts/EditPostModal.jsx
import { useEffect, useState } from "react";

export default function EditPostModal({ isOpen, post, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [slideUrl, setSlideUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Khi mở modal, fill dữ liệu từ post
  useEffect(() => {
    if (isOpen && post) {
      setTitle(post.title || "");
      setCategory(post.category || "");
      setDescription(post.description || "");
      // tuỳ backend: có thể là post.slideUrl hoặc post.slideUrls[0]
      setSlideUrl(post.slideUrl || (post.slideUrls && post.slideUrls[0]) || "");
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        title,
        description,
        slideUrl,
        category,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Edit Post</h2>
        <p>Update the slide information.</p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Category
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Biology, Mathematics..."
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </label>

          <label>
            Slide URL
            <input
              type="text"
              value={slideUrl}
              onChange={(e) => setSlideUrl(e.target.value)}
              placeholder="/slides/new_slide.pdf"
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
