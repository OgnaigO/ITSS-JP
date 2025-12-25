// src/components/posts/PostModal.jsx
import { useState, useEffect } from "react";
import { createPost } from "../../api/postsApi";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";

export default function PostModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { language, t } = useLanguage();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");

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
      setThumbnailFile(null);

      // revoke thumbnail preview
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
      setThumbnailPreviewUrl("");

      // revoke slide previews
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0] || null;

    // revoke preview cũ
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);

    setThumbnailFile(file);

    if (file) {
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    } else {
      setThumbnailPreviewUrl("");
    }
  };

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
        category: subject, // backend dùng field category
        authorId: user?.id, // ✅ gửi authorId thay vì chỉ authorName
        authorName,
        thumbnailFile, // ✅ thêm thumbnail
        slideFiles,
      });

      // Tạo notification cho bản thân về việc đăng bài thành công
      addNotification({
        type: "post",
        title: language === "Vietnamese" 
          ? "Đăng bài thành công"
          : "投稿が成功しました",
        message: language === "Vietnamese"
          ? `"${title}" đã được đăng`
          : `「${title}」が投稿されました`,
        link: `/posts/${newPost.id}`,
      });

      // ✅ Không gửi notification cho user khác ở đây vì:
      // - localStorage không thể chia sẻ giữa browsers
      // - HomePage sẽ tự động tạo notification khi user vào trang
      // - Tránh duplicate notifications

      onCreated?.(newPost);
      onClose();
    } catch (err) {
      console.error(err);
      alert(t("postModal.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{t("postModal.create")}</h2>
        <p>
          {t("postModal.description")}
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            {t("postModal.title")} *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("postModal.titlePlaceholder")}
              required
            />
          </label>

          <label>
            {t("postModal.category")} *
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              <option value="">{t("postModal.selectCategory")}</option>
              <option value="Biology">{t("postModal.biology")}</option>
              <option value="Mathematics">{t("postModal.mathematics")}</option>
              <option value="History">{t("postModal.history")}</option>
              <option value="Physics">{t("postModal.physics")}</option>
              <option value="Chemistry">{t("postModal.chemistry")}</option>
              <option value="Literature">{t("postModal.literature")}</option>
              <option value="Geography">{t("postModal.geography")}</option>
              <option value="English">{t("postModal.english")}</option>
              <option value="Computer Science">{t("postModal.computerScience")}</option>
              <option value="Art">{t("postModal.art")}</option>
              <option value="Music">{t("postModal.music")}</option>
            </select>
          </label>

          <label>
            {t("postModal.authorName")} *
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("postModal.authorPlaceholder")}
              required
              disabled={!!user}
            />
          </label>

          <label>
            {t("postModal.descriptionLabel")} *
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("postModal.descriptionPlaceholder")}
              required
            />
          </label>

          {/* ✅ THUMBNAIL */}
          <label>
            {t("postModal.thumbnail")}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
          </label>

          {thumbnailPreviewUrl && (
            <div className="slides-preview-item" style={{ marginTop: 8 }}>
              <div className="slides-preview-title">{t("postModal.thumbnailPreview")}</div>
              <img
                src={thumbnailPreviewUrl}
                alt="thumbnail preview"
                className="slides-preview-img"
              />
            </div>
          )}

          {/* SLIDES */}
          <label>
            {t("postModal.slides")}
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
                    {t("postModal.slide")} {idx + 1} – {p.name}
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
              {t("postModal.cancel")}
            </button>
            <button
              type="submit"
              className="btn-primary post-slide"
              disabled={submitting}
            >
              {submitting ? t("postModal.posting") : t("postModal.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
