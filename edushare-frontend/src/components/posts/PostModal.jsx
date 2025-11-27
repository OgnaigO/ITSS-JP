import { useState } from "react";
import { createPost } from "../../api/postsApi";

export default function PostModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [slideFiles, setSlideFiles] = useState([]); // mảng file
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newPost = await createPost({
        title,
        description,
        category: subject,
        authorName,
        slideFiles,
      });
      onCreated?.(newPost);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Post a Slide</h2>
        <p>
          Share a slide that's difficult to explain and get AI suggestions and
          advice from fellow teachers.
        </p>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Title *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How to explain photosynthesis visually?"
              required
            />
          </label>

          <label>
            Subject *
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              <option value="">Select a subject</option>
              <option value="Biology">Biology</option>
              <option value="Mathematics">Mathematics</option>
              <option value="History">History</option>
            </select>
          </label>

          <label>
            Author Name *
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Description *
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what makes this slide difficult to explain..."
              required
            />
          </label>

          <label>
            Slide Images (you can select multiple files)
            <input
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={(e) => setSlideFiles(Array.from(e.target.files || []))}
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Posting..." : "Post Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
