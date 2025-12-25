// src/utils/avatarUtils.js
const BACKEND_ORIGIN = "http://localhost:8080";

/**
 * Converts avatar URL from backend format to frontend display format
 * Backend returns: "uploads/avatars/filename.png"
 * Backend serves from: /avatars/** (mapped to file:uploads/avatars/)
 * So we need: /avatars/filename.png
 */
export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  
  // Remove "uploads/" prefix if present
  // "uploads/avatars/filename.png" -> "avatars/filename.png"
  const normalizedPath = avatarUrl.startsWith("uploads/")
    ? avatarUrl.replace("uploads/", "")
    : avatarUrl;
  
  // Ensure it starts with /
  const path = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;
  
  return `${BACKEND_ORIGIN}${path}`;
}

