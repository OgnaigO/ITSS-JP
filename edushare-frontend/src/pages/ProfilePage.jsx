// src/pages/ProfilePage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser, uploadAvatar } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { getAvatarUrl } from "../utils/avatarUtils";

const BACKEND_ORIGIN = "http://localhost:8080";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, token, login } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: "",
    role: "",
    school: "",
    bio: "",
    address: "",
    phone: "",
  });

  // Sử dụng id từ params hoặc id của user hiện tại
  const userId = id || currentUser?.id;

  useEffect(() => {
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData);
        setError("");
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Khi vào edit mode, load dữ liệu vào form
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        username: user.username || "",
        role: "TEACHER", // ✅ Luôn là TEACHER
        school: user.school || "",
        bio: user.bio || "",
        address: user.address || "",
        phone: user.phone || "",
      });
    }
  }, [isEditing, user]);

  const handleEdit = () => {
    // Chỉ cho phép edit profile của chính mình
    if (currentUser && currentUser.id === userId) {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!userId) return;

    setSubmitting(true);
    setError("");

    try {
      const updatedUser = await updateUser(userId, {
        username: formData.username,
        role: formData.role,
        school: formData.school,
        bio: formData.bio,
        address: formData.address,
        phone: formData.phone,
      });

      setUser(updatedUser);
      setIsEditing(false);

      // Nếu đang xem profile của chính mình, cập nhật AuthContext
      if (currentUser && currentUser.id === userId) {
        // Giữ nguyên token, chỉ update user data
        login(updatedUser, token);
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarClick = () => {
    if (currentUser && currentUser.id === userId) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (PNG, JPG, JPEG)");
      return;
    }

    setUploadingAvatar(true);
    setError("");

    try {
      const updatedUser = await uploadAvatar(userId, file);
      console.log("Avatar upload response:", updatedUser);
      console.log("Avatar URL:", updatedUser?.avatarUrl);
      
      // Đảm bảo cập nhật state với dữ liệu mới
      setUser((prevUser) => ({
        ...prevUser,
        ...updatedUser,
        avatarUrl: updatedUser.avatarUrl, // Đảm bảo avatarUrl được cập nhật
      }));

      // Nếu đang xem profile của chính mình, cập nhật AuthContext
      if (currentUser && currentUser.id === userId) {
        login({ ...currentUser, ...updatedUser }, token);
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading) {
    return (
      <div className="page profile-page">
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page profile-page">
        <div className="error-message">{error || "User not found"}</div>
      </div>
    );
  }

  // Tính toán initials cho avatar
  const displayName = user.username || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // ✅ Role luôn là Teacher

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <div>
          <h1>Profile</h1>
          <p className="profile-subtitle">
            Manage your personal information and public profile
          </p>
        </div>
      </div>

      <div className="profile-content">
        {/* Left Column */}
        <div className="profile-left">
          {/* Personal Information Section */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h2>Personal Information</h2>
              {currentUser && currentUser.id === userId && (
                !isEditing ? (
                  <button className="btn-primary" onClick={handleEdit}>
                    Edit Profile
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn-secondary"
                      onClick={handleCancel}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleSave}
                      disabled={submitting}
                    >
                      {submitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                )
              )}
            </div>
            {error && (
              <div className="error-message" style={{ marginBottom: "16px" }}>
                {error}
              </div>
            )}
            <div className="profile-form">
              <div className="form-field">
                <label>Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="editable-input"
                  />
                ) : (
                  <input
                    type="text"
                    value={user.username || ""}
                    readOnly
                    className="readonly-input"
                  />
                )}
              </div>
              <div className="form-field">
                <label>Role</label>
                {/* ✅ Role luôn là Teacher, không cho phép chỉnh sửa */}
                <input
                  type="text"
                  value="Teacher"
                  readOnly
                  className="readonly-input"
                />
              </div>
              <div className="form-field">
                <label>School</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => handleInputChange("school", e.target.value)}
                    className="editable-input"
                  />
                ) : (
                  <input
                    type="text"
                    value={user.school || ""}
                    readOnly
                    className="readonly-input"
                  />
                )}
              </div>
              <div className="form-field">
                <label>Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="editable-input"
                  />
                ) : (
                  <input
                    type="text"
                    value={user.address || ""}
                    readOnly
                    className="readonly-input"
                  />
                )}
              </div>
              <div className="form-field">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="editable-input"
                  />
                ) : (
                  <input
                    type="text"
                    value={user.phone || ""}
                    readOnly
                    className="readonly-input"
                  />
                )}
              </div>
              <div className="form-field">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="editable-textarea"
                    rows={4}
                  />
                ) : (
                  <textarea
                    value={user.bio || ""}
                    readOnly
                    className="readonly-textarea"
                    rows={4}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right">
          {/* Profile Picture Section */}
          <div className="profile-section">
            <h2>Profile Picture</h2>
            <div className="profile-picture-container">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/png,image/jpeg,image/jpg"
                style={{ display: "none" }}
              />
              {user?.avatarUrl ? (
                <img
                  key={user.avatarUrl} // Thêm key để force re-render khi avatarUrl thay đổi
                  src={`${getAvatarUrl(user.avatarUrl)}?t=${Date.now()}`} // Thêm timestamp để tránh cache
                  alt={displayName}
                  className="profile-avatar-image"
                  onError={(e) => {
                    console.error("Failed to load avatar image:", e.currentTarget.src);
                    // Fallback to placeholder if image fails to load
                    const placeholder = e.currentTarget.parentElement.querySelector('.profile-avatar-placeholder');
                    if (placeholder) {
                      e.currentTarget.style.display = "none";
                      placeholder.style.display = "flex";
                    }
                  }}
                  onLoad={() => {
                    console.log("Avatar image loaded successfully:", getAvatarUrl(user.avatarUrl));
                  }}
                />
              ) : null}
              <div 
                className="profile-avatar-placeholder"
                style={{ display: user?.avatarUrl ? "none" : "flex" }}
              >
                {initials}
              </div>
              {currentUser && currentUser.id === userId && (
                <button
                  className="btn-secondary"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                >
                  <span className="icon-camera">📷</span>
                  {uploadingAvatar ? "Uploading..." : "Change Picture"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

