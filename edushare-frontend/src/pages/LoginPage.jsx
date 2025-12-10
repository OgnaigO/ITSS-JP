// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginApi({ email, password });

      // Hỗ trợ cả 2 kiểu: { token, user } hoặc chỉ user
      const user = data.user || data;
      const token = data.token || null;

      login(user, token);

      // Sau khi đăng nhập xong quay về trang chủ
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your email/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <h1>Log in</h1>
      <p>Sign in to share and manage your slides.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
