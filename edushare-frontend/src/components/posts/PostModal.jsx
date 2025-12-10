import { useState, useEffect } from "react";
import { createPost } from "../../api/postsApi";
import { useAuth } from "../../context/AuthContext";

export default function PostModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");

  const [slideFiles, setSlideFiles] = useState([]); // mảng file thật để gửi BE
  const [slidePreviews, setSlidePreviews] = useState([]); // mảng info để preview

  const [submitting, setSubmitting] = useState(false);

  // Khi đóng modal thì reset form + giải phóng URL preview
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setSubject("");
      setDescription("");
      setAuthorName("");
      setSlideFiles([]);

      // revoke các object URL cũ
      slidePreviews.forEach((p) => URL.revokeObjectURL(p.url));
      setSlidePreviews([]);
    } else {
      // khi mở modal, auto set Author Name = username / email
      if (user) {
        const displayName =
          user.username || (user.email ? user.email.split("@")[0] : "");
        setAuthorName(displayName);
      } else {
        setAuthorName("");
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSlidesChange = (e) => {
    const files = Array.from(e.target.files || []);

    setSlideFiles(files);

    // Xoá các object URL cũ
    slidePreviews.forEach((p) => URL.revokeObjectURL(p.url));

    // Tạo object URL mới để preview
    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      isImage: file.type.startsWith("image/"),
      isPdf: file.type === "application/pdf",
    }));

    setSlidePreviews(previews);
  };

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
              disabled={!!user}
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
              onChange={handleSlidesChange}
            />
          </label>

          {/* ==== PREVIEW KHU VỰC SLIDE ==== */}
          {slidePreviews.length > 0 && (
            <div className="slides-preview-list">
              {slidePreviews.map((p, idx) => (
                <div key={idx} className="slides-preview-item">
                  <div className="slides-preview-title">
                    Slide {idx + 1} – {p.name}
                  </div>

                  {p.isImage && (
                    <img
                      src={p.url}
                      alt={p.name}
                      className="slides-preview-img"
                    />
                  )}

                  {p.isPdf && (
                    <iframe
                      src={p.url}
                      title={p.name}
                      className="slides-preview-frame"
                    />
                  )}

                  {!p.isImage && !p.isPdf && (
                    <div className="slides-preview-other">{p.name}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* ==== HẾT PHẦN PREVIEW ==== */}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary post-slide"
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
