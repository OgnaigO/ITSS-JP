// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo từ localStorage (nếu đã đăng nhập trước đó)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      const storedToken = localStorage.getItem("authToken");
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedToken) setToken(storedToken);
    } catch (e) {
      console.error("Failed to load auth from storage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData || null);
    setToken(tokenData || null);

    if (userData) {
      localStorage.setItem("authUser", JSON.stringify(userData));
    } else {
      localStorage.removeItem("authUser");
    }

    if (tokenData) {
      localStorage.setItem("authToken", tokenData);
    } else {
      localStorage.removeItem("authToken");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
  };

  const value = { user, token, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Đề phòng dùng ngoài Provider
    return {
      user: null,
      token: null,
      loading: false,
      login: () => {},
      logout: () => {},
    };
  }
  return ctx;
}
