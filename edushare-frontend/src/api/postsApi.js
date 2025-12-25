// src/api/postsApi.js

const API_BASE = "http://localhost:8080/api";

/**
 * Lấy danh sách bài viết (có filter + phân trang)
 */
export async function fetchPosts({
  page = 0,
  size = 10,
  sortBy,
  direction,
  category,
  title,
  authorId,
  userId, // ✅ Backend dùng userId parameter
} = {}) {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("size", size);

  // CHỈ gửi khi có giá trị
  if (sortBy) params.append("sortBy", sortBy);
  if (direction) params.append("direction", direction);
  if (category) params.append("category", category);
  if (title) params.append("title", title);
  // ✅ Backend dùng userId, nhưng vẫn hỗ trợ authorId để tương thích
  if (userId) params.append("userId", userId);
  if (authorId && !userId) params.append("userId", authorId); // map authorId -> userId

  const res = await fetch(`${API_BASE}/posts/filter?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

/**
 * Lấy chi tiết 1 bài viết (kèm comments)
 */
export async function fetchPostById(id) {
  const res = await fetch(`${API_BASE}/posts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json(); // Post
}

/**
 * Tạo bài viết mới (form-data, nhiều file "slides")
 */
export async function createPost({
  title,
  description,
  category,
  authorId,
  authorName,
  thumbnailFile,
  slideFiles = [],
}) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  if (authorId) {
    formData.append("authorId", authorId);
  }
  formData.append("authorName", authorName || "Anonymous");

  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  }

  // Gửi nhiều file với cùng key "slides"
  slideFiles.forEach((file) => {
    formData.append("slides", file);
  });

  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to create post");
  return res.json(); // Post vừa tạo
}

/**
 * Cập nhật bài viết (JSON)
 * Body (theo spec backend): { title, description, slideUrl, category }
 */
export async function updatePost(id, payload) {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json(); // Post đã cập nhật
}

/**
 * Xoá bài viết
 */
export async function deletePost(id) {
  const res = await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete post");
}

/**
 * Lấy danh sách comment của 1 post.
 * Backend KHÔNG có GET /posts/{id}/comments,
 * nên ta tái dùng fetchPostById rồi trả về post.comments.
 */
export async function fetchComments(postId) {
  const post = await fetchPostById(postId);
  // tuỳ model, có thể là post.comments hoặc field khác
  return post.comments || [];
}

/**
 * Tạo comment mới cho 1 post
 * POST /api/posts/{postId}/comments
 * Body:
 * {
 *   "author": { "id": "...", "name": "..." },
 *   "content": "...",
 *   "parentId": null
 * }
 */
export async function createComment(
  postId,
  { content, authorId, authorName, parentId = null }
) {
  const body = {
    author: {
      id: authorId,
      username: authorName,
    },
    content,
    parentId,
  };

  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to create comment");
  return res.json(); // { message, commentId } theo spec
}

/**
 * Cập nhật nội dung 1 comment
 * PUT /api/posts/{postId}/comments/{commentId}
 */
export async function updateComment(postId, commentId, content) {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to update comment");
  return res.json();
}

/**
 * Xoá comment
 * DELETE /api/posts/{postId}/comments/{commentId}
 */
export async function deleteComment(postId, commentId) {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete comment");
}

// ===== AI Explain =====
export async function explainPost(postId, level) {
  const params = new URLSearchParams();
  if (level) params.append("level", level);

  const url = `${API_BASE}/ai/posts/${postId}/explain${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error("Failed to explain post");
  return res.json(); // { summary, explanation, key_points, suggested_tags }
}
